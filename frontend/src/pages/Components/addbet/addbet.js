import React, {useState} from "react";
import { FiPlus, FiMinusCircle } from 'react-icons/fi';
import './addbet.css';

export default function Addbet(){
  const [ pressed, setPressed ] = useState(false);

  return(
    <div>
      <div className="slideStyle" onClick={()=>setPressed(true)}>
        <FiPlus size={40}/>
        <div className="textContainer">
          <h2 className="text">ADD BET</h2>
        </div>
      </div>

      <div className="bet_board" style={pressed?{}:{display:'none'}}>
        <div className="bet_board_inner">
          <h1>NEW BET</h1>
          <div className="focus_container">
            <div className="wallet"><p>WALLET:<span>1230$</span></p></div>
            <div className="focus">
              <div className="option_container">
                <h2>TEAM</h2>
                <select>
                  <option>AJAX</option>
                  <option>ATALANTA</option>
                </select>
              </div>
              <div className="option_container">
                <h2>BET</h2>
                <select>
                  <option>IN LAST</option>
                  <option>IN FIRST</option>
                </select>
                <p>(1.98)</p>
              </div>
              <div className="option_container">
                <h2>VALUE</h2>
                <input type="text"></input>
                <p>PROFIT: 1530$</p>
              </div>
            </div>
          </div>
          <div className="focus_lower">
            <div className="market_container">
              <h2>MARKET HIGHLIGHTS</h2>
              <div className="list_container">
                <ul style={{textAlign:'right'}}>
                  <li>PARIS SAINT GERMAIN IN FIRST</li>
                  <li>AJAX IN FIRST</li>
                  <li>PARIS SAINT GERMAIN IN FIRST</li>
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

            <div className="market_container">
              <h2>YOURS CURRENT BETS</h2>
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
                </ul>
                <ul>
                  <li>800$</li>
                  <li>800$</li>
                  <li>800$</li>
                  <li style={{color:'var(--verde)', marginTop:'20px'}}>PROFIT</li>
                </ul>
                <ul>
                  <li>+1584$</li>
                  <li>+1584$</li>
                  <li>+1584$</li>
                  <li style={{color:'var(--verde)', marginTop:'20px'}}>+1584$</li>
                </ul>
                <ul>
                  <li><FiMinusCircle color={'var(--vermelho_claro_plus)'} style={{cursor:'pointer'}}/></li>
                  <li><FiMinusCircle color={'var(--vermelho_claro_plus)'} style={{cursor:'pointer'}}/></li>
                  <li><FiMinusCircle color={'var(--vermelho_claro_plus)'} style={{cursor:'pointer'}}/></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="button" style={{backgroundColor:'var(--vermelho_escuro)'}}>SUBMIT BET</div>
        </div>
      </div>

    </div>
  )
}