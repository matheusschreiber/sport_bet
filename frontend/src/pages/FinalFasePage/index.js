import React, { useState, useEffect } from "react";
import './style.css'

import { useNavigate } from "react-router-dom";

import { Dots } from "react-activity";
import "react-activity/dist/Dots.css";

import Header from "../Components/header";
import Footer from "../Components/footer";
import thropy from '../../assets/Thropy.png'

import api from '../../services/api';

export default function FinalFasePage() {
  const [ potATeamsMatches, setPotATeamsMatches ] = useState([]);
  const [ potBTeamsMatches, setPotBTeamsMatches ] = useState([]);    
  const [ buttonStatus, setbuttonStatus ] = useState('PRESSED');
  const [ loadingRound, setLoadingRound ] = useState(false)
  const [ winningSeason, setWinningSeason ] = useState({
    team_name:'LOADING',
    year: localStorage.getItem('SEASON'),
    placement: 'LOADING',
    biggest_opponent:'',
    least_opponent:'',
    wins:0,
    losses:0,
    dues:0,
    games:0,
    goalsfor:0,
    goalsagainst:0
  });
  const [ loadedMatches, setLoadedMatches ] = useState([]);
  const [ loading, setLoading ] = useState(false);
  const [ fase, setFase ] = useState('ROUND OF 8')

  const nav = useNavigate();

  async function simulateRound(){
    setLoading(true);
    setLoadingRound(true);

    async function generateMatchOutcome(match, team1, team2){
      let answer = []
      const response1 = await api.put('/match', {team_1:team1,team_2:team2})
      console.log(response1.data.outcome.team_1.name + ' ' + response1.data.outcome.team_1.goals + ' x ' + response1.data.outcome.team_2.goals + ' ' + response1.data.outcome.team_2.name)
      const response2 = await api.put('/match', {team_1:team2,team_2:team1})
      console.log(response2.data.outcome.team_1.name + ' ' + response2.data.outcome.team_1.goals + ' x ' + response2.data.outcome.team_2.goals + ' ' + response2.data.outcome.team_2.name)
      
      answer = [ match, response1.data.outcome.team_1.goals, response1.data.outcome.team_2.goals, response2.data.outcome.team_2.goals, response2.data.outcome.team_1.goals ];
      answer[5] = 0
      answer[6] = 0
      if ((answer[1]+answer[3]===answer[2]+answer[4])&&(answer[2]===answer[3])){
        const response = await api.put('/penalties', {team_1:team2, team_2:team1})
        answer[5] = response.data.outcome.team_2.goals
        answer[6] = response.data.outcome.team_1.goals
      }
      
      setLoadedMatches(loadedMatches.push(0))
      return answer;
    }

    async function generateOutcome(matchLegsA, matchLegsB){
      let i, answer=[1];
      if (fase==='GRAND FINAL') {
        const response = await api.put('/match', {team_1:matchLegsA[0].A,team_2:matchLegsA[0].B})
        answer[1] = response.data.outcome.team_1.goals;
        answer[2] = response.data.outcome.team_2.goals
        console.log(response.data.outcome.team_1.name + ' ' + answer[1] + ' x ' + answer[2] + ' ' + response.data.outcome.team_2.name)
        answer[3] = 0
        answer[4] = 0
        if (answer[1]===answer[2]){
          const res = await api.put('/penalties', {team_1:matchLegsA[0].A, team_2:matchLegsA[0].B})
          answer[3] = res.data.outcome.team_1.goals
          answer[4] = res.data.outcome.team_2.goals
        }

        let aux = potATeamsMatches;
        aux[0].score_A = answer[1]
        aux[0].score_B = answer[2]
        aux[0].score_A_penalties = answer[3]
        aux[0].score_B_penalties = answer[4]
        setPotATeamsMatches(aux)

        if ((answer[1]>answer[2])||(answer[3]>answer[4])) setWinningSeason({
          team_name:'LOADING',
          year: localStorage.getItem('SEASON'),
          placement: 'TITLE',
          biggest_opponent:'',
          least_opponent:'',
          wins:0,
          losses:0,
          dues:0,
          games:0,
          goalsfor:0,
          goalsagainst:0
        })

        return [1, answer[1], answer[2], answer[3], answer[4]]
      }

      for(i=0;i<matchLegsA.length+matchLegsB.length;i++) {
        if (i<matchLegsA.length) {
          answer[i] = await generateMatchOutcome(i+1,matchLegsA[i].A,matchLegsA[i].B);
          let aux = potATeamsMatches;
          aux[i].score_A_first_leg = answer[i][1]
          aux[i].score_B_first_leg = answer[i][2]
          aux[i].score_A_second_leg = answer[i][3]
          aux[i].score_B_second_leg = answer[i][4]
          aux[i].score_A_penalties = answer[i][5]
          aux[i].score_B_penalties = answer[i][6]
          setPotATeamsMatches(aux)
        } else {
          let j = i - matchLegsA.length
          answer[i] = await generateMatchOutcome(i+1,matchLegsB[j].A,matchLegsB[j].B);
          let aux = potBTeamsMatches;
          aux[j].score_A_first_leg = answer[i][1]
          aux[j].score_B_first_leg = answer[i][2]
          aux[j].score_A_second_leg = answer[i][3]
          aux[j].score_B_second_leg = answer[i][4]
          aux[j].score_A_penalties = answer[i][5]
          aux[j].score_B_penalties = answer[i][6]
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
    setLoadedMatches([0]);
    setLoading(false);
    setLoadingRound(false);
    if (fase==='GRAND FINAL') setbuttonStatus('FINISH SEASON')
    else setbuttonStatus('NEXT');
  }
  
  async function updateRound(){
    setLoading(true)
    if (fase === "ROUND OF 8" && buttonStatus==='NEXT') {
      setTimeout(async()=>{
        const round = await api.put('setup4',{year:localStorage.getItem('SEASON')})
        setPotATeamsMatches([round.data.quarter_finals.match_1,round.data.quarter_finals.match_2]);
        setPotBTeamsMatches([round.data.quarter_finals.match_3,round.data.quarter_finals.match_4]);
        setFase("QUARTER FINALS");
        setLoading(false);
        setbuttonStatus('SIMULATE ROUND');
      },1000)
    } else if (fase === "QUARTER FINALS" && buttonStatus==='NEXT') {
      setTimeout(async()=>{
        const round = await api.put('setup2',{year:localStorage.getItem('SEASON')})
        setPotATeamsMatches([round.data.semi_finals.match_1]);
        setPotBTeamsMatches([round.data.semi_finals.match_2]);
        setFase("SEMI FINALS");
        setLoading(false);
        setbuttonStatus('SIMULATE ROUND');
      },500)
    } else if (fase === "SEMI FINALS" && buttonStatus==='NEXT') {
      setTimeout(async()=>{
        const round = await api.put('setupfinal',{year:localStorage.getItem('SEASON')})
        setPotATeamsMatches([round.data.final.match]);
        setPotBTeamsMatches([]);
        setFase("GRAND FINAL");
        setLoading(false);
        setbuttonStatus('SIMULATE ROUND');
      },500)
    } else {
      setTimeout(async()=>{
        const round = await api.put('setup8',{year:localStorage.getItem('SEASON')})
        setPotATeamsMatches([round.data.round_of_8.match_1,round.data.round_of_8.match_2,round.data.round_of_8.match_3,round.data.round_of_8.match_4]);
        setPotBTeamsMatches([round.data.round_of_8.match_5,round.data.round_of_8.match_6,round.data.round_of_8.match_7,round.data.round_of_8.match_8]);
        setLoading(false);
        setbuttonStatus('SIMULATE ROUND');
      },500)
    }
  }

  async function changeStage(){
    if (buttonStatus==='SIMULATE ROUND') {
      setbuttonStatus('PRESSED');
      await simulateRound();
    } else if (buttonStatus==='NEXT'){
      await updateRound();
      setbuttonStatus('PRESSED');
    } else if (buttonStatus==='FINISH SEASON'){
      setWinningSeason([])
      nav('/')
    }
  }

  async function checkRound(){
    const response = await api.put('file', {year:localStorage.getItem('SEASON')})
    if (response.data.final_fase.final) {
      setFase('GRAND FINAL')
      const aux = response.data.final_fase.final.match
      setPotATeamsMatches([aux])
      if(aux.score_A||aux.score_B||aux.score_A_penalties||aux.score_B_penalties) setbuttonStatus('FINISH SEASON')
      else setbuttonStatus('SIMULATE ROUND')
    } else if (response.data.final_fase.semi_finals) {
      setFase('SEMI FINALS')
      const aux = response.data.semi_finals
      setPotATeamsMatches([aux.match_1])
      setPotBTeamsMatches([aux.match_2])
      if(aux.match_1.score_A||aux.match_1.score_B||aux.match_1.score_A_penalties||aux.match_1.score_B_penalties) setbuttonStatus('NEXT')
      else setbuttonStatus('SIMULATE ROUND')
    } else if (response.data.final_fase.quarter_finals) {
      const aux = response.data.final_fase.quarter_finals
      setFase('QUARTER FINALS')
      setPotATeamsMatches([aux.match_1, aux.match_2])
      setPotBTeamsMatches([aux.match_3, aux.match_4])
      if(aux.match_1.score_A||aux.match_1.score_B||aux.match_1.score_A_penalties||aux.match_1.score_B_penalties) setbuttonStatus('NEXT')
      else setbuttonStatus('SIMULATE ROUND')
    } else if (response.data.final_fase.round_of_8) {
      const aux = response.data.final_fase.round_of_8
      setFase('ROUND OF 8')
      setPotATeamsMatches([aux.match_1, aux.match_2, aux.match_3, aux.match_4])
      setPotBTeamsMatches([aux.match_5, aux.match_6, aux.match_7, aux.match_8])
      if(aux.match_1.score_A||aux.match_1.score_B||aux.match_1.score_A_penalties||aux.match_1.score_B_penalties) setbuttonStatus('NEXT')
      else setbuttonStatus('SIMULATE ROUND')
    } else {
      console.log("No current final fase found, creating one...")
      updateRound()
    }
  }

  useEffect(()=>{
    window.scroll(0,0);
    setLoading(true)
    setTimeout(async()=>{
      await checkRound();
      setLoading(false);
    }, 1000)
  }, [])


  return (
    <div>
      <Header />
      <div className="final_container">
        <div className="title_container">
          <h1>CLASSIFICATIONS</h1>  
          <h2>SEASON {localStorage.getItem('SEASON')}</h2>
        </div>
        <div>
          <div className="HIGHLIGHT"><h1>Final FASE</h1></div>
          <div className="HIGHLIGHT_SUB"><h2>{fase}</h2></div>

          <h3 onClick={async()=>{
            const teams = await api.get('/getTeamsJSON')
            await api.post('newseason',{year:localStorage.getItem('SEASON'),teams:teams.data})
            updateRound();    
            window.location.reload();
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
                      <li key={"potA"+i.A}>{i.A.toUpperCase()}</li>
                      <li key={"potA"+i.B}>{i.B.toUpperCase()}</li>
                    </ul>
                    <ul>
                      <li key={`potAscore1_${i.A}`}>{i.score_A_first_leg}</li>
                      <li key={`potAscore1_${i.B}`}>{i.score_B_first_leg}</li>
                    </ul>
                    <ul>
                      <li key={`potAscore2_${i.A}`}>{i.score_A_second_leg}</li>
                      <li key={`potAscore2_${i.B}`}>{i.score_B_second_leg}</li>
                    </ul>
                    <ul style={i.score_A_penalties||i.score_B_penalties?{fontSize:'12pt', color:'var(--amarelo)'}:{display:'none'}}>
                      <li key={`potApenalties_${i.A}`}>{i.score_A_penalties}</li>
                      <li key={`potApenalties_${i.B}`}>{i.score_B_penalties}</li>
                    </ul>
                  </div>
                ))
              }
              </div>
              <div>
              {
                potBTeamsMatches.map((i)=>(
                  <div className="match_final_fase" style={{justifyContent:'left',textAlign:'left'}}>
                    <ul style={i.score_A_penalties||i.score_B_penalties?{fontSize:'12pt', color:'var(--amarelo)'}:{display:'none'}}>
                      <li key={`potBpenalties_${i.A}`}>{i.score_A_penalties}</li>
                      <li key={`potBpenalties_${i.B}`}>{i.score_B_penalties}</li>
                    </ul>
                    <ul>
                      <li key={`potBscore1_${i.A}`}>{i.score_A_first_leg}</li>
                      <li key={`potBscore1_${i.B}`}>{i.score_B_first_leg}</li>
                    </ul>
                    <ul>
                      <li key={`potBscore2_${i.A}`}>{i.score_A_second_leg}</li>
                      <li key={`potBscore2_${i.B}`}>{i.score_B_second_leg}</li>
                    </ul>
                    <ul className="teams_final_fase" style={{textAlign:'left'}}>
                      <li key={"potB"+i.A}>{i.A.toUpperCase()}</li>
                      <li key={"potB"+i.B}>{i.B.toUpperCase()}</li>
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
                  <h2>{potATeamsMatches[0]?potATeamsMatches[0].A:'LOADING'}</h2>
                </div>
                <img src={potATeamsMatches[0]?potATeamsMatches[0].jerseyA:'LOADING'} alt="jersey" />
                <div className="scores">
                  <h2>FIRST LEG ({potATeamsMatches[0]?potATeamsMatches[0].localA:'LOADING'})</h2>
                  <h1>{potATeamsMatches[0]?potATeamsMatches[0].score_A_first_leg:'LOADING'} - {potATeamsMatches[0]?potATeamsMatches[0].score_B_first_leg:'LOADING'}</h1>
                  <h2>SECOND LEG ({potATeamsMatches[0]?potATeamsMatches[0].localB:'LOADING'})</h2>
                  <h1>{potATeamsMatches[0]?potATeamsMatches[0].score_A_second_leg:'LOADING'} - {potATeamsMatches[0]?potATeamsMatches[0].score_B_second_leg:'LOADING'}</h1>
                </div>
                <img src={potATeamsMatches[0]?potATeamsMatches[0].jerseyB:'LOADING'} alt="jersey"/>
                <div className="semi_text_container" style={{textAlign: 'left'}}>
                  <h2>{potATeamsMatches[0]?potATeamsMatches[0].B:'LOADING'}</h2>
                </div>
              </div>
            </div>
            <div className="semi_final_container" style={{textAlign: 'right'}}>
              <div className="semi_text_container">
                <h2>{potBTeamsMatches[0]?potBTeamsMatches[0].A:'LOADING'}</h2>
              </div>
              <img src={potBTeamsMatches[0]?potBTeamsMatches[0].jerseyA:'LOADING'} alt=""/>
              <div className="scores">
                <h2>FIRST LEG ({potBTeamsMatches[0]?potBTeamsMatches[0].localA:'LOADING'})</h2>
                <h1>{potBTeamsMatches[0]?potBTeamsMatches[0].score_A_first_leg:'LOADING'} - {potBTeamsMatches[0]?potBTeamsMatches[0].score_B_first_leg:'LOADING'}</h1>
                <h2>SECOND LEG ({potBTeamsMatches[0]?potBTeamsMatches[0].localB:'LOADING'})</h2>
                <h1>{potBTeamsMatches[0]?potBTeamsMatches[0].score_A_second_leg:'LOADING'} - {potBTeamsMatches[0]?potBTeamsMatches[0].score_B_second_leg:'LOADING'}</h1>
              </div>
              <img src={potBTeamsMatches[0]?potBTeamsMatches[0].jerseyB:'LOADING'} alt=""/>
              <div className="semi_text_container" style={{textAlign: 'left'}}>
                <h2>{potBTeamsMatches[0]?potBTeamsMatches[0].B:'LOADING'}</h2>
              </div>
            </div>
          </div>
          <div style={fase==='GRAND FINAL'?{}:{display:'none'}}>
            <div className="final">
              <div className="final_team">
                <img src={potATeamsMatches[0]?potATeamsMatches[0].jerseyA:'LOADING'} alt={"Jersey"} />  
                <h2>{potATeamsMatches[0]?potATeamsMatches[0].A:'LOADING'}</h2>
              </div>
              <div className="final_score">
                <img src={thropy} alt={"Thropy"} style={{height:'150px'}} />
                <h1>{potATeamsMatches[0]?potATeamsMatches[0].score_A:'LOADING'} - {potATeamsMatches[0]?potATeamsMatches[0].score_B:'LOADING'}</h1>
                <h2 style={potATeamsMatches[0]?potATeamsMatches[0].score_A_penalties||potATeamsMatches[0].score_B_penalties?{}:{display:'none'}:{display:'none'}}>
                  {potATeamsMatches[0]?potATeamsMatches[0].score_A_penalties:'LOADING'} - {potATeamsMatches[0]?potATeamsMatches[0].score_B_penalties:'LOADING'}
                </h2>
              </div>
              <div className="final_team">
                <img src={potATeamsMatches[0]?potATeamsMatches[0].jerseyB:'LOADING'} alt={"Jersey"} />  
                <h2>{potATeamsMatches[0]?potATeamsMatches[0].B:'LOADING'}</h2>
              </div>
            </div>
          </div>
        </div>

        <div className="load_square_container" style={loadingRound?{}:{display:'none'}}>
          {
            potATeamsMatches.map((i)=>(
              <div className="load_square" style={loadedMatches>potATeamsMatches.indexOf(i)?{backgroundColor:'var(--verde)'}:{backgroundColor:'var(--vermelho_claro_plus'}}></div>
            ))
          }
          {
            potBTeamsMatches.map((i)=>(
              <div className="load_square" style={loadedMatches-potATeamsMatches.length>potBTeamsMatches.indexOf(i)?{backgroundColor:'var(--verde)'}:{backgroundColor:'var(--vermelho_claro_plus'}}></div>
            ))
          }
        </div>
        <Dots color="var(--vermelho_escuro)" style={loading?{display:'block'}:{display:'none'}}/>
        <div className="button" onClick={changeStage} id={buttonStatus==='PRESSED'?'pressed':''}>
          {buttonStatus!=='PRESSED'?buttonStatus:'LOADING'}
        </div>
      <div className="season_overall" style={fase==='GRAND FINAL'?{}:{display:'none'}}>
        <h1>{winningSeason.team_name}'s Season {winningSeason.year}</h1>
        <h3>{winningSeason.wins} wins</h3>
        <h3>{winningSeason.losses} losses</h3>
        <h3>{winningSeason.dues} dues</h3>
        <h3>{winningSeason.games} games</h3>
        <h3>{winningSeason.goalsfor} goals for</h3>
        <h3>{winningSeason.goalsagainst} goals against</h3>
        <h2>{winningSeason.placement}</h2>
      </div>
      </div>
      <Footer />
    </div>

  );
}

