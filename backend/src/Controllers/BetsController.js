const connection = require('../database/connection')
const crypto = require('crypto')

module.exports = {
  async createBetOdd(request, response){
    const { team, description, year, value, player } = request.body;


    //inser level of probability of the description to the math of the odd

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