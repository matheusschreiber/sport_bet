const connection = require('../database/connection');
const fs = require('fs');

module.exports = {
  async createSeason(request, response) {
    const { year, teams } = request.body;
    
    var teamsFormatted = [];
    var j=0, k=0;

    teams.map((i)=>{
      teamsFormatted[k] = {
        "name": i,
        "points": 0,
        "current_position": j+1,
        "old_position": 0
      }

      if (j==3) j=0;
      else j++;
      
      k++;
    })

    var groups = [];
    for(i=0, j=0;i<8;i++, j+=4){
      groups[i] = {
        team_1: teamsFormatted[j],
        team_2: teamsFormatted[j+1],
        team_3: teamsFormatted[j+2],
        team_4: teamsFormatted[j+3],
      }
    }
    
    const season = {
      group_fase: {
        group_a: groups[0],
        group_b: groups[1],
        group_c: groups[2],
        group_d: groups[3],
        group_e: groups[4],
        group_f: groups[5],
        group_g: groups[6],
        group_h: groups[7],        
      },
      final_fase: {
        
      }
    }

    var fileStatus;
    try {
      fs.unlink(`${year}.json`, () => fileStatus = "Season file already in directory. Recreating.")
    } catch (err) { fileStatus = "Season file not found in directory. Clean start." }

    fs.writeFile(`${year}.json`, JSON.stringify(season), 'utf8', ()=>{});
    return response.json({
      setup: fileStatus,
      outcome: "SEASON FILE CREATED"
    });
  }
}