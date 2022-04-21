import React, { createRef, useContext } from 'react';
import '../../styles/organisation/About-org.scss';
import Logo from '../../assets/logo.png';
import { NOTIFICATIONCONTEXT } from '../../contexts/notificationContext';

import authUtils from '../../utils/auth';
import { AUTHCONTEXT } from '../../contexts/authContext';

const About = () => {

    let notificationsContext=useContext(NOTIFICATIONCONTEXT);
    let feedbackInput=createRef<HTMLTextAreaElement>();
    let feedbackPics=createRef<HTMLInputElement>();
    let authContext=useContext(AUTHCONTEXT);

    return (
        <div className="About-org">
            <img src={Logo} alt="logo"/>
            <p>Treno is an exam conductor application founded in 2022. It provides a backend for organisations prepare both mcq and programming questions. It also provides a frontend for candidates to give a nice exam. Organisations can monitor students through webcames in their test durations.</p>
            
            <textarea ref={feedbackInput} placeholder="For any complaints/feedbacks feel free to write and/or upload screenshots..." rows={7} />
            <div className="feedback-submit">
                <input type="file" multiple={true} ref={feedbackPics}/>
                <button className="btn btn-blue" onClick={()=>{
                    function cb(message: string){
                        notificationsContext?.notificationState.notifications.push(message);
                        notificationsContext?.notificationDispatch({
                            type:"OPEN_CLOSE_NOTIFICATION_VIEW",
                            payload:{
                                active:true,
                                notifications:notificationsContext.notificationState.notifications
                            }

                        });
                    }
                    function success(){
                        if(feedbackInput.current) feedbackInput.current.value ="";
                        if(feedbackPics.current) feedbackPics.current.value="";
                        cb("Your feedback was successfull!");
                    }
                    function failure(){
                        cb("Sorry, feedback not sent!");
                    }
                    if(authContext?.authState)
                        authUtils.feedback(
                            authContext.authState,
                            authContext.authDispatch,
                            feedbackInput.current?.value,
                            feedbackPics.current?.files,
                            success,
                            failure
                        );
                }}><span>SEND</span></button>
            </div>
        </div>
    );
};

export default About;