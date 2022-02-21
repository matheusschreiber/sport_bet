const connection = require('../database/connection')
const crypto = require('crypto')

module.exports = {
  async registerMatch(request, response){
    const { team_A, team_B, score_A, score_B, year } = request.body;
    const data = {
      id: crypto.randomBytes(10).toString('HEX'),
      team_A,
      team_B,
      score_A,
      score_B,
      year,
    }
    await connection('matches').insert(data)
    return response.json(data)
  },

  async getScoresbyOpponent(request, response){
    const { team, year } = request.body;
    
    const teams = await connection('teams').whereNot('name', team).select('*')
    let biggestScore=0, biggestScorer=""
    let leastScore=100000, leastScorer=""
    
    await Promise.all(teams.map(async(t)=>{
      var totalGoals=0;
      
      const goalsA = await connection('matches')
      .where({'team_B': team, 'team_A':t.name, 'year':year})
      .select('score_A')
      const goalsB = await connection('matches')
      .where({'team_A': team, 'team_B':t.name, 'year':year})
      .select('score_B')
      
      goalsA.map((i)=>{totalGoals+=parseInt(i.score_A)})
      goalsB.map((i)=>{totalGoals+=parseInt(i.score_B)})
      
      if (totalGoals>biggestScore){
        biggestScore = totalGoals
        biggestScorer = t.name
      }
      if (totalGoals<leastScore){
        leastScore=totalGoals
        leastScorer=t.name
      }
    }))
    
    return response.json({easy:leastScorer, easyScore:leastScore, hard: biggestScorer, hardScore: biggestScore})
  },

  async updateAllTimeOpponent(request, response){
    const { team } = request.params;

    const teams = await connection('teams').whereNot('name', team).select('*')
    let biggestScore=0, biggestScorer=""
    let leastScore=100000, leastScorer=""
    
    await Promise.all(teams.map(async(t)=>{
      var totalGoals=0;
      
      const goalsA = await connection('matches')
      .where({'team_B': team, 'team_A':t.name})
      .select('score_A')
      const goalsB = await connection('matches')
      .where({'team_A': team, 'team_B':t.name})
      .select('score_B')
      
      goalsA.map((i)=>{totalGoals+=parseInt(i.score_A)})
      goalsB.map((i)=>{totalGoals+=parseInt(i.score_B)})
      
      if (totalGoals>biggestScore){
        biggestScore = totalGoals
        biggestScorer = t.name
      }
      if (totalGoals<leastScore){
        leastScore=totalGoals
        leastScorer=t.name
      }
    }))

    let [ teamInfo ] = await connection('teams').where('name', team).select('*');
    teamInfo.biggest_opponent=biggestScorer;
    teamInfo.biggest_opponent_score=biggestScore;
    teamInfo.least_opponent=leastScorer;
    teamInfo.least_opponent_score=leastScore;

    await connection('teams').where('name', team).update(teamInfo)

    return response.json({
      least_opponent:leastScorer,
      least_opponent_score:leastScore,
      biggest_opponent: biggestScorer,
      biggest_opponent_score: biggestScore
    })
  }

}