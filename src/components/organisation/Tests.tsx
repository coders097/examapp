import React, { createRef, useContext, useEffect, useState } from 'react';
import { AUTHCONTEXT } from '../../contexts/authContext';
import { BATCHTESTCONTEXT, BatchTestState, TestState } from '../../contexts/batchTestContext';
import { NOTIFICATIONCONTEXT } from '../../contexts/notificationContext';
import '../../styles/organisation/Tests-org.scss';
import H2Wrapper from './H2Wrapper';
import TestDetailedView from './TestDetailedView';

import testUtil from '../../utils/test'; 

const Tests = ({messageQueue,setMessageQueue}:{messageQueue:{
    type: string;
    data: any;
}[],setMessageQueue:React.Dispatch<React.SetStateAction<{
    type: string;
    data: any;
}[]>>}) => {

    let [viewLayout,setViewLayout]=useState<{
        view:number,
        data:TestState | null 
    }>({
        view:0,
        data:null
    });

    let authContext=useContext(AUTHCONTEXT);
    let batchTestContext=useContext(BATCHTESTCONTEXT);
    let notificationsContext=useContext(NOTIFICATIONCONTEXT);

    let [searchResults,setSearchResults]=useState<BatchTestState[]>([]);
    let testNameField=createRef<HTMLInputElement>();
    let searchInputRef=createRef<HTMLInputElement>();

    let searchResultsFunc=()=>{
        if(searchInputRef.current && batchTestContext){
            let key=searchInputRef.current.value;
            if(key.trim()===''){
                setSearchResults([]);
                return;
            }
            let results=batchTestContext.testsState.filter(test=>{
                return test.name.toLowerCase().includes(key);
            });
            setSearchResults(results);
        }
    }

    let viewTest=(_id:string) =>{
        testUtil.openTest({
            _id:_id,
            notificationsContext:notificationsContext,
            authContext: authContext,
            setViewLayout:setViewLayout,
        });
    }

    useEffect(()=>{
        let message=messageQueue.filter(message=>{
            return message.type=="VIEWTEST";
        });
        if(message.length>0){
            viewTest(message[0].data);
            messageQueue=messageQueue.filter(message=>{
                return message.type!="VIEWTEST";
            });
            setMessageQueue(messageQueue);
        }
    },[messageQueue]);

    return (
        <>
        {(viewLayout.view===0) && <div className="Tests-org">
            <div className="search">
                <input type="text" placeholder="Search for Tests..." ref={searchInputRef}/>
                <button className="btn btn-black" onClick={()=>searchResultsFunc()}><span><i className="fa fa-search" aria-hidden="true"></i></span></button>
            </div>
            {(searchResults.length>0) && <H2Wrapper name="Search Results" defaultShow={true}>
                <div className="all-tests">
                    {searchResults.map(test=>{
                        return <div className="test" key={test._id}>
                            <h3>{test.name}</h3>
                            <span onClick={()=>viewTest(test._id)}>view</span>
                        </div>;
                    })}
                </div>
            </H2Wrapper>}
            <div className="add-test">
                <input placeholder="Enter new test name" type="text" ref={testNameField}/>
                <button className="btn btn-blue" onClick={()=>{
                    if(testNameField.current){
                        let name=testNameField.current.value;
                        testUtil.createTest({
                            testName:name,
                            authContext:authContext,
                            notificationsContext,
                            testsDispatcher:batchTestContext?.testsDispatcher,
                            testsState:batchTestContext?.testsState
                        });
                        testNameField.current.value ="";
                    }
                }}><span>ADD TEST</span></button>
            </div>
            <H2Wrapper name='All Tests'
                        defaultShow={true}>
                <div className="all-tests">
                    {batchTestContext?.testsState && batchTestContext.testsState.map((test) =>{
                        return <div className="test" key={test._id}>
                            <h3>{test.name}</h3>
                            <span onClick={()=>viewTest(test._id)}>view</span>
                        </div>;
                    })}
                </div>
            </H2Wrapper>
        </div>}

        {(viewLayout.view===1) && <TestDetailedView data={viewLayout.data!} setViewLayout={setViewLayout}/>}
        </>
    );
};

export default Tests;