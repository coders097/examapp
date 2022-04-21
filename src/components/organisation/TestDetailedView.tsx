import React, { createRef, useContext, useEffect, useState } from 'react';
import Back from '../../assets/back.png';
import QuestionAdder from './Question-Adder';
import H2Wrapper from './H2Wrapper';
import { BATCHTESTCONTEXT, TestState } from '../../contexts/batchTestContext';
import { DIALOGCONTEXT } from '../../contexts/dialogContext';

import testUtils from '../../utils/test';
import testDepResUtils from '../../utils/testDepRes';
import { AUTHCONTEXT } from '../../contexts/authContext';
import { NOTIFICATIONCONTEXT } from '../../contexts/notificationContext';

const TestDetailedView = ({data,setViewLayout}:{
    data:TestState,
    setViewLayout:React.Dispatch<React.SetStateAction<{
        view: number;
        data: TestState | null;
    }>>
}) => {

    let batchTestContext=useContext(BATCHTESTCONTEXT);
    let dialogBoxContext=useContext(DIALOGCONTEXT);
    let authContext=useContext(AUTHCONTEXT);
    let notificationsContext=useContext(NOTIFICATIONCONTEXT);

    let startTime = createRef<HTMLInputElement>();
    let endTime = createRef<HTMLInputElement>();
    let markPerQuestion = createRef<HTMLInputElement>();
    let noOfQuestions = createRef<HTMLInputElement>();
    let randomiseQuestion = createRef<HTMLInputElement>();
    let testTimeInMin = createRef<HTMLInputElement>();
    let batchesSelector = createRef<HTMLSelectElement>();

    let [editMode,setEditMode]=useState<{
        status: boolean;
        data: any;
        type: "MCQ" | "PROG"
    }>({
        status:false,
        data:null,
        type:'MCQ'
    });

    useEffect(()=>{
        if(dialogBoxContext?.dialogState.view && dialogBoxContext?.dialogState.parent==="RENAMETEST"){
            if(dialogBoxContext.dialogState.getResult)
            dialogBoxContext.dialogState.getResult().then((result:any)=>{
                if(result.status){
                    //result.text
                    testUtils.editPreferences({
                        authContext: authContext,
                        command:"RENAME",
                        notificationsContext:notificationsContext,
                        setViewLayout:setViewLayout,
                        testsDispatcher:batchTestContext?.testsDispatcher,
                        testsState:batchTestContext?.testsState,
                        testName:result.text,
                        viewData:data
                    });
                }
            }).catch((error)=>{
                console.log(error);
            });
        }
    },[dialogBoxContext]);
    
    let editPreferences=(command: string)=>{
        if(command==="RENAMETEST"){
            dialogBoxContext?.setDialogDispatch({
                type:"RUN",
                payload:{
                    getResult:dialogBoxContext.dialogState.getResult,
                    placeholder:"Enter the new test name...",
                    question:"Do you confirm this change?",
                    view:true,
                    parent:"RENAMETEST"
                }
            });
        }else if(command==="EDIT_PREFERENCES"){
            let editMainObj:{[key:string]:any}={};
            let optionsSelectedIds:string[] = [];
            let options = batchesSelector.current?.options;
            if(options) Array.from(options).forEach(option => {
                if(option.selected) optionsSelectedIds.push(option.value);
            })
            editMainObj.batches = optionsSelectedIds;
            editMainObj.startTime=startTime.current?.value;
            editMainObj.endTime=endTime.current?.value;
            editMainObj.markPerQuestion=markPerQuestion.current?.value;
            editMainObj.randomiseQuestion=randomiseQuestion.current?.checked;
            editMainObj.noOfQuestions=noOfQuestions.current?.value;
            editMainObj.testTimeInMin=testTimeInMin.current?.value;
            if(editMainObj.testTimeInMin<15 || editMainObj.testTimeInMin>360) {
                alert("Enter time between 15 and 360");
                return;
            }

            testUtils.editPreferences({
                authContext: authContext,
                command:"EDIT_PREFERENCES",
                notificationsContext:notificationsContext,
                setViewLayout:setViewLayout,
                testsDispatcher:batchTestContext?.testsDispatcher,
                testsState:batchTestContext?.testsState,
                testName:undefined,
                viewData:data,
                editMainObj:editMainObj
            });
        }
    }


    return (
        <>
        <div className="Test-View">
            <div className="main-view">
                <div className="head">
                    <img src={Back} alt="back" onClick={() =>setViewLayout({
                        view:0,
                        data:null
                    })}/>
                    <h1>{data.name}</h1>
                    <button className="btn btn-blue" onClick={() =>editPreferences("RENAMETEST")}><span>RENAME</span></button>
                    <button className="btn btn-red" ><span>DELETE</span></button>
                </div>
                <H2Wrapper name="Add Question" defaultShow={false}>
                    <QuestionAdder type="mcq" data={data} setViewLayout={setViewLayout} editMode={editMode} setEditMode={setEditMode}/>
                </H2Wrapper>
                <H2Wrapper name="Add Programming Question" defaultShow={false}>
                    <QuestionAdder type="prog" data={data} setViewLayout={setViewLayout} editMode={editMode} setEditMode={setEditMode}/>
                </H2Wrapper>
                <H2Wrapper name="All Programming Questions" defaultShow={false}>
                    {data.progQuestions.map(question =>{
                        return <div className="_prog_question" key={question._id}>
                            <h3>{question.question.title}</h3>
                            <p>{question.question.description}</p>
                            {question.question.examples.map(example =>{
                                return <div className="example" key={Math.floor(Math.random()*9000000+20)}>
                                    <div className="example-input">{example.input.split("\n").map(line =>{
                                        return <React.Fragment key={Math.floor(Math.random()*9000000+20)}>{line} <br/></React.Fragment>
                                    })}</div>
                                    <div className="example-output">{example.output.split("\n").map(line =>{
                                        return <React.Fragment key={Math.floor(Math.random()*9000000+20)}>{line} <br/></React.Fragment>
                                    })}</div>
                                </div>;
                            })}
                            <button className="btn btn-black" onClick={()=>setEditMode({
                                data:question,
                                status:true,
                                type:'PROG'
                            })}><span>Edit</span></button>
                        </div>;
                    })}
                </H2Wrapper>
                <H2Wrapper name="All Questions" defaultShow={true}>
                    {data.mcqQuestions.map(question =>{
                        return <div className="_question" key={question.id}>
                            <h3>{question.question}</h3>
                            {question.options.map((option,ind) =>{
                                return <p key={ind}>{option} {(option.trim()===question.answer) && <i className="fa fa-check" aria-hidden="true"></i>}</p>;
                            })}
                            <button className="btn btn-black" onClick={()=>setEditMode({
                                data:question,
                                status:true,
                                type:'MCQ'
                            })}><span>Edit</span></button>
                        </div>;
                    })}
                </H2Wrapper>
            </div> 
            <div className="aside-view">
                <h3 className={data.conductor.status?"test-deployed":"test-notdeployed"}>{data.conductor.status?"LAUNCHED":"NOT DEPLOYED"}</h3>
                <div className="element">
                    <p>Starting &amp; Ending Dates</p>
                    <input type="datetime-local" placeholder="Starting Time" ref={startTime} defaultValue={data.conductor.startDateTime}/>
                    <input type="datetime-local" placeholder="Ending Time" ref={endTime} defaultValue={data.conductor.endDateTime}/>
                </div>
                <div className="element">
                    <p>Batches</p>
                    <select multiple={true} ref={batchesSelector}>
                        {batchTestContext?.batchesState.map((batch)=>{
                            return <option key={batch._id} value={batch._id} selected={data.batches.includes(batch._id)?true:false}>{batch.name}</option>;
                        })}
                    </select>
                </div>
                <div className="element">
                    <input type="number" placeholder="Mark(s) per question" ref={markPerQuestion} defaultValue={data.conductor.markPerQuestion}/>
                    <input type="number" placeholder="No of questions" ref={noOfQuestions} defaultValue={data.conductor.noOfQuestions}/>
                    <input type="number" placeholder="Enter test time(min)" min={15} max={360} ref={testTimeInMin} defaultValue={data.conductor.testTimeInMin}/>
                    <div className="box">
                        <input type="checkbox" ref={randomiseQuestion} defaultChecked={data.conductor.randomiseQuestion}/>
                        <p>Randomize Questions</p>
                    </div>
                </div>
                <div className="control">
                    <button className="btn btn-black" onClick={() =>editPreferences("EDIT_PREFERENCES")}><span>SAVE</span></button>
                    {data.conductor.status && <button className="btn btn-blue" onClick={()=>{
                        testDepResUtils.downloadPasskeys({
                            testId:data._id,
                            authContext: authContext,
                            notificationsContext:notificationsContext
                        });
                    }}><span>PASSKEYS</span></button>}
                    <button className='btn btn-blue' onClick={(e) =>{
                        (e.target as HTMLButtonElement).classList.add("btn-loading");
                        testDepResUtils.getResults({
                            testId:data._id,
                            button:e.target as HTMLButtonElement,
                            authContext: authContext,
                            notificationsContext:notificationsContext
                        });
                    }}><span>RESULTS</span></button>
                    <button className="btn btn-green" onClick={()=>{
                        testDepResUtils.deployTest({
                            testId:data._id,
                            authContext: authContext,
                            notificationsContext:notificationsContext,
                            setViewLayout:setViewLayout,
                            viewData:data
                        });
                    }}><span>{data.conductor.status?"STOP TEST":"DEPLOY"}</span></button>
                </div>
            </div>
        </div>
        </>
    );
};

export default TestDetailedView;