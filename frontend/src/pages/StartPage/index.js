import React, { useState } from "react";
import { useNavigate } from 'react-router-dom'

import Welcome from '../../assets/Welcome.png'
import { Dots } from "react-activity";
import "react-activity/dist/Dots.css";

import './style.css'

import Header from '../Components/header'
import Footer from '../Components/footer'
import api from "../../services/api";

export default function StartPage(){
  const navigate = useNavigate();
  const [ loading, setLoading ] = useState(false);
  const [ year, setYear ] = useState('2019-2020');

  
  return(
    <div className="start_container">
      <Header />
      <div className="main_container">
        <img src={Welcome} alt="Welcome to Sport Bet Platform Project"/>
        <div className="text_container">
          <h1>PROJECT DESCRIPTION</h1>
          <p>THIS WEBSITE SEEKS TO FUNCTION AS A PRACTICE PROJECT IN ORDER TO EXERCICE THE REACT JS FRONT END AND NODE JS BACK END DEVELOPMENT, AT THE SAME TIME THAT CIRCLES AROUND A NICE THEME, FILLED WITH STATISTICS AND VARIOUS INTERESTING MECANISMS.</p><br/>
          <p>THE FULL ACCESS TO THE CODE IS AT THE GITHUB LINK AVAILABLE AT THE BOTTOM OF THE PAGE.</p><br/>
          <p>HAVE FUN BETTING!</p>
        </div>
        <div className="button_container">
          <Dots color="var(--vermelho_escuro)" style={loading?{display:'block'}:{display:'none'}}/>
          <div className="button" onClick={async () => {
            localStorage.setItem('SEASON','2019-2020')
            setLoading(true)
            const response = await api.get('getTeamsJSON')
            await api.post('newseason',{year,teams:response.data})
            setLoading(false)
            navigate('/groups')
          }}>START SEASON</div>
          <p>CURRENT SEASON: {year}</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}