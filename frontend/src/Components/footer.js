import React from "react";

const footer_bg = {
  marginTop: '500px',
  width: '100%',
  backgroundColor: 'var(--vermelho_escuro)',
  height: '350px',
  display: 'flex',
  justifyContent: 'space-between',
  padding: '100px'
}

const h1 = {
  fontSize: '60pt',
  fontFamily: 'Jaldi, sans-serif',
  lineHeight: '50pt',
  color: 'var(--azul_escuro)'
}

const h2 = {
  fontFamily: 'Contrail One, sans-serif',
  color: 'white'
}

const h3 ={
  fontSize: '20pt',
  lineHeight: '20pt',
  width: '350px',
  color: 'var(--vermelho_claro)',
  marginTop: '50px'
}

const text_container = {
  textAlign: 'right',
  height: '100px',
  width: '20%',
}

export default function Footer(){
  return(
    <div style={footer_bg}>
      <div style={text_container}>
        <h1 style={h1}>football</h1>  
        <h2 style={h2}>CHAMPIONS LEAGUE</h2>
      </div>    
      <div style={{textAlign:"center"}}>
        <h3 style={h3}>DESIGNED BY MATHEUS MEIER SCHREIBER</h3>    
        <a href="https://github.com/matheusschreiber/sport_bet">
          <p style={{cursor:'pointer', marginTop:"50px", color:'white', lineHeight:"100px"}}>GITHUB REPOSITORY</p>
        </a>
      </div>
    </div>
  );
}