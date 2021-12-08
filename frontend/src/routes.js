import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import StartPage from  "./pages/StartPage";

export default function RouterComponent(){
  return(
    <BrowserRouter>
      <Routes>
        <Route path="/" exact element={<StartPage/>}/>
      </Routes>
    </BrowserRouter>
  );
}