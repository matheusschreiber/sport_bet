import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from '../../services/api'

import { Dots } from "react-activity";
import "react-activity/dist/Dots.css";

import './style.css'
import { FiArrowRight, FiRotateCw } from 'react-icons/fi'

import Footer from "../../Components/footer";
import Header from "../../Components/header";

export default function Historypage(){  
  const nav = useNavigate();
  const [ teams, setTeams ] = useState([]);
  const [ loading, setLoading ] = useState(false);
  const [ hallFame, setHallFame ] = useState([]);
  const [ hallShame, setHallShame ] = useState([]);
  const [ hasSeasons, setHasSeasons ]  = useState(false);


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
        return 0;
      })
      setLoading(false)
    })
  }
  
  async function updateTable(){
    setLoading(true)
    const response = await api.get('/teams')
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
  }

  async function getHall(){
    setLoading(true);
    let best = [], worst = [], response;
    try{
      response = await api.get('/getBiggestWinner');  
      best[0]=response.data.biggest; 
      worst[0]=response.data.worst;
      

      response = await api.get('/getTopScorer');      
      best[1]=response.data.topscorer;
      worst[1]=response.data.worstscorer;
      
      response = await api.get('/getBestSeason');     
      best[2] = {
        team:response.data.bestSeasonTeam,
        season: response.data.bestSeason
      }
      worst[2] = {
        team:response.data.worstSeasonTeam,
        season: response.data.worstSeason
      }

      response = await api.get('/getbestWinstreak');  
      best[3]=response.data;


      setHasSeasons(true);
    } catch (err) {
      // alert('No seasons/teams registered!');
      setHasSeasons(false);
    }
    setHallFame(best.slice());
    setHallShame(worst.slice());
    setLoading(false);    
  }

  return(
    <div>
      <Header/>
      <div className="history_container">
        <div className="button" onClick={createAllTeams} 
          style={teams.length!==32?{}:{display:'none'}}>GENERATE TEAMS</div>
        <div className="history_back">
          <h2 onClick={()=>nav('/')}>GO BACK</h2>
          <FiArrowRight size={27}/>
        </div>
        <div className="table_title">
          <h1>ALL TIME RECORDS</h1>
          <FiRotateCw size={20} onClick={updateTable} style={loading?{display:'none'}:{cursor:'pointer'}}/>
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
            teams.map((i)=>{return(
              <tr key={i.name} style={teams.indexOf(i)+1===1?{color:'var(--amarelo)'}:
              teams.indexOf(i)+1===2?{color:'var(--cinza)'}:
              teams.indexOf(i)+1===3?{color:'var(--bronze)'}:
              teams.indexOf(i)+1>=30?{color:'var(--vermelho_escuro)'}:{}}>
                <td>{teams.indexOf(i)+1}</td>
                <td>{i.name.toUpperCase()}</td>
                <td>{i.goals_for}</td>
                <td>{i.goals_against}</td>
                <td>{i.wins} - {i.dues} - {i.losses}</td>
                <td>{i.biggest_opponent}</td>
                <td>{i.least_opponent}</td>
                <td>{i.titles} 🥇 - {i.vices} 🥈</td>
              </tr>
            )})
          }
          </tbody>
        </table>
      </div>


      <div className="table_title" style={{color: "var(--amarelo)"}}>
        <h1>HALL OF FAME</h1>
        <FiRotateCw size={20} onClick={getHall} style={loading?{display:'none'}:{cursor:'pointer'}}/>
        <Dots color="var(--amarelo)" style={loading?{display:'block'}:{display:'none'}}/>
      </div>
      <div className="hall">
        <section>
          <div className="hall_card">
            <div className="HIGHLIGHT_CONTAINER">
              <div className="HIGHLIGHT"><h1>BIGGEST WINNER</h1></div>
              <div className="HIGHLIGHT_SUB">
                <h2>{ hallFame[0]?hallFame[0].titles:'LOADING...' } TITLES { hallFame[0]?hallFame[0].vices:'LOADING...' } VICES</h2>
              </div>
            </div>
            <img src={hallFame[0]?hallFame[0].jersey:""} alt="" />
            <h1>{hallFame[0]?hallFame[0].name:'LOADING...'}</h1>
          </div>
          <div className="hall_card">
            <div className="HIGHLIGHT_CONTAINER">
              <div className="HIGHLIGHT"><h1>TOP SCORER</h1></div>
              <div className="HIGHLIGHT_SUB"><h2>{ hallFame[1]?hallFame[1].goals_for:'LOADING...' } GOALS</h2></div>
            </div>
            <img src={hallFame[1]?hallFame[1].jersey:""} alt=""/>
            <h1>{hallFame[1]?hallFame[1].name:'LOADING...'}</h1>
          </div>
        </section>
        <section>
          <div className="hall_card" style={hasSeasons?{}:{display:'none'}}>
            <div className="HIGHLIGHT_CONTAINER">
              <div className="HIGHLIGHT"><h1>BEST SEASON</h1></div>
              <div className="HIGHLIGHT_SUB"><h2>{ hallFame[2]?`${(hallFame[2].season.id).slice(0,4)}-${(hallFame[2].season.id).slice(4,8)}`:'LOADING...' }</h2></div>
            </div>
            <img src={hallFame[2]?hallFame[2].team[0].jersey:""} alt=""/>
            <h1>{hallFame[2]?hallFame[2].team[0].name:'LOADING...'}</h1>
            <br/>
            <p>{ hallFame[2]?hallFame[2].season.goals_for:'loading...' } GOALS FOR</p>
            <p>{ hallFame[2]?hallFame[2].season.goals_against:'loading...' } GOALS AGAINST</p>
            <p>{ hallFame[2]?hallFame[2].season.wins:'loading...' } WINS</p>
            <p>{ hallFame[2]?hallFame[2].season.losses:'loading...' } LOSSES</p>
            <p>{ hallFame[2]?hallFame[2].season.placement:'loading...' } </p>
            <p style={{color:'var(--amarelo)'}}>{ hallFame[2]?hallFame[2].season.season_score:'loading...' } </p>
          </div>
          <div className="hall_card" style={hasSeasons?{}:{display:'none'}}>
            <div className="HIGHLIGHT_CONTAINER">
              <div className="HIGHLIGHT"><h1>BIGGEST WINSTREAK</h1></div>
              <div className="HIGHLIGHT_SUB"><h2> {hallFame[3]?hallFame[3].streak:'LOADING...'} SEASONS</h2></div>
            </div>
            <img src={hallFame[3]?hallFame[3].team.jersey:""} alt=""/>
            <h1>{hallFame[3]?hallFame[3].team.name:'LOADING...'}</h1>
          </div>
        </section>
      </div>




      <div className="table_title" style={{color: "var(--vermelho_claro_plus)", marginTop: '100px'}}>
        <h1>HALL OF SHAME</h1>
        <FiRotateCw size={20} onClick={getHall} style={loading?{display:'none'}:{cursor:'pointer'}}/>
        <Dots color="var(--amarelo)" style={loading?{display:'block',color:'var(--vermelho)'}:{display:'none'}}/>
      </div>
      <div className="hall">
        <section>
          <div className="hall_card">
            <div className="HIGHLIGHT_CONTAINER" id="shame">
              <div className="HIGHLIGHT"><h1>LEAST WINNER</h1></div>
              <div className="HIGHLIGHT_SUB"><h2>{ hallShame[0]?hallShame[0].titles:'LOADING...' } TITLES { hallShame[0]?hallShame[0].vices:'LOADING...' } VICES </h2></div>
            </div>
            <img src={hallShame[0]?hallShame[0].jersey:""} alt="" />
            <h1>{hallShame[0]?hallShame[0].name:'LOADING...'}</h1>
          </div>
          <div className="hall_card">
            <div className="HIGHLIGHT_CONTAINER" id="shame">
              <div className="HIGHLIGHT"><h1>WORST SCORER</h1></div>
              <div className="HIGHLIGHT_SUB"><h2>{ hallShame[1]?hallShame[1].goals_for:'LOADING...' } GOALS</h2></div>
            </div>
            <img src={hallShame[1]?hallShame[1].jersey:""} alt=""/>
            <h1>{hallShame[1]?hallShame[1].name:'LOADING...'}</h1>
          </div>
        </section>
        <section>
          <div className="hall_card" style={hasSeasons?{}:{display:'none'}}>
            <div className="HIGHLIGHT_CONTAINER" id="shame">
              <div className="HIGHLIGHT"><h1>WORST SEASON</h1></div>
              <div className="HIGHLIGHT_SUB"><h2>{ hallShame[2]?`${(hallShame[2].season.id).slice(0,4)}-${(hallShame[2].season.id).slice(4,8)}`:'LOADING...' }</h2></div>
            </div>
            <img src={hallShame[2]?hallShame[2].team[0].jersey:""} alt=""/>
            <h1>{hallShame[2]?hallShame[2].team[0].name:'LOADING...'}</h1>
            <br/>
            <p>{ hallShame[2]?hallShame[2].season.goals_for:'loading...' } GOALS FOR</p>
            <p>{ hallShame[2]?hallShame[2].season.goals_against:'loading...' } GOALS AGAINST</p>
            <p>{ hallShame[2]?hallShame[2].season.wins:'loading...' } WINS</p>
            <p>{ hallShame[2]?hallShame[2].season.losses:'loading...' } LOSSES</p>
            <p>{ hallShame[2]?hallShame[2].season.placement:'loading...' } </p>
            <p style={{color:'var(--amarelo)'}}>{ hallShame[2]?hallShame[2].season.season_score:'loading...' } </p>
          </div>

          {/* <div className="hall_card" style={hasSeasons?{}:{display:'none'}}>
            <div className="HIGHLIGHT_CONTAINER" id="shame">
              <div className="HIGHLIGHT"><h1>BIGGEST WINSTREAK</h1></div>
              <div className="HIGHLIGHT_SUB"><h2> {hallShame[3]?hallShame[3].streak:'LOADING...'} SEASONS</h2></div>
            </div>
            <img src={hallShame[3]?hallShame[3].team.jersey:""} alt=""/>
            <h1>{hallShame[3]?hallShame[3].team.name:'LOADING...'}</h1>
          </div> */}

        </section>
      </div>




      <Footer/>
    </div>
  );
}