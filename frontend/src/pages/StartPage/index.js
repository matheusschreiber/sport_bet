import React from "react";
import { useNavigate } from 'react-router-dom'

import Welcome from '../../assets/Welcome.png'

import './style.css'

import Header from '../Components/header'
import Footer from '../Components/footer'

export default function StartPage(){
  const navigate = useNavigate();

  
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
          <div className="button" onClick={() => navigate('/groups')}>START SEASON</div>
          <p>CURRENT SEASON: 2020-2021</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}