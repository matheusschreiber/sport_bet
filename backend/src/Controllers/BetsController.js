const connection = require('../database/connection')
const crypto = require('crypto')
const fs = require('fs');

module.exports = {
  async createBetOdd(request, response){
    const { team, description, year, value, player } = request.body;

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

    return response.json(averageGoals)

    
    let coef=0;
    switch(description){
      case "IN LAST": coef = 1/lastPosition; break;
      case "IN FIRST": coef = 1/(5-lastPosition); break;
    }

    if (description==="IN LAST") coef = 1/lastPosition; 
    else if (description==="IN FIRST") coef = 1/(5-lastPosition);
    else if (description.includes("POINTS")) coef=parseInt(description.split(' ')[1])?parseInt(description.split(' ')[1])/averagePoints:1/averagePoints;

    return response.json(coef)



    const [playerInfo] = await connection('players').where('name', player).select('*')
    if (value>playerInfo.wallet) return response.json({message: "Insufficient funds"})
    
    const [teamInfo] = await connection('teams').where('name', team).select('*')
    const parameter = Math.random()/teamInfo.fans;
    let odd;
    if (parameter<0.00001) odd=50*Math.random();
    else if (parameter<0.0005) odd=10*Math.random();
    else if (parameter<0.0008) odd=5*Math.random();
    else if (parameter<0.001) odd=3*Math.random();
    else if (parameter<0.015) odd=2*Math.random();
    else if (parameter<0.3) odd=1+Math.random();
    else if (parameter>0.3) odd=Math.random();
    
    return response.json({odd:parseFloat(odd.toFixed(2))})   
  },
  
  async registerBet(request,response){
    const { team, player, value, description, year, odd } = request.body
    let data = {
      id:crypto.randomBytes(5).toString('HEX'),
      team,
      player,
      value,
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




}