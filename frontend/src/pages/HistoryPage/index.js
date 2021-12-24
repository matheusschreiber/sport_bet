import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from '../../services/api'

import { Dots } from "react-activity";
import "react-activity/dist/Dots.css";

import './style.css'
import { FiArrowRight, FiRotateCw } from 'react-icons/fi'

import Footer from "../Components/footer";
import Header from "../Components/header";

export default function Historypage(){  
  const nav = useNavigate();
  const [ teams, setTeams ] = useState([]);
  const [ loading, setLoading ] = useState(false);
  const [ hall, setHall ] = useState([]);


  useEffect(()=>{
    updateTable()
    getHall()
  }, [])

  async function createAllTeams(){
    setLoading(true)
    let teamsRaw=[]
    await api.get('/allteams').then((response)=>{
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
      setLoading(false)
    })
  }
  
  async function updateTable(){
    setLoading(true)
    await api.get('/teams').then((response)=>{
      let a = response.data
      a.sort(function(a,b){
        if (a.titles>b.titles) return -1;
        else if (a.titles<b.titles) return 1;
        else if (a.vices > b.vices) return -1;
        else if (a.vices < b.vices) return 1;
        else return 0;
      })
      setTeams(a);
      setLoading(false)
    })
  }

  async function getHall(){
    setLoading(true);
    let array = [];
    await api.get('/getBiggestWinner').then((response)=>{
      array[0]=response.data;
    }).then(api.get('/getTopScorer').then((response)=>{
      array[1]=response.data;
    })).then(api.get('/getBestSeason').then((response)=>{
      array[2]=response.data;
    })).then(api.get('/getbestWinstreak').then((response)=>{
      array[3]=response.data;
      setHall(array.slice());
      setLoading(false);
    }))
    
  }

  return(
    <div>
      <Header/>
      <div className="history_container">
        <div className="button" onClick={createAllTeams} 
          style={teams.length!==32?{}:{display:'none'}}>GENERATE TEAMS</div>
        <div className="history_back">
          <h2 onClick={()=>nav('/groups')}>GO BACK</h2>
          <FiArrowRight size={27}/>
        </div>
        <div className="table_title">
          <h1>ALL TIME RECORDS</h1>
          <FiRotateCw size={20} onClick={updateTable} style={{cursor:'pointer'}}/>
          <Dots color="var(--vermelho_escuro)" style={loading?{display:'block'}:{display:'none'}}/>
        </div>
        <table>
          <thead>
            <tr>
              <th>POS</th>
              <th>TEAM</th>
              <th>GOALS FOR</th>
              <th>GOALS AGAINST</th>
              <th>WINS <br/> DUES &amp; <br/> LOSSES</th>
              <th>MAJOR <br/> OPPONENT</th>
              <th>EASIEST <br/> OPPONENT</th>
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
      <div className="table_title" style={{color: "var(--amarelo)"}}>
        <h1>HALL OF FAME</h1>
        <FiRotateCw size={20} onClick={getHall} style={{cursor:'pointer'}}/>
        <Dots color="var(--amarelo)" style={loading?{display:'block'}:{display:'none'}}/>
      </div>
      <div className="hall">
        <section>
          <div className="hall_card">
            <div>
              <div className="HIGHLIGHT"><h1>BIGGEST WINNER</h1></div>
              <div className="HIGHLIGHT_SUB"><h2>{ hall[0]?hall[0].titles:'LOADING...' } TITLES</h2></div>
            </div>
            <img src={hall[0]?hall[0].jersey:""} alt="" />
            <h1>{hall[0]?hall[0].name:'LOADING...'}</h1>
          </div>
          <div className="hall_card">
            <div>
              <div className="HIGHLIGHT"><h1>TOP SCORER</h1></div>
              <div className="HIGHLIGHT_SUB"><h2>{ hall[1]?hall[1].goalsfor:'LOADING...' } GOALS</h2></div>
            </div>
            <img src={hall[1]?hall[1].jersey:""} alt=""/>
            <h1>{hall[1]?hall[1].name:'LOADING...'}</h1>
          </div>
        </section>
        <section>
          <div className="hall_card">
            <div>
              <div className="HIGHLIGHT"><h1>BEST SEASON</h1></div>
              <div className="HIGHLIGHT_SUB"><h2>{ hall[2]?`${(hall[2].season.id).slice(0,4)}-${(hall[2].season.id).slice(4,8)}`:'LOADING...' }</h2></div>
            </div>
            <img src={hall[2]?hall[2].team[0].jersey:""} alt=""/>
            <h1>{hall[2]?hall[2].team[0].name:'LOADING...'}</h1>
            <br/>
            <p>{ hall[2]?hall[2].season.goalsfor:'loading...' } GOALS FOR</p>
            <p>{ hall[2]?hall[2].season.goalsagainst:'loading...' } GOALS AGAINST</p>
            <p>{ hall[2]?hall[2].season.wins:'loading...' } WINS</p>
            <p>{ hall[2]?hall[2].season.losses:'loading...' } LOSSES</p>
            <p>{ hall[2]?hall[2].season.placement:'loading...' } </p>
          </div>
          <div className="hall_card">
            <div>
              <div className="HIGHLIGHT"><h1>BIGGEST WINSTREAK</h1></div>
              <div className="HIGHLIGHT_SUB"><h2> {hall[3]?hall[3].streak:'LOADING...'} SEASONS</h2></div>
            </div>
            <img src={hall[3]?hall[3].team.jersey:""} alt=""/>
            <h1>{hall[3]?hall[3].team.name:'LOADING...'}</h1>
          </div>
        </section>
      </div>
      <Footer/>
    </div>
  );
}