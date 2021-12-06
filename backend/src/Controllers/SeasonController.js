const connection = require('../database/connection');
const fs = require('fs');

module.exports = {
  async createSeasonFile(request, response) {
    function createMatchSchedule(team1, team2, team3, team4){
      let matches={
        "1":{"A": team1,"score_A": "-","B": team2,"score_B": "-",},
        "2":{"A": team3,"score_A": "-","B": team4,"score_B": "-",},
        "3":{"A": team1,"score_A": "-","B": team3,"score_B": "-",},
        "4":{"A": team2,"score_A": "-","B": team4,"score_B": "-",},
        "5":{"A": team2,"score_A": "-","B": team1,"score_B": "-",},
        "6":{"A": team4,"score_A": "-","B": team3,"score_B": "-",},
        "7":{"A": team3,"score_A": "-","B": team1,"score_B": "-",},
        "8":{"A": team4,"score_A": "-","B": team2,"score_B": "-",},
      }
      return matches;
    }
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
        matches: createMatchSchedule(teams[j], teams[j+1], teams[j+2], teams[j+3])
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

    fs.writeFile(`./src/database/seasons/${year}.json`, JSON.stringify(season), 'utf8', (err)=>{
      if (err) throw err
      else return response.json(season)
    });
  },

  async updateMatchesSeason(request, response) {
    const { year, fase, outcomes } = request.body;
    
    fs.readFile(`./src/database/seasons/${year}.json`, 'utf-8' , (err, data)=>{
      if (err) {throw err}
      var file = JSON.parse(data);
      var groups;
      if (fase==='group') {
        groups = (file.group_fase)
        Object.entries(outcomes).forEach((i)=>{
          var group = i[0]
          var results = i[1]
          results.map((k)=>{
            Object.entries(groups).forEach((g)=>{
              const [gkey, gvalue] = g
              if (gkey == group) {
                Object.entries(gvalue.matches).forEach((m)=>{
                  const [ mkey, mvalue ] = m;
                  if (mkey == k[0]){
                    mvalue.score_A = k[1]
                    mvalue.score_B = k[2]

                    switch(mvalue.A){
                      case gvalue.team_1.name:
                        if (k[1]>k[2]) gvalue.team_1.points+=3;
                        else if (k[1]==k[2]) gvalue.team_1.points+=1;
                        break;
                      case gvalue.team_2.name:
                        if (k[1]>k[2]) gvalue.team_2.points+=3;
                        else if (k[1]==k[2]) gvalue.team_2.points+=1;
                        break;
                      case gvalue.team_3.name:
                        if (k[1]>k[2]) gvalue.team_3.points+=3;
                        else if (k[1]==k[2]) gvalue.team_3.points+=1;
                        break;
                      case gvalue.team_4.name:
                        if (k[1]>k[2]) gvalue.team_4.points+=3;
                        else if (k[1]==k[2]) gvalue.team_4.points+=1;
                        break;
                    }

                    switch(mvalue.B){
                      case gvalue.team_1.name:
                        if (k[1]<k[2]) gvalue.team_1.points+=3;
                        else if (k[1]==k[2]) gvalue.team_1.points+=1;
                        break;
                      case gvalue.team_2.name:
                        if (k[1]<k[2]) gvalue.team_2.points+=3;
                        else if (k[1]==k[2]) gvalue.team_2.points+=1;
                        break;
                      case gvalue.team_3.name:
                        if (k[1]<k[2]) gvalue.team_3.points+=3;
                        else if (k[1]==k[2]) gvalue.team_3.points+=1;
                        break;
                      case gvalue.team_4.name:
                        if (k[1]<k[2]) gvalue.team_4.points+=3;
                        else if (k[1]==k[2]) gvalue.team_4.points+=1;
                        break;
                    }
                  }
                })
              }
            })
          })
        })

        Object.entries(groups).forEach((i)=>{
          const [ key, value ] = i
          var teams = [
            [value.team_1.name, value.team_1.points],
            [value.team_2.name, value.team_2.points],
            [value.team_3.name, value.team_3.points],
            [value.team_4.name, value.team_4.points]
          ]

          teams.sort(function(a, b){
            if (a[1]>b[1]) return -1;
            else if (a[1]<b[1]) return 1;
            return 0;
          })

          for(i=0;i<4;i++){
            switch (teams[i][0]) {
              case value.team_1.name:
                value.team_1.current_position = i+1
                break;
              case value.team_2.name:
                value.team_2.current_position = i+1
                break;
              case value.team_3.name:
                value.team_3.current_position = i+1
                break;
              case value.team_4.name:
                value.team_4.current_position = i+1
                break;
            }
          }
        })
        
        file.group_fase = groups      
        fs.writeFile(`./src/database/seasons/${year}.json`, JSON.stringify(file), 'utf8', (err)=>{
          if (err) throw Error(err)
          return response.json(file);
        });      

      } else if (fase=="final"){
        
      }
      
    })
  },

  async listGroupMatches(request, response){
    const { year, group } = request.body;
    fs.readFile(`./src/database/seasons/${year}.json`, 'utf-8' , (err, data)=>{
      if (err) {throw err}
      switch(group.toLowerCase()){
        case "a": return response.json(JSON.parse(data).group_fase.group_a.matches);
        case "b": return response.json(JSON.parse(data).group_fase.group_b.matches);
        case "c": return response.json(JSON.parse(data).group_fase.group_c.matches);
        case "d": return response.json(JSON.parse(data).group_fase.group_d.matches);
        case "e": return response.json(JSON.parse(data).group_fase.group_e.matches);
        case "f": return response.json(JSON.parse(data).group_fase.group_f.matches);
        case "g": return response.json(JSON.parse(data).group_fase.group_g.matches);
        case "h": return response.json(JSON.parse(data).group_fase.group_h.matches);
      }
    })
  },


}