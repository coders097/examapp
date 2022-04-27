import React, { useState,createRef, useContext, useEffect } from 'react';
import '../../styles/organisation/Batches-org.scss';
import Back from '../../assets/back.png';

import batchUtils from '../../utils/batch';
import H2Wrapper from './H2Wrapper';
import { AUTHCONTEXT } from '../../contexts/authContext';
import { BATCHTESTCONTEXT, BatchTestState } from '../../contexts/batchTestContext';
import { NOTIFICATIONCONTEXT } from '../../contexts/notificationContext';
import { DIALOGCONTEXT } from '../../contexts/dialogContext';

const Batches = () => {


    let authContext=useContext(AUTHCONTEXT);
    let batchTestContext=useContext(BATCHTESTCONTEXT);
    let notificationsContext=useContext(NOTIFICATIONCONTEXT);
    let dialogBoxContext=useContext(DIALOGCONTEXT);

    let [searchResults,setSearchResults]=useState<BatchTestState[]>([]);

    let [viewLayout,setViewLayout]=useState<{
        view:number,
        data:{
            _id:string,
            tests:[{
                name:string, 
                _id:string
            }],
            candidates:{
                name:string,
                email:string,
                regdNo:string
            }[],
            name: string,
            dateOfCreation: string
        } | null
    }>({
        view:0,
        data:null
    });

    let [batchEditMode,setBatchEditMode]=useState({
        status:false,
        _id:"",
        name:""
    });

    let idGen=()=>{
        let S4 = function() {
           return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
        };
        return (S4()+S4()+S4());
    };

    let [newCandidates,setNewCandidates]=useState([idGen()]);

    useEffect(()=>{
        if(viewLayout.view===0){
            setNewCandidates([idGen()]);
        }
    },[viewLayout]);

    let searchInputRef=createRef<HTMLInputElement>();
    let batchNameInputRef=createRef<HTMLInputElement>();
    let batchCandidatesParent=createRef<HTMLHeadingElement>();
    let [csv,setCsv]=useState<File | null>(null);
    let csvInputRef=createRef<HTMLInputElement>();
    let tBodyRef=createRef<HTMLTableSectionElement>();
    let tableRowGlobalSelectInput=createRef<HTMLInputElement>();

    let newBatchInit=()=>{
        let obj:{[key:string]:any}={};
        if(batchNameInputRef.current)
        obj.name=batchNameInputRef.current.value;
        let candidates=[];
        // Name:any, Email:any, Regd:any
        if(batchCandidatesParent.current){
            let children=batchCandidatesParent.current.parentElement?.children;
            if(children){
                for(let i=0;i<children.length;i++){
                    if(children[i].className==='candidate'){
                        let candidate:{[key:string]:any}={};
                        candidate.Name=(children[i].children[0].children[0] as HTMLInputElement).value;
                        candidate.Email=(children[i].children[0].children[1] as HTMLInputElement).value;
                        candidate.Regd=(children[i].children[1].children[0] as HTMLInputElement).value;
                        candidates.push(candidate);
                    }
                }
            }
            obj.candidates = candidates;
        }
        if(csv){
            obj.csv = csv;
        }
        if(batchEditMode.status){
            batchUtils.addDataToBatch({
                _id:batchEditMode._id,
                obj:obj,
                notificationsContext:notificationsContext,
                authState:authContext?.authState,
                authDispatch:authContext?.authDispatch,
                setViewLayout:setViewLayout,
                setBatchEditMode:setBatchEditMode
            });
            return;
        }
        if(authContext?.authState)
            batchUtils.batchInit({
                authDispatch:authContext?.authDispatch,
                authState:authContext.authState,
                batchesDispatcher:batchTestContext?.batchesDispatcher,
                notificationsContext:notificationsContext,
                obj:obj,
                batchesState:batchTestContext?.batchesState,
                setViewLayout:setViewLayout
            });
    };

    let viewBatch=(_id:string) =>{
        batchUtils.openBatch({
            _id:_id,
            notificationsContext:notificationsContext,
            authState:authContext?.authState,
            authDispatch:authContext?.authDispatch,
            setViewLayout:setViewLayout
        });
    }

    let searchResultsFunc=()=>{
        if(searchInputRef.current && batchTestContext){
            let key=searchInputRef.current.value;
            if(key.trim()===''){
                setSearchResults([]);
                return;
            }
            let results=batchTestContext.batchesState.filter(batch=>{
                return batch.name.toLowerCase().includes(key);
            });
            setSearchResults(results);
        }
    }

    useEffect(()=>{
        if(dialogBoxContext?.dialogState.view && dialogBoxContext?.dialogState.parent==="RENAMEBATCH"){
            if(dialogBoxContext.dialogState.getResult)
            dialogBoxContext.dialogState.getResult().then((result:any)=>{
                if(result.status){
                    //result.text
                    batchUtils.renameBatch({
                        batchTestContext:batchTestContext,
                        viewLayout:viewLayout,
                        authContext: authContext,
                        notificationsContext:notificationsContext,
                        setViewLayout:setViewLayout,
                        batchName:result.text
                    });
                }
            }).catch((error)=>{
                console.log(error);
            });
        }
    },[dialogBoxContext]);

    let renameBatch=async ()=>{
        dialogBoxContext?.setDialogDispatch({
            type:"RUN",
            payload:{
                getResult:dialogBoxContext.dialogState.getResult,
                placeholder:"Enter your new batch name...",
                question:"Do you confirm this change?",
                view:true,
                parent:"RENAMEBATCH"
            }
        });
    }

    let deleteCandidates=(flag:string,candidate?:{
        name: string;
        email: string;
        regdNo: string;
    })=>{
        // MULTI,SINGLE
        let candidates=[];
        if(flag=="SINGLE"){
            candidates.push(candidate);
        }else if(flag=="MULTI"){
            let children=tBodyRef.current?.children;
            if(children){
                for(let i=1;i<children.length;i++){
                    let candidate:{
                        name: string;
                        email: string;
                        regdNo: string;
                    }={name:"",email:"",regdNo:""};
                    candidate.name=(children[i].children[1].innerHTML);
                    candidate.regdNo=(children[i].children[2].innerHTML);
                    candidate.email=(children[i].children[3].innerHTML);
                    if((children[i].children[0].children[0] as HTMLInputElement).checked)
                        candidates.push(candidate);
                }
            }
        }
        batchUtils.deleteCandidates({
            candidates: candidates,
            setViewLayout:setViewLayout,
            viewLayout:viewLayout,
            authContext: authContext,
            notificationsContext:notificationsContext
        });
    }

    let deleteBatch=()=>{
        if(viewLayout.data)
            batchUtils.deleteBatch({
                batchId:viewLayout.data._id,
                authContext: authContext,
                notificationsContext:notificationsContext,
                setViewLayout:setViewLayout,
                batchTestContext:batchTestContext
            });
    }


    return (
        <>
        {(viewLayout.view===0) && <div className="Batches-org">
            <div className="search">
                <input type="text" placeholder="Search for batches..." ref={searchInputRef}/>
                <button onClick={()=>searchResultsFunc()} className="btn btn-black"><span><i className="fa fa-search" aria-hidden="true"></i></span></button>
            </div>
            {(searchResults.length>0) && <H2Wrapper name="Search Results" defaultShow={true}>
                <div className="all-batches">
                    {searchResults.map(batch=>{
                        return <div className="batch" key={batch._id}>
                            <h3>{batch.name}</h3>
                            <span onClick={()=>{
                                setBatchEditMode({
                                    status:true,
                                    _id:batch._id,
                                    name: batch.name
                                });
                            }} style={{marginLeft:"auto"}}>edit</span>
                            <span style={{marginLeft:"unset"}} onClick={()=>viewBatch(batch._id)}>view</span>
                        </div>;
                    })}
                </div>
            </H2Wrapper>}
            <H2Wrapper name={"Add Batch"} defaultShow={false}>
                <div className="batch-adder">
                    {batchEditMode.status && <h3 className="batch-edit-mode">BATCH EDIT MODE <i onClick={()=>{
                        setBatchEditMode({
                            _id:"",
                            name:"",
                            status:false
                        });
                    }} className="fa fa-times" aria-hidden="true"></i></h3>}
                    <div className="box">
                        <input type="text" placeholder="Batch Name" ref={batchNameInputRef} value={batchEditMode.status?batchEditMode.name:undefined}/>
                        <input onChange={(e)=>{
                            if(e.target.files && e.target.files.length > 0){
                                setCsv(e.target.files[0]);
                            }else setCsv(null);
                        }} type="file" style={{display:"none"}} ref={csvInputRef} accept=".csv,.xlsx,.xls"/>
                        <button onClick={()=>csvInputRef.current?.click()} className="btn btn-green"><span><i className="fa fa-table" aria-hidden="true"></i>&nbsp; {csv?"Loaded CSV":"Upload CSV"}</span></button>
                        <button onClick={()=>newBatchInit()} className="btn btn-blue"><span><i className="fa fa-plus-circle" aria-hidden="true"></i>&nbsp; {batchEditMode.status?"Update Batch":"Add Batch"}</span></button>
                    </div>
                    <h4 ref={batchCandidatesParent} >List of Candidates</h4>
                    {newCandidates.map((candidate)=><div key={candidate} className="candidate">
                        <div className="box">
                            <input type="text" placeholder="Name"/>
                            <input type="text" placeholder="Regd no"/>
                        </div>
                        <div className="box">
                            <input type="email" placeholder="Email"/>
                            <button onClick={() =>{
                                setNewCandidates(newCandidates.filter(candidateId=>candidateId!=candidate));
                            }} className="btn btn-blue"><span><i className="fa fa-trash" aria-hidden="true"></i></span></button>
                        </div>
                    </div>)}
                    <div>
                        <button onClick={()=>{
                            setNewCandidates([...newCandidates,idGen()]);
                        }} className="btn btn-black"><span><i className="fa fa-plus" aria-hidden="true"></i> ADD</span></button>
                    </div>
                </div>
            </H2Wrapper>
            <H2Wrapper name={"Available Batches"} defaultShow={true}>
                <div className="all-batches">
                    {batchTestContext?.batchesState && batchTestContext.batchesState.map(batch=>{
                        return <div className="batch" key={batch._id}>
                            <h3>{batch.name}</h3>
                            <span onClick={()=>{
                                setBatchEditMode({
                                    status:true,
                                    _id:batch._id,
                                    name: batch.name
                                });
                            }} style={{marginLeft:"auto"}}>edit</span>
                            <span style={{marginLeft:"unset"}} onClick={()=>viewBatch(batch._id)}>view</span>
                        </div>;
                    })}
                </div>
            </H2Wrapper>
        </div>}


        {(viewLayout.view===1) && <div className="Batch-View">
            <div className="head">
                <img src={Back} alt="back" onClick={()=>{
                    setViewLayout({
                        view:0,
                        data:null
                    });
                    if(batchEditMode.status)
                        setBatchEditMode({
                            _id:"",
                            name:"",
                            status:false
                        });
                    if(csv) setCsv(null);
                }}/>
                <h1>{viewLayout.data?.name}</h1>
                <button onClick={()=>renameBatch()} className="btn btn-blue" style={{marginLeft:"auto"}}><span>Rename</span></button>
                <button onClick={()=>deleteBatch()} className="btn btn-red"><span>Delete Batch</span></button>
            </div>
            <h2>All Exams appeared <span style={{float: 'right'}}><i className="fa fa-chevron-circle-down" aria-hidden="true"></i></span></h2>
            <div className="exams">
                {viewLayout.data && viewLayout.data.tests.map(test =>{
                    return <div className="exam" id={test._id}>
                        <h3>{test.name}</h3>
                        <p>Go to Exam</p>
                    </div>;
                })}
            </div>
            <h2>All Candidates <span style={{float: 'right'}}><i className="fa fa-chevron-circle-down" aria-hidden="true"></i></span></h2>
            <table>
                <tbody ref={tBodyRef} onChange={(e)=>{
                    if((e.target as HTMLElement).classList.contains("just-a-row")){
                        if(tableRowGlobalSelectInput.current)
                            tableRowGlobalSelectInput.current.checked=false;
                    }
                }}>
                <tr>
                    <th onClick={(e)=>{
                        ((e.target as HTMLTableHeaderCellElement).children[0] as HTMLInputElement).checked = 
                            !((e.target as HTMLTableHeaderCellElement).children[0] as HTMLInputElement).checked;
                        let children:any=(e.target as HTMLElement).parentElement?.parentElement;
                        if(children){
                            children=children.children;
                            for(let i=1;i<children.length;i++){
                                (children[i].children[0].children[0] as HTMLInputElement).checked=
                                    ((e.target as HTMLTableHeaderCellElement).children[0] as HTMLInputElement).checked
                            }
                        }
                    }}><input ref={tableRowGlobalSelectInput} type="checkbox" style={{pointerEvents: 'none'}}/></th>
                    <th>Name</th>
                    <th>Regd no</th>
                    <th>Email</th>
                    <th title="Delete" onClick={()=>deleteCandidates("MULTI")}><i className="fa fa-trash" aria-hidden="true"></i></th>
                </tr>
                {viewLayout.data && viewLayout.data.candidates.map((candidate) =><tr key={candidate.regdNo}>
                    <td><input type="checkbox" className="just-a-row"/></td>
                    <td>{candidate.name}</td>
                    <td>{candidate.regdNo}</td>
                    <td>{candidate.email}</td>
                    <td onClick={()=>deleteCandidates("SINGLE",candidate)}><i className="fa fa-trash" aria-hidden="true"></i></td>
                </tr>)}
                </tbody>
            </table>
        </div>}
        </>
    );
};

export default Batches;