import React, { useState } from "react";
import './style.css'

import Header from "../Components/header";
import Footer from "../Components/footer";
import thropy from '../../assets/Thropy.png'

export default function FinalFasePage() {
  const [ potATeamsMatches, setPotATeamsMatches ] = useState([1,2,3,4]);
  const [ potBTeamsMatches, setPotBTeamsMatches ] = useState([1,2,3,4]);
  const [ buttonStatus, setbuttonStatus ] = useState('SIMULATE ROUND');
  const [ fase, setFase ] = useState('ROUND OF 8')
  const linkLogo1 = 'https://upload.wikimedia.org/wikipedia/pt/d/d2/Logo_PSG.png'
  const linkLogo2 = 'https://upload.wikimedia.org/wikipedia/pt/thumb/b/b8/AFC_Ajax_Amsterdam.svg/1200px-AFC_Ajax_Amsterdam.svg.png'
  const linkLogo3 = 'https://upload.wikimedia.org/wikipedia/pt/thumb/0/0c/Liverpool_FC.svg/1200px-Liverpool_FC.svg.png'
  const linkLogo4 = 'https://upload.wikimedia.org/wikipedia/pt/1/19/AtleticoMadrid2017.png'

  function changeStage(){
    if (buttonStatus==='SIMULATE ROUND') setbuttonStatus('NEXT')
    else setbuttonStatus('SIMULATE ROUND')

    if (fase === "ROUND OF 8" && buttonStatus==='NEXT') {
      setPotATeamsMatches([1,2]);
      setPotBTeamsMatches([1,2]);
      setFase("QUARTER FINALS");
    } else if (fase === "QUARTER FINALS" && buttonStatus==='NEXT') {
      setFase("SEMI FINALS");
      setPotATeamsMatches([1]);
      setPotBTeamsMatches([1]);
    } else if (fase === "SEMI FINALS" && buttonStatus==='NEXT') {
      setFase("GRAND FINAL");
      setPotATeamsMatches([]);
      setPotBTeamsMatches([]);
    } else if (fase === "GRAND FINAL" && buttonStatus==='NEXT') {
      setFase("ROUND OF 8")
      setPotATeamsMatches([1,2,3,4]);
      setPotBTeamsMatches([1,2,3,4]);
    }
  }

  return (
    <div>
      <Header />
      <div className="final_container">
        <div className="title_container">
          <h1>CLASSIFICATIONS</h1>  
          <h2>SEASON 2020-2021</h2>
        </div>
        <div>
          <div className="HIGHLIGHT"><h1>Final FASE</h1></div>
          <div className="HIGHLIGHT_SUB"><h2>{fase}</h2></div>
        </div>

        <div className="brackets">
          <div style={fase==='ROUND OF 8' || fase==='QUARTER FINALS'?{}:{display:'none'}}>
            <div className="round_8_container">
              <div>
              {
                potATeamsMatches.map((i)=>(
                  <div className="match_final_fase">
                    <ul className="teams_final_fase">
                      <li>PARIS SAINT GERMAIN</li>
                      <li>BARCELONA</li>
                    </ul>
                    <ul>
                      <li>0</li>
                      <li>0</li>
                    </ul>
                    <ul>
                      <li>1</li>
                      <li>2</li>
                    </ul>
                  </div>
                ))
              }
              </div>
              <div>
              {
                potBTeamsMatches.map((i)=>(
                  <div className="match_final_fase">
                    <ul>
                      <li>0</li>
                      <li>0</li>
                    </ul>
                    <ul>
                      <li>1</li>
                      <li>2</li>
                    </ul>
                    <ul className="teams_final_fase" style={{textAlign:'left'}}>
                      <li>PARIS SAINT GERMAIN</li>
                      <li>BARCELONA</li>
                    </ul>
                  </div>
                ))
              }
              </div>
            </div>
          </div>
          <div style={fase==='SEMI FINALS'?{}:{display:'none'}}>
            <div className="semis_container">
              <div className="semi_final_container">
                <div className="semi_text_container" style={{textAlign: 'right'}}>
                  <h2>PARIS SAINT GERMAIN</h2>
                </div>
                <img src={linkLogo1} alt="" />
                <div className="scores">
                  <h2>FIRST LEG (FRANCE)</h2>
                  <h1>0 - 0</h1>
                  <h2>SECOND LEG (HOLLAND)</h2>
                  <h1>0 - 0</h1>
                </div>
                <img src={linkLogo2} alt=""/>
                <div className="semi_text_container" style={{textAlign: 'left'}}>
                  <h2>AJAX</h2>
                </div>
              </div>
            </div>
            <div className="semi_final_container" style={{textAlign: 'right'}}>
              <div className="semi_text_container">
                <h2>LIVERPOOL</h2>
              </div>
              <img src={linkLogo3} alt=""/>
              <div className="scores">
                <h2>FIRST LEG (ENGLAND)</h2>
                <h1>0 - 0</h1>
                <h2>SECOND LEG (SPAIN)</h2>
                <h1>0 - 0</h1>
              </div>
              <img src={linkLogo4} alt=""/>
              <div className="semi_text_container" style={{textAlign: 'left'}}>
                <h2>ATLETICO MADRID</h2>
              </div>
            </div>
          </div>
          <div style={fase==='GRAND FINAL'?{}:{display:'none'}}>
            <div className="final">
              <div className="final_team">
                <img src={linkLogo1} alt={"Jersey"} />  
                <h2>PARIS SAINT GERMAIN</h2>
              </div>
              <div className="final_score">
                <img src={thropy} alt={"Thropy"} style={{height:'150px'}} />
                <h1>0 - 0</h1>
              </div>
              <div className="final_team">
                <img src={linkLogo2} alt={"Jersey"} />  
                <h2>AJAX</h2>
              </div>
            </div>
          </div>
        </div>
        <div className="button" onClick={changeStage}>{buttonStatus}</div>
      </div>
      <Footer />
    </div>

  );
}
