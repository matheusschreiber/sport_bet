import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import StartPage from  "./pages/StartPage";
import GroupFasePage from './pages/GroupFasePage';
import FinalFasePage from './pages/FinalFasePage';
import Historypage from './pages/HistoryPage'

export default function RouterComponent(){
  return(
    <BrowserRouter>
      <Routes>
        <Route path="/" exact element={<StartPage/>}/>
        <Route path="/groups" exact element={<GroupFasePage/>}/>
        <Route path="/finals" exact element={<FinalFasePage/>}/>
        <Route path="/history" exact element={<Historypage/>}/>
      </Routes>
    </BrowserRouter>
  );
}
