import React, { useState, useEffect } from "react";
import './style.css'

import { useNavigate } from "react-router-dom";

import { Dots } from "react-activity";
import "react-activity/dist/Dots.css";

import Header from "../../Components/header";
import Footer from "../../Components/footer";
import thropy from '../../assets/Thropy.png'
import BetPanel from "../../Components/BetPanel";
import Addbet from '../../Components/addbet';

import { FiArrowLeft } from 'react-icons/fi';

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
  const [ fase, setFase ] = useState('ROUND OF 8');
  const [ readyToRefreshBet, setReadyRefreshBet ]  = useState(false);

  const nav = useNavigate();

  async function simulateRound(){
    setReadyRefreshBet(false);
    setLoading(true);
    setLoadingRound(true);

    async function generateMatchOutcome(match, team1, team2){
      let answer = []
      const response1 = await api.put('/match', {year: localStorage.getItem('SEASON'), team_1:team1,team_2:team2})
      console.log(response1.data.outcome.team_1.name + ' ' + response1.data.outcome.team_1.goals + ' x ' + response1.data.outcome.team_2.goals + ' ' + response1.data.outcome.team_2.name)
      const response2 = await api.put('/match', {year: localStorage.getItem('SEASON'), team_1:team2,team_2:team1})
      console.log(response2.data.outcome.team_1.name + ' ' + response2.data.outcome.team_1.goals + ' x ' + response2.data.outcome.team_2.goals + ' ' + response2.data.outcome.team_2.name)
      
      answer = [ match, response1.data.outcome.team_1.goals, response1.data.outcome.team_2.goals, response2.data.outcome.team_2.goals, response2.data.outcome.team_1.goals ];
      answer[5] = 0
      answer[6] = 0
      if ((answer[1]+answer[3]===answer[2]+answer[4])&&(answer[2]===answer[3])){
        const response = await api.put('/penalties', {year: localStorage.getItem('SEASON'), team_1:team2, team_2:team1})
        answer[5] = response.data.outcome.team_2.goals
        answer[6] = response.data.outcome.team_1.goals
      }
      
      await api.post('./rgmatch', {
        year:localStorage.getItem('SEASON'),
        team_A:team1,
        team_B:team2,
        score_A:answer[1],
        score_B:answer[2],
      })

      await api.post('./rgmatch', {
        year:localStorage.getItem('SEASON'),
        team_A:team1,
        team_B:team2,
        score_A:answer[2]+answer[5],
        score_B:answer[3]+answer[6]
      })

      setLoadedMatches(loadedMatches.push(0))
      return answer;
    }

    async function generateOutcome(matchLegsA, matchLegsB){
      let i, answer=[1];
      if (fase==='GRAND FINAL') {
        const response = await api.put('/match', {year:localStorage.getItem('SEASON'), team_1:matchLegsA[0].A,team_2:matchLegsA[0].B})
        answer[1] = response.data.outcome.team_1.goals;
        answer[2] = response.data.outcome.team_2.goals
        console.log(response.data.outcome.team_1.name + ' ' + answer[1] + ' x ' + answer[2] + ' ' + response.data.outcome.team_2.name)
        answer[3] = 0
        answer[4] = 0
        
        if (answer[1]===answer[2]){
          const res = await api.put('/penalties', {year: localStorage.getItem('SEASON'),team_1:matchLegsA[0].A, team_2:matchLegsA[0].B})
          answer[3] = res.data.outcome.team_1.goals
          answer[4] = res.data.outcome.team_2.goals
        }

        await api.post('./rgmatch', {
          year:localStorage.getItem('SEASON'),
          team_A:matchLegsA[0].A,
          team_B:matchLegsA[0].B,
          score_A:answer[1]+answer[3],
          score_B:answer[2]+answer[4]
        })

        let aux = potATeamsMatches;
        aux[0].score_A = answer[1]
        aux[0].score_B = answer[2]
        aux[0].score_A_penalties = answer[3]
        aux[0].score_B_penalties = answer[4]
        setPotATeamsMatches(aux)
        setReadyRefreshBet(true);
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

    await api.put('/updateMatchFile', data);
    setLoadedMatches([]);
    setLoading(false);
    setLoadingRound(false);
    if (fase==='GRAND FINAL') {
      const response = await api.put('file', {year:localStorage.getItem('SEASON')})
      updateSeasonWinner(response.data.final_fase.final.match)
      setbuttonStatus('FINISH SEASON')
    } else setbuttonStatus('NEXT');
  }
  
  async function updateSeasonWinner(data){
    let pot = data;
    if ((pot.score_A>pot.score_B)||(pot.score_A_penalties>pot.score_B_penalties)){
      await registerSeason([pot.A], 'TITLE')
      await registerSeason([pot.B], 'FINALIST')
      const res = await api.put(`/getSeason/${localStorage.getItem('SEASON').replace(/-/g,"")} ${pot.A}`)
      setWinningSeason(res.data[0])
    } else {
      await registerSeason([pot.B], 'TITLE')
      await registerSeason([pot.A], 'FINALIST')
      const res = await api.put(`/getSeason/${localStorage.getItem('SEASON').replace(/-/g,"")} ${pot.B}`)
      setWinningSeason(res.data[0])
    }
  }
  
  async function registerSeason(disclassified, placement){
    await Promise.all(disclassified.map(async(d)=>{
      let response;
      response = await api.put(`/getSeason/${localStorage.getItem('SEASON').replace(/-/g,"")} ${d}`)
      const season = response.data
      response = await api.put('/getGoalsOpponent', {year:localStorage.getItem('SEASON'), team:d})
      
      await api.put('updateOpponent', {
        team:d,
        bg_opponent:`${response.data.hardScore} - ${response.data.hard}`,
        lt_opponent:`${response.data.easyScore} - ${response.data.easy}`
      })

      season[0].biggest_opponent = `${response.data.hardScore} - ${response.data.hard}`
      season[0].least_opponent = `${response.data.easyScore} - ${response.data.easy}`
      season[0].placement = placement
      season[0].year = localStorage.getItem('SEASON');
      await api.put('updateSeason', season[0])
    }))
  }
  
  async function updateRound(){
    setLoading(true);
    if (fase === "ROUND OF 8" && buttonStatus==='NEXT') {
      const round = await api.put('setup4',{year:localStorage.getItem('SEASON')})
      setPotATeamsMatches([round.data.quarter_finals.match_1,round.data.quarter_finals.match_2]);
      setPotBTeamsMatches([round.data.quarter_finals.match_3,round.data.quarter_finals.match_4]);
      await registerSeason(round.data.classified, 'PENDING ROUNDOF8')
      await registerSeason(round.data.disclassified, 'ROUNDOF8')
      setFase("QUARTER FINALS");
      localStorage.setItem('FASE', 'QUARTERS');
      setbuttonStatus('SIMULATE ROUND');
      setLoading(false);
    } else if (fase === "QUARTER FINALS" && buttonStatus==='NEXT') {
      const round = await api.put('setup2',{year:localStorage.getItem('SEASON')})
      setPotATeamsMatches([round.data.semi_finals.match_1]);
      setPotBTeamsMatches([round.data.semi_finals.match_2]);
      await registerSeason(round.data.classified, 'PENDING QUARTERS')
      await registerSeason(round.data.disclassified, 'QUARTERS')
      setFase("SEMI FINALS");
      localStorage.setItem('FASE', 'SEMIS');
      setbuttonStatus('SIMULATE ROUND');
      setLoading(false);
    } else if (fase === "SEMI FINALS" && buttonStatus==='NEXT') {
      const round = await api.put('setupfinal',{year:localStorage.getItem('SEASON')})
      setFase("GRAND FINAL");
      localStorage.setItem('FASE', 'FINAL');
      setPotATeamsMatches([round.data.final.match]);
      setPotBTeamsMatches([]);
      await registerSeason(round.data.classified, 'PENDING SEMIS')
      await registerSeason(round.data.disclassified, 'SEMIS')
      setbuttonStatus('SIMULATE ROUND');
      setLoading(false);
    } else {
      const round = await api.put('setup8',{year:localStorage.getItem('SEASON')})
      setPotATeamsMatches([round.data.round_of_8.match_1,round.data.round_of_8.match_2,round.data.round_of_8.match_3,round.data.round_of_8.match_4]);
      setPotBTeamsMatches([round.data.round_of_8.match_5,round.data.round_of_8.match_6,round.data.round_of_8.match_7,round.data.round_of_8.match_8]);
      await registerSeason(round.data.classified, 'PENDING GROUPS')
      await registerSeason(round.data.disclassified, 'GROUPS')
      setFase("ROUND OF 8");
      localStorage.setItem('FASE', 'ROUNDOF8');
      setLoading(false);
      setbuttonStatus('SIMULATE ROUND');
    }
    setTimeout(()=>setReadyRefreshBet(true),500);
  }

  async function changeStage(){
    if (buttonStatus==='SIMULATE ROUND') {
      setbuttonStatus('PRESSED');
      await simulateRound();
    } else if (buttonStatus==='NEXT'){
      setbuttonStatus('PRESSED');
      await updateRound();
    } else if (buttonStatus==='FINISH SEASON'){
      setbuttonStatus('PRESSED');
      nav('/')
    }
  }

  async function checkRound(){
    setReadyRefreshBet(false);
    const response = await api.put('file', {year:localStorage.getItem('SEASON')})
    if (response.data.final_fase.final) {
      setFase('GRAND FINAL')
      localStorage.setItem('FASE', 'FINAL');
      const aux = response.data.final_fase.final.match
      await updateSeasonWinner(aux);
      setPotATeamsMatches([aux]);
      setPotBTeamsMatches([]);
      if(aux.score_A||aux.score_B||aux.score_A_penalties||aux.score_B_penalties) setbuttonStatus('FINISH SEASON')
      else setbuttonStatus('SIMULATE ROUND')
    } else if (response.data.final_fase.semi_finals) {
      setFase('SEMI FINALS')
      localStorage.setItem('FASE', 'SEMIS');
      const aux = response.data.final_fase.semi_finals
      setPotATeamsMatches([aux.match_1])
      setPotBTeamsMatches([aux.match_2])
      if(aux.match_1.score_A_first_leg||aux.match_1.score_B_first_leg||aux.match_1.score_A_second_leg||aux.match_1.score_B_second_leg||aux.match_1.score_A_penalties||aux.match_1.score_B_penalties) setbuttonStatus('NEXT')
      else setbuttonStatus('SIMULATE ROUND')
    } else if (response.data.final_fase.quarter_finals) {
      const aux = response.data.final_fase.quarter_finals
      setFase('QUARTER FINALS')
      localStorage.setItem('FASE', 'QUARTERS');
      setPotATeamsMatches([aux.match_1, aux.match_2])
      setPotBTeamsMatches([aux.match_3, aux.match_4])
      if(aux.match_1.score_A_first_leg||aux.match_1.score_B_first_leg||aux.match_1.score_A_second_leg||aux.match_1.score_B_second_leg||aux.match_1.score_A_penalties||aux.match_1.score_B_penalties) setbuttonStatus('NEXT')
      else setbuttonStatus('SIMULATE ROUND')
    } else if (response.data.final_fase.round_of_8) {
      const aux = response.data.final_fase.round_of_8
      setFase('ROUND OF 8')
      localStorage.setItem('FASE', 'ROUNDOF8');
      setPotATeamsMatches([aux.match_1, aux.match_2, aux.match_3, aux.match_4])
      setPotBTeamsMatches([aux.match_5, aux.match_6, aux.match_7, aux.match_8])
      if(aux.match_1.score_A_first_leg||aux.match_1.score_B_first_leg||aux.match_1.score_A_second_leg||aux.match_1.score_B_second_leg||aux.match_1.score_A_penalties||aux.match_1.score_B_penalties) setbuttonStatus('NEXT')
      else setbuttonStatus('SIMULATE ROUND')
    } else {
      console.log("No current final fase found, creating one...")
      updateRound()
    }
    setReadyRefreshBet(true);
  }

  useEffect(()=>{    
    window.scroll(0,0);
    setLoading(true); 
    checkRound(); 
    setLoading(false); //eslint-disable-next-line
  }, [])


  

  return (
    <div style={{color:'white', textAlign:'center'}}>
      <Header />
      <div className="final_container">
        <div className="back_groups">
          <h2 onClick={()=>nav('/Groups')}>BACK TO GROUPS</h2>
          <FiArrowLeft size={27}/>
        </div>
        <div className="title_container">
          <h1>CLASSIFICATIONS</h1>  
          <h2>SEASON {localStorage.getItem('SEASON')}</h2>
        </div>
        <div className="HIGHIGHT_container">
          <div className="HIGHLIGHT"><h1>Final FASE</h1></div>
          <div className="HIGHLIGHT_SUB"><h2>{fase}</h2></div>
        </div>

        <div className="brackets">
          <div style={fase==='ROUND OF 8' || fase==='QUARTER FINALS'?{}:{display:'none'}}>
            <div className="round_8_container">
              <div>
              {
                potATeamsMatches.map((i)=>{
                  const styleAWinnerHighlightPOTA = i.score_A_first_leg+i.score_A_second_leg+i.score_A_penalties>i.score_B_first_leg+i.score_B_second_leg+i.score_B_penalties || (i.score_A_first_leg+i.score_A_second_leg === i.score_B_first_leg+i.score_B_second_leg && i.score_A_second_leg>i.score_B_first_leg)?{color:'var(--verde)'}:{}
                  const styleBWinnerHighlightPOTA = i.score_A_first_leg+i.score_A_second_leg+i.score_A_penalties<i.score_B_first_leg+i.score_B_second_leg+i.score_B_penalties || (i.score_A_first_leg+i.score_A_second_leg === i.score_B_first_leg+i.score_B_second_leg && i.score_A_second_leg<i.score_B_first_leg)?{color:'var(--verde)'}:{}
                  
                  return (
                    <div className="match_final_fase" key={i.A}>
                      <ul className="teams_final_fase" key={i.A + "UL1"}>
                        <li key={i.A + "UL1_li1"} style={styleAWinnerHighlightPOTA}>{i.A.toUpperCase()}</li>
                        <li key={i.A + "UL1_li2"} style={styleBWinnerHighlightPOTA}>{i.B.toUpperCase()}</li>
                      </ul>
                      <ul key={i.A + "UL2"}>
                        <li key={i.A + "UL2_li1"} style={styleAWinnerHighlightPOTA}>{i.score_A_first_leg}</li>
                        <li key={i.A + "UL2_li2"} style={styleBWinnerHighlightPOTA}>{i.score_B_first_leg}</li>
                      </ul>
                      <ul key={i.A + "UL3"}>
                        <li key={i.A + "UL3_li1"} style={styleAWinnerHighlightPOTA}>{i.score_A_second_leg}</li>
                        <li key={i.A + "UL3_li2"} style={styleBWinnerHighlightPOTA}>{i.score_B_second_leg}</li>
                      </ul>
                      <ul style={i.score_A_penalties||i.score_B_penalties?{fontSize:'12pt', color:'var(--amarelo)'}:{display:'none'}}
                        key={i.A + "UL4"}>
                        <li key={i.A + "UL4_li1"}>{i.score_A_penalties}</li>
                        <li key={i.A + "UL4_li2"}>{i.score_B_penalties}</li>
                      </ul>
                    </div>
                  )
                })
              }
              </div>
              <div>
              {
                potBTeamsMatches.map((i)=>{
                  const styleAWinnerHighlightPOTB = i.score_A_first_leg+i.score_A_second_leg+i.score_A_penalties>i.score_B_first_leg+i.score_B_second_leg+i.score_B_penalties || (i.score_A_first_leg+i.score_A_second_leg === i.score_B_first_leg+i.score_B_second_leg && i.score_A_second_leg>i.score_B_first_leg)?{color:'var(--verde)'}:{}
                  const styleBWinnerHighlightPOTB = i.score_A_first_leg+i.score_A_second_leg+i.score_A_penalties<i.score_B_first_leg+i.score_B_second_leg+i.score_B_penalties || (i.score_A_first_leg+i.score_A_second_leg === i.score_B_first_leg+i.score_B_second_leg && i.score_A_second_leg<i.score_B_first_leg)?{color:'var(--verde)'}:{}
                  return(
                    <div className="match_final_fase" style={{justifyContent:'left',textAlign:'left'}} key={i.B}>
                      <ul style={i.score_A_penalties||i.score_B_penalties?{fontSize:'12pt', color:'var(--amarelo)'}:{display:'none'}}
                        key={i.B + "UL1"}>
                        <li key={i.B + "UL1_li1"}>{i.score_A_penalties}</li>
                        <li key={i.B + "UL1_li2"}>{i.score_B_penalties}</li>
                      </ul>
                      <ul key={i.B + "UL2"}>
                        <li key={i.B + "UL2_li1"}style={styleAWinnerHighlightPOTB}>{i.score_A_first_leg}</li>
                        <li key={i.B + "UL2_li2"}style={styleBWinnerHighlightPOTB}>{i.score_B_first_leg}</li>
                      </ul>
                      <ul key={i.B + "UL3"}>
                        <li key={i.B + "UL3_li1"}style={styleAWinnerHighlightPOTB}>{i.score_A_second_leg}</li>
                        <li key={i.B + "UL3_li2"}style={styleBWinnerHighlightPOTB}>{i.score_B_second_leg}</li>
                      </ul>
                      <ul className="teams_final_fase" style={{textAlign:'left'}} key={i.B + "UL4"}>
                        <li key={i.B + "UL4_li1"}style={styleAWinnerHighlightPOTB}>{i.A.toUpperCase()}</li>
                        <li key={i.B + "UL4_li2"}style={styleBWinnerHighlightPOTB}>{i.B.toUpperCase()}</li>
                      </ul>
                    </div>
                  )
                })
              }
              </div>
            </div>
          </div>
          <div style={fase==='SEMI FINALS'?{}:{display:'none'}}>
            <div className="semis_container">
              <div className="semi_final_container">
                <div className="semi_text_container" style={{textAlign: 'right'}}>
                  <h2 style={
                    potATeamsMatches[0]&&
                    (potATeamsMatches[0].score_A_first_leg+potATeamsMatches[0].score_A_second_leg+potATeamsMatches[0].score_A_penalties
                    >
                    potATeamsMatches[0].score_B_first_leg+potATeamsMatches[0].score_B_second_leg+potATeamsMatches[0].score_B_penalties
                    || potATeamsMatches[0].score_A_second_leg>potATeamsMatches[0].score_B_first_leg)
                    ?
                    {color:'var(--verde)'}:{}
                  }>{potATeamsMatches[0]?potATeamsMatches[0].A:'LOADING'}</h2>
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
                  <h2 style={ 
                    potATeamsMatches[0]&&
                    (potATeamsMatches[0].score_A_first_leg+potATeamsMatches[0].score_A_second_leg+potATeamsMatches[0].score_A_penalties
                    <
                    potATeamsMatches[0].score_B_first_leg+potATeamsMatches[0].score_B_second_leg+potATeamsMatches[0].score_B_penalties
                    || potATeamsMatches[0].score_A_second_leg<potATeamsMatches[0].score_B_first_leg)
                    ?
                    {color:'var(--verde)'}:{}
                  }>{potATeamsMatches[0]?potATeamsMatches[0].B:'LOADING'}</h2>
                </div>
                <h2 style={potATeamsMatches[0]?potATeamsMatches[0].score_A_penalties||potATeamsMatches[0].score_B_penalties?{}:{display:'none'}:{display:'none'}}>
                  {potATeamsMatches[0]?potATeamsMatches[0].score_A_penalties:'LOADING'} - {potATeamsMatches[0]?potATeamsMatches[0].score_B_penalties:'LOADING'}
                </h2>
              </div>
            </div>
            <div className="semi_final_container" style={{textAlign: 'right'}}>
              <div className="semi_text_container">
                <h2 style={
                    potBTeamsMatches[0]&&
                    (potBTeamsMatches[0].score_A_first_leg+potBTeamsMatches[0].score_A_second_leg+potBTeamsMatches[0].score_A_penalties
                    >
                    potBTeamsMatches[0].score_B_first_leg+potBTeamsMatches[0].score_B_second_leg+potBTeamsMatches[0].score_B_penalties
                    || potBTeamsMatches[0].score_A_second_leg>potBTeamsMatches[0].score_B_first_leg)
                    ?
                    {color:'var(--verde)'}:{}
                  }>{potBTeamsMatches[0]?potBTeamsMatches[0].A:'LOADING'}</h2>
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
                <h2 style={ 
                    potBTeamsMatches[0]&&
                    (potBTeamsMatches[0].score_A_first_leg+potBTeamsMatches[0].score_A_second_leg+potBTeamsMatches[0].score_A_penalties
                    <
                    potBTeamsMatches[0].score_B_first_leg+potBTeamsMatches[0].score_B_second_leg+potBTeamsMatches[0].score_B_penalties
                    || potBTeamsMatches[0].score_A_second_leg<potBTeamsMatches[0].score_B_first_leg)
                    ?
                    {color:'var(--verde)'}:{}
                  }>{potBTeamsMatches[0]?potBTeamsMatches[0].B:'LOADING'}</h2>
              </div>
              <h2 style={potATeamsMatches[0]?potATeamsMatches[0].score_A_penalties||potATeamsMatches[0].score_B_penalties?{}:{display:'none'}:{display:'none'}}>
                {potATeamsMatches[0]?potATeamsMatches[0].score_A_penalties:'LOADING'} - {potATeamsMatches[0]?potATeamsMatches[0].score_B_penalties:'LOADING'}
              </h2>
            </div>
          </div>
          <div style={fase==='GRAND FINAL'?{}:{display:'none'}} className="final_container">
            <h2 id="stadium">{potATeamsMatches[0]?potATeamsMatches[0].local:'LOADING'}</h2>
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
      <div className="season_overall" style={buttonStatus==='FINISH SEASON'?{}:{display:'none'}}>
        <h1>{winningSeason.team_name}'s Season {winningSeason.year}</h1>
        <h3>{winningSeason.wins} wins</h3>
        <h3>{winningSeason.losses} losses</h3>
        <h3>{winningSeason.dues} dues</h3>
        <h3>{winningSeason.games} games</h3>
        <h3>{winningSeason.goals_for} goals for</h3>
        <h3>{winningSeason.goals_against} goals against</h3>
        <h2>SEASON SCORE {winningSeason.season_score} </h2>
      </div>
      </div>
      <h3 style={readyToRefreshBet?{display:'none'}:{}}>CLICK NEXT TO UPDATE BETS</h3>
      <BetPanel 
        player_name={localStorage.getItem('PLAYER')} 
        ready={readyToRefreshBet}
        round_finished={buttonStatus==='NEXT' || buttonStatus==='FINISH SEASON'?true:false}/>
      <Footer />
      <Addbet betsAvailable={readyToRefreshBet} />
    </div>

  );
}

