import React, { useEffect, useState } from "react";
import { FiRotateCw } from 'react-icons/fi';
import api from '../../../services/api';

import { Levels } from "react-activity";
import "react-activity/dist/Levels.css";

import './style.css';

export default function BetPanel({player_name, ready}){

  const [ player, setPlayer ] = useState({wallet:'LOADING'});
  const [ total, setTotal ] = useState(0)
  const [ bets, setBets ] = useState([]);
  const [ loading, setLoading ] = useState(false);

  async function loadPanel(ready){
    setLoading(true);

    if (!player_name) {setPlayer([{id:0,name:0,wallet:0}]);return}
    const response1 = await api.get(`getPlayer/${player_name}`);
    setPlayer(response1.data[0]);

    const response2 = await api.get(`listBets/${localStorage.getItem('SEASON')}`, {headers: {authorization:response1.data[0].name}})
    let sum=0;
    response2.data.map((i)=>{if(i.outcome>0)sum+=i.profit; else if(!i.outcome)sum-=i.profit; return sum})
    setBets(response2.data);
    setTotal(sum);

    if (ready) await Promise.all(response2.data.map(async(i)=>{await api.get(`verifyBet/${i.id}`);}))

    setLoading(false);
  }

  useEffect(()=>{
    loadPanel(ready); // eslint-disable-next-line
  }, [ready])

  return (
    <div className="bet_panel_container">
      <div style={{display:'flex',alignItems: 'center',width: '120px',justifyContent: 'space-around'}}>
        <h2>PROFITS</h2>
        <FiRotateCw size={20} onClick={()=>loadPanel(ready)} style={loading?{display:'none'}:{cursor:'pointer'}}/>
        <Levels style={loading?{}:{display:'none'}}/>
      </div>
      <div className="wallet">
        <h2>
          WALLET: {player.wallet}$ 
          <span style={total>0?{color:'var(--verde_escuro)'}:{color:'var(--vermelho_escuro)'}}>
            {total>0?` (+${total})`:total<0?` (${total})`:""}
          </span>
        </h2>
      </div>

      <table>
        <thead>
          <tr>
            <th>BETS</th>
            <th>OUTCOME</th>
          </tr>
        </thead>

        <tbody>
          {
            player?bets.map((i)=>(
              <tr key={`${i.id} tr`}>
                <td key={`${i.id} td1`}>{`${i.team.toUpperCase()} ${i.description}`}</td>
                <td key={`${i.id} td2`} style={
                    i.outcome>0?{color:'var(--verde)'}:i.outcome===0?{color:'var(--vermelho_claro_plus)'}:{color:'var(--cinza)'}
                  }>
                  {i.outcome>0?`+${i.profit}`:i.outcome===0?`-${i.profit}`:"--"}</td>
              </tr>
            )):""
          }
          
        </tbody>
      </table>
    </div>
  )
}