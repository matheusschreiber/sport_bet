import React, { useEffect, useState } from "react";
import { FiRotateCw } from 'react-icons/fi';
import api from '../../services/api';

import { Levels } from "react-activity";
import "react-activity/dist/Levels.css";

import './style.css';

export default function BetPanel({player_name, ready, bet_added, finished}){

  const [ player, setPlayer ] = useState({wallet:'LOADING'});
  const [ total, setTotal ] = useState(0)
  const [ bets, setBets ] = useState([]);
  const [ loading, setLoading ] = useState(false);

  async function loadPanel(){
    setLoading(true);

    if (!player_name) {setPlayer([{id:0,name:0,wallet:0}]);setLoading(false);return}
    let response1 = await api.get(`getPlayer/${player_name}`);
    if (!response1.data.length) response1.data = [{id:"",name:"",wallet:""}]
    
    setPlayer(response1.data[0]);

    const response2 = await api.get(`listBets/${localStorage.getItem('SEASON')}`, {headers: {authorization:response1.data[0].name}})
    let sum=0;
    
    response2.data.map((i)=>{
      if(i.outcome===1)sum+=i.profit;
      else if(!i.outcome)sum-=i.profit;
      return 0;
    })
    
    setBets(response2.data);
    setTotal(sum);
    
    if (!bet_added || finished) await Promise.all(response2.data.map(async(i)=>await api.get(`verifyBet/${i.id}`)))
    
    discount(finished);
    setLoading(false);
  }

  async function discount(finished){
    if (finished) await api.put('discountBets', {playerName: localStorage.getItem('PLAYER'), year:localStorage.getItem('SEASON')}); 
  }

  useEffect(()=>{
    loadPanel(); // eslint-disable-next-line
  }, [ready])

  return (
    <div className="bet_panel_container" style={ready?{}:{opacity:'.3',cursor:'not-allowed'}}>
      <div className="bet_panel_title">
        <h2>PROFITS {localStorage.getItem('SEASON')}</h2>
        <FiRotateCw size={20} onClick={loadPanel} style={loading?{display:'none'}:{cursor:'pointer'}}/>
        <Levels style={loading?{}:{display:'none'}}/>
      </div>
      <p>NEW BET/END OF SEASON: <span style={bet_added?{color:'var(--vermelho_claro_plus)'}:{color:'var(--verde)'}}>{bet_added?"YES":"NO"}</span></p>
      <div className="wallet">
        <h2>
          WALLET: {player.wallet}$ 
          <span style={total>0?{color:'var(--verde_escuro)', cursor:'pointer'}:{color:'var(--vermelho_escuro)',cursor:'pointer'}}
            onClick={()=>discount(true)}>
            {total>0&&ready?` (+${total.toFixed(2)})`:total<0&&ready?` (${total.toFixed(2)})`:""}
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
                <td key={`${i.id} td1`}>
                  {(i.fase==='FINALIST'||i.fase==='TITLE')&&(i.description==='CLASSIFIED'||i.description==='DISCLASSIFIED')
                  ?`${i.team.toUpperCase()} ${i.fase}`
                  :`${i.team.toUpperCase()} ${i.description} IN ${i.fase}`}
                  </td>
                <td key={`${i.id} td2`} style={
                    (i.outcome===1||i.outcome===2)&&ready?{color:'var(--verde)'}:(i.outcome===0||i.outcome===3)&&ready?{color:'var(--vermelho_claro_plus)'}:{color:'var(--cinza)'}
                  }>
                  {ready?(i.outcome===1||i.outcome===2)?`+${i.profit.toFixed(2)}`:(i.outcome===0||i.outcome===3)?`-${i.profit.toFixed(2)}`:"--":"--"}</td>
              </tr>
            )):"LOADING"
          }
        </tbody>
      </table>
    </div>
  )
}