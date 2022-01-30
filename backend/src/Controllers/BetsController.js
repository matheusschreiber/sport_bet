const connection = require('../database/connection')
const crypto = require('crypto')

module.exports = {
  async createODD(request, response){
    const { team, description, year, fase } = request.body;

    let lastYear = String(parseInt(year.replace(/-/g, "")) - 10001)
    lastYear = `${lastYear.slice(0, 4)}-${lastYear.slice(4,8)}`

    const [ lastSeason ] = await connection('seasons').where('id',`${lastYear.replace(/-/g,"")} ${team}`).select('*')
    lastPosition = lastSeason.position_groups;

    const allSeasons = await connection('seasons').where('team_name', team).select('*')
    
    let averagePoints=0, seasons=0;
    Object.entries(allSeasons).map((i)=>{ averagePoints+=i[1].points; seasons+=1; })
    averagePoints/=seasons;

    let averageGoals=0;
    Object.entries(allSeasons).map((i)=>{ averageGoals+=i[1].goals_for; })
    averageGoals/=seasons;

    let averageSeasonScore=0;
    Object.entries(allSeasons).map((i)=>{ averageSeasonScore += i[1].season_score; })
    averageSeasonScore/=seasons;
    

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
    const { team, player, value, description, year, odd } = request.body
    let data = {
      id:crypto.randomBytes(5).toString('HEX'),
      team,
      player,
      value,
      profit:parseFloat(value)*parseFloat(odd),
      outcome: false,
      description,
      year,
      odd
    }
    await connection('bets').insert(data)
    return response.json(data)
  },

  async createPlayer(request,response){
    const { name } = request.params;
    const data = {id: crypto.randomBytes(10).toString('HEX'), name, wallet:1000}
    await connection('players').insert(data)
    return response.json(data)
  },

  async listBets(request,response){
    const { year } = request.params;
    const bets = await connection('bets').where('year', year).select('*');
    return response.json(bets)
  }
}