import React, { useState,useContext, useEffect } from 'react';
import About from '../../components/organisation/About';
import Batches from '../../components/organisation/Batches';
import HomeOrg from '../../components/organisation/Home-Org';
import Settings from '../../components/organisation/Settings';
import Tests from '../../components/organisation/Tests';
import '../../styles/organisation/OrgaDashboard.scss';

import {AUTHCONTEXT, AUTHSTATE} from '../../contexts/authContext';
import { useNavigate } from 'react-router-dom';

import authUtils from '../../utils/auth';
import orgaUtils from '../../utils/organisation';

import { NOTIFICATIONCONTEXT } from '../../contexts/notificationContext';
import { BATCHTESTCONTEXT } from '../../contexts/batchTestContext';

const OrgaDashboard = () => {
    
    let authContext=useContext(AUTHCONTEXT);
    let notificationsContext=useContext(NOTIFICATIONCONTEXT);
    let batchTestContext=useContext(BATCHTESTCONTEXT);

    let navigate=useNavigate();
    useEffect(()=>{
        if(!authContext?.authState.login){
            navigate("/");
        }else{
            if(authContext?.authState.loginType==='candidate')
                navigate("/");
            else orgaUtils.getTestBatchInfo({
                authDispatch:authContext.authDispatch,
                authState:authContext.authState,
                batchesDispatcher:batchTestContext?.batchesDispatcher,
                testsDispatcher:batchTestContext?.testsDispatcher,
                notificationsContext
            });
        }
    },[authContext]);

    let [pageNo,setPageNo] = useState(0);

    return (
        <section className="OrgaDashboard">
            <div className="Orga-nav">
                <h1>Welcome <span>{authContext?.authState.orgData.name}</span></h1>
                <p onClick={()=>{
                    notificationsContext?.notificationDispatch({
                        type:"OPEN_CLOSE_NOTIFICATION_VIEW",
                        payload:{
                            active:!notificationsContext.notificationState.active,
                            notifications:notificationsContext.notificationState.notifications
                        }
                    });
                }}><i className="fa fa-bell" aria-hidden="true"></i></p>
                <button className="btn btn-red" onClick={()=>{
                    authUtils.logoutOrganisation(authContext?.authDispatch);
                }}><span>Logout</span></button>
                {notificationsContext?.notificationState.active && <div className="notifications open-up-anim">
                    {(notificationsContext.notificationState.notifications.length===0) && <p className="no-notification">No Notifications!</p>}
                    {notificationsContext.notificationState.notifications.map((notification,ind)=><p key={ind}>{notification}</p>)}
                </div>}
            </div>
            <div className="Orga-aside">
                <p className={(pageNo===0)?"active":""} onClick={()=>setPageNo(0)}><i className="fa fa-home" aria-hidden="true"></i> Home</p>
                <p className={(pageNo===1)?"active":""} onClick={()=>setPageNo(1)}><i className="fa fa-file" aria-hidden="true"></i> Tests</p>
                <p className={(pageNo===2)?"active":""} onClick={()=>setPageNo(2)}><i className="fa fa-database" aria-hidden="true"></i> Batches</p>
                <p className={(pageNo===3)?"active":""} style={{marginTop:"auto"}}  onClick={()=>setPageNo(3)}><i className="fa fa-cog" aria-hidden="true"></i> Settings</p>
                <p className={(pageNo===4)?"active":""} onClick={()=>setPageNo(4)}><i className="fa fa-life-ring" aria-hidden="true"></i> About</p>
            </div>
            <div className="Orga-main">
                {(pageNo===0) && <HomeOrg/>}
                {(pageNo===1) && <Tests/>}
                {(pageNo===2) && <Batches/>}
                {(pageNo===3) && <Settings/>}
                {(pageNo===4) && <About/>}
            </div>
        </section>
    );
};

export default OrgaDashboard;