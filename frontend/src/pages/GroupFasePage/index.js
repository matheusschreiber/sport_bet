import React, { useState, useEffect } from "react";
import { FiChevronUp, FiChevronDown, FiMinus, FiAward } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import './style.css'

import Header from "../Components/header";
import Footer from "../Components/footer";


export default function GroupFasePage(){
  useEffect(()=>{
    window.scroll(0,0);
    getGroups()
  }, [])
  
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
      .then(setGroups(array))
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
        <div className="HIGHLIGHT"><h1>GROUP FASE</h1></div>
        
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

        <div className="button">SIMULATE ENTIRE GROUP FASE</div>
      </div>
      <Footer />
    </div>
  );
}