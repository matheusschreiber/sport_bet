import React, { useState } from "react";
import { FiChevronUp, FiChevronDown, FiMinus } from 'react-icons/fi'
import './style.css'

import Header from "../Components/header";
import Footer from "../Components/footer";


export default function GroupFasePage(){
  const [ groups, setGroups ] = useState(['A','B','C','D','E','F','G','H']);


  return(
    <div>
      <Header />
      <div className="groups_container">
        <div className="title_container">
          <h1>CLASSIFICATIONS</h1>  
          <h2>SEASON 2020-2021</h2>
        </div>
        <div className="HIGHLIGHT"><h1>GROUP FASE</h1></div>
        
        <div className="groups_grid">
          <ul className="grid">
            {
              groups.map((i)=>(
                <li>
                  <div className="group_external_container">
                    <div className="group_container_bg2">
                      <div className="group_container_bg1">
                        <div className="group_highlight"><h2>GROUP {i}</h2></div>
                        <div className="group_container">
                          <ul>
                            <li>MANCHESTER CITY</li>
                            <li>PARIS SAINT GERMAIN</li>
                            <li>LEIPZIG</li>
                            <li>CLUB BRUGGE</li>
                          </ul>

                          <ul>
                            <li>12</li>
                            <li>8</li>
                            <li>8</li>
                            <li>4</li>
                          </ul>

                          <ul>
                            <li><FiChevronUp size={20} color="var(--verde)"/></li>
                            <li><FiChevronDown size={20} color="var(--vermelho_claro_plus)"/></li>
                            <li><FiChevronUp size={20} color="var(--verde)"/></li>
                            <li><FiMinus size={20} color="var(--cinza)"/></li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))
            }
          </ul>
        </div>

        <div className="button">SIMULATE ENTIRE GROUP FASE</div>
      </div>
      <Footer />
    </div>
  );
}