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
      goalsfor: 0,
      goalsagainst: 0,
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
    const { team_1, team_2 } = request.body;

    var goals_A = Math.floor(Math.random()*5);
    var goals_B = Math.floor(Math.random()*5);
    
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
      const [{wins:wA, goalsfor:gfA, goalsagainst:gaA, games:gA, fans:fA}] = await connection('teams')
        .where('name',winner[0])
        .select([
        'wins',
        'goalsfor',
        'goalsagainst',
        'games',
        'fans',
      ]);
      await connection('teams')
        .where('name', winner[0])
        .update({
          wins: wA+1,
          goalsfor: gfA+winner[1],
          goalsagainst: gaA+loser[1],
          games: gA+1,
          fans:fA+fan_quota
        });
      
      const [{losses:lB, goalsfor:gfB, goalsagainst:gaB, games:gB, fans:fB}] = await connection('teams')
        .where('name',loser[0])
        .select([
        'losses',
        'goalsfor',
        'goalsagainst',
        'games',
        'fans',
      ]);
      await connection('teams')
        .where('name', loser[0])
        .update({
          losses: lB+1,
          goalsfor: gfB+loser[1],
          goalsagainst: gaB+winner[1],
          games: gB+1,
          fans:fB+fan_quota
        });

    } else {
      var team = [ team_1, goals_A, goals_B];
      for(i=0;i<2;i++){
        const [{dues, goalsfor, goalsagainst, games}] = await connection('teams')
          .where('name',team[0])
          .select([
          'dues',
          'goalsfor',
          'goalsagainst',
          'games',
        ]);
        await connection('teams')
          .where('name', team[0])
          .update({
            dues: dues+1,
            goalsfor: goalsfor+team[1],
            goalsagainst: goalsagainst+team[2],
            games: games+1
        });
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

  async setBiggestOpponent(request, response){
    const { team, biggest_opponent, goals } = request.body;
    await connection('teams').where('name', team)
      .update({'biggest_opponent': biggest_opponent, 'biggest_opponent_score': goals})
    
    return response.json({message: "Successfully added"})      
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
      if (i.goalsfor>topscore) {
        topscore = i.titles
        topscorer = i
      }
    })
    return response.json(topscorer)
  },
}