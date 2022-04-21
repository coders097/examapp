import React,{ createRef, useContext, useEffect, useState } from 'react';
import { AUTHCONTEXT } from '../../contexts/authContext';
import { TestState } from '../../contexts/batchTestContext';
import { NOTIFICATIONCONTEXT } from '../../contexts/notificationContext';
import '../../styles/organisation/QuestionAdder.scss';

import testUtil from '../../utils/test';

const QuestionAdder = ({type,data,setViewLayout,editMode,setEditMode}:{
    type: "prog" | "mcq",
    data?:TestState,
    setViewLayout?:React.Dispatch<React.SetStateAction<{
        view: number;
        data: TestState | null;
    }>>,
    editMode:{
        status: boolean;
        data: any;
        type: "MCQ" | "PROG";
    },
    setEditMode:React.Dispatch<React.SetStateAction<{
        status: boolean;
        data: any;
        type: "MCQ" | "PROG";
    }>>
}) => {

    let questionTitle=createRef<HTMLInputElement>();
    let questionDescription=createRef<HTMLTextAreaElement>();
    let optionsCover=createRef<HTMLDivElement>();
    let progCover=createRef<HTMLDivElement>();
    let testCasesFile=createRef<HTMLInputElement>();
    let testOutputFile=createRef<HTMLInputElement>();
    let mcqQuestionsFile=createRef<HTMLInputElement>();
    
    let [optionsCount,setOptionsCount]=useState([1]);

    let authContext=useContext(AUTHCONTEXT);
    let notificationsContext=useContext(NOTIFICATIONCONTEXT);
    

    useEffect(()=>{
        if(editMode.status){
            let data;
            if(editMode.type==="MCQ"){
                data=editMode.data as {
                    question: string;
                    options: string[];
                    answer: string;
                    id: string;
                };
                if(questionTitle.current)
                    questionTitle.current.value=data.question;
            }else if(editMode.type==="PROG"){
                data=editMode.data as {
                    question: {
                        title: string;
                        description: string;
                        examples: {
                            input: string;
                            output: string;
                        }[];
                    };
                    testCasesFile: string;
                    outputsFile: string;
                    _id: string;
                };
                if(questionTitle.current)
                    questionTitle.current.value=data.question.title;
                if(questionDescription.current)
                    questionDescription.current.value=data.question.description;
            }
        }
    },[editMode]);

    let _addProgQuestion=()=>{
        let _data:{[key:string]:any}={};
        _data["question"]={};
        if(questionTitle.current && questionDescription.current){
            _data["question"]["title"]=questionTitle.current.value;
            _data["question"]["description"]=questionDescription.current.value;
        }
        _data["question"]["examples"]=[];
        if(progCover.current){
            let children=progCover.current.children;
            for(let i=0;i<children.length;i++){
                if(children[i].className==='prog-example'){
                    let example={
                        input:"",
                        output:"",
                    }
                    example.input=(children[i].children[0] as HTMLTextAreaElement).value;
                    example.output=(children[i].children[1] as HTMLTextAreaElement).value;
                    _data["question"]["examples"].push(example);
                }
            }
        }
        if(testCasesFile.current?.files && testOutputFile.current?.files){
            _data["testCasesFile"]=testCasesFile.current?.files[0];
            _data["outputsFile"]=testOutputFile.current?.files[0];
        }
        if(data && setViewLayout)
            testUtil.uploadProgQuestion({
                data: _data,
                authContext: authContext,
                notificationsContext:notificationsContext,
                setViewLayout:setViewLayout,
                testId:data._id,
                viewData:data,
                setEditMode:(editMode.status && (editMode.type==="PROG"))?setEditMode:undefined,
                questionId:(editMode.status && (editMode.type==="PROG"))?editMode.data._id:null
            });
    }

    let _addMcqQuestion=()=>{
        let obj:{[key:string]:any}={};
        // question,options,answer
        obj["question"]=questionTitle.current?.value.trim();
        obj["options"]=[];
        let children=optionsCover.current?.children;
        if(children)
        for(let i=1;i<children.length-1;i++){
            let optionBox=children[i];
            if(optionBox.classList.contains("active")){
                obj["answer"]=optionBox.children[0].textContent?.trim();
            }
            obj["options"].push(optionBox.children[0].textContent?.trim());
        }
        if(data && setViewLayout)
            testUtil.uploadQuestions({
                authContext: authContext,
                mcqFile:null,
                mcqQuestion:obj as {
                    answer: string;
                    options: string[];
                    question: string;
                },
                notificationsContext:notificationsContext,
                setViewLayout:setViewLayout,
                testId:data._id,
                viewData:data,
                setEditMode:(editMode.status && (editMode.type==="MCQ"))?setEditMode:undefined,
                questionId:(editMode.status && (editMode.type==="MCQ"))?editMode.data.id:null
            });
    }

    let uploadMCQuestions=()=>{
        if(mcqQuestionsFile.current?.files && mcqQuestionsFile.current?.files.length>0){
            if(data && setViewLayout)
                testUtil.uploadQuestions({
                    authContext: authContext,
                    mcqFile:mcqQuestionsFile.current.files[0],
                    mcqQuestion:{} as {
                        answer: string;
                        options: string[];
                        question: string;
                    },
                    notificationsContext:notificationsContext,
                    setViewLayout:setViewLayout,
                    testId:data._id,
                    viewData:data
                });
        }
        setTimeout(()=>{
            if(mcqQuestionsFile.current) mcqQuestionsFile.current.value="";
        },2500);
    }

    let addQuestion=()=>{
        if(type==='mcq'){
            _addMcqQuestion();
        }else if(type==='prog'){
            _addProgQuestion();
        }
    }

    return (
        <div className="Add-question">
            {type==='mcq' && <>
            {(editMode.status && (editMode.type==="MCQ")) && <h3 className="test-edit-mode">EDIT MODE ON <i onClick={()=>{
                setEditMode({
                    data:null,
                    status:false,
                    type:"MCQ"
                });
            }} className="fa fa-times" aria-hidden="true"></i></h3>}
            <input ref={questionTitle} type="text" placeholder="Enter Question"/>
            <div className="options" ref={optionsCover} onKeyDown={(e)=>{
                e.stopPropagation();
                if(e.key==='Enter'){
                    if((e.target as HTMLParagraphElement).hasAttribute('data-optionfield')){
                        (e.target as HTMLParagraphElement).contentEditable="false";
                    }
                }
            }}>
                <h5>~ Options</h5>
                {optionsCount.map((i)=><div className="option" key={i}>
                    <p data-optionfield="ok">Option 1</p>
                    <i className="fa fa-pencil" aria-hidden="true" onClick={(e)=>{
                        ((e.target as HTMLElement).parentElement?.children[0] as HTMLParagraphElement).contentEditable='true';
                        ((e.target as HTMLElement).parentElement?.children[0] as HTMLParagraphElement).focus();
                    }}></i>
                    <i className="fa fa-check" aria-hidden="true" onClick={(e)=>{
                        (e.target as HTMLElement).parentElement?.classList.add("active");
                        if(optionsCover.current){
                            let children=optionsCover.current.children;
                            for(let i=0;i<children.length;i++){
                                if(children[i].classList.contains('option') && children[i].classList.contains('active')){
                                    if(children[i]!==(e.target as HTMLElement).parentElement){
                                        children[i].classList.remove("active");
                                    }
                                }
                            }
                        }
                    }}></i>
                    <i className="fa fa-times" aria-hidden="true" onClick={()=>{
                        if(optionsCount.length>1){
                            optionsCount=optionsCount.filter(doc=>{
                                return doc!=i;
                            })
                            setOptionsCount([...optionsCount]);
                        }
                    }}></i>
                </div>)}
                <button className="btn btn-black" onClick={(e)=>{
                    setOptionsCount([...optionsCount,optionsCount[optionsCount.length-1]+1]);
                }}>
                    <span><i className="fa fa-plus" aria-hidden="true"></i> Add Option</span>
                </button>
            </div>
            </>}
            {type==='prog' && <>
                <div className="prog-question-adder" ref={progCover}>
                    {(editMode.status && (editMode.type==="PROG")) && <h3 className="test-edit-mode">EDIT MODE ON <i onClick={()=>{
                        setEditMode({
                            data:null,
                            status:false,
                            type:"MCQ"
                        });
                    }} className="fa fa-times" aria-hidden="true"></i></h3>}
                    <input ref={questionTitle} type="text" placeholder="Enter the title"/>
                    <textarea ref={questionDescription} rows={8} placeholder="Description - for next line insert <$$>"></textarea>
                    <h3>Examples</h3>
                    {optionsCount.map((i)=>{
                        return <div key={i} className="prog-example">
                            <textarea placeholder="Input"></textarea>
                            <textarea placeholder="Output"></textarea>
                            <button className="btn btn-black" onClick={()=>{
                                if(optionsCount.length>1){
                                    optionsCount=optionsCount.filter(doc=>{
                                        return doc!=i;
                                    })
                                    setOptionsCount([...optionsCount]);
                                }
                            }}>
                                <span><i className="fa fa-trash" aria-hidden="true"></i></span>
                            </button>
                        </div>;
                    })}
                    <button className="btn btn-black prog-example-btn" onClick={(e)=>{
                        setOptionsCount([...optionsCount,optionsCount[optionsCount.length-1]+1]);
                    }}>
                        <span><i className="fa fa-plus" aria-hidden="true"></i> Add Example</span>
                    </button>
                </div>    
            </>}
            
            <div className="submit-ques">
                <input type="file" style={{display: 'none'}} ref={testCasesFile}/>
                <input type="file" style={{display: 'none'}} ref={testOutputFile}/>
                <input type="file" style={{display: 'none'}}/>
                
                {(type==='prog') && <>
                <button onClick={()=>testCasesFile.current?.click()} style={{marginLeft:"auto"}} className="btn btn-black"><span>Testcases</span></button>
                <button onClick={()=>testOutputFile.current?.click()} className="btn btn-black"><span>Testoutput</span></button>
                </>}
                <button onClick={addQuestion} style={(type==='mcq')?{marginLeft:"auto"}:{}} className="btn btn-black"><span>Add</span></button>
            </div>
            {(type==='mcq') && <>
                <h4>- or -</h4>
                <input type="file" style={{display:"none"}} ref={mcqQuestionsFile} onChange={()=>uploadMCQuestions()}/>
                <div className="questions-uploader">
                    <h3>Upload Questions CSV</h3>
                    <button className="btn btn-blue" onClick={()=>mcqQuestionsFile.current?.click()}><span>Upload</span></button>
                </div>
            </>}
        </div>
    );
};

export default QuestionAdder;