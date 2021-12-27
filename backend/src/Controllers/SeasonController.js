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
        "5":{"A": team1,"score_A": "-","B": team4,"score_B": "-",},
        "6":{"A": team2,"score_A": "-","B": team3,"score_B": "-",},
        "7":{"A": team2,"score_A": "-","B": team1,"score_B": "-",},
        "8":{"A": team4,"score_A": "-","B": team3,"score_B": "-",},
        "9":{"A": team3,"score_A": "-","B": team1,"score_B": "-",},
        "10":{"A": team4,"score_A": "-","B": team2,"score_B": "-",},
        "11":{"A": team4,"score_A": "-","B": team1,"score_B": "-",},
        "12":{"A": team3,"score_A": "-","B": team2,"score_B": "-",},
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
        "old_position": 5
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

  async seasonFile(request, response) {
    const { year } = request.body;
    var file = fs.readFileSync(`./src/database/seasons/${year}.json`, 'utf-8')
    return response.json(JSON.parse(file))
  },

  async updateMatchesSeason(request, response) {
    const { year, fase, outcomes={} } = request.body;
    var file = JSON.parse(fs.readFileSync(`./src/database/seasons/${year}.json`, 'utf-8'));
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
              value.team_1.old_position = value.team_1.current_position
              value.team_1.current_position = i+1
              break;
            case value.team_2.name:
              value.team_2.old_position = value.team_2.current_position
              value.team_2.current_position = i+1
              break;
            case value.team_3.name:
              value.team_3.old_position = value.team_3.current_position
              value.team_3.current_position = i+1
              break;
            case value.team_4.name:
              value.team_4.old_position = value.team_4.current_position
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

    } else if (fase=="round of 8"){
      var matches = Object.entries(file.final_fase.round_of_8)
      outcomes.map((i)=>{
        matches[i[0]-1][1].score_A_first_leg = i[1],
        matches[i[0]-1][1].score_B_first_leg = i[2],
        matches[i[0]-1][1].score_A_second_leg = i[3],
        matches[i[0]-1][1].score_B_second_leg = i[4]
      })
      
      file.final_fase.round_of_8 = {
       match_1: matches[0][1],
       match_2: matches[1][1],
       match_3: matches[2][1],
       match_4: matches[3][1],
       match_5: matches[4][1],
       match_6: matches[5][1],
       match_7: matches[6][1],
       match_8: matches[7][1],
      }
      fs.writeFileSync(`./src/database/seasons/${year}.json`, JSON.stringify(file),'utf-8');
      return response.json(file.final_fase.round_of_8)
    } else if (fase=="quarter finals"){
      var matches = Object.entries(file.final_fase.quarter_finals)
      outcomes.map((i)=>{
        matches[i[0]-1][1].score_A_first_leg = i[1],
        matches[i[0]-1][1].score_B_first_leg = i[2],
        matches[i[0]-1][1].score_A_second_leg = i[3],
        matches[i[0]-1][1].score_B_second_leg = i[4]
      })
      
      file.final_fase.quarter_finals = {
       match_1: matches[0][1],
       match_2: matches[1][1],
       match_3: matches[2][1],
       match_4: matches[3][1] 
      }
      fs.writeFileSync(`./src/database/seasons/${year}.json`, JSON.stringify(file),'utf-8');
      return response.json(file.final_fase.quarter_finals)
    } else if (fase=="semi finals"){
      var matches = Object.entries(file.final_fase.semi_finals)
      outcomes.map((i)=>{
        matches[i[0]-1][1].score_A_first_leg = i[1],
        matches[i[0]-1][1].score_B_first_leg = i[2],
        matches[i[0]-1][1].score_A_second_leg = i[3],
        matches[i[0]-1][1].score_B_second_leg = i[4]
      })
      
      file.final_fase.semi_finals = {
       match_1: matches[0][1],
       match_2: matches[1][1]
      }
      fs.writeFileSync(`./src/database/seasons/${year}.json`, JSON.stringify(file),'utf-8');
      return response.json(file.final_fase.semi_finals)
    } else if (fase=="final"){  
      
      file.final_fase.final.match.score_A = outcomes[0],
      file.final_fase.final.match.score_B = outcomes[1]
      fs.writeFileSync(`./src/database/seasons/${year}.json`, JSON.stringify(file),'utf-8');
      
      var winner = outcomes[0]>outcomes[1] ? file.final_fase.final.match.A : file.final_fase.final.match.B
      var loser = outcomes[0]<outcomes[1] ? file.final_fase.final.match.A : file.final_fase.final.match.B
      

      return response.json({
        final: file.final_fase.final,
        winner,
        loser
      })
    }
  },

  async getGroup(request,response){
    const { year, group } = request.body;
    let groupLetter, g
    var data = JSON.parse(fs.readFileSync(`./src/database/seasons/${year}.json`, 'utf-8'))
    switch(group.toLowerCase()){
      case "a": 
        groupLetter = 'A' 
        g = data.group_fase.group_a
        break;
      case "b": 
        groupLetter = 'B' 
        g = data.group_fase.group_b
        break;
      case "c": 
        groupLetter = 'C' 
        g = data.group_fase.group_c
        break;
      case "d": 
        groupLetter = 'D' 
        g = data.group_fase.group_d
        break;
      case "e": 
        groupLetter = 'E' 
        g = data.group_fase.group_e
        break;
      case "f": 
        groupLetter = 'F' 
        g = data.group_fase.group_f
        break;
      case "g": 
        groupLetter = 'G' 
        g = data.group_fase.group_g
        break;
      case "h": 
        groupLetter = 'H' 
        g = data.group_fase.group_h
        break;
    }
    const [{fans:fans1,games:games1, goalsfor:goalsfor1}] = await connection('teams').where('name',g.team_1.name).select("fans", "games", "goalsfor")
    const [{fans:fans2,games:games2, goalsfor:goalsfor2}] = await connection('teams').where('name',g.team_2.name).select("fans", "games", "goalsfor")
    const [{fans:fans3,games:games3, goalsfor:goalsfor3}] = await connection('teams').where('name',g.team_3.name).select("fans", "games", "goalsfor")
    const [{fans:fans4,games:games4, goalsfor:goalsfor4}] = await connection('teams').where('name',g.team_4.name).select("fans", "games", "goalsfor")

    let groupArray=[
      [g.team_1.name,g.team_1.points,g.team_1.current_position,g.team_1.old_position,fans1,games1,goalsfor1],
      [g.team_2.name,g.team_2.points,g.team_2.current_position,g.team_2.old_position,fans2,games2,goalsfor2],
      [g.team_3.name,g.team_3.points,g.team_3.current_position,g.team_3.old_position,fans3,games3,goalsfor3],
      [g.team_4.name,g.team_4.points,g.team_4.current_position,g.team_4.old_position,fans4,games4,goalsfor4]
    ]
    return response.json({group: groupLetter, data: groupArray});
  },

  async setupRoundOf8(request, response) {
    const { year } = request.body;
    var seasonFile = JSON.parse(fs.readFileSync(`./src/database/seasons/${year}.json`, 'utf-8'))   
    if (seasonFile && Object.keys(seasonFile.final_fase).length==0){
      var classified = [];
      var disclassified = [];
      Object.entries(seasonFile.group_fase).forEach((i)=>{
        const [ key, value ] = i;
        Object.entries(value).forEach((j)=>{
          const [ jkey, jvalue ] = j;
          if (jvalue.current_position==1 || jvalue.current_position==2) classified.push(jvalue.name);          
          else if (jvalue.name) disclassified.push(jvalue.name);
        })
      })
  
      const potA = classified.slice(0, 8)
      const potB = classified.slice(8, 16)
     
      function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
      }

      shuffleArray(potA)
      shuffleArray(potB)

      var round_of_8 = {}
      for(i=0, j=1;i<16;i+=2, j++){
        if (i<8){
          var match = {
            "A": potA[i],
            "B": potA[i+1],
            "score_A_first_leg": 0,
            "score_B_first_leg": 0,
            "score_A_second_leg": 0,
            "score_B_second_leg": 0
          }
        } else {
          var match = {
            "A": potB[i-8],
            "B": potB[i-7],
            "score_A_first_leg": 0,
            "score_B_first_leg": 0,
            "score_A_second_leg": 0,
            "score_B_second_leg": 0
          }
        }
        round_of_8[`match_${j}`] = match
      }
      
      seasonFile.final_fase = {
        teams_pot_A: potA,
        teams_pot_B: potB,
        round_of_8
      }

      fs.writeFile(`./src/database/seasons/${year}.json`, JSON.stringify(seasonFile), 'utf-8', (err)=>{
        if (err) throw Error("Unable to write in season file at round of 8")
        return response.json({
          round_of_8:seasonFile.final_fase.round_of_8,
          disclassified,
        })
      })
    } else if (Object.keys(seasonFile.final_fase).length!=0) {
      throw Error("Trying to create round of 8 data which alerady exists")
    } else throw Error("Season File corrupted or inaccessible");
  },

  async setupQuarter(request, response){
    const { year } = request.body;
    var file = JSON.parse(fs.readFileSync(`./src/database/seasons/${year}.json`, 'utf-8'));
    if (file && Object.keys(file.final_fase).length==3) {
      var classified = []
      var disclassified = []
      Object.entries(file.final_fase.round_of_8).forEach((i)=>{
        const [ key, value ] = i
        if (value.score_A_first_leg+value.score_A_second_leg > value.score_B_first_leg+value.score_B_second_leg) {
          classified.push(value.A);
          disclassified.push(value.B);
        }else if (value.score_A_first_leg+value.score_A_second_leg < value.score_B_first_leg+value.score_B_second_leg) {
          classified.push(value.B);
          disclassified.push(value.A);
        }
        else classified.push("UNDEFINED BY DUE")
      })
  
      var quarter_finals = {}
      for(i=0,j=1;i<8;i+=2, j++){
        var match = {
          "A": classified[i],
          "B": classified[i+1],
          "score_A_first_leg": 0,
          "score_B_first_leg": 0,
          "score_A_second_leg": 0,
          "score_B_second_leg": 0
        }
        quarter_finals[`match_${j}`] = match
      }
  
      file.final_fase['quarter_finals'] = quarter_finals;
      fs.writeFile(`./src/database/seasons/${year}.json`,JSON.stringify(file), 'utf-8', (err)=>{
        if (err) throw Error("Unable to write in season file at quarter finals")
        response.json({
          quarter_finals:file.final_fase.quarter_finals,
          disclassified,
        })
      });
    } else if (Object.keys(file.final_fase).length!=3) {
      throw Error("Trying to create quarter finals data which alerady exists")
    } else throw Error("Season File corrupted or inaccessible");
  },

  async setupSemis(request, response) {
    const { year } = request.body;
    var file = JSON.parse(fs.readFileSync(`./src/database/seasons/${year}.json`, 'utf-8'));
    if (file && Object.keys(file.final_fase).length==4) {
      var classified = []
      var disclassified = []
      Object.entries(file.final_fase.quarter_finals).forEach((i)=>{
        const [ key, value ] = i
        if (value.score_A_first_leg+value.score_A_second_leg > value.score_B_first_leg+value.score_B_second_leg) {
          classified.push(value.A);
          disclassified.push(value.B);
        }
        else if (value.score_A_first_leg+value.score_A_second_leg < value.score_B_first_leg+value.score_B_second_leg) {
          classified.push(value.B);
          disclassified.push(value.A);
        }
        else classified.push("UNDEFINED BY DUE")
      })
  
      var semi_finals = {}
      for(i=0,j=1;i<4;i+=2, j++){
        var match = {
          "A": classified[i],
          "B": classified[i+1],
          "score_A_first_leg": 0,
          "score_B_first_leg": 0,
          "score_A_second_leg": 0,
          "score_B_second_leg": 0
        }
        semi_finals[`match_${j}`] = match
      }
  
      file.final_fase['semi_finals'] = semi_finals;
      fs.writeFile(`./src/database/seasons/${year}.json`,JSON.stringify(file), 'utf-8', (err)=>{
        if (err) throw Error("Unable to write in season file at semi finals")
        response.json({
          semi_finals: file.final_fase.semi_finals,
          disclassified
        })
      });
    } else if (Object.keys(file.final_fase).length!=4) {
      throw Error("Trying to create semi finals data which alerady exists")
    } else throw Error("Season File corrupted or inaccessible");
  },

  async setupFinal(request, response){
    const { year } = request.body;
    var file = JSON.parse(fs.readFileSync(`./src/database/seasons/${year}.json`, 'utf-8'));
    if (file && Object.keys(file.final_fase).length==5) {
      var classified = []
      var disclassified = []
      Object.entries(file.final_fase.semi_finals).forEach((i)=>{
        const [ key, value ] = i
        if (value.score_A_first_leg+value.score_A_second_leg > value.score_B_first_leg+value.score_B_second_leg) {
          classified.push(value.A);
          disclassified.push(value.B);
        }
        else if (value.score_A_first_leg+value.score_A_second_leg < value.score_B_first_leg+value.score_B_second_leg) {
          classified.push(value.B);
          disclassified.push(value.A);
        }
        else classified.push("UNDEFINED BY DUE")
      }) 
      file.final_fase['final'] = {
        match: {
          "A": classified[0],
          "B": classified[1],
          "score_A": 0,
          "score_B": 0,
        }
      }
      fs.writeFile(`./src/database/seasons/${year}.json`,JSON.stringify(file), 'utf-8', (err)=>{
        if (err) throw Error("Unable to write in season file at finals")
        response.json({
          final: file.final_fase.final,
          disclassified
        })
      });
    } else if (Object.keys(file.final_fase).length!=5) {
      throw Error("Trying to create finals data which alerady exists")
    } else throw Error("Season File corrupted or inaccessible");
  },

  async registerSeason(request, response){
    const { 
      team_name,
      year,
      placement,
      biggest_opponent,
      least_opponent,
      wins,
      losses,
      dues,
      games,
      goalsfor,
      goalsagainst
    } = request.body;
        
    const [{ fans }] = await connection('teams').where('name', team_name).select('fans')

    const yearSplited = year.split('-')
    let yearNumber = parseInt(yearSplited[0])*10000 + parseInt(yearSplited[1])
    const id = `${yearNumber} ${team_name}`;

    var p = 0;
    switch(placement){
      case "GROUPS":
        p = 1;
        break;
      case "ROUNDOF8":
        p = 6;
        break;
      case "QUARTERS":
        p = 7;
        break;
      case "SEMIS":
        p = 8;
        break;
      case "FINALIST":
        const [{vices}] = await connection('teams').where('name', team_name).select('vices')
        await connection('teams').where('name', team_name).update('vices', vices+1)  
        p = 9;
        break;
      case "TITLE":
        const [{titles}] = await connection('teams').where('name', team_name).select('titles')
        await connection('teams').where('name', team_name).update('titles', titles+1)
        p = 10;
        break;
      default:
        throw Error("Wrong placement informed");
    }

    let season_score;
    if (!games) season_score = 0;
    else season_score = (wins-dues/2-losses)*(4/games)+(p*(5/games))+(goalsfor-goalsagainst)*0.01
    
    const data = {
      id,
      team_name,
      placement,
      season_score,
      wins,
      losses,
      dues,
      games,
      goalsfor,
      goalsagainst,
      biggest_opponent,
      least_opponent,
      fans,
    }

    await connection('seasons').insert(data)
    return response.json(data)
  },

  async getBestSeason(request, response){
    const seasons = await connection('seasons').select('*')
    let bestSeason, bestSeasonScore=0;
    seasons.map((i)=>{ 
      if (i.season_score>bestSeasonScore) {
        bestSeasonScore = i.season_score;
        bestSeason = i;
      }
    })

    const team = await connection('teams').where('name', bestSeason.team_name).select('*')
    return response.json({
      season: bestSeason,
      team: team
    })
  },

  async getbestWinstreak(request, response){    
    const teams = await connection('teams').select('*');
    let bestWinstreak=0, bestWinstreakTeam;

    teams.map(async(i)=>{
      const seasons = await connection('seasons')
        .where({'team_name':i.name, 'placement':'TITLE'})
        .select('*');
      
      let streak=0, streakID;
      if (seasons) seasons.map((j)=>{
        if (streakID){
          let array = streakID.split(' ')
          nextID = `${parseInt(array[0])+10001} ${array.slice(1)}`
          nextID = nextID.replace(/,/g, " ");
          if (j.id === nextID) {
            streak++;
            if (streak>bestWinstreak){
              bestWinstreak = streak;
              bestWinstreakTeam = i;
            }
          } else streak=0;
        }
        streakID = j.id;
      })  


      if (teams.indexOf(i)==teams.length-1)return response.json({
        team: bestWinstreakTeam,
        streak: bestWinstreak
      });
    })
  },

}

