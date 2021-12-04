const connection = require('../database/connection');

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

}