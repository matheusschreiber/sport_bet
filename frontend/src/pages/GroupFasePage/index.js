import React, { useState, useEffect } from "react";
import { FiChevronUp, FiChevronDown, FiMinus} from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import './style.css'

import { Dots } from "react-activity";
import "react-activity/dist/Dots.css";

import Header from "../Components/header";
import Footer from "../Components/footer";


export default function GroupFasePage(){
  const nav = useNavigate()
  const [ loading, setLoading ] = useState(false);
  const [ update, setUpdate ] = useState([])
  const [ finished, setFinished ] = useState(false);
  const [ loadedGroups, setLoadedGroups ] = useState([])
  const [ match_log, setMatchLog ] = useState([[],[],[],[],[],[],[],[],[]])
  const [ groups, setGroups ] = useState([{
    group: 'A',
    data: [
      ['LOADING...',0,1,2],
      ['LOADING...',0,2,1],
      ['LOADING...',0,3,3],
      ['LOADING...',0,4,4]
    ]
  }]);
  
  
  async function getGroups(){
    console.log('UPDATING GROUPS, YEAR: '+localStorage.getItem('SEASON'))
    try{
      let array=[], response;
      response = await api.put('/getGroup', {year: localStorage.getItem('SEASON'),group:"a",}); array[0] = response.data;
      response = await api.put('/getGroup', {year: localStorage.getItem('SEASON'),group:"b",}); array[1] = response.data;
      response = await api.put('/getGroup', {year: localStorage.getItem('SEASON'),group:"c",}); array[2] = response.data;
      response = await api.put('/getGroup', {year: localStorage.getItem('SEASON'),group:"d",}); array[3] = response.data;
      response = await api.put('/getGroup', {year: localStorage.getItem('SEASON'),group:"e",}); array[4] = response.data;
      response = await api.put('/getGroup', {year: localStorage.getItem('SEASON'),group:"f",}); array[5] = response.data;
      response = await api.put('/getGroup', {year: localStorage.getItem('SEASON'),group:"g",}); array[6] = response.data;
      response = await api.put('/getGroup', {year: localStorage.getItem('SEASON'),group:"h",}); array[7] = response.data;
      
      array.map((i)=>{i.data.sort((a,b)=>a[2]-b[2]); return 0;})
      setGroups(array)
      if (array[7].data[0][1]||array[7].data[1][1]||array[7].data[2][1]||array[7].data[3][1]) setFinished(true)
      else setFinished(false)
    } catch(err){
      alert('PROBLEM IN CONNECTION WITH BACKEND TRY RESTARTING THE PAGE')
    }
  }
  
  async function simulateGroupFase(){
    setLoading(true)
    
    async function generateMatchOutcome(match, team_1, team_2, id){
      let answer = []
      const response = await api.put('/match', {year:localStorage.getItem('SEASON'),team_1,team_2})
      
      await api.post('./rgmatch', {
        year:localStorage.getItem('SEASON'),
        team_A:response.data.outcome.team_1.name,
        team_B:response.data.outcome.team_2.name,
        score_A:response.data.outcome.team_1.goals,
        score_B:response.data.outcome.team_2.goals
      })
      
      let matchArray = match_log.slice()      
      matchArray[id].push(response.data.outcome.team_1.name + ' ' + response.data.outcome.team_1.goals + ' x ' + response.data.outcome.team_2.goals + ' ' + response.data.outcome.team_2.name)      
      setMatchLog(matchArray)    

      answer = [ match, response.data.outcome.team_1.goals, response.data.outcome.team_2.goals ];
      return answer;
    }
    
    async function generateGroupOutcomes(g, id){
      let array = [];
      array[0] = await generateMatchOutcome(1,g[0][0],g[1][0], id);
      array[1] = await generateMatchOutcome(2,g[2][0],g[3][0], id);
      
      array[2] = await generateMatchOutcome(3,g[0][0],g[2][0], id);
      array[3] = await generateMatchOutcome(4,g[1][0],g[3][0], id);
      
      array[4] = await generateMatchOutcome(5,g[0][0],g[3][0], id);
      array[5] = await generateMatchOutcome(6,g[1][0],g[2][0], id);
      
      array[6] = await generateMatchOutcome(7,g[1][0],g[0][0], id);
      array[7] = await generateMatchOutcome(8,g[3][0],g[2][0], id);
      
      array[8] = await generateMatchOutcome(9,g[2][0],g[0][0], id);
      array[9] = await generateMatchOutcome(10,g[3][0],g[1][0], id);
      
      array[10] = await generateMatchOutcome(11,g[3][0],g[0][0], id);
      array[11] = await generateMatchOutcome(12,g[2][0],g[1][0], id);
      
      
      
      return array;
    }

    let i=0;
    for(i=0;i<8;i++) {
      let data, done = false;
      try {
        const response = await api.put('/getGroup', {year:localStorage.getItem('SEASON'),group:groups[i].group})
        if (response.data.data[0][1]||response.data.data[1][1]||response.data.data[2][1]||response.data.data[3][1]) done = true;
        if (!done) {
          switch (groups[i].group){
            case "A": data = {group_a: await generateGroupOutcomes(groups[i].data, i)};break;
            case "B": data = {group_b: await generateGroupOutcomes(groups[i].data, i)};break;
            case "C": data = {group_c: await generateGroupOutcomes(groups[i].data, i)};break;
            case "D": data = {group_d: await generateGroupOutcomes(groups[i].data, i)};break;
            case "E": data = {group_e: await generateGroupOutcomes(groups[i].data, i)};break;
            case "F": data = {group_f: await generateGroupOutcomes(groups[i].data, i)};break;
            case "G": data = {group_g: await generateGroupOutcomes(groups[i].data, i)};break;
            case "H": data = {group_h: await generateGroupOutcomes(groups[i].data, i)};break;
            default: data = null;
          }

          await api.put('/updateMatchFile', {
            year: localStorage.getItem('SEASON'),
            fase: "group",
            outcomes: data
          })

          const res = await api.put('/getGroup', {year:localStorage.getItem('SEASON'),group:groups[i].group})
          let array = groups.slice()
          array[i].data = res.data.data
          array.map((j)=>{j.data.sort((a,b)=>a[2]-b[2]); return 0;})
          setGroups(array)
        }
        setLoadedGroups(loadedGroups.push(0))
      } catch(err){
        alert('Request response delay is off. Remove any nodemon activities and restart backend')
        console.log(err)
        setFinished(true);
        setLoading(false);
        break;
      }
    }
    setFinished(true);
    setLoading(false);
  }
  
  useEffect(()=>{
    if (update.length===0) window.scroll(0,0);
    setTimeout(getGroups, 500)
  }, [update])
  
  return(
    <div>
      <Header />
      <div className="groups_container">
        <div className="title_container">
          <h1>CLASSIFICATIONS</h1>  
          <h2>SEASON { localStorage.getItem('SEASON')?localStorage.getItem('SEASON'):'LOADING...' }</h2>
        </div>
        <div className="HIGHLIGHT" onClick={()=>setUpdate(update.push([]))}><h1>GROUP FASE</h1></div>
        
        <div className="groups_grid">
          <ul className="grid">
            { 
              groups.map((i)=>(
                <li key={i.group}>
                  <div className="group_external_container">
                    <div className="group_container_bg2">
                      <div className="group_container_bg1">
                        <div className="group_highlight"><h2>GROUP {i.group}</h2></div>
                        <div className="group_container">
                          <ul>
                            <li>{i.data[0][0]}</li>
                            <li>{i.data[1][0]}</li>
                            <li>{i.data[2][0]}</li>
                            <li>{i.data[3][0]}</li>
                          </ul>

                          <ul>
                            <li>{i.data[0][1]}</li>
                            <li>{i.data[1][1]}</li>
                            <li>{i.data[2][1]}</li>
                            <li>{i.data[3][1]}</li>
                          </ul>

                          <ul>
                            {i.data[0][2]<i.data[0][3]?<li><FiChevronUp size={20} color="var(--verde)"/></li>:i.data[0][2]>i.data[0][3]?<li><FiChevronDown size={20} color="var(--vermelho_claro_plus)"/></li>:<li><FiMinus size={20} color="var(--cinza)"/></li>}
                            {i.data[1][2]<i.data[1][3]?<li><FiChevronUp size={20} color="var(--verde)"/></li>:i.data[1][2]>i.data[1][3]?<li><FiChevronDown size={20} color="var(--vermelho_claro_plus)"/></li>:<li><FiMinus size={20} color="var(--cinza)"/></li>}
                            {i.data[2][2]<i.data[2][3]?<li><FiChevronUp size={20} color="var(--verde)"/></li>:i.data[2][2]>i.data[2][3]?<li><FiChevronDown size={20} color="var(--vermelho_claro_plus)"/></li>:<li><FiMinus size={20} color="var(--cinza)"/></li>}
                            {i.data[3][2]<i.data[3][3]?<li><FiChevronUp size={20} color="var(--verde)"/></li>:i.data[3][2]>i.data[3][3]?<li><FiChevronDown size={20} color="var(--vermelho_claro_plus)"/></li>:<li><FiMinus size={20} color="var(--cinza)"/></li>}
                          </ul>
                        </div>
                          <div className="match_log" style={match_log[groups.indexOf(i)].length && !match_log[groups.indexOf(i)+1].length && !finished?{}:{display:'none'}}>
                            <div className="inner_match_log" style={{marginTop:`-${(match_log[groups.indexOf(i)].length-1)*13}px`}}>
                              {match_log[groups.indexOf(i)]?match_log[groups.indexOf(i)].map((j)=>(
                                  <p>{j}</p>
                                )):""}
                            </div>
                          </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))
            }
          </ul>
        </div>

        <div className="load_square_container" style={loading?{}:{display:'none'}}>
          <div className="load_square" style={loadedGroups>0?{backgroundColor:'var(--verde)'}:{backgroundColor:'var(--vermelho_claro_plus'}}></div>
          <div className="load_square" style={loadedGroups>1?{backgroundColor:'var(--verde)'}:{backgroundColor:'var(--vermelho_claro_plus'}}></div>
          <div className="load_square" style={loadedGroups>2?{backgroundColor:'var(--verde)'}:{backgroundColor:'var(--vermelho_claro_plus'}}></div>
          <div className="load_square" style={loadedGroups>3?{backgroundColor:'var(--verde)'}:{backgroundColor:'var(--vermelho_claro_plus'}}></div>
          <div className="load_square" style={loadedGroups>4?{backgroundColor:'var(--verde)'}:{backgroundColor:'var(--vermelho_claro_plus'}}></div>
          <div className="load_square" style={loadedGroups>5?{backgroundColor:'var(--verde)'}:{backgroundColor:'var(--vermelho_claro_plus'}}></div>
          <div className="load_square" style={loadedGroups>6?{backgroundColor:'var(--verde)'}:{backgroundColor:'var(--vermelho_claro_plus'}}></div>
          <div className="load_square" style={loadedGroups>7?{backgroundColor:'var(--verde)'}:{backgroundColor:'var(--vermelho_claro_plus'}}></div>
        </div>
        <Dots color="var(--vermelho_escuro)" style={loading?{display:'block'}:{display:'none'}}/>
        <div className="button" style={finished?{display:'none'}:{}} onClick={simulateGroupFase} id={loading?'pressed':''}>
          {loading?'LOADING':'SIMULATE ENTIRE GROUP FASE'}</div>

        <div className="button" style={finished?{}:{display:'none'}} onClick={()=>nav('/finals')}>GO TO FINAL FASE</div>
      </div>
      <Footer />
    </div>
  );
}