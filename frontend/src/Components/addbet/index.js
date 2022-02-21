import React, {useEffect, useState} from "react";
import { FiPlus, FiMinusCircle, FiChevronLeft } from 'react-icons/fi';

import './style.css';

import { Levels } from "react-activity";
import "react-activity/dist/Levels.css";

import api from '../../services/api'

export default function Addbet({betsAvailable=false, childToParent}){
  const [ pressed, setPressed ] = useState(false);
  
  const [ team, setTeam ] = useState();
  const [ description, setDescription ] = useState("");
  const [ betValue, setValue ] = useState(0);
  const [ xVariable, setX ] = useState(0);
  const [ odd, setOdd ] = useState();
  const [ profit, setProfit ] = useState();
  
  const [ teams, setTeams ] = useState(['LOADING']);
  const [ allBets, setAllBets ] = useState([]);
  const [ playerBets, setPlayerBets ] = useState([]);
  const [ player, setPlayer ] = useState([{id:'LOADING', wallet:'LOADING'}]);

  const [ sumProfit, setSumProfit ] = useState(0);
  

  async function fetchData(){
    const p = await loadPlayer();
    await loadTeams();
    await loadBets(p); 
  }

  async function handleSubmit(){
    let fase;
    if (localStorage.getItem('FASE')==='FINAL' && description==="CLASSIFIED") fase = "TITLE"
    else if (localStorage.getItem('FASE')==='FINAL' && description==="DISCLASSIFIED") fase = "FINALIST"
    else fase = localStorage.getItem('FASE');
    const data = {
      team,
      player:player[0].name,
      value:betValue,
      description,
      year:localStorage.getItem('SEASON'),
      odd,
      fase
    }
    if (player[0].wallet>=betValue) await api.post('registerBet',data);
    else alert('Insuficient Funds!');
    loadBets(player[0]);
    childToParent(true)
  }
  
  async function calculateODD(team,description, x){
    if (team && description!=="") {
      if (description.includes('OVER')) {
        let array = description.split(' ');
        array[1] = x===""?"0":x;
        array = array.join().replace(/,/g," ");
        setDescription(array);
      }
      const data = {
        team: team,
        description,
        year:localStorage.getItem('SEASON'),
        fase:localStorage.getItem('FASE')
      }
      const response = await api.post('createODD', data)
      setOdd(response.data.odd);
    }
    if (betValue) setProfit((parseFloat(odd)*parseFloat(betValue)).toFixed(2));
  }

  async function loadTeams(){
    let response;

    try {
      switch(localStorage.getItem('FASE')){
        case "ROUNDOF8": response = await api.put('getClassified', {year: localStorage.getItem('SEASON'), fase:"GROUPS"});break;
        case "QUARTERS": response = await api.put('getClassified', {year: localStorage.getItem('SEASON'), fase:"ROUNDOF8"});break;
        case "SEMIS": response = await api.put('getClassified', {year: localStorage.getItem('SEASON'), fase:"QUARTERS"});break;
        case "FINAL": response = await api.put('getClassified', {year: localStorage.getItem('SEASON'), fase:"SEMIS"});break;
        default: response = await api.get('getTeamsJSON'); break;
      }
    } catch(err) {
      response = await api.get('getTeamsJSON');
    }
    
    let array;
    if (!response.data) response = await api.get('getTeamsJSON'); 
    array = response.data;
    array.sort();
    setTeams(array);
  }

  async function loadBets(p){
    let sum=0;
    if (!(localStorage.getItem('SEASON') && localStorage.getItem('PLAYER'))) return;

    const aBets = await api.get(`listBets/${localStorage.getItem('SEASON')}`);
    await Promise.all(aBets.data.map(async(i)=>{
      const team = await api.get(`getTeam/${i.team}`);
      aBets.data[aBets.data.indexOf(i)].team = team.data[0].acronym
    }))

    const pBets = await api.get(`listBets/${localStorage.getItem('SEASON')}`, {headers: {authorization:p.name}});
    await Promise.all(pBets.data.map(async(i)=>{
      const team = await api.get(`getTeam/${i.team}`);
      pBets.data[pBets.data.indexOf(i)].team = team.data[0].acronym
    }))

    pBets.data.map((i)=>sum+=i.profit)
    setAllBets(aBets.data);
    setPlayerBets(pBets.data);
    setSumProfit(sum);
  }

  async function loadPlayer(){
    if (!localStorage.getItem('PLAYER')) {
      setPlayer([{id:0,name:0,wallet:0}]);
      return [{id:0,name:0,wallet:0}]
    }
    const response = await api.get(`getPlayer/${localStorage.getItem('PLAYER')}`);
    if (!response.data.length) {
      setPlayer([{id:0,name:"",wallet:0}]);
      return [{id:0,name:"",wallet:0}];
    } else {
      setPlayer(response.data)
      return response.data[0]
    }
    
  }

  async function deleteBet(id){
    try { 
      await api.delete(`deleteBet/${id}`, {headers:{authorization:localStorage.getItem('PLAYER')}});
      loadBets(player[0]);
    }
    catch(err){ alert("Player Unauthorized!"); }

  }

  useEffect(()=>{
    fetchData();
    // eslint-disable-next-line
  },[])

  return(
    <div>
      <div className="slideStyle" onClick={()=>{if (betsAvailable) {setPressed(true)};loadTeams();}} style={betsAvailable?{}:{opacity:'.2',cursor:'not-allowed'}}>
        <FiPlus size={40}/>
        <div className="textContainer">
          <h2 className="text">ADD BET</h2>
        </div>
      </div>
      <div className="bet_board" style={pressed?{transition:'.2s', transform:'scale(1)'}:{transition:'.2s', transform:'scale(0)'}}>
        <div className="bet_board_inner">
          <FiChevronLeft id="back_arrow" size={40} onClick={()=>{setPressed(false);}}/>
          <h1>NEW BET</h1>
          <div className="focus_container">
            <div className="top_boxes">
              <div><p>FASE: <span>{localStorage.getItem('FASE')}</span></p></div>
              <div><p>WALLET:<span style={player[0].wallet<100?{color:'var(--vermelho_claro_plus)'}:
                player[0].wallet<1000?{color:'var(--amarelo)'}:{color:'var(--verde)'}}>{player[0].wallet}$</span></p>
              </div>
            </div>
            <form className="focus">
              <div className="option_container">
                <h2>TEAM</h2>
                <select onChange={(e)=>{setTeam(e.target.value);calculateODD(e.target.value,description,betValue)}}>
                  <option hidden>SELECT TEAM</option>
                  { teams.map((i)=>(<option value={i} key={i}>{i.toUpperCase()}</option>)) }
                </select>
              </div>
              <div className="option_container">
                <h2>BET</h2>
                <select onChange={(e)=>{setDescription(e.target.value);calculateODD(team,e.target.value,betValue);setValue(0);setProfit(0)}}>
                  <option hidden>SELECT ODD</option>
                  <option style={localStorage.getItem('FASE')==='GROUPS'?{}:{display:'none'}}>IN LAST</option>
                  <option style={localStorage.getItem('FASE')==='GROUPS'?{}:{display:'none'}}>IN FIRST</option>
                  <option>CLASSIFIED</option>
                  <option>DISCLASSIFIED</option>
                  <option style={localStorage.getItem('FASE')==='GROUPS'?{}:{display:'none'}}>OVER X POINTS</option>
                  <option>OVER X TOTAL GOALS</option>
                </select>
                <p style={odd?{}:{display:'none'}}>({odd})</p>
              </div>
              <div className="option_container" id="x_value" style={description.includes("OVER")?{}:{display:'none'}}>
                <h2>X</h2>
                <input type="number" onChange={(e)=>{setX(e.target.value);calculateODD(team,description, e.target.value)}} value={xVariable} />
              </div>
              <div className="option_container">
                <h2>VALUE</h2>
                <input type="number" onChange={(e)=>{
                  setValue(parseInt(e.target.value));
                  setProfit((parseFloat(odd)*parseFloat(e.target.value)).toFixed(2));
                }} value={betValue} />
                <p style={(profit>0)?{}:{display:'none'}}>PROFIT: {profit}$</p>
              </div>
            </form>
          </div>
          <div className="focus_lower">
            <div className="market_container">
              <Levels style={allBets[0]?{display:'none'}:{}} />
              <p style={allBets[0]?{display:'none'}:{marginBottom:'5px'}}>Waiting for bets...</p>
              <h2>MARKET HIGHLIGHTS</h2>
              <div className="list_container">
                <ul style={{textAlign:'right'}}> { allBets.map((i)=>(<li key={i.id+i.team}>{i.team.toUpperCase()} {i.description.toUpperCase()}</li>))} </ul>
                <ul> { allBets.map((i)=>(<li key={i.id+i.odd} style={{color:'var(--verde)'}}>({i.odd})</li>))} </ul>
              </div>
            </div>

            <div className="bet_log_container">
              <Levels style={playerBets[0]?{display:'none'}:{}}/>
              <p style={playerBets[0]?{display:'none'}:{marginBottom:'5px'}}>Waiting for bets...</p>
              <h2>{player[0].name?player[0].name:'LOADING'}'S CURRENT BETS</h2>
              <div className="list_container">
                <ul style={{textAlign:'right'}}> { playerBets.map((i)=>(<li key={i.id+i.team}>{i.team.toUpperCase()} {i.description.toUpperCase()}</li>))} </ul>
                <ul> { playerBets.map((i)=>(<li key={i.id+i.odd} style={{color:'var(--verde)'}}>({i.odd})</li>))} </ul>
                <ul> { playerBets.map((i)=>(<li key={i.id+i.value}>{i.value}$</li>))} </ul>
                <ul> { playerBets.map((i)=>(<li key={i.id+i.profit}>+{i.profit.toFixed(2)}$</li>))} </ul>
                <ul> { playerBets.map((i)=>(<li key={i.id+i}>
                  <FiMinusCircle 
                    color={'var(--vermelho_claro_plus)'} 
                    style={i.outcome===-1?{cursor:'pointer'}:{display:'none'}}
                    onClick={()=>deleteBet(i.id)}/>
                  </li>))} </ul>
              </div>
            </div>
          </div>
          <div className="profit_container"><p>PLANNED PROFIT: +{sumProfit.toFixed(2)}$</p></div>
          <div className="button" style={{backgroundColor:'var(--vermelho_escuro)'}}
            onClick={handleSubmit}>SUBMIT BET</div>
        </div>
      </div>

    </div>
  )
}