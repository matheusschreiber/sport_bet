import React, { useEffect, useState } from "react";
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';

import { Spinner } from "react-activity";
import "react-activity/dist/Spinner.css";

import api from '../../services/api'



export default function DBlog(){
  const [ status, setStatus ] = useState('OFF');
  const [ loading, setLoading ] = useState(true);
  
  const style = {
    margin: '10px 10px',
    color:'var(--vermelho_claro)',
    width: loading?'200px':'160px',
    fontSize: '8pt',
    display:'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'absolute',
    right: "10px",
    top: "350px",
    cursor: 'pointer'
  }

  async function check(){
    setLoading(true);
    setStatus('OFF');
    
    setTimeout(async()=>{
      try{
        await api.get('connectionTest2');
        const res = await api.put('connectionTest1', {payload:10});
        if (res.data===10*1000) setStatus('ON');
        else setStatus('OFF');
      } catch (err) {
        setStatus('OFF');
      }      
      setLoading(false);
    }, 1000);
  }

  useEffect(()=>{
    check();
  }, []);

  return(
    <div style={style} onClick={check}>
      <Spinner style={loading?{}:{display:'none'}} />
      <FiXCircle size={25} color={"var(--vermelho_claro_plus)"} style={status!=="ON"?{}:{display:'none'}}/>
      <FiCheckCircle size={25} color={"var(--verde)"} style={status!=="ON"?{display:'none'}:{}}/>
      <div style={{width: "120px"}}>
        <h2>BACKEND STABLE CONNECTION <span style={status==="ON"?{color:"var(--verde)"}:{}}>{status}</span></h2>
      </div>
    </div>
  )
}