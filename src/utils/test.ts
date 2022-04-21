import { AUTHSTATE } from '../contexts/authContext';
import { BatchTestState, TestState } from '../contexts/batchTestContext';
import { NOTIFICATIONSTATE } from '../contexts/notificationContext';
import authUtil from './auth';
let domain="http://localhost:3002";


let createTest= async ({  
    testName,
    authContext,
    notificationsContext,
    testsDispatcher,
    testsState
}:{
    testName:string,
    authContext:{
        authState: AUTHSTATE;
        authDispatch: React.Dispatch<{
            type: string;
            payload: AUTHSTATE;
        }>;
    } | null,
    notificationsContext:{
        notificationState: NOTIFICATIONSTATE;
        notificationDispatch: React.Dispatch<{
            type: string;
            payload: NOTIFICATIONSTATE;
        }>;
    } | null,
    testsDispatcher:React.Dispatch<{
        type: string;
        payload: any;
    }> | undefined,
    testsState?:BatchTestState[]
})=>{
    try{
        let waitObj=await (await fetch(`${domain}/organisation/test/addTest`,{
            method: 'POST',
            credentials:"include",
            headers:{
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                testName:testName
            })
        })).json();
        if(waitObj.success) {
            if(testsDispatcher && testsState){
                testsState.push({
                    _id:waitObj.data._id,
                    dateOfCreation:waitObj.data.dateOfCreation,
                    name:waitObj.data.name
                });
                testsState.sort((a,b)=>new Date(b.dateOfCreation).getTime()-new Date(a.dateOfCreation).getTime());
                testsDispatcher({
                    type:"LOAD",
                    payload:[...testsState]
                });
            }
        }else{
            if(waitObj.error==='Expired Token!'){
                if(authContext?.authState && authContext?.authDispatch)
                authUtil.refreshTokenAndProcedd(authContext.authState,authContext.authDispatch,()=>{
                    createTest({
                        authContext: authContext,
                        notificationsContext:notificationsContext,
                        testName:testName,
                        testsDispatcher:testsDispatcher,
                        testsState:testsState
                    });
                });
            }else{
                if(notificationsContext){
                    notificationsContext.notificationState.notifications.push("😐 Failed to create test!");
                    notificationsContext.notificationDispatch({
                        type:"ADD_NOTIFICATION",
                        payload:{
                            active:true,
                            notifications:notificationsContext.notificationState.notifications
                        }
                    });
                }
            }
        }
    }catch(err){
        console.log(err);
        if(notificationsContext){
            notificationsContext.notificationState.notifications.push("😐 Failed to create test!");
            notificationsContext.notificationDispatch({
                type:"ADD_NOTIFICATION",
                payload:{
                    active:true,
                    notifications:notificationsContext.notificationState.notifications
                }
            });
        }
    }
};


let openTest=({
    _id,
    notificationsContext,
    authContext,
    setViewLayout
}:{
    _id:string,
    authContext:{
        authState: AUTHSTATE;
        authDispatch: React.Dispatch<{
            type: string;
            payload: AUTHSTATE;
        }>;
    } | null,
    notificationsContext:{
        notificationState: NOTIFICATIONSTATE;
        notificationDispatch: React.Dispatch<{
            type: string;
            payload: NOTIFICATIONSTATE;
        }>;
    } | null,
    setViewLayout:any
})=>{
    fetch(`${domain}/organisation/test/getTestData`,{
        method: 'POST',
        credentials:"include",
        headers:{
            'Content-Type': 'application/json'
        },
        body:JSON.stringify({
            testId:_id
        })
    }).then(response=>response.json())
    .then(data=>{
        if(data.success){
            setViewLayout({
                view:1,
                data:data.data
            }); 
        }else if(data.error==='Expired Token!'){
            if(authContext?.authState && authContext?.authDispatch)
            authUtil.refreshTokenAndProcedd(authContext.authState,authContext.authDispatch,()=>{
                openTest({
                    _id,
                    notificationsContext,
                    authContext,
                    setViewLayout
                });
            });
        }else if(notificationsContext){
            console.log(data.error);
            notificationsContext.notificationState.notifications.push("😐 Failed to view test data!");
            notificationsContext.notificationDispatch({
                type:"ADD_NOTIFICATION",
                payload:{
                    active:true,
                    notifications:notificationsContext.notificationState.notifications
                }
            });
        }
    }).catch((e) => {
        console.log(e);
        if(notificationsContext){
            notificationsContext.notificationState.notifications.push("😐 Failed to view test data!");
            notificationsContext.notificationDispatch({
                type:"ADD_NOTIFICATION",
                payload:{
                    active:true,
                    notifications:notificationsContext.notificationState.notifications
                }
            });
        }
    });
}

