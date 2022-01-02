import React, { useState, useEffect } from "react";
import { FiChevronUp, FiChevronDown, FiMinus, FiAward } from 'react-icons/fi'
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
  const [ finished, setFinished ] = useState(false);
  const [ loadedGroups, setLoadedGroups ] = useState([0])
  const [ groups, setGroups ] = useState([{
    group: 'A',
    data: [
      ['LOADING...',0,1,2],
      ['LOADING...',0,2,1],
      ['LOADING...',0,3,3],
      ['LOADING...',0,4,4]
    ]
  }]);
  
  useEffect(()=>{
    window.scroll(0,0);
    getGroups()
  }, [])

  async function getGroups(){
    console.log('UPDATING GROUPS')
    let array=[];
    await api.post('/getGroup', {year: localStorage.getItem('SEASON'),group:"a",}).then((response)=>{array[0]=response.data})
      .then(()=>api.post('/getGroup', {year: localStorage.getItem('SEASON'),group:"b",})).then((response)=>{array[1]=response.data})
      .then(()=>api.post('/getGroup', {year: localStorage.getItem('SEASON'),group:"c",})).then((response)=>{array[2]=response.data})
      .then(()=>api.post('/getGroup', {year: localStorage.getItem('SEASON'),group:"d",})).then((response)=>{array[3]=response.data})
      .then(()=>api.post('/getGroup', {year: localStorage.getItem('SEASON'),group:"e",})).then((response)=>{array[4]=response.data})
      .then(()=>api.post('/getGroup', {year: localStorage.getItem('SEASON'),group:"f",})).then((response)=>{array[5]=response.data})
      .then(()=>api.post('/getGroup', {year: localStorage.getItem('SEASON'),group:"g",})).then((response)=>{array[6]=response.data})
      .then(()=>api.post('/getGroup', {year: localStorage.getItem('SEASON'),group:"h",})).then((response)=>{array[7]=response.data})
    
    array.map((i)=>{i.data.sort((a,b)=>a[2]-b[2]); return 0;})
    setGroups(array)
    if (array[0].data[0][1]||array[0].data[1][1]||array[0].data[2][1]||array[0].data[3][1]) setFinished(true)
    else setFinished(false)
  }

  async function simulateGroupFase(){
    setLoading(true)

    async function generateMatchOutcome(match, team_1, team_2){
      let answer = []
      await api.put('/match', {team_1,team_2}).then((response)=>{
        console.log(response.data.outcome.team_1.name + ' ' + response.data.outcome.team_1.goals + ' x ' + response.data.outcome.team_2.goals + ' ' + response.data.outcome.team_2.name)
        answer = [ match, response.data.outcome.team_1.goals, response.data.outcome.team_2.goals ];
      })
      return answer;
    }

    async function generateGroupOutcomes(g){
      let array = [];
      array[0] = await generateMatchOutcome(1,g[0][0],g[1][0]);
      array[1] = await generateMatchOutcome(2,g[2][0],g[3][0]);
      
      array[2] = await generateMatchOutcome(3,g[0][0],g[2][0]);
      array[3] = await generateMatchOutcome(4,g[1][0],g[3][0]);
      
      array[4] = await generateMatchOutcome(5,g[0][0],g[3][0]);
      array[5] = await generateMatchOutcome(6,g[1][0],g[2][0]);
      
      array[6] = await generateMatchOutcome(7,g[1][0],g[0][0]);
      array[7] = await generateMatchOutcome(8,g[3][0],g[2][0]);
      
      array[8] = await generateMatchOutcome(9,g[2][0],g[0][0]);
      array[9] = await generateMatchOutcome(10,g[3][0],g[1][0]);
      
      array[10] = await generateMatchOutcome(11,g[3][0],g[0][0]);
      array[11] = await generateMatchOutcome(12,g[2][0],g[1][0]);

      setLoadedGroups(loadedGroups.push(0))
      return array;
    }

    let innerGroups = [], i=0;
    for(i=0;i<8;i++) innerGroups[i] = await generateGroupOutcomes(groups[i].data)

    let data ={
      year: localStorage.getItem('SEASON'),
      fase: "group",
      outcomes: {
        group_a: innerGroups[0],
        group_b: innerGroups[1],
        group_c: innerGroups[2],
        group_d: innerGroups[3],
        group_e: innerGroups[4],
        group_f: innerGroups[5],
        group_g: innerGroups[6],
        group_h: innerGroups[7]
      }
    }

    api.put('/updateMatchFile', data).then(()=>{
      setFinished(true);
      setLoading(false);
    })
  }
  
  return(
    <div>
      <Header />
      <div className="groups_container">
        <div className="history_linker" onClick={()=>nav('/history')}>
          <h2>TEAMS HISTORY</h2>
          <FiAward size={40}/>
        </div>
        <div className="title_container">
          <h1>CLASSIFICATIONS</h1>  
          <h2>SEASON { localStorage.getItem('SEASON')?localStorage.getItem('SEASON'):'LOADING...' }</h2>
        </div>
        <div className="HIGHLIGHT" onClick={getGroups}><h1>GROUP FASE</h1></div>
        
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
                      </div>
                    </div>
                  </div>
                </li>
              ))
            }
          </ul>
        </div>

        <div className="load_square_container" style={loading?{}:{display:'none'}}>
          <div className="load_square" style={loadedGroups>1?{backgroundColor:'var(--verde)'}:{backgroundColor:'var(--vermelho_claro_plus'}}></div>
          <div className="load_square" style={loadedGroups>2?{backgroundColor:'var(--verde)'}:{backgroundColor:'var(--vermelho_claro_plus'}}></div>
          <div className="load_square" style={loadedGroups>3?{backgroundColor:'var(--verde)'}:{backgroundColor:'var(--vermelho_claro_plus'}}></div>
          <div className="load_square" style={loadedGroups>4?{backgroundColor:'var(--verde)'}:{backgroundColor:'var(--vermelho_claro_plus'}}></div>
          <div className="load_square" style={loadedGroups>5?{backgroundColor:'var(--verde)'}:{backgroundColor:'var(--vermelho_claro_plus'}}></div>
          <div className="load_square" style={loadedGroups>6?{backgroundColor:'var(--verde)'}:{backgroundColor:'var(--vermelho_claro_plus'}}></div>
          <div className="load_square" style={loadedGroups>7?{backgroundColor:'var(--verde)'}:{backgroundColor:'var(--vermelho_claro_plus'}}></div>
          <div className="load_square" style={loadedGroups>8?{backgroundColor:'var(--verde)'}:{backgroundColor:'var(--vermelho_claro_plus'}}></div>
        </div>
        <Dots color="var(--vermelho_escuro)" style={loading?{display:'block'}:{display:'none'}}/>
        <div className="button" style={finished?{display:'none'}:{}} onClick={simulateGroupFase}>SIMULATE ENTIRE GROUP FASE</div>
        <div className="button" style={finished?{}:{display:'none'}} onClick={()=>nav('/finals')}>GO TO FINAL FASE</div>
      </div>
      <Footer />
    </div>
  );
}