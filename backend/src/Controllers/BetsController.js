const connection = require('../database/connection')
const crypto = require('crypto')

module.exports = {
  async createODD(request, response){
    const { team, description, year, fase } = request.body;

    let lastYear = String(parseInt(year.replace(/-/g, "")) - 10001)
    lastYear = `${lastYear.slice(0, 4)}-${lastYear.slice(4,8)}`

    const [ lastSeason ] = await connection('seasons').where('id',`${lastYear.replace(/-/g,"")} ${team}`).select('*')
    if (!lastSeason) lastPosition = 4;
    else lastPosition = lastSeason.position_groups;

    let averagePoints=0.1, seasons=0.1, averageGoals=0.1, averageSeasonScore=0.1;
    let allSeasons = await connection('seasons').where('team_name', team).select('*')

    if (allSeasons){
      Object.entries(allSeasons).map((i)=>{ averagePoints+=i[1].points; seasons+=1; })
      averagePoints/=seasons;

      Object.entries(allSeasons).map((i)=>{ averageGoals+=i[1].goals_for; })
      averageGoals/=seasons;

      Object.entries(allSeasons).map((i)=>{ averageSeasonScore += i[1].season_score; })
      averageSeasonScore/=seasons;
    } 

    let coef=0;
    if (description.includes("GOALS") && fase==='GROUPS') coef=parseInt(description.split(' ')[1])?(parseInt(description.split(' ')[1])/averageGoals)*0.65:0.65/averageGoals;
    else if (description.includes("GOALS") && fase!=='GROUPS') coef=parseInt(description.split(' ')[1])?(parseInt(description.split(' ')[1])/averageGoals)*0.35:0.35/averageGoals;
    else if (description.includes("OVER")) coef=parseInt(description.split(' ')[1])?(parseInt(description.split(' ')[1])/averageSeasonScore):1/averageSeasonScore;
    else if (description.includes("UNDER")) coef=parseInt(description.split(' ')[1])?averageSeasonScore/(parseInt(description.split(' ')[1])):averageSeasonScore;


    switch(fase){
      case "GROUPS":
        let qualifGroups=0;
        Object.entries(allSeasons).map((i)=>{ if (i[1].placement!=='GROUPS') qualifGroups+=1 });
        disqualifGroups = (seasons-qualifGroups)/seasons;
        qualifGroups/=seasons;

        if (description==="IN LAST") coef = 1/lastPosition; 
        else if (description==="IN FIRST") coef = 1/(5-lastPosition);
        else if (description==="CLASSIFIED") coef = 1/qualifGroups; 
        else if (description==="DISCLASSIFIED") coef = 1/disqualifGroups;
        else if (description.includes("POINTS")) coef=parseInt(description.split(' ')[1])?parseInt(description.split(' ')[1])/averagePoints:1/averagePoints;
        break;
      case "ROUNDOF8":
        let qualifRoundof8=0;
        Object.entries(allSeasons).map((i)=>{ if (i[1].placement!=='ROUNDOF8' && i[1].placement!=='GROUPS') qualifRoundof8+=1 });
        disqualifRoundof8 = (seasons-qualifRoundof8)/seasons;
        qualifRoundof8/=seasons;

        if (description==="CLASSIFIED") coef = 1/qualifRoundof8; 
        else if (description==="DISCLASSIFIED") coef = 1/disqualifRoundof8;
        break;
      case "QUARTERS":
        let qualiQuarters=0;
        Object.entries(allSeasons).map((i)=>{ if (i[1].placement!=='ROUNDOF8' && i[1].placement!=='GROUPS'
          && i[1].pĺacement!=='QUARTERS') qualiQuarters+=1 });
        disqualiQuarters = (seasons-qualiQuarters)/seasons;
        qualiQuarters/=seasons;

        if (description==="CLASSIFIED") coef = 1/qualiQuarters; 
        else if (description==="DISCLASSIFIED") coef = 1/disqualiQuarters;
        break;
      case "SEMIS":
        let qualiSemis=0;
        Object.entries(allSeasons).map((i)=>{ if (i[1].placement!=='ROUNDOF8' && i[1].placement!=='GROUPS'
          && i[1].pĺacement!=='QUARTERS' && i[1].placement!=='SEMIS') qualiSemis+=1 });
        disqualiSemis = (seasons-qualiSemis)/seasons;
        qualiSemis/=seasons;

        if (description==="CLASSIFIED") coef = 1/qualiSemis; 
        else if (description==="DISCLASSIFIED") coef = 1/disqualiSemis;
        break;
      case "FINAL":
        let qualiFinal=0;
        Object.entries(allSeasons).map((i)=>{ if (i[1].placement!=='ROUNDOF8' && i[1].placement!=='GROUPS'
          && i[1].pĺacement!=='QUARTERS' && i[1].placement!=='SEMIS') qualiFinal+=1 });
        disqualiFinal = (seasons-qualiFinal)/seasons;
        qualiFinal/=seasons;

        if (description==="WINNER") coef = 1/qualiFinal; 
        else if (description==="VICE") coef = 1/disqualiFinal;
        break;
    }

    const [teamInfo] = await connection('teams').where('name', team).select('*')
    let odd = coef + Math.random() + (1-(1/teamInfo.fans));
    
    return response.json({odd:parseFloat(odd.toFixed(2)), coef})   
  },
  
  async registerBet(request,response){
    const { team, player, value, description, year, odd, fase } = request.body
    let data = {
      id:crypto.randomBytes(5).toString('HEX'),
      team,
      player,
      value,
      profit:parseFloat(value)*parseFloat(odd),
      outcome: -1,
      description,
      year,
      odd,
      fase
    }
    await connection('bets').insert(data)
    return response.json(data)
  },

  async deleteBet(request,response){
    const { id } = request.params;
    const player= request.headers.authorization;
    const name = await connection('bets').where({'id':id,'player':player}).select('player');
    
    if (name[0]) await connection('bets').where('id',id).del();
    else return response.status(401).json('Unauthorized');
    
    return response.json("Successfuly deleted");
  },

  async createPlayer(request,response){
    const { name } = request.params;
    const data = {id: crypto.randomBytes(10).toString('HEX'), name, wallet:1000}
    await connection('players').insert(data)
    return response.json(data)
  },

  async getPlayer(request,response){
    const { name } = request.params;
    const player = await connection('players').where('name',name).select('*');
    return response.json(player);
  },

  async listBets(request,response){
    const { year } = request.params;
    const player = request.headers.authorization;
    let bets;
    if (player) bets = await connection('bets').where({year,player}).select('*');
    else bets = await connection('bets').where({year}).select('*');
    return response.json(bets)
  },

  async verifyBet(request,response){
    const { id } = request.params;

    let [ bet ] = await connection('bets').where('id',id).select('*');
    const [ season ] = await connection('seasons').where('id', bet.year.replace("-","") + " " + bet.team)    

    if (bet.outcome!=-1) return response.json("BET ALREADY CHECKED");

    if (bet.description=='CLASSIFIED' || bet.description=='DISCLASSIFIED'){
      if (season.placement=='PENDING') classified = -1;
      else {
        let classified;
        if (season.placement==bet.fase) classified=0;
        else if (season.placement==`PENDING ${bet.fase}`) classified=1;

        if (bet.description=='CLASSIFIED') bet.outcome = classified;
        else if (!classified) bet.outcome = 1;
        else bet.outcome = 0;

        if (bet.fase=='TITLE' && season.placement=='TITLE') bet.outcome=1;
        else if (bet.fase=='TITLE' && season.placement!='TITLE') bet.outcome=0;
        else if (bet.fase=='FINALIST' && season.placement=='FINALIST') bet.outcome=1;
        else if (bet.fase=='FINALIST' && season.placement!='FINALIST') bet.outcome=0;
      }
    } else if (bet.description.includes('GOALS')){
      const x = parseInt(bet.description.split(' ')[1])
      if (season.goals_for>=x) bet.outcome=1;
      else bet.outcome=0;
    } else if (bet.description.includes('POINTS')){
      const x = parseInt(bet.description.split(' ')[1])
      if (season.points>=x) bet.outcome=1;
      else bet.outcome=0;
    }
    else if (bet.description=='IN FIRST' && season.position_groups==1 && season.placement!='PENDING') bet.outcome=1;
    else if (bet.description=='IN FIRST' && season.position_groups!=1 && season.placement!='PENDING') bet.outcome=0;
    else if (bet.description=='IN LAST'  && season.position_groups==4 && season.placement!='PENDING') bet.outcome=1;
    else if (bet.description=='IN LAST'  && season.position_groups!=4 && season.placement!='PENDING') bet.outcome=0;
    
    await connection('bets').where('id', bet.id).update(bet);
    if (bet.outcome==1) return response.json('BET ACCOMPLISHED');
    else return response.json('BET UNACCOMPLISHED');
  },

  async discountBets(request, response){
    const { playerName, value } = request.body;
    const [{wallet}] = await connection('players').where('name', playerName).select('wallet');
    await connection('players').where('name', playerName).update({wallet: wallet+value});
    const [player] = await connection('players').where('name', playerName).select('*');
    return response.json(player);
  }
  
}