let uploadQuestions=({
    mcqQuestion,
    testId, 
    mcqFile,
    authContext,
    notificationsContext,
    setViewLayout,
    viewData,
    setEditMode,
    questionId
}:{
    mcqQuestion:{
        answer: string,
        options: string[]
        question:string
    },
    testId:string,
    mcqFile:File | null,
    authContext:{
        authState: AUTHSTATE;
        authDispatch: React.Dispatch<{
            type: string;
            payload: AUTHSTATE;
        }>;
    } | null,
    notificationsContext:{
        notificationState: NOTIFICATIONSTATE;
        notificationDispatch: React.Dispatch<{
            type: string;
            payload: NOTIFICATIONSTATE;
        }>;
    } | null,
    setViewLayout:React.Dispatch<React.SetStateAction<{
        view: number;
        data: TestState | null;
    }>>,
    viewData:TestState,
    setEditMode?:React.Dispatch<React.SetStateAction<{
        status: boolean;
        data: any;
        type: "MCQ" | "PROG";
    }>>,
    questionId?:string | null
})=>{
    let formData = new FormData();
    if(mcqFile){
        formData.append("mcqFile",mcqFile);
    }else{
        formData.append("question",mcqQuestion.question);
        formData.append("answer",mcqQuestion.answer);
        formData.append("options",JSON.stringify(mcqQuestion.options));
    }
    formData.append("testId",testId);
    if(questionId){
        formData.append("questionId",questionId);
    }

    fetch(`${domain}/organisation/test/addQuestionsToTest`,{
        method: 'POST',
        credentials:"include",
        body: formData
    }).then(response =>response.json())
    .then(data=>{
        if(data.success){
            let _viewData={...viewData};
            _viewData.mcqQuestions=data.data;
            setViewLayout({
                view:1,
                data:_viewData
            });
            if(setEditMode)
                setEditMode({
                    status:false,
                    data:null,
                    type:"MCQ"
                });
        }else if(data.error==='Expired Token!'){
            if(authContext?.authState && authContext?.authDispatch)
            authUtil.refreshTokenAndProcedd(authContext.authState,authContext.authDispatch,()=>{
                uploadQuestions({
                    authContext: authContext,
                    mcqFile:mcqFile,
                    mcqQuestion:mcqQuestion,
                    notificationsContext:notificationsContext,
                    setViewLayout:setViewLayout,
                    testId:testId,
                    viewData:viewData
                });
            });
        }else if(notificationsContext){
            console.log(data.error);
            notificationsContext.notificationState.notifications.push("😐 Failed to insert mcq questions!");
            notificationsContext.notificationDispatch({
                type:"ADD_NOTIFICATION",
                payload:{
                    active:true,
                    notifications:notificationsContext.notificationState.notifications
                }
            });
        }
    }).catch(error =>{
        console.log(error);
        if(notificationsContext){
            notificationsContext.notificationState.notifications.push("😐 Failed to insert mcq questions!");
            notificationsContext.notificationDispatch({
                type:"ADD_NOTIFICATION",
                payload:{
                    active:true,
                    notifications:notificationsContext.notificationState.notifications
                }
            });
        }
    });
}

let uploadProgQuestion=({
    data,
    testId,
    authContext,
    notificationsContext,
    setViewLayout,
    viewData,
    setEditMode,
    questionId
}:{
    data:{
        [key: string]: any;
    },
    testId:string,
    authContext:{
        authState: AUTHSTATE;
        authDispatch: React.Dispatch<{
            type: string;
            payload: AUTHSTATE;
        }>;
    } | null,
    notificationsContext:{
        notificationState: NOTIFICATIONSTATE;
        notificationDispatch: React.Dispatch<{
            type: string;
            payload: NOTIFICATIONSTATE;
        }>;
    } | null,
    setViewLayout:React.Dispatch<React.SetStateAction<{
        view: number;
        data: TestState | null;
    }>>,
    viewData:TestState,
    setEditMode?:React.Dispatch<React.SetStateAction<{
        status: boolean;
        data: any;
        type: "MCQ" | "PROG";
    }>>,
    questionId?:string | null
})=>{
    let formData = new FormData();
    formData.append("testId",testId);
    formData.append("testCasesFile",data["testCasesFile"]);
    formData.append("outputsFile",data["outputsFile"]);
    data["testCasesFile"]="";
    data["outputsFile"]="";
    formData.append("progQuestion",JSON.stringify(data));
    if(questionId){
        formData.append("questionId",questionId);
    }

    fetch(`${domain}/organisation/test/addProgrammingQuestion`,{
        method: "POST",
        credentials:"include",
        body:formData
    }).then((response)=>response.json())
    .then(_data=>{
        if(_data.success){
            viewData.progQuestions=_data.data;
            setViewLayout({
                view:1,
                data:{ ...viewData }
            });
            if(setEditMode)
                setEditMode({
                    status:false,
                    data:null,
                    type:"MCQ"
                });
        }else if(data.error==='Expired Token!'){
            if(authContext?.authState && authContext?.authDispatch)
            authUtil.refreshTokenAndProcedd(authContext.authState,authContext.authDispatch,()=>{
                uploadProgQuestion({
                    authContext: authContext,
                    data:data,
                    notificationsContext:notificationsContext,
                    setViewLayout:setViewLayout,
                    testId:testId,
                    viewData:viewData
                });
            });
        }else if(notificationsContext){
            console.log(data.error);
            notificationsContext.notificationState.notifications.push("😐 Failed to insert prog questions!");
            notificationsContext.notificationDispatch({
                type:"ADD_NOTIFICATION",
                payload:{
                    active:true,
                    notifications:notificationsContext.notificationState.notifications
                }
            });
        }
    }).catch(err=>{
        if(notificationsContext){
            console.log(err);
            notificationsContext.notificationState.notifications.push("😐 Failed to insert proq questions!");
            notificationsContext.notificationDispatch({
                type:"ADD_NOTIFICATION",
                payload:{
                    active:true,
                    notifications:notificationsContext.notificationState.notifications
                }
            });
        }
    });
}

let editPreferences=async ({command,testName,authContext,notificationsContext,setViewLayout,testsDispatcher,testsState,viewData,editMainObj}:{
    command:string,
    testName?:string,
    authContext:{
        authState: AUTHSTATE;
        authDispatch: React.Dispatch<{
            type: string;
            payload: AUTHSTATE;
        }>;
    } | null,
    notificationsContext:{
        notificationState: NOTIFICATIONSTATE;
        notificationDispatch: React.Dispatch<{
            type: string;
            payload: NOTIFICATIONSTATE;
        }>;
    } | null,
    setViewLayout:React.Dispatch<React.SetStateAction<{
        view: number;
        data: TestState | null;
    }>>,
    testsDispatcher:React.Dispatch<{
        type: string;
        payload: any;
    }> | undefined,
    testsState:BatchTestState[] | undefined,
    viewData:TestState,
    editMainObj?:{[key:string]:any}
})=>{
    let errorMessage=(command==="RENAME")?"Unable to rename test :(":"Unable to edit preferences :(";
    let fetchRequest;
    if(command==="RENAME"){
        let reqObj:{[key:string]:any}={
            "command": command,
            "testId":viewData._id
        };
        if(testName) reqObj["testName"]=testName;
        fetchRequest=fetch(`${domain}/organisation/test/editTest`,{
            method: "POST",
            credentials:"include",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(reqObj)
        });
    }else if(command==="EDIT_PREFERENCES"){
        if(editMainObj){
            editMainObj["command"]="EDIT_PREFERENCES";
            editMainObj["testId"]=viewData._id;
            fetchRequest=fetch(`${domain}/organisation/test/editTest`,{
                method: "POST",
                credentials:"include",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(editMainObj)
            });
        }
    }
    try{
        let data=(await (await fetchRequest)?.json());
        if(data.success){
            if(command==="RENAME"){
                if(testName){ 
                    viewData.name=testName;
                    setViewLayout({
                        view:1,
                        data:{ ...viewData }
                    });
                }
                if(testsState && testsDispatcher){
                    testsState=testsState.map(test=>{
                        if(test._id==data.data._id) return data.data;
                        return test;
                    });
                    testsDispatcher({
                        type:"LOAD",
                        payload:[...testsState]
                    });
                }
            }else if(command==="EDIT_PREFERENCES"){
                setViewLayout({
                    view:1,
                    data:data.data
                });
                if(notificationsContext){
                    notificationsContext.notificationState.notifications.push("SUCCESSFUL EDIT PREFERENCES!");
                    notificationsContext.notificationDispatch({
                        type:"ADD_NOTIFICATION",
                        payload:{
                            active:true,
                            notifications:notificationsContext.notificationState.notifications
                        }
                    });
                }
            }
        }else if(data.error==='Expired Token!'){
            if(authContext?.authState && authContext?.authDispatch)
            authUtil.refreshTokenAndProcedd(authContext.authState,authContext.authDispatch,()=>{
                editPreferences({command,testName,authContext,notificationsContext,setViewLayout,testsDispatcher,testsState,viewData});
            });
        }else if(notificationsContext){
            console.log(data.error);
            notificationsContext.notificationState.notifications.push(errorMessage);
            notificationsContext.notificationDispatch({
                type:"ADD_NOTIFICATION",
                payload:{
                    active:true,
                    notifications:notificationsContext.notificationState.notifications
                }
            });
        }
    }catch(e){
        console.log(e);
        if(notificationsContext){
            notificationsContext.notificationState.notifications.push(errorMessage);
            notificationsContext.notificationDispatch({
                type:"ADD_NOTIFICATION",
                payload:{
                    active:true,
                    notifications:notificationsContext.notificationState.notifications
                }
            });
        }
    }
}

export default {
    createTest,openTest,uploadQuestions,uploadProgQuestion,editPreferences
}    