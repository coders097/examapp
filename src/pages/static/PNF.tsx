import React, { useContext } from 'react';
import '../../styles/PNF.scss';
import { useNavigate } from 'react-router-dom';

import {AUTHCONTEXT} from '../../contexts/authContext';

const PNF = () => {
    
    let authContext=useContext(AUTHCONTEXT);
    let navigate=useNavigate();
    
    return (
        <section className="PNF">
            <div>
                <h2>
                    Are you an organization?
                </h2>
                <button className="btn btn-pale" onClick={()=>{
                    if(authContext?.authState.login) navigate("/organisation");
                    else navigate("/");
                }}><span>Back to Organisation</span></button>
            </div>
            <div>
                <h2>
                    Are you a candidate?
                </h2>
                <button className="btn btn-blue" onClick={()=>{
                    if(authContext?.authState.login) navigate("/candidate");
                    else navigate("/candidate/login");
                }}><span>Back to Candidate</span></button>
            </div>
        </section>
    );
};

export default PNF;