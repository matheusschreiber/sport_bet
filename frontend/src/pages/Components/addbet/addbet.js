import React, {useState} from "react";
import { FiPlus, FiMinusCircle, FiChevronLeft } from 'react-icons/fi';

import './addbet.css';

import { Levels } from "react-activity";
import "react-activity/dist/Levels.css";

import api from '../../../services/api'

export default function Addbet(){
  const [ pressed, setPressed ] = useState(false);
  const [ team, setTeam ] = useState();
  const [ description, setDescription ] = useState();
  const [ betValue, setValue ] = useState();
  const [ loadingMarket, setLoadingMarket ] = useState(true);
  const [ odd, setOdd ] = useState();
  const [ profit, setProfit ] = useState();

  async function handleSubmit(){
  }
  
  async function calculateODD(team,description){
    if (team && description) {
      const data = {
        team: team.charAt(0).toUpperCase() + team.slice(1).toLowerCase(),
        description,
        year:localStorage.getItem('SEASON'),
        fase:"GROUPS"
      }
      const response = await api.post('createODD', data)
      setOdd(response.data.odd);
    }
  }

  return(
    <div>
      <div className="slideStyle" onClick={()=>setPressed(true)}>
        <FiPlus size={40}/>
        <div className="textContainer">
          <h2 className="text">ADD BET</h2>
        </div>
      </div>

      <div className="bet_board" style={pressed?{transition:'.2s'}:{transition:'.2s',display:'none'}}>
        <div className="bet_board_inner">
          <FiChevronLeft id="back_arrow" size={40} onClick={()=>{setPressed(false);}}/>
          <h1>NEW BET</h1>
          <div className="focus_container">
            <div className="wallet"><p>WALLET:<span>1230$</span></p></div>
            <form className="focus">
              <div className="option_container">
                <h2>TEAM</h2>
                <select onChange={(value)=>{setTeam(value.target.value);calculateODD(value.target.value,description,betValue)}}>
                  <option selected disabled>SELECT TEAM</option>
                  <option value="AJAX">AJAX</option>
                  <option value="ATALANTA">ATALANTA</option>
                </select>
              </div>
              <div className="option_container">
                <h2>BET</h2>
                <select onChange={(value)=>{setDescription(value.target.value);calculateODD(team,value.target.value,betValue)}}>
                  <option selected disabled>SELECT ODD</option>
                  <option>IN LAST</option>
                  <option>IN FIRST</option>
                </select>
                <p style={odd?{}:{display:'none'}}>({odd})</p>
              </div>
              <div className="option_container">
                <h2>VALUE</h2>
                <input type="number" onChange={(value)=>{
                  setValue(value.target.value);
                  setProfit((parseFloat(odd)*parseFloat(value.target.value)).toFixed(2));
                  console.log(profit!==null);
                }} value={betValue} />
                <p style={(profit>0)?{}:{display:'none'}}>PROFIT: {profit}$</p>
              </div>
            </form>
          </div>
          <div className="focus_lower">
            <div className="market_container">
              <Levels /><h2>MARKET HIGHLIGHTS</h2>
              <div className="list_container">
                <ul style={{textAlign:'right'}}>
                  <li>PARIS SAINT GERMAIN IN FIRST</li>
                  <li>AJAX IN FIRST</li>
                  <li>PARIS SAINT GERMAIN WITH 10 GOALS</li>
                  <li>VF WOLFSBURG WITH 10 POINTS</li>
                  <li>PARIS SAINT GERMAIN IN FIRST</li>
                  <li>PARIS SAINT GERMAIN IN FIRST</li>
                </ul>
                <ul style={{color:'var(--verde)'}}>
                  <li>(1.98)</li>
                  <li>(1.98)</li>
                  <li>(1.98)</li>
                  <li>(1.98)</li>
                  <li>(1.98)</li>
                  <li>(1.98)</li>
                </ul>
              </div>
            </div>

            <div className="bet_log_container">
              <Levels /><h2>MATHEUS'S CURRENT BETS</h2>
              <div className="list_container">
                <ul style={{textAlign:'right'}}>
                  <li>PARIS SAINT GERMAIN IN FIRST</li>
                  <li>AJAX IN LAST</li>
                  <li>BENFICA CLASSIFIED</li>
                </ul>
                <ul>
                  <li>(1.98)</li>
                  <li>(1.98)</li>
                  <li>(1.98)</li>
                  <li style={{color:'var(--verde)', marginTop:'20px'}}>PROFIT</li>
                </ul>
                <ul>
                  <li>800$</li>
                  <li>800$</li>
                  <li>800$</li>
                </ul>
                <ul>
                  <li>+1584$</li>
                  <li>+1584$</li>
                  <li>+1584$</li>
                  <li style={{color:'var(--verde)', marginTop:'20px'}}>+1584$</li>
                </ul>
                <ul style={{marginLeft:'10px'}}>
                  <li><FiMinusCircle color={'var(--vermelho_claro_plus)'} style={{cursor:'pointer'}}/></li>
                  <li><FiMinusCircle color={'var(--vermelho_claro_plus)'} style={{cursor:'pointer'}}/></li>
                  <li><FiMinusCircle color={'var(--vermelho_claro_plus)'} style={{cursor:'pointer'}}/></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="button" style={{backgroundColor:'var(--vermelho_escuro)'}}
            onClick={handleSubmit}>SUBMIT BET</div>
        </div>
      </div>

    </div>
  )
}