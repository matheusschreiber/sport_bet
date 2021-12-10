import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from '../../services/api'

import './style.css'
import { FiArrowRight, FiRotateCw } from 'react-icons/fi'

import Footer from "../Components/footer";
import Header from "../Components/header";

export default function Historypage(){
  const linkLogo1 = 'https://upload.wikimedia.org/wikipedia/pt/d/d2/Logo_PSG.png'
  const linkLogo2 = 'https://upload.wikimedia.org/wikipedia/pt/thumb/b/b8/AFC_Ajax_Amsterdam.svg/1200px-AFC_Ajax_Amsterdam.svg.png'
  const linkLogo3 = 'https://upload.wikimedia.org/wikipedia/pt/thumb/0/0c/Liverpool_FC.svg/1200px-Liverpool_FC.svg.png'
  const linkLogo4 = 'https://upload.wikimedia.org/wikipedia/pt/1/19/AtleticoMadrid2017.png'
  
  const nav = useNavigate();
  const [ teams, setTeams ] = useState([]);
  const [ update, setUpdate ] = useState([false]);

  useEffect(()=>{
    api.get('/teams').then((response)=>{setTeams(response.data)})
  }, [])

  function createAllTeams(){
    let teamsRaw=[]
    api.get('/allteams').then((response)=>{
      teamsRaw=response.data[0]
      Object.entries(teamsRaw).map((i)=>{
        const data = {
          name: i[0],
          acronym: i[1].acronym,
          country: i[1].country,
          fans: i[1].fans,
          jersey: i[1].jersey
        }
        api.post('/newteam', data)
      })
    })
  }
  
  function updateTable(){
    api.get('/teams').then((response)=>{
      setTeams(response.data)
      let a = teams.slice();
      a.sort(function(a,b){
        if (a.titles>b.titles) return -1;
        else if (a.titles<b.titles) return 1;
        else return 0;
      })
      setTeams(a);
    })
  }

  return(
    <div>
      <Header/>
      <div className="history_container">
        <div className="button" onClick={createAllTeams} 
          style={teams.length!=32?{}:{display:'none'}}>GENERATE TEAMS</div>
        <div className="history_back">
          <h2 onClick={()=>nav('/groups')}>GO BACK</h2>
          <FiArrowRight size={27}/>
        </div>
        <div className="table_title">
          <h1>ALL TIME RECORDS</h1>
          <FiRotateCw size={20} onClick={updateTable} style={{cursor:'pointer'}}/>
        </div>
        <table>
          <thead>
            <tr>
              <th>POS</th>
              <th>TEAM</th>
              <th>GOALS FOR</th>
              <th>GOALS AGAINST</th>
              <th>WINS DUES &amp; LOSSES</th>
              <th>MAJOR OPPONENT</th>
              <th>EASIEST OPPONENT</th>
              <th>TITLES</th>
            </tr>
          </thead>
          <tbody>
          {
            teams.map((i)=>(
              <tr style={teams.indexOf(i)+1===1?{color:'var(--amarelo)'}:
              teams.indexOf(i)+1===2?{color:'var(--cinza)'}:
              teams.indexOf(i)+1===3?{color:'var(--bronze)'}:
              teams.indexOf(i)+1>=30?{color:'var(--vermelho_escuro)'}:{}}
              key={i.name}>
                <td>{teams.indexOf(i)+1}</td>
                <td>{i.name.toUpperCase()}</td>
                <td>{i.goalsfor}</td>
                <td>{i.goalsagainst}</td>
                <td>{i.wins} - {i.dues} - {i.losses}</td>
                <td>{i.biggest_opponent}</td>
                <td>{i.least_opponent}</td>
                <td>{i.titles} 🥇 - {i.vices} 🥈</td>
              </tr>
            ))
          }
          </tbody>
        </table>
      </div>
      <div className="hall">
        <section>
          <div className="hall_card">
            <div>
              <div className="HIGHLIGHT"><h1>BIGGEST WINNER</h1></div>
              <div className="HIGHLIGHT_SUB"><h2>6 TITLES</h2></div>
            </div>
            <img src={linkLogo1} alt="" />
            <h1>PARIS SAINT GERMAIN</h1>
          </div>
          <div className="hall_card">
            <div>
              <div className="HIGHLIGHT"><h1>TOP SCORER</h1></div>
              <div className="HIGHLIGHT_SUB"><h2>350 GOALS</h2></div>
            </div>
            <img src={linkLogo2} alt=""/>
            <h1>AJAX</h1>
          </div>
        </section>
        <section>
          <div className="hall_card">
            <div>
              <div className="HIGHLIGHT"><h1>BEST SEASON</h1></div>
              <div className="HIGHLIGHT_SUB"><h2>2019-2020</h2></div>
            </div>
            <img src={linkLogo3} alt=""/>
            <h1>LIVERPOOL</h1>
            <br/>
            <p>20 GOALS FOR</p>
            <p>4 GOALS AGAINST</p>
            <p>8 WINS</p>
            <p>4 LOSSES</p>
            <p>FINALIST</p>
          </div>
          <div className="hall_card">
            <div>
              <div className="HIGHLIGHT"><h1>BIGGEST WINSTREAK</h1></div>
              <div className="HIGHLIGHT_SUB"><h2>3 SEASONS</h2></div>
            </div>
            <img src={linkLogo4} alt=""/>
            <h1>ATLETICO MADRID</h1>
          </div>
        </section>
      </div>
      <Footer/>
    </div>
  );
}