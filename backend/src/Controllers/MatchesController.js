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
    const { team, opponent, year } = request.body;
    
    const goalsB = await connection('matches')
      .where({'team_A': team, 'team_B':opponent, 'year':year})
      .select('score_B')
    
    var totalGoals=0;
    goalsB.map((i)=>{totalGoals+=parseInt(i.score_B)})

    const goalsA = await connection('matches')
      .where({'team_B': team, 'team_A':opponent, 'year':year})
      .select('score_A')
    
    goalsA.map((i)=>{totalGoals+=parseInt(i.score_A)})

    return response.json({goals: totalGoals})
  },

}