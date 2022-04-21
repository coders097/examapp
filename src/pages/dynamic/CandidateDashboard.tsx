import React, { createRef, useContext, useEffect , useState} from 'react';
import '../../styles/candidate/CandidateDashboard.scss';
import TestLogo from '../../assets/test.png';
import CodeLogo from '../../assets/codelogo.png';
import OrgLogo from '../../assets/nanotech.png';

import {AUTHCONTEXT} from '../../contexts/authContext';
import { useLocation, useNavigate } from 'react-router-dom';

import candiUtils from '../../utils/candidate';
import MCQPage from './MCQPage';
import CodingPage from './CodingPage';
let domain ="http://localhost:3002";

const CandidateDashboard = () => {

    let authContext=useContext(AUTHCONTEXT);
    let navigate=useNavigate();
    let location=useLocation();
    let leaveExanBtn=createRef<HTMLButtonElement>();

    useEffect(()=>{
        if(!authContext?.authState.login){
            navigate("/candidate/login");
        }
    },[authContext]);

    let [results,setResults]=useState<{
        prog:{_id:string,code:string}[],
        mcq:{id:string,answer:string}[]
    }>({
        prog:[],
        mcq:[]
    });

    let leaveExam=(button:HTMLButtonElement)=>{
        candiUtils.submitAnswers({
            answerSheet:results,
            authContext:authContext,
            button:button,
            name:authContext?.authState.candiData.name,
            passkey:authContext?.authState.candiData.key,
            regdNo:authContext?.authState.candiData.regd,
            testId:authContext?.authState.candiData.testId
        });
        localStorage.clear();
    }

    let [questionSet,setQuestionSet]=useState<{
        programmingQuestions:{
            question:{ 
                title:string,
                description:string,
                examples:{
                    input:string,
                    output:string
                }[]
            },
            testCasesFile:string,
            outputsFile:string,
            _id:string
        }[],
        mcqQuestions:{
            question:string,
            options:string[],
            answer:string,
            id:string, 
        }[],
        testTimeInMin:number
    }>({
        programmingQuestions:[],
        mcqQuestions:[],
        testTimeInMin:0
    });
    let [organisationInfo,setOrganisationInfo]=useState<{
        name:string,
        pic:string,
        _id:string,
        testName:string,
    }>({
        name:"",
        pic:"",
        _id:"",
        testName:""
    });

    useEffect(()=>{
        let {_id,testName}=location.state as {_id:string,testName:string};
        candiUtils.getOrgaNamePic(setOrganisationInfo,testName,_id);
        if(authContext?.authState.candiData.testId)
        candiUtils.getQuestionSet(setQuestionSet,authContext.authState.candiData.testId);
    },[location]);

    let [currView,setCurrView]=useState(0);

    
    let [timeInSeconds,setTimeInSeconds]=useState(10000);
    let getTimeString=()=>{
        let hour=Math.floor((timeInSeconds/3600));
        let min=Math.floor(timeInSeconds%3600/60);
        let sec=Math.floor(timeInSeconds%3600%60);
        return `${hour}:${min}:${sec}`;
    }
    useEffect(()=>{
        let id:NodeJS.Timer | null=null;
        if(questionSet){
            let timeInSeconds =questionSet.testTimeInMin*60;
            if(localStorage.getItem("currTimeSec")!=null){
                timeInSeconds = parseInt(localStorage.getItem("currTimeSec") as string);
            }
            setTimeInSeconds(timeInSeconds);
            id=setInterval(()=>{
                if(timeInSeconds<=0){
                    clearInterval(id as NodeJS.Timer);
                    leaveExam(leaveExanBtn.current!);
                    return;
                }
                timeInSeconds--;
                
                if(timeInSeconds%7==0){
                    localStorage.setItem("currTimeSec",timeInSeconds+"");
                }
                setTimeInSeconds(timeInSeconds);
            },1000);
        }
        return ()=>{
            clearInterval(id as NodeJS.Timer);
        };
    },[questionSet]);

    return (
        <>
        {(currView==0) && <section className="Candidate-Dashboard">
            <div className="main">
                <h1>{organisationInfo.testName}</h1>
                <h2><img src={organisationInfo.pic==""?OrgLogo:`${domain}/auth/organisation/getPic?${new URLSearchParams({pic:organisationInfo.pic}).toString()}`} 
                    alt="orglogo"/> {organisationInfo.name}</h2>
                {(questionSet.mcqQuestions.length>0 && questionSet.programmingQuestions.length>0) && <h3>Choose any of the following.</h3>} 
                {(questionSet.mcqQuestions.length>0) && <div className="question-card">
                    <img src={TestLogo} alt="mcq" />
                    <div className="details">
                        <h2>Multiple Choice Questions</h2>
                        <p>This section contains {questionSet.mcqQuestions.length} questions.</p>
                        <button className="btn btn-blue" onClick={()=>setCurrView(1)}><span>Start</span></button>
                    </div>
                </div>}
                {(questionSet.programmingQuestions.length>0) && <div className="question-card">
                    <img src={CodeLogo} alt="prog" />
                    <div className="details">
                        <h2>Programming Questions</h2>
                        <p>This section contains {questionSet.programmingQuestions.length} questions.</p>
                        <button className="btn btn-blue" onClick={()=>setCurrView(2)}><span>Start</span></button>
                    </div>
                </div>}
            </div>
            <div className="aside">
                <video controls={true}/>
                <h2>{authContext?.authState.candiData.name}</h2>
                <p>id : <span>{authContext?.authState.candiData.regd}</span></p>
                <h3>{getTimeString()} <span>Time remaining</span></h3>
                <h2 style={{color:"red"}}>Instructions **</h2>
                <ul className="instructions">
                    <li>This test contains a MCQ Section and a programming section.</li>
                    <li>Check on any one to attempt first.</li>
                    <li>Once attended it's final you have to complete that section first.</li>
                    <li>At any point of time, you can leave exam.</li>
                    <li>Your answers will be automatically saved.</li>
                </ul>
                <button className="btn btn-red" ref={leaveExanBtn} onClick={(e) =>{
                    (e.target as HTMLButtonElement).classList.add("btn-loading");
                    leaveExam(e.target as HTMLButtonElement);
                    localStorage.clear();
                }}><span>Leave Exam</span></button>
            </div>

        </section>}

        {(currView==1) && <MCQPage results={results} setResults={setResults} data={questionSet.mcqQuestions} setCurrView={setCurrView}/>}
        {(currView==2) && <CodingPage results={results} setResults={setResults} data={questionSet.programmingQuestions} setCurrView={setCurrView}/>}
        </>
    );
};

export default CandidateDashboard;