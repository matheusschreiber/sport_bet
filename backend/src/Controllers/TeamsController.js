const connection = require('../database/connection');
const fs = require('fs')

module.exports = {
  async createTeam(request, response){
    const { name, acronym, fans, jersey, country } = request.body;
    
    const time = {
      name,
      acronym, 
      wins: 0,
      dues: 0,
      losses: 0,
      games: 0,
      fans,
      goals_for: 0,
      goals_against: 0,
      jersey,
      country,
      winstreak: 0,
      titles:0,
      vices:0,
      alltimerecord: 0,
    }
    
    await connection('teams').insert(time)   

    return response.json({message: "Team successfully created"})
  },

  async playMatch(request, response) {
    const { year, team_1, team_2 } = request.body;

    const [team_1_info] = await connection('teams').where('name',team_1).select('*')
    const [team_2_info] = await connection('teams').where('name',team_2).select('*')

    let a2 = team_1_info.games?((team_1_info.goals_for/team_1_info.games)*Math.random()):0   //GOALS/GAMES
    let a3 = 0.2;                                                                           //HOME or AWAY
    let a4 = (Math.random()*3)                                                              //LUCKY MULTIPLYER
    
    let b2 = team_2_info.games?((team_2_info.goals_for/team_2_info.games)*Math.random()):0
    let b3 = 0;
    let b4 = (Math.random()*3)          

    let a6 = ((b2+b3+b4)*(-1)*0.1)
    let b6 = ((a2+a3+a4)*(-1)*0.1)
    
    const somaA = Math.round(a2+a3+a4+a6)
    const somaB = Math.round(b2+b3+b4+b6)

    const goals_A = somaA>0?somaA:0
    const goals_B = somaB>0?somaB:0
    
    var fan_quota = 1;
    var winner = [];
    var loser = [];
    var due = 0;

    if (goals_A>goals_B){
      winner = [ team_1, goals_A ];
      loser = [ team_2, goals_B ];
    } else if (goals_A<goals_B){
      winner = [ team_2, goals_B ];
      loser = [ team_1, goals_A ];
    } else {
      due = 1;
    }

    if (!due) {
      const [{wins:wA, goals_for:gfA, goals_against:gaA, games:gA, fans:fA}] = await connection('teams')
        .where('name',winner[0])
        .select(['wins','goals_for','goals_against','games','fans',]);
      await connection('teams')
        .where('name', winner[0])
        .update({wins: wA+1,goals_for: gfA+winner[1],goals_against: gaA+loser[1],games: gA+1,fans:fA+fan_quota});

      const [{wins:wA_season, goals_for:gfA_season, goals_against:gaA_season, games:gA_season, fans:fA_season}] = await connection('seasons')
        .where('id',`${year.replace(/-/g,"")} ${winner[0]}`)
        .select(['wins','goals_for','goals_against','games','fans']);
      await connection('seasons')
        .where('id',`${year.replace(/-/g,"")} ${winner[0]}`)
        .update({wins:wA_season+1,goals_for:gfA_season+winner[1], goals_against:gaA_season+loser[1], games:gA_season+1, fans:fA_season+fan_quota});
    
      const [{losses:lB, goals_for:gfB, goals_against:gaB, games:gB, fans:fB}] = await connection('teams')
        .where('name',loser[0])
        .select(['losses','goals_for','goals_against','games','fans',]);
      await connection('teams')
        .where('name', loser[0])
        .update({losses: lB+1,goals_for: gfB+loser[1],goals_against: gaB+winner[1],games: gB+1,fans:fB+fan_quota});

      const [{losses:lB_season, goals_for:gfB_season, goals_against:gaB_season, games:gB_season, fans:fB_season}] = await connection('seasons')
        .where('id',`${year.replace(/-/g,"")} ${loser[0]}`)
        .select(['losses','goals_for','goals_against','games','fans']);
      await connection('seasons')
        .where('id',`${year.replace(/-/g,"")} ${loser[0]}`)
        .update({losses:lB_season+1,goals_for:gfB_season+loser[1], goals_against:gaB_season+winner[1], games:gB_season+1, fans:fB_season-fan_quota});
    } else {
      var team = [ team_1, goals_A, goals_B];
      for(i=0;i<2;i++){
        const [{dues, goals_for, goals_against, games}] = await connection('teams')
          .where('name',team[0])
          .select(['dues','goals_for','goals_against','games']);
        await connection('teams')
          .where('name', team[0])
          .update({dues: dues+1,goals_for: goals_for+team[1],goals_against: goals_against+team[2],games: games+1});
        
        const [{dues:d_season, goals_for:gf_season, goals_against:ga_season, games:g_season, fans:f_season}] = await connection('seasons')
          .where('id',`${year.replace(/-/g,"")} ${team[0]}`)
          .select(['dues','goals_for','goals_against','games','fans']);
        await connection('seasons')
          .where('id',`${year.replace(/-/g,"")} ${team[0]}`)
          .update({dues:d_season+1,goals_for:gf_season+team[1], goals_against:ga_season+team[2], games:g_season+1, fans:f_season+fan_quota});

        team = [ team_2, goals_B, goals_A ];
      }
    }

    return response.json({
      outcome:{
        team_1:{
          name: team_1,
          goals: goals_A,
        },
        team_2:{
          name: team_2,
          goals: goals_B,
        },
        fans_added: fan_quota
      }
    })
  },  

  async penalties(request, response){
    const { year, team_1, team_2 } = request.body;
    const fan_quota = 1

    const [team_1_info] = await connection('teams').where('name',team_1).select('*')
    const [team_2_info] = await connection('teams').where('name',team_2).select('*')

    let score_A=0, score_B=0, taken=0;
    
    while(true){
      if (Math.round(Math.random()*10)>=5) score_A++; 
      if (Math.round(Math.random()*10)>=5) score_B++;
      taken++;

      if (Math.abs(score_A-score_B)>=3) break;
      else if (taken>=5 && Math.abs(score_A-score_B)) break;
    }

    await connection('teams').where('name',team_1).update({goals_for:team_1_info.goals_for+score_A, goals_against:team_1_info.goals_against+score_B})
    await connection('teams').where('name',team_2).update({goals_for:team_2_info.goals_for+score_B, goals_against:team_2_info.goals_against+score_A})
    
    const [{goals_for:gfA_season, goals_against:gaA_season}] = await connection('seasons').where('id',`${year.replace(/-/g,"")} ${team_1}`).select(['goals_for','goals_against']);
    await connection('seasons').where('id',`${year.replace(/-/g,"")} ${team_1}`).update({goals_for:gfA_season+score_A, goals_against:gaA_season+score_B});

    const [{goals_for:gfB_season, goals_against:gaB_season}] = await connection('seasons').where('id',`${year.replace(/-/g,"")} ${team_2}`).select(['goals_for','goals_against']);
    await connection('seasons').where('id',`${year.replace(/-/g,"")} ${team_2}`).update({goals_for:gfB_season+score_B, goals_against:gaB_season+score_A});

    return response.json({outcome:{
      team_1:{
        name: team_1,
        goals: score_A,
      },
      team_2:{
        name: team_2,
        goals: score_B,
      },
      fans_added: fan_quota
    }})
  },

  async updateOpponents(request, response){
    const { team, bg_opponent, lt_opponent } = request.body;
    
    const [{biggest_opponent, least_opponent}] = await connection('teams').where('name',team).select('biggest_opponent', 'least_opponent')
    
    if (!biggest_opponent || parseInt(biggest_opponent.split('-')[0]) < parseInt(bg_opponent.split('-')[0])) 
      await connection('teams').where('name', team).update({'biggest_opponent': bg_opponent})

    if (!least_opponent || parseInt(least_opponent.split('-')[0]) > parseInt(lt_opponent.split('-')[0])) 
      await connection('teams').where('name', team).update({'least_opponent': lt_opponent})
    
    return response.json({biggest_opponent,bg_opponent,least_opponent,lt_opponent})      
  },

  async getBiggestOpponent(request, response) {
    const { team } = request.params;
    const [{biggest_opponent, biggest_opponent_score}] = await connection('teams').where('name', team)
      .select(['biggest_opponent', 'biggest_opponent_score'])

    return response.json({biggest_opponent, biggest_opponent_score})
  },

  async setWeakestOpponent(request, response){
    const { team, least_opponent, goals } = request.body;
    await connection('teams').where('name', team)
      .update({'least_opponent': least_opponent, 'least_opponent_score': goals})
    
    return response.json({message: "Successfully added"})      
  },

  async getWeakestOpponent(request, response) {
    const { team } = request.params;
    const [{least_opponent, least_opponent_score}] = await connection('teams').where('name', team)
      .select(['least_opponent', 'least_opponent_score'])

    return response.json({least_opponent, least_opponent_score})
  },

  async getTeams(request, response){
    const data = await connection('teams').select('*')
    return response.json(data)
  },

  async getAllTeams(request, response){
    const file = JSON.parse(fs.readFileSync('./src/database/seasons/teams.json', 'utf-8'))
    return response.json(file)
  },

  async getBiggestWinner(request, response){
    const teams = await connection('teams').select('*')
    let biggest, biggestScore=0;
    teams.map((i)=>{
      if (i.titles>biggestScore) {
        biggestScore = i.titles
        biggest = i
      }
    })
    return response.json(biggest)
  },

  async getTopScorer(request, response){
    const teams = await connection('teams').select('*')
    let topscorer, topscore=0;
    teams.map((i)=>{
      if (i.goals_for>topscore) {
        topscore = i.goals_for
        topscorer = i
      }
    })
    return response.json(topscorer)
  },

  async getTeamsJSON(request,response){
    const teams = JSON.parse(fs.readFileSync('./src/database/seasons/teams.json', 'utf-8'))
    let teamArray = []
    Object.entries(teams[0]).map((e)=>{
      const [ key, value ] = e;
      teamArray.push(key)
    })
    return response.json(teamArray)
  },

  async getTeam(request,response){
    const {team} = request.params;
    const teamInfo = await connection('teams').where('name',team).select('*')
    return response.json(teamInfo)
  }
}