import React, { createRef, useContext, useEffect, useState } from 'react';
import '../../styles/candidate/SolutionSheet.scss';
import Back from '../../assets/back.png';

import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/mode-c_cpp";
import "ace-builds/src-noconflict/mode-python";

import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/theme-solarized_light"; 
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/theme-tomorrow_night_blue";

import "ace-builds/src-min-noconflict/snippets/java";
import "ace-builds/src-min-noconflict/snippets/c_cpp";
import "ace-builds/src-min-noconflict/snippets/python";
import "ace-builds/src-min-noconflict/ext-language_tools";
import { AUTHCONTEXT } from '../../contexts/authContext';

let domain="http://localhost:3002";

const CodingPage = ({data,setCurrView,setResults,results}:{
    data:{
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
    let chooseLanguageRef=createRef<HTMLSelectElement>();

    let [editorSettings,setEditorSettings]=useState({
        mode:"java",
        theme:"monokai"
    });

    let [aceEditorValue,setAceEditorValue]=useState("");
    let aceEditor=createRef<AceEditor>();
    let compilerEditorRef=createRef<HTMLTextAreaElement>();
    let compilerOutput=createRef<HTMLDivElement>();
    let compile=()=>{
        if(compilerOutput.current)
            compilerOutput.current.innerText="";
        fetch(`${domain}/code/compile`,{
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body:JSON.stringify({ 
                type:editorSettings.mode,
                code:aceEditorValue,
                inputs:compilerEditorRef.current?.value
            })
        })
        .then(res=>res.json())
        .then(data=>{
            if(data.success){
                (document.getElementById("compilerOutputID") as HTMLDivElement).innerText = data.data;
            }else{
                (document.getElementById("compilerOutputID") as HTMLDivElement).innerText = "SERVER ERROR";
            }
        })
        .catch(err=>console.log(err));
    }

    let [compilerSettings,setCompilerSettings]=useState({
        view:false
    })

    let [quesAnsSets,setQuesAnsSets]=useState<{
        title:string,
        description:string,
        examples:{
            input:string,
            output:string
        }[],
        view:boolean
        code:string,
        _id:string
    }[]>([]);

    let loadQuestion=(question:{
        title: string;
        description: string;
        examples: {
            input: string;
            output: string;
        }[];
        view: boolean;
        code: string;
        _id: string;
    })=>{
        if(question.code.trim()!=''){
            let parts:string[]=question.code.split("<$%$%$>");
            setEditorSettings({
                mode:parts[0],
                theme:editorSettings.theme
            });
            aceEditor.current?.editor.setValue(parts[1]);
        }else aceEditor.current?.editor.setValue("");
    };

    useEffect(()=>{
        if(chooseLanguageRef.current){
            let children=chooseLanguageRef.current.children;
            for(let i=0;i<children.length;i++){
                let childOption = children[i] as HTMLOptionElement;
                if(childOption.value==editorSettings.mode){
                    childOption.selected=true;
                }else childOption.selected=false;
            }
            // console.log(children);
        }
        // console.log("render")
    },[editorSettings]);

    useEffect(()=>{
        if(data.length>0){
            
            let availableCode=false;
            let testId=localStorage.getItem("testId");
            let progDataStr=localStorage.getItem("progData");
            let passKey=localStorage.getItem("passKey");
            let map=new Map<string, string>();
            if(progDataStr && (testId==authContext?.authState.candiData.testId) && ((passKey==authContext?.authState.candiData.key))){
                availableCode=true;
                let progData=JSON.parse(progDataStr) as {
                    title: string;
                    description: string;
                    examples: {
                        input: string;
                        output: string;
                    }[];
                    view: boolean;
                    code: string;
                    _id: string;
                }[];
                progData.forEach(_progData=>{
                    map.set(_progData._id,_progData.code);
                });
            }

            quesAnsSets=data.map((_data)=>{
                let resultCode=availableCode?map.get(_data._id):"";
                if(!resultCode) resultCode="";
                return {
                    code:resultCode,
                    description:_data.question.description,
                    _id:_data._id,
                    examples:_data.question.examples,
                    title:_data.question.title,
                    view:false
                }
            });
            quesAnsSets[0].view=true;
            setQuesAnsSets(quesAnsSets);
            loadQuestion(quesAnsSets[0]);
        }
    },[data]);

    let saveProgress=()=>{
        let currQuestion=null;
        quesAnsSets.forEach(question=>{
            if(question.view){
                currQuestion=question;
            }
        });
        if(currQuestion){
            (currQuestion as {
                title: string;
                description: string;
                examples: {
                    input: string;
                    output: string;
                }[];
                view: boolean;
                code: string;
                _id: string;
            }).code=`${editorSettings.mode}<$%$%$>${aceEditorValue}`;
        }
        //save in localStorage
        if(authContext && authContext.authState.candiData.testId)
            localStorage.setItem("testId",authContext.authState.candiData.testId);
        localStorage.setItem("progData",JSON.stringify(quesAnsSets));
        if(authContext?.authState.candiData.key)
            localStorage.setItem("passKey",authContext.authState.candiData.key);
        /////
        // console.log(quesAnsSets);
    };

    let selectAnotherQuestion=(nextId:string)=>{
        saveProgress();
        quesAnsSets.forEach(question=>{
            if(question._id==nextId){
                question.view=true;
                loadQuestion(question);
            }else question.view=false;
        });
        setQuesAnsSets([...quesAnsSets]);
    };

    let saveResults=()=>{
        let prog:{_id:string,code:string}[]=[];
        quesAnsSets.forEach(question =>{
            if(question.view){
                prog.push({
                    _id:question._id,
                    code:`${editorSettings.mode}<$%$%$>${aceEditor.current?.editor.getValue()}`
                });
            }
            else prog.push({
                _id:question._id,
                code:question.code
            });
        });
        // console.log(prog);
        setResults({
            mcq:results.mcq,
            prog:prog
        });
        alert("Saved!");
    }

    return (
        <section className="Solution-page-layout">
            <div className="Solution-nav">
                <img alt="back" src={Back} onClick={()=>{
                    saveProgress();
                    setCurrView(0);
                }}/>
                <h1>Editor</h1>
                <video src="" controls={true}/>
                <div className="details">
                    <h3>{authContext?.authState.candiData.name}</h3>
                    <p>ID : <span>{authContext?.authState.candiData.regd}</span></p>
                    <h2>9:51</h2>
                </div>
            </div>
            <div className="Solution-aside">
                {quesAnsSets.map((s) =><div className="question" key={s._id}>
                    <h2 onClick={()=>selectAnotherQuestion(s._id)}>{s.title}</h2>
                    {s.view && <div className="details">
                        {s.description.split("<$$>").map((des,i)=><p key={i}>{des}</p>)}

                        {s.examples.map((example,j)=><React.Fragment key={j}><p>Example {j+1}</p>
                        <div className="example">
                            <p><span>Input:</span></p>
                            <p>{example.input.split('<$$>').map((partInput,l)=>{
                                return <React.Fragment key={l}>{partInput}<br/></React.Fragment>;
                            })}</p>
                            <p><span>Output:</span></p>
                            <p>{example.output.split('<$$>').map((partOutput,l)=>{
                                return <React.Fragment key={l}>{partOutput}<br/></React.Fragment>;
                            })}</p>
                        </div></React.Fragment>)}
                            {/* <p><span>Explanation:</span></p>
                            <p>0th and 2nd person both */}
{/* know 1. Therefore, 1 is the celebrity. </p> */}

                        {/* <p>Your Task:</p>
                        <p>You don't need to read input or print anything. Complete the function celebrity() which takes the matrix M and its size N as input parameters and returns the index of the celebrity. If no such celebrity is present, return -1.</p>
                        <p>Expected Time Complexity: O(N)</p>
                        <p>Expected Auxiliary Space: O(1)</p>
                        <p>Constraints:</p>
                        <p>{`2 <= N <= 3000`}</p>
                        <p>{`0 <= M[][] <= 1`}</p> */}
                    </div>}
                </div>)}
            </div>
            <div className="Solution-content">
                <div className="menu">
                    <select onChange={(e)=>setEditorSettings({
                        mode: editorSettings.mode,
                        theme:e.target.value
                    })} defaultValue={"monokai"}>
                        <option value="github" >Github</option>
                        <option value="monokai">Monokai</option>
                        <option value="solarized_light">Solarized Light</option>
                    </select>
                    <select ref={chooseLanguageRef} onChange={(e)=>setEditorSettings({
                        mode: e.target.value,
                        theme: editorSettings.theme
                    })} defaultValue={"java"} style={{marginLeft: "auto"}}>
                        <option value="c_cpp">C</option>
                        <option value="java">Java</option>
                        <option value="python">Python</option>
                    </select>
                </div>
                <AceEditor
                    onChange={(val)=>setAceEditorValue(val)}
                    mode={editorSettings.mode}
                    theme={editorSettings.theme}
                    name="UNIQUE_ID_OF_DIV"
                    editorProps={{ $blockScrolling: true }}
                    setOptions={{
                        enableBasicAutocompletion: true,
                        enableLiveAutocompletion: true,
                        enableSnippets: true
                    }}
                    fontSize="17px"
                    defaultValue='/* Enter your code here */'
                    width="100%"
                    height="100%"
                    ref={aceEditor}
                />
                {compilerSettings.view && <div className="compiler">
                    <textarea rows={6} ref={compilerEditorRef}/>
                    <div className="output-compiler" ref={compilerOutput} id="compilerOutputID">
                        {/* 8<br/>
                        10<br/> */}
                    </div>
                </div>}
                <div className="runner">
                    <button className="btn btn-black" onClick={()=>{
                        setCompilerSettings({
                            ...compilerSettings,
                            view:!compilerSettings.view
                        });
                    }}><span>{compilerSettings.view?"Close":"Compiler"}</span></button>    
                    {compilerSettings.view && <button className="btn btn-blue" onClick={()=>{
                        compile();
                    }}><span>Compile</span></button>}                
                    <button className="btn btn-pale" style={{marginLeft:"auto"}} onClick={()=>saveResults()}><span>Submit</span></button>                    
                </div>
            </div>            
        </section>
    );
};

export default CodingPage;