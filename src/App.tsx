import React from 'react';
import { Routes , Route } from 'react-router-dom';
import CandidateDashboard from './pages/dynamic/CandidateDashboard';
import OrgaDashboard from './pages/dynamic/OrgaDashboard';
import CandidateAuth from './pages/static/CandidateAuth';
import OrganisationAuth from './pages/static/OrganisationAuth';
import PNF from './pages/static/PNF';

import AUTHCONTEXT from './contexts/authContext';
import NOTIFICATIONCONTEXT from './contexts/notificationContext';
import DIALOGCONTEXT from './contexts/dialogContext';
import DialogBox from './components/DialogBox';
import BATCHTESTCONTEXT from './contexts/batchTestContext';

const App = () => {
  
  return (
    <AUTHCONTEXT>
      <DIALOGCONTEXT>
        <Routes>
            <Route path="/" element={<OrganisationAuth/>}/>
            <Route path="/candidate/login" element={<CandidateAuth/>} />
            <Route path="/candidate" element={<CandidateDashboard/>} />
            <Route path="/organisation" element={
                <BATCHTESTCONTEXT>
                  <NOTIFICATIONCONTEXT>
                    <OrgaDashboard/>
                  </NOTIFICATIONCONTEXT>
                </BATCHTESTCONTEXT>
            }/>
            <Route path="*" element={<PNF/>}/>
        </Routes>
        <DialogBox/>
      </DIALOGCONTEXT>
    </AUTHCONTEXT>
  ); 
};

export default App;