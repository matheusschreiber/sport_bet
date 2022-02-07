import React, { useEffect, useState } from "react";
import api from '../../../services/api'

import './style.css';

export default function BetPanel({player_name}){

  const [ player, setPlayer ] = useState({wallet:'LOADING'});
  const [ total, setTotal ] = useState(0)
  const [ bets, setBets ] = useState([]);

  
  async function loadPlayer(){
    if (!localStorage.getItem('PLAYER')) {
      setPlayer([{id:0,name:0,wallet:0}]);
      return
    }
    const response = await api.get(`getPlayer/${localStorage.getItem('PLAYER')}`);
    setPlayer(response.data[0]);
    console.log(player)
  }

  async function loadBets(){
    let sum=0;
    const response = await api.get(`listBets/${localStorage.getItem('SEASON')}`, {headers: {authorization:player.name}});
    response.data.map((i)=>{
      if (i.outcome>0)sum+=i.profit
      else if (!i.outcome)sum-=i.profit;
    })
    console.log(response)
    setBets(response.data);
    setTotal(sum);
  }
  
  useEffect(()=>{
    loadPlayer();
    loadBets(); // eslint-disable-next-line
  }, [])

  return (
    <div className="bet_panel_container">
      <h2>PROFITS</h2>

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
              <tr>
                <td>{`${i.team.toUpperCase()} ${i.description}`}</td>
                <td style={i.outcome>0?{color:'var(--verde)'}:!i.outcome?{color:'var(--vermelho_claro_plus)'}:{color:'var(--cinza)'}}>
                  {i.outcome>0?`+${i.profit}`:!i.outcome?`-${i.profit}`:"--"}</td>
              </tr>
            )):""
          }
          
        </tbody>
      </table>
    </div>
  )
}