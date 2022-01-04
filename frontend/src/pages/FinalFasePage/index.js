import React, { useState, useEffect } from "react";
import './style.css'

import { Dots } from "react-activity";
import "react-activity/dist/Dots.css";

import Header from "../Components/header";
import Footer from "../Components/footer";
import thropy from '../../assets/Thropy.png'

import api from '../../services/api';

export default function FinalFasePage() {
  const [ loading, setLoading ] = useState(false);
  const [ loadedMatches, setLoadedMatches ] = useState([])
  const [ potATeamsMatches, setPotATeamsMatches ] = useState([]);
  const [ potBTeamsMatches, setPotBTeamsMatches ] = useState([]);    
  const [ buttonStatus, setbuttonStatus ] = useState('SIMULATE ROUND');
  const [ fase, setFase ] = useState('ROUND OF 8')

  const linkLogo1 = 'https://upload.wikimedia.org/wikipedia/pt/d/d2/Logo_PSG.png'
  const linkLogo2 = 'https://upload.wikimedia.org/wikipedia/pt/thumb/b/b8/AFC_Ajax_Amsterdam.svg/1200px-AFC_Ajax_Amsterdam.svg.png'
  const linkLogo3 = 'https://upload.wikimedia.org/wikipedia/pt/thumb/0/0c/Liverpool_FC.svg/1200px-Liverpool_FC.svg.png'
  const linkLogo4 = 'https://upload.wikimedia.org/wikipedia/pt/1/19/AtleticoMadrid2017.png'

  async function simulateRound(){
    setLoading(true)

    async function generateMatchOutcome(match, team_1, team_2){
      let answer = []
      const response1 = await api.put('/match', {team_1,team_2})
      console.log(response1.data.outcome.team_1.name + ' ' + response1.data.outcome.team_1.goals + ' x ' + response1.data.outcome.team_2.goals + ' ' + response1.data.outcome.team_2.name)
      const response2 = await api.put('/match', {team_2,team_1})
      console.log(response2.data.outcome.team_2.name + ' ' + response2.data.outcome.team_2.goals + ' x ' + response2.data.outcome.team_1.goals + ' ' + response2.data.outcome.team_1.name)
      answer = [ match, response1.data.outcome.team_1.goals, response1.data.outcome.team_2.goals, response2.data.outcome.team_2.goals, response2.data.outcome.team_1.goals ];
      setLoadedMatches(loadedMatches.push(0))
      return answer;
    }

    async function generateOutcome(matchLegsA, matchLegsB){
      let i, answer=[];
      for(i=0;i<matchLegsA.length+matchLegsB.length;i++) {
        if (i<matchLegsA.length) {
          answer[i] = await generateMatchOutcome(i+1,matchLegsA[i].A,matchLegsA[i].B);
          let aux = potATeamsMatches;
          aux[i].score_A_first_leg = answer[i][1]
          aux[i].score_B_first_leg = answer[i][2]
          aux[i].score_A_second_leg = answer[i][3]
          aux[i].score_B_second_leg = answer[i][4]
          setPotATeamsMatches(aux)
        }
        else {
          let j = i - matchLegsA.length
          answer[i] = await generateMatchOutcome(j+1,matchLegsB[j].A,matchLegsB[j].B);
          let aux = potBTeamsMatches;
          aux[j].score_A_first_leg = answer[i][1]
          aux[j].score_B_first_leg = answer[i][2]
          aux[j].score_A_second_leg = answer[i][3]
          aux[j].score_B_second_leg = answer[i][4]
          setPotBTeamsMatches(aux)
        }
      }    
      return answer;
    }

    let data ={
      year: localStorage.getItem('SEASON'),
      fase: fase.toLowerCase(),
      outcomes: await generateOutcome(potATeamsMatches, potBTeamsMatches)
    }
    await api.put('/updateMatchFile', data)
    setLoading(false);
  }

  async function updateRound(){
    setLoading(true)
    let route;
    if (fase==="ROUND OF 8") route = "setup8"
    else if (fase==="QUARTER FINALS") route = "setup4"
    else if (fase==="SEMI FINALS") route = "setup2"
    else if (fase==="GRAND FINAL") route = "setupfinal"

    setTimeout(async()=>{
      const round = await api.put(`${route}`,{year:localStorage.getItem('SEASON')})
      setPotATeamsMatches([round.data.round_of_8.match_1,round.data.round_of_8.match_2,round.data.round_of_8.match_3,round.data.round_of_8.match_4]);
      setPotBTeamsMatches([round.data.round_of_8.match_5,round.data.round_of_8.match_6,round.data.round_of_8.match_7,round.data.round_of_8.match_8]);
      setLoading(false);
    },1000)
  }

  useEffect(()=>{
    window.scroll(0,0);
    //updateRound();    
  }, [])

  async function changeStage(){
    if (buttonStatus==='SIMULATE ROUND') {
      setbuttonStatus('NEXT');
      await simulateRound();
    } else {
      if (fase === "ROUND OF 8" && buttonStatus==='NEXT') setFase("QUARTER FINALS");
      else if (fase === "QUARTER FINALS" && buttonStatus==='NEXT') setFase("SEMI FINALS");
      else if (fase === "SEMI FINALS" && buttonStatus==='NEXT') setFase("GRAND FINAL");
      else if (fase === "GRAND FINAL" && buttonStatus==='NEXT') console.log('WINNER: ')
      await updateRound();
      setbuttonStatus('SIMULATE ROUND')
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
          
          <h3 onClick={async()=>{
            const teams = await api.get('/getTeamsJSON')
            await api.post('newseason',{year:localStorage.getItem('SEASON'),teams:teams.data})
            updateRound();    
            //window.location.reload();
          }} style={{cursor:'pointer', fontSize:'20pt', lineHeight:'50pt'}}>RESET</h3>

        </div>

        <div className="brackets">
          <div style={fase==='ROUND OF 8' || fase==='QUARTER FINALS'?{}:{display:'none'}}>
            <div className="round_8_container">
              <div>
              {
                potATeamsMatches.map((i)=>(
                  <div className="match_final_fase">
                    <ul className="teams_final_fase">
                      <li key={i.A}>{i.A.toUpperCase()}</li>
                      <li key={i.B}>{i.B.toUpperCase()}</li>
                    </ul>
                    <ul>
                      <li key={`score1_${i.A}`}>{i.score_A_first_leg}</li>
                      <li key={`score1_${i.B}`}>{i.score_B_first_leg}</li>
                    </ul>
                    <ul>
                      <li key={`score2_${i.A}`}>{i.score_A_second_leg}</li>
                      <li key={`score2_${i.B}`}>{i.score_B_second_leg}</li>
                    </ul>
                  </div>
                ))
              }
              </div>
              <div>
              {
                potBTeamsMatches.map((i)=>(
                  <div className="match_final_fase" style={{justifyContent:'left',textAlign:'left'}}>
                    <ul>
                      <li key={`score1_${i.A}`}>{i.score_A_first_leg}</li>
                      <li key={`score1_${i.B}`}>{i.score_B_first_leg}</li>
                    </ul>
                    <ul>
                      <li key={`score2_${i.A}`}>{i.score_A_second_leg}</li>
                      <li key={`score2_${i.B}`}>{i.score_B_second_leg}</li>
                    </ul>
                    <ul className="teams_final_fase" style={{textAlign:'left'}}>
                      <li key={i.A}>{i.A.toUpperCase()}</li>
                      <li key={i.B}>{i.B.toUpperCase()}</li>
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

        <div className="load_square_container" style={loading?{}:{display:'none'}}>
          <div className="load_square" style={loadedMatches>1?{backgroundColor:'var(--verde)'}:{backgroundColor:'var(--vermelho_claro_plus'}}></div>
          <div className="load_square" style={loadedMatches>2?{backgroundColor:'var(--verde)'}:{backgroundColor:'var(--vermelho_claro_plus'}}></div>
          <div className="load_square" style={loadedMatches>3?{backgroundColor:'var(--verde)'}:{backgroundColor:'var(--vermelho_claro_plus'}}></div>
          <div className="load_square" style={loadedMatches>4?{backgroundColor:'var(--verde)'}:{backgroundColor:'var(--vermelho_claro_plus'}}></div>
          <div className="load_square" style={loadedMatches>5?{backgroundColor:'var(--verde)'}:{backgroundColor:'var(--vermelho_claro_plus'}}></div>
          <div className="load_square" style={loadedMatches>6?{backgroundColor:'var(--verde)'}:{backgroundColor:'var(--vermelho_claro_plus'}}></div>
          <div className="load_square" style={loadedMatches>7?{backgroundColor:'var(--verde)'}:{backgroundColor:'var(--vermelho_claro_plus'}}></div>
          <div className="load_square" style={loadedMatches>8?{backgroundColor:'var(--verde)'}:{backgroundColor:'var(--vermelho_claro_plus'}}></div>
        </div>
        <Dots color="var(--vermelho_escuro)" style={loading?{display:'block'}:{display:'none'}}/>
        <div className="button" onClick={changeStage}>{buttonStatus}</div>
      </div>
      <Footer />
    </div>

  );
}
