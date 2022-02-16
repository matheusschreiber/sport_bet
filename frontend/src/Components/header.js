import React from "react";
import { useNavigate } from 'react-router-dom'

import ChampionsBall from '../assets/ChampionsBall.png'

const start_header = {
  backgroundColor: "var(--vermelho_claro)",
  height: "280px",
  width: "90%",
  marginLeft: "30px",
  lineHeight: "32pt",
  display: "flex",
  justifyContent: "space-around",
  alignItems: "center",
}

const start_header_bg = {
  width: '100%',
  backgroundColor: 'var(--vermelho_escuro)',
  height: '250px',
  paddingTop: '30px'
}

const h1 = {
  color: 'white',
  fontSize: '60pt',
  fontFamily: 'Jaldi, sans-serif',
}

const h2 = {
  fontFamily: 'Contrail One, sans-serif',
  color: 'var(--azul_escuro)'
}

const text_container = {
  textAlign: 'right',
  height: '100px',
  marginRight: '400px',
  cursor:'pointer'
}

const img = {
  width: '100px',
  height: '100px'
}

export default function Header(){
  const nav = useNavigate()
  
  return(
    <div style={start_header_bg}>
      <header style={start_header}>
        <div style={text_container} onClick={()=>{nav('/')}}>
          <h1 style={h1}>football</h1>  
          <h2 style={h2}>CHAMPIONS LEAGUE</h2>
        </div>        
        <img src={ChampionsBall} style={img} alt="Champions League Ball"/> 
      </header>
    </div>
  )
}

