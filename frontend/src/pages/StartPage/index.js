import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom'

import { FiAward } from 'react-icons/fi';

import Welcome from '../../assets/Welcome.png'
import { Dots } from "react-activity";
import "react-activity/dist/Dots.css";

import './style.css'

import Header from '../Components/header'
import Footer from '../Components/footer'
import DBlog from '../Components/databaseConnection'

import api from "../../services/api";

export default function StartPage(){
  const navigate = useNavigate();
  const [ loading, setLoading ] = useState(false);
  const [ year, setYear ] = useState(['','']);
  const nav = useNavigate();

  async function getLatestYear(){
    const response = await api.get('/getAnyFile')
    let array = [response.data.slice(0,9)]
    
    let nextYear = String(parseInt(array[0].replace(/-/g, "")) + 10001)
    nextYear = `${nextYear.slice(0, 4)}-${nextYear.slice(4,8)}`
    array.push(nextYear)
    setYear(array)
  }

  useEffect(()=>getLatestYear(),[])
  
  return(
    <div className="start_container">
      <Header />
      <DBlog />
      <div className="main_container">
        <div className="history_linker" onClick={()=>nav('/history')}>
          <h2>TEAMS HISTORY</h2>
          <FiAward size={40}/>
        </div>
        <img src={Welcome} alt="Welcome to Sport Bet Platform Project"/>
        <div className="text_container">
          <h1>PROJECT DESCRIPTION</h1>
          <p>THIS WEBSITE SEEKS TO FUNCTION AS A PRACTICE PROJECT IN ORDER TO EXERCICE THE REACT JS FRONT END AND NODE JS BACK END DEVELOPMENT, AT THE SAME TIME THAT CIRCLES AROUND A NICE THEME, FILLED WITH STATISTICS AND VARIOUS INTERESTING MECANISMS.</p><br/>
          <p>THE FULL ACCESS TO THE CODE IS AT THE GITHUB LINK AVAILABLE AT THE BOTTOM OF THE PAGE.</p><br/>
          <p>HAVE FUN BETTING!</p>
          <h2>DISCLAIMER</h2>
          <p>THE JERSEYS AND TEAM'S MEDIAS ARE CONNECTED TO WIKIPEDIA IMAGES, SO ANY INCONSISTENCY OVER THE LOADING OF THESE CONTENTS MAY BE CAUSED BY POOR/UNAVAILABLE INTERNET CONNECTION</p>
        </div>
        <div className="button_outer_container">
          <Dots color="var(--vermelho_escuro)" style={loading?{display:'block'}:{display:'none'}}/>
          <div className="button_container">
            <div className="button" onClick={async () => {
              localStorage.setItem('SEASON',year[1])
              setLoading(true)
              const response = await api.get('getTeamsJSON')
              await api.post('newseason',{year:year[1],teams:response.data})
              setLoading(false)
              navigate('/groups')
            }}>START NEW SEASON</div>

            <div className="button" onClick={async () => {
                localStorage.setItem('SEASON',year[0])
                setLoading(true)
                navigate('/groups')
              }}>CONTINUE SEASON</div>
          </div>
          <p>LAST SEASON: <span>{year[0]}</span> NEXT SEASON: <span>{year[1]}</span> </p>
        </div>
        <div className="year_selector">
          <ul>
            <li></li>
          </ul>
        </div>
      </div>
      <Footer />
    </div>
  );
}