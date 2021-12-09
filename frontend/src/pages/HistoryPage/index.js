import React, { useState } from "react";
import Footer from "../Components/footer";
import Header from "../Components/header";
import './style.css'
import { FiArrowRight } from 'react-icons/fi'

export default function Historypage(){
  const [ teams, setTeams ] = useState([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32]);
  
  const linkLogo1 = 'https://upload.wikimedia.org/wikipedia/pt/d/d2/Logo_PSG.png'
  const linkLogo2 = 'https://upload.wikimedia.org/wikipedia/pt/thumb/b/b8/AFC_Ajax_Amsterdam.svg/1200px-AFC_Ajax_Amsterdam.svg.png'
  const linkLogo3 = 'https://upload.wikimedia.org/wikipedia/pt/thumb/0/0c/Liverpool_FC.svg/1200px-Liverpool_FC.svg.png'
  const linkLogo4 = 'https://upload.wikimedia.org/wikipedia/pt/1/19/AtleticoMadrid2017.png'

  return(
    <div>
      <Header/>
      <div className="history_container">
        <div className="history_back">
          <h2>GO BACK</h2>
          <FiArrowRight size={27}/>
        </div>
        <h1>ALL TIME RECORDS</h1>
        <table>
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
          {
            teams.map((i)=>(
              <tr style={teams.indexOf(i)+1===1?{color:'var(--amarelo)'}:
              teams.indexOf(i)+1===2?{color:'var(--cinza)'}:
              teams.indexOf(i)+1===3?{color:'var(--bronze)'}:
              teams.indexOf(i)+1>=30?{color:'var(--vermelho_escuro)'}:{}}>
                <td>{teams.indexOf(i)+1}</td>
                <td>MANCHESTER CITY</td>
                <td>200</td>
                <td>140</td>
                <td>10 - 2 - 5</td>
                <td>LIVERPOOL</td>
                <td>BARCELONA</td>
                <td>6 🥇 - 2 🥈</td>
              </tr>
            ))
          }

        </table>
      </div>
      <div className="hall">
        <section>
          <div className="hall_card">
            <div>
              <div className="HIGHLIGHT"><h1>BIGGEST WINNER</h1></div>
              <div className="HIGHLIGHT_SUB"><h2>6 TITLES</h2></div>
            </div>
            <img src={linkLogo1} />
            <h1>PARIS SAINT GERMAIN</h1>
          </div>
          <div className="hall_card">
            <div>
              <div className="HIGHLIGHT"><h1>TOP SCORER</h1></div>
              <div className="HIGHLIGHT_SUB"><h2>350 GOALS</h2></div>
            </div>
            <img src={linkLogo2} />
            <h1>AJAX</h1>
          </div>
        </section>
        <section>
          <div className="hall_card">
            <div>
              <div className="HIGHLIGHT"><h1>BEST SEASON</h1></div>
              <div className="HIGHLIGHT_SUB"><h2>2019-2020</h2></div>
            </div>
            <img src={linkLogo3} />
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
            <img src={linkLogo4} />
            <h1>ATLETICO MADRID</h1>
          </div>
        </section>
      </div>
      <Footer/>
    </div>
  );
}