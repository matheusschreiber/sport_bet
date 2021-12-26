import React, { useState, useEffect } from "react";
import { FiChevronUp, FiChevronDown, FiMinus, FiAward } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import './style.css'

import Header from "../Components/header";
import Footer from "../Components/footer";


export default function GroupFasePage(){
  const nav = useNavigate()
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
    let array=[];
    await api.post('/getGroup', {year: localStorage.getItem('SEASON'),group:"a",}).then((response)=>{array[0]=response.data})
      .then(()=>api.post('/getGroup', {year: localStorage.getItem('SEASON'),group:"b",})).then((response)=>{array[1]=response.data})
      .then(()=>api.post('/getGroup', {year: localStorage.getItem('SEASON'),group:"c",})).then((response)=>{array[2]=response.data})
      .then(()=>api.post('/getGroup', {year: localStorage.getItem('SEASON'),group:"d",})).then((response)=>{array[3]=response.data})
      .then(()=>api.post('/getGroup', {year: localStorage.getItem('SEASON'),group:"e",})).then((response)=>{array[4]=response.data})
      .then(()=>api.post('/getGroup', {year: localStorage.getItem('SEASON'),group:"f",})).then((response)=>{array[5]=response.data})
      .then(()=>api.post('/getGroup', {year: localStorage.getItem('SEASON'),group:"g",})).then((response)=>{array[6]=response.data})
      .then(()=>api.post('/getGroup', {year: localStorage.getItem('SEASON'),group:"h",})).then((response)=>{array[7]=response.data})
    
    array.map((i)=>{
      i.data.sort((a,b)=>a[2]-b[2])
    })
    setGroups(array)
    console.log(array)
  }

  async function simulateGroupFase(){
    //await api.put('/updateMatchFile', )

    function generateGroupOutcomes(g){
      let array = [];
      let a1 = Math.round((g[0][4]*Math.random()*3)/g[0][4])          //FANS
      let a2 = g[0][6]?Math.round(g[0][5]/g[0][6]*Math.random()*4):0  //GOALS/GAMES
      let a3 = 1;                                                     //HOME or AWAY
      let a4 = a1+a2+a3==4?Math.round(Math.random()*4):0              //CHOCOLATE MULTIPLIER
      
      let b1 = Math.round((g[1][4]*Math.random()*3)/g[1][4])
      let b2 = g[1][6]?Math.round(g[1][5]/g[1][6]*Math.random()*4):0
      let b3 = 0;
      let b4 = b1+b2+b3==4?Math.round(Math.random()*4):0
      
      let a5 = (b1+b2+b3+b4)*(-1)
      let score_a = a1+a2+a3+a4+a5>0?a1+a2+a3+a4+a5:0

      let b5 = (a1+a2+a3+a4)*(-1)
      let score_b = b1+b2+b3+b4+b5>0?b1+b2+b3+b4+b5:0

      array[0] = [1,score_a,score_b]

      console.log(`A: ${a1} ${a2} ${a3} ${a4} ${a5} ${score_a}`)
      console.log(`B: ${b1} ${b2} ${b3} ${b4} ${b5} ${score_b}`)

      return array;
    }

    let data ={
      year: localStorage.getItem('SEASON'),
      fase: 'group',
      outcome: {
        group_a:generateGroupOutcomes(groups[0].data),
        group_b:generateGroupOutcomes(groups[1].data),
        group_c:generateGroupOutcomes(groups[2].data),
        group_d:generateGroupOutcomes(groups[3].data),
        group_e:generateGroupOutcomes(groups[4].data),
        group_f:generateGroupOutcomes(groups[5].data),
        group_g:generateGroupOutcomes(groups[6].data),
        group_h:generateGroupOutcomes(groups[7].data),
      }
    }
    console.log(data)
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

        <div className="button" onClick={simulateGroupFase}>SIMULATE ENTIRE GROUP FASE</div>
      </div>
      <Footer />
    </div>
  );
}