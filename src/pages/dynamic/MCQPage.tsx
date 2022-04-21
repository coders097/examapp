import React, { createRef, useContext, useEffect, useState } from 'react';
import '../../styles/candidate/SolutionSheet.scss';
import Back from '../../assets/back.png';
import { AUTHCONTEXT } from '../../contexts/authContext';

const MCQPage = ({data,setCurrView,setResults,results}:{
    data:{
        question:string,
        options:string[],
        answer:string,
        id:string, 
    }[],
    setCurrView:React.Dispatch<React.SetStateAction<number>>,
    setResults:React.Dispatch<React.SetStateAction<{
        prog: {
            _id: string;
            code: string;
        }[];
        mcq: {
            id: string;
            answer: string;
        }[];
    }>>,
    results:{
        prog: {
            _id: string;
            code: string;
        }[];
        mcq: {
            id: string;
            answer: string;
        }[];
    }
}) => {

    let authContext=useContext(AUTHCONTEXT);
    let questionSetsCounterDisplayRef=createRef<HTMLDivElement>();
    let answerSheetRef=createRef<HTMLDivElement>();

    let [mcqState,setMCQState]=useState<{
        question:string,
        options:string[],
        answer:string,
        id:string
    }[]>([]);

    useEffect(()=>{
        // :{id:string,answer:string}[]
        let mcqData:any=localStorage.getItem('mcqData'); 
        let testId=localStorage.getItem("testId");
        let passKey=localStorage.getItem("passKey");
        if(mcqData && (testId==authContext?.authState.candiData.testId) && (passKey==authContext?.authState.candiData.key)) 
            mcqData=JSON.parse(mcqData);
        else mcqData=[];
        let map=new Map<string,string>();
        mcqData.forEach((_mcq:any)=>{
            map.set(_mcq.id,_mcq.answer);
        });
        setMCQState(data.map(e=>{
            e.answer=map.has(e.id)?map.get(e.id) as string:"";
            return e;
        }));
    },[data]);

    let saveProgress=()=>{
        let mcq:{id:string,answer:string}[]=[];
        if(answerSheetRef.current){
            let children=answerSheetRef.current.children;
            for(let i=0; i<children.length; i++){
                let child=children[i];
                let partMcq={id:child.id, answer:""};
                let options=child.children[1].children;
                for(let j=0; j<options.length; j++){
                    let option=options[j];
                    if((option.children[0] as HTMLInputElement).checked){
                        partMcq.answer=option.children[1].innerHTML;
                        break;
                    }
                }
                mcq.push(partMcq);
            }
        }
        //save in localStorage
        if(authContext && authContext.authState.candiData.testId)
            localStorage.setItem("testId",authContext.authState.candiData.testId);
        localStorage.setItem("mcqData",JSON.stringify(mcq));
        if(authContext?.authState.candiData.key)
            localStorage.setItem("passKey",authContext.authState.candiData.key);
        /////
    }

    let saveResults=()=>{
        if(answerSheetRef.current){
            let mcq:{id:string,answer:string}[]=[];
            let children=answerSheetRef.current.children;
            for(let i=0; i<children.length; i++){
                let child=children[i];
                let partMcq={id:child.id, answer:""};
                let options=child.children[1].children;
                for(let j=0; j<options.length; j++){
                    let option=options[j];
                    if((option.children[0] as HTMLInputElement).checked){
                        partMcq.answer=option.children[1].innerHTML;
                        break;
                    }
                }
                mcq.push(partMcq);
            }
            setResults({
                mcq:mcq,
                prog:results.prog
            });
            alert("Saved!");
        }
    }

    let selectDeselectCounter=(index:number,check:boolean)=>{
        if(questionSetsCounterDisplayRef.current){
            let children=questionSetsCounterDisplayRef.current.children;
            if(check) children[index].classList.add("attempted");
            else children[index].classList.remove("attempted");
        }
    }

    return (
        <section className="Solution-page-layout">
            <div className="Solution-nav">
                <img alt="back" src={Back} onClick={()=>{
                    saveProgress();
                    setCurrView(0);
                }}/>
                <h1>MCQs</h1>
                <video src="" controls={true}/>
                <div className="details">
                    <h3>{authContext?.authState.candiData.name}</h3>
                    <p>ID : <span>{authContext?.authState.candiData.regd}</span></p>
                    <h2>9:51</h2>
                </div> 
            </div>
            <div className="Solution-aside">
                <div className="question-menu">
                    <div className="question-sets" ref={questionSetsCounterDisplayRef}>
                        {mcqState.map((_,i)=>{
                            return <div key={i} className={mcqState[i].answer.length>0?"attempted":""}>{i+1}</div>;
                        })}
                    </div>
                    <button onClick={()=>saveResults()} className="btn btn-pale" style={{marginTop:"auto"}}><span>Submit</span></button>
                </div>
            </div>
            <div className="Solution-content">
                <div className="answer-sheet" ref={answerSheetRef}>
                    {mcqState.map((mcq,i)=><div className="answer-box" id={mcq.id} key={i} onClick={(e)=>{
                        if((e.target as HTMLElement).className=="answer-button-ball")
                            selectDeselectCounter(i,true);
                    }}>
                        <h3>{i+1}. {mcq.question}</h3>
                        <div className="answer-options">
                            {mcq.options.map((option,j)=>{
                                return <div className="answer-option" key={j}>
                                    <input name={"name-"+i} className="answer-button-ball" type="radio" defaultChecked={mcq.answer==option?true:false} value="Barack Obama"/>
                                    <label htmlFor="random">{option}</label>
                                </div>;
                            })}
                        </div>
                        <p onClick={(e)=>{
                            e.stopPropagation();
                            let options=(e.target as HTMLElement).parentElement?.children[1].children;
                            if(options){
                                for(let j=0;j<options.length;j++){
                                    let option = options[j];
                                    (option.children[0] as HTMLInputElement).checked=false;
                                }
                            }
                            selectDeselectCounter(i,false);
                        }}>Reset Answer</p>
                    </div>)}
                </div>
            </div>
        </section>
    );
};

export default MCQPage;