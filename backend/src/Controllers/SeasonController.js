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

    teams.map(async(i)=>{
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

    for(i=0;i<teams.length;i++){
      const [{fans}] = await connection('teams').where('name', teams[i]).select('fans');
      const season = await connection('seasons').where('id', `${year.replace(/-/g,"")} ${teams[i]}`).select('*');
      if (season[0]) await connection('seasons').where('id', `${year.replace(/-/g,"")} ${teams[i]}`).update({
        id:`${year.replace(/-/g,"")} ${teams[i]}`,team_name:teams[i],placement:'PENDING',season_score:0,wins:0,losses:0,
        dues:0,games:0,goals_for:0,goals_against:0,fans,points:0,position_groups:0})
      else await connection('seasons').insert({id:`${year.replace(/-/g,"")} ${teams[i]}`,team_name:teams[i],
        placement:'PENDING',season_score:0,wins:0,losses:0,dues:0,games:0,goals_for:0,goals_against:0,
        fans,points:0,position_groups:0})
    }

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
    var file;
    try {file = JSON.parse(fs.readFileSync(`./src/database/seasons/${year}.json`, 'utf-8'))}
    catch (err) {file=0}
    return response.json(file)
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
        Object.entries(groups).forEach((i)=>{
          const [ key, value ] = i
          if (key==group){
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
          }
        })
        
        file.group_fase = groups      
      })
      fs.writeFile(`./src/database/seasons/${year}.json`, JSON.stringify(file), 'utf8', (err)=>{
        if (err) throw Error(err)
        return response.json(file);
      });      
    } else if (fase=="round of 8"){
      var matches = Object.entries(file.final_fase.round_of_8)
      outcomes.map((i)=>{
        matches[i[0]-1][1].score_A_first_leg = i[1]
        matches[i[0]-1][1].score_B_first_leg = i[2]
        matches[i[0]-1][1].score_A_second_leg = i[3]
        matches[i[0]-1][1].score_B_second_leg = i[4]
        matches[i[0]-1][1].score_A_penalties = i[5]
        matches[i[0]-1][1].score_B_penalties = i[6]
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
        matches[i[0]-1][1].score_A_first_leg = i[1]
        matches[i[0]-1][1].score_B_first_leg = i[2]
        matches[i[0]-1][1].score_A_second_leg = i[3]
        matches[i[0]-1][1].score_B_second_leg = i[4]
        matches[i[0]-1][1].score_A_penalties = i[5]
        matches[i[0]-1][1].score_B_penalties = i[6]
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
        matches[i[0]-1][1].score_A_first_leg = i[1]
        matches[i[0]-1][1].score_B_first_leg = i[2]
        matches[i[0]-1][1].score_A_second_leg = i[3]
        matches[i[0]-1][1].score_B_second_leg = i[4]
        matches[i[0]-1][1].score_A_penalties = i[5]
        matches[i[0]-1][1].score_B_penalties = i[6]
      })
      
      file.final_fase.semi_finals = {
       match_1: matches[0][1],
       match_2: matches[1][1]
      }
      fs.writeFileSync(`./src/database/seasons/${year}.json`, JSON.stringify(file),'utf-8');
      return response.json(file.final_fase.semi_finals)
    } else if (fase=="grand final"){  
      
      file.final_fase.final.match.score_A = outcomes[1]
      file.final_fase.final.match.score_B = outcomes[2]
      file.final_fase.final.match.score_A_penalties = outcomes[3]
      file.final_fase.final.match.score_B_penalties = outcomes[4]

      fs.writeFileSync(`./src/database/seasons/${year}.json`, JSON.stringify(file),'utf-8');
      
      var winner = outcomes[1]>outcomes[2]||outcomes[3]>outcomes[4]?file.final_fase.final.match.A:file.final_fase.final.match.B
      var loser = outcomes[1]<outcomes[2]||outcomes[3]<outcomes[4]?file.final_fase.final.match.A:file.final_fase.final.match.B
      

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

    let groupArray=[
      [g.team_1.name,g.team_1.points,g.team_1.current_position,g.team_1.old_position],
      [g.team_2.name,g.team_2.points,g.team_2.current_position,g.team_2.old_position],
      [g.team_3.name,g.team_3.points,g.team_3.current_position,g.team_3.old_position],
      [g.team_4.name,g.team_4.points,g.team_4.current_position,g.team_4.old_position]
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
      let potA=[], potB=[];
      
      await Promise.all(classified.map(async(i)=>{
        const [{country, jersey}] = await connection('teams').where('name',i).select('country','jersey')
        if (classified.indexOf(i)%2) potA.push([i,country,jersey])
        else potB.push([i,country,jersey])
      }))

      if (potA && potB) {
        function shuffleArray(array) {
          for (let i = array.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [array[i], array[j]] = [array[j], array[i]];
          }
        }
        let toBeShuffled = true, control=0;
        while(toBeShuffled){
          shuffleArray(potA)
          shuffleArray(potB)
          for(i=0;i<8;i+=2){
            if (potA[i][1]==potA[i+1][1]) {
              toBeShuffled = true;
              break;
            } else toBeShuffled = false;
            if (potB[i][1]==potB[i+1][1]) {
              toBeShuffled = true;
              break;
            } else toBeShuffled = false;
          }
          control++;
          if (control>=100) return response.json({error: `Couldn't find a right shuffle after ${control} times`})
        }


        var round_of_8 = {};
        for(i=0, j=1;i<16;i+=2, j++){
          if (i<8){
            var match = {
              "A": potA[i][0],
              "jerseyA":potA[i][2],
              "B": potA[i+1][0],
              "jerseyB":potA[i+1][2],
              "score_A_first_leg": 0,
              "score_B_first_leg": 0,
              "score_A_second_leg": 0,
              "score_B_second_leg": 0,
              "score_A_penalties":0,
              "score_B_penalties":0,
              "localA": potA[i][1],
              "localB": potA[i+1][1]
            }
          } else {
            var match = {
              "A": potB[i-8][0],
              "jerseyA":potB[i-8][2],
              "B": potB[i-7][0],
              "jerseyB":potB[i-7][2],
              "score_A_first_leg": 0,
              "score_B_first_leg": 0,
              "score_A_second_leg": 0,
              "score_B_second_leg": 0,
              "score_A_penalties":0,
              "score_B_penalties":0,
              "localA": potB[i-8][1],
              "localB": potB[i-7][1]
            }
          }
          round_of_8[`match_${j}`] = match
        }

        seasonFile.group_fase['classified'] = classified;
        seasonFile.group_fase['disclassified'] = disclassified;

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
            classified
          })
        })
      } else return response.json({error:'Problems during database connection'})
     
    } else if (Object.keys(seasonFile.final_fase).length!=0) {
      console.log('error')
      throw Error("Trying to create round of 8 data which alerady exists")
    } else {
      console.log('errro hre')
      throw Error("Season File corrupted or inaccessible");
    }
  },

  async setupQuarter(request, response){
    const { year } = request.body;
    var file = JSON.parse(fs.readFileSync(`./src/database/seasons/${year}.json`, 'utf-8'));
    if (file && Object.keys(file.final_fase).length==3) {
      var classified = []
      var disclassified = []
      Object.entries(file.final_fase.round_of_8).map((i)=>{
        const [ key, value ] = i
        if ((value.score_A_first_leg+value.score_A_second_leg > value.score_B_first_leg+value.score_B_second_leg)
        || (value.score_A_second_leg>value.score_B_first_leg)) {
          classified.push(value.A);
          disclassified.push(value.B);
        } else if ((value.score_A_first_leg+value.score_A_second_leg < value.score_B_first_leg+value.score_B_second_leg)
        || (value.score_A_second_leg<value.score_B_first_leg)) {
          classified.push(value.B);
          disclassified.push(value.A);
        } else if (value.score_A_penalties>value.score_B_penalties) {
          classified.push(value.A) 
          disclassified.push(value.B)
        } else if (value.score_A_penalties<value.score_B_penalties) {
          classified.push(value.B) 
          disclassified.push(value.A)
        } else {
          console.log('PROBLEM AT '+value.A+' x '+value.B)
          console.log('FIRST LEG: '+value.score_A_first_leg+' x '+value.score_B_first_leg)
          console.log('SECOND LEG: '+value.score_A_second_leg+' x '+value.score_B_second_leg)
        }
      })
  
      let infos=[]

      await Promise.all(classified.map(async(i)=>{
        const [{ country, jersey }] = await connection('teams').where('name', i).select('country', 'jersey')
        infos.push([i,country,jersey])
      }))
      var quarter_finals = {}
      for(i=0,j=1;i<8;i+=2, j++){
        var match = {
          "A": infos[i][0],
          "jerseyA":infos[i][2],
          "B": infos[i+1][0],
          "jerseyB":infos[i+1][2],
          "score_A_first_leg": 0,
          "score_B_first_leg": 0,
          "score_A_second_leg": 0,
          "score_B_second_leg": 0,
          "score_A_penalties": 0,
          "score_B_penalties":0,
          "localA":infos[i][1],
          "localB":infos[i+1][1]
        }
        quarter_finals[`match_${j}`] = match
      }
  
      file.final_fase['quarter_finals'] = quarter_finals;

      file.final_fase.round_of_8['classified'] = classified;
      file.final_fase.round_of_8['disclassified'] = disclassified;

      fs.writeFile(`./src/database/seasons/${year}.json`,JSON.stringify(file), 'utf-8', (err)=>{
        if (err) throw Error("Unable to write in season file at quarter finals")
        return response.json({
          quarter_finals:file.final_fase.quarter_finals,
          disclassified,
          classified
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
        if ((value.score_A_first_leg+value.score_A_second_leg > value.score_B_first_leg+value.score_B_second_leg)
          || (value.score_A_second_leg>value.score_B_first_leg)) {
          classified.push(value.A);
          disclassified.push(value.B);
        } else if ((value.score_A_first_leg+value.score_A_second_leg < value.score_B_first_leg+value.score_B_second_leg)
          || value.score_A_second_leg<value.score_B_first_leg) {
          classified.push(value.B);
          disclassified.push(value.A);
        } else if (value.score_A_penalties>value.score_B_penalties) {
          classified.push(value.A) 
          disclassified.push(value.B)
        } else if (value.score_A_penalties<value.score_B_penalties) {
          classified.push(value.B) 
          disclassified.push(value.A)
        } else classified.push("UNDEFINED BY DUE")
      })

      let infos=[]

      await Promise.all(classified.map(async(i)=>{
        const [{ country, jersey }] = await connection('teams').where('name', i).select('country', 'jersey')
        infos.push([i,country,jersey])
      }))

      var semi_finals = {}
      for(i=0,j=1;i<4;i+=2, j++){
        var match = {
          "A": infos[i][0],
          "jerseyA":infos[i][2],
          "B": infos[i+1][0],
          "jerseyB":infos[i+1][2],
          "score_A_first_leg": 0,
          "score_B_first_leg": 0,
          "score_A_second_leg": 0,
          "score_B_second_leg": 0,
          "score_A_penalties":0,
          "score_B_penalties":0,
          "localA":infos[i][1],
          "localB":infos[i+1][1]
        }
        semi_finals[`match_${j}`] = match
      }
  
      file.final_fase['semi_finals'] = semi_finals;

      file.final_fase.quarter_finals['classified'] = classified;
      file.final_fase.quarter_finals['disclassified'] = disclassified;
      
      fs.writeFile(`./src/database/seasons/${year}.json`,JSON.stringify(file), 'utf-8', (err)=>{
        if (err) throw Error("Unable to write in season file at semi finals")
        return response.json({
          semi_finals: file.final_fase.semi_finals,
          disclassified,
          classified
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
        } else if (value.score_A_first_leg+value.score_A_second_leg < value.score_B_first_leg+value.score_B_second_leg) {
          classified.push(value.B);
          disclassified.push(value.A);
        } else if (value.score_A_second_leg>value.score_B_first_leg){
          classified.push(value.A);
          disclassified.push(value.B);
        } else if (value.score_A_second_leg<value.score_B_first_leg){
          classified.push(value.B);
          disclassified.push(value.A);
        } else if (value.score_A_penalties>value.score_B_penalties) {
          classified.push(value.A) 
          disclassified.push(value.B)
        } else if (value.score_A_penalties<value.score_B_penalties) {
          classified.push(value.B) 
          disclassified.push(value.A)
        } else classified.push("UNDEFINED BY DUE")
      }) 

      const choices = [
        'Wembley Stadium - England',
        'Allianz Arena - Germany',
        'Gazprom Arena - Russia',
        'Estadio do Dragao - Portugal',
        'Estadio da Luz - Portugal',
        'Wanda Metropolitano - Spain',
        'NSC Olimpiyskiy - Ukraine',
        'Millennium Stadium - Wales',
        'San Siro - Spain',
        'Olympiastadion Berlin - Germany'
      ]
      const stadium = choices[Math.round(Math.random()*choices.length)]
      const jerseyA = await connection('teams').where('name',classified[0]).select('jersey')
      const jerseyB = await connection('teams').where('name',classified[1]).select('jersey')

      file.final_fase['final'] = {
        match: {
          "A": classified[0],
          "B": classified[1],
          "score_A": 0,
          "jerseyA":jerseyA[0].jersey,
          "score_B": 0,
          "jerseyB":jerseyB[0].jersey,
          "score_A_penalties":0,
          "score_A_penalties":0,
          "local": stadium
        }
      }

      file.final_fase.semi_finals['classified'] = classified;
      file.final_fase.semi_finals['disclassified'] = disclassified;

      fs.writeFile(`./src/database/seasons/${year}.json`,JSON.stringify(file), 'utf-8', (err)=>{
        if (err) throw Error("Unable to write in season file at finals")
        return response.json({
          final: file.final_fase.final,
          disclassified,
          classified
        })
      });
    } else if (Object.keys(file.final_fase).length!=5) {
      throw Error("Trying to create finals data which alerady exists")
    } else throw Error("Season File corrupted or inaccessible");
  },

  async getSeason(request,response){
    const { id } = request.params;
    const data = await connection('seasons').where('id', id).select('*')
    return response.json(data)
  },
  
  async updateSeason(request, response){
    const { 
      year,
      team_name,
      placement,
      biggest_opponent,
      least_opponent,
      wins,
      losses,
      dues,
      games,
      goals_for,
      goals_against
    } = request.body;
        
    const [{ fans }] = await connection('teams').where('name', team_name).select('fans')

    const id = `${year.replace(/-/g,"")} ${team_name}`;

    var p = 0;
    switch(placement){
      case "GROUPS":
        p = 1;
        break;
      case "ROUNDOF8":
        p = 2;
        break;
      case "QUARTERS":
        p = 3;
        break;
      case "SEMIS":
        p = 4;
        break;
      case "FINALIST":
        const [{vices}] = await connection('teams').where('name', team_name).select('vices')
        await connection('teams').where('name', team_name).update('vices', vices+1)  
        p = 10;
        break;
      case "TITLE":
        const [{titles}] = await connection('teams').where('name', team_name).select('titles')
        await connection('teams').where('name', team_name).update('titles', titles+1)
        p = 20;
        break;
      default: break;
    }

    let season_score;
    if (!games) season_score = 0;
    else season_score = (wins-dues/2-losses)*(4/games)+(5*p/20)+(goals_for-goals_against)*0.01

    if (season_score<0) {season_score*=-1;season_score/=10;}

    season_score = (Math.round(season_score*100))/100
    
    let position_groups, points;
    const file = JSON.parse(fs.readFileSync(`./src/database/seasons/${year}.json`, 'utf-8'))
    Object.entries(file.group_fase).map((i)=>{
      Object.entries(i[1]).map((j)=>{
        if (j[1].name===team_name){
          position_groups = j[1].current_position;
          points = j[1].points;
        }
      })
    }) 

    const data = {
      id,
      team_name,
      placement,
      season_score,
      points,
      position_groups,
      wins,
      losses,
      dues,
      games,
      goals_for,
      goals_against,
      // biggest_opponent,
      // least_opponent,
      fans,
    } 

    const season = await connection('seasons').where('id',id).select('*')
    if (season[0]) await connection('seasons').where('id',id).update(data)
    else await connection('seasons').insert(data)
    return response.json(data)
  },

  async getBestSeason(request, response){
    const seasons = await connection('seasons').select('*')
    if (seasons!=""){
      let bestSeason, bestSeasonScore=0;
      let worstSeason, worstSeasonScore=10000000;
      seasons.map((i)=>{ 
        if (i.season_score>bestSeasonScore) {
          bestSeasonScore = i.season_score;
          bestSeason = i;
        }

        if (i.season_score<worstSeasonScore) {
          worstSeasonScore = i.season_score;
          worstSeason = i;
        }

      })
      const bestSeasonTeam = await connection('teams').where('name', bestSeason.team_name).select('*')
      const worstSeasonTeam = await connection('teams').where('name', worstSeason.team_name).select('*')
      return response.json({
        bestSeason,
        bestSeasonTeam,
        worstSeason,
        worstSeasonTeam,
      })
    } else return response.status(408).json('No seasons available')
  },

  async getbestWinstreak(request, response){    
    const teams = await connection('teams').select('*');
    let bestWinstreak=1, bestWinstreakTeam;

    teams.map(async(i)=>{
      const seasons = await connection('seasons')
        .where({'team_name':i.name, 'placement':'TITLE'})
        .select('*');
        
      let streak=1, streakID;
      if (seasons) seasons.map((j)=>{
        if (!bestWinstreakTeam) bestWinstreakTeam = i;
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
          } else streak=1;
        }
        streakID = j.id;
      })  

      if (teams.indexOf(i)==teams.length-1) return response.json({team: bestWinstreakTeam,streak: bestWinstreak});
    })
  },

  async getAnyFile(request,response){
    fs.readdir('./src/database/seasons', (err, files)=>{
      if(err) return response.json(err)
      if (files[files.length-2]) return response.json(files[files.length-2]);
      else return response.json('2020-2021.json');
    })
  },

  async deletefile(request,response){
    const { file } = request.params;
    await fs.unlink(`./src/database/seasons/${file}.json`, (err)=>{
      if (err) return response.json("COULDN'T DELETE FILE")
      else return response.json('SUCCESSFULY DELETED')
    })
  },

  async getClassified(request,response){
    const { fase, year } = request.body;
    const seasonFile = JSON.parse(fs.readFileSync(`./src/database/seasons/${year}.json`, 'utf-8'))   
    switch(fase){
      case 'GROUPS':
        return response.json(seasonFile.group_fase.classified);
      case 'ROUNDOF8':
        return response.json(seasonFile.final_fase.round_of_8.classified);
      case 'QUARTERS':
        return response.json(seasonFile.final_fase.quarter_finals.classified);
      case 'SEMIS':
        return response.json(seasonFile.final_fase.semi_finals.classified);
      case 'FINAL':
        return response.json(seasonFile.final_fase.final.classified);
    }
  },

  async getDisclassified(request,response){
    const { fase, year } = request.body;
    const seasonFile = JSON.parse(fs.readFileSync(`./src/database/seasons/${year}.json`, 'utf-8'))   
    switch(fase){
      case 'GROUPS':
        return response.json(seasonFile.group_fase.disclassified);
      case 'ROUNDOF8':
        return response.json(seasonFile.final_fase.round_of_8.disclassified);
      case 'QUARTERS':
        return response.json(seasonFile.final_fase.quarter_finals.disclassified);
      case 'SEMIS':
        return response.json(seasonFile.final_fase.semi_finals.disclassified);
      case 'FINAL':
        return response.json(seasonFile.final_fase.final.disclassified);
    }
  }

}

