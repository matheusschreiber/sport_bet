const connection = require('../database/connection')
const crypto = require('crypto')

module.exports = {
  async newPlayer(request, response){
    const {name} = request.params
    const player = await connection('players').where('name',name);
    
    if (player=="") await connection('players').insert({name,id:crypto.randomBytes(5).toString('HEX'),wallet:1000})
    else return response.json(player)
    
    return response.status(204).json({name});
  }
}