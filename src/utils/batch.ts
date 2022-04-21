import authUtil from './auth';
import { AUTHSTATE } from "../contexts/authContext";
import { BatchTestState } from "../contexts/batchTestContext";
import { NOTIFICATIONSTATE } from "../contexts/notificationContext";

let domain="http://localhost:3002";


let batchInit=async (props:{
    batchesDispatcher:React.Dispatch<{
        type: string;
        payload: any;
    }> | undefined,
    batchesState?:BatchTestState[], 
    authState:AUTHSTATE,
    authDispatch:React.Dispatch<{
        type: string;
        payload: AUTHSTATE;
    }> | undefined, 
    notificationsContext:{
        notificationState: NOTIFICATIONSTATE;
        notificationDispatch: React.Dispatch<{
            type: string;
            payload: NOTIFICATIONSTATE;
        }>;
    } | null,
    setViewLayout: React.Dispatch<React.SetStateAction<{
        view: number;
        data: {
            _id: string;
            tests: [
                {
                    name: string;
                    _id: string;
                }
            ];
            candidates: {
                name: string;
                email: string;
                regdNo: string;
            }[];
            name: string;
            dateOfCreation: string;
        } | null;
    }>>,
    obj:{
        name?:any,
        candidates?:any,
        csv?:File | null
    }
})=>{
    // batchName,batchData,batchId
    try{
    if(props.obj.name){
        let waitObj=await (await fetch(`${domain}/organisation/batch/addBatch`,{
            method: 'POST',
            credentials:"include",
            headers:{
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                batchName: props.obj.name
            })
        })).json();
        if(waitObj.success){
            // _id name dateOfCreation
            if(props.batchesDispatcher && props.batchesState){
                props.batchesState.push({
                    _id:waitObj.data._id,
                    dateOfCreation:waitObj.data.dateOfCreation,
                    name:waitObj.data.name
                });
                props.batchesState.sort((a,b)=>new Date(b.dateOfCreation).getTime()-new Date(a.dateOfCreation).getTime());
                props.batchesDispatcher({
                    type:"LOAD",
                    payload:[...props.batchesState]
                });
            }
            let formdata=new FormData();
            if(props.obj.csv){
                formdata.append("csv",props.obj.csv);
                formdata.append("batchId",waitObj.data._id);
            }else{
                formdata.append("batchId",waitObj.data._id);
                if(props.obj.candidates)
                    formdata.append("batchData",JSON.stringify(props.obj.candidates));
            }

            let data=await (await fetch(`${domain}/organisation/batch/addBatchData`,{
                method: 'POST',
                credentials:"include",
                body:formdata
            })).json();
            if(data.success){
                // add view
                console.log(data.data);
                props.setViewLayout({
                    view:1,
                    data:data.data
                });
            }else{
                if(props.notificationsContext){
                    props.notificationsContext.notificationState.notifications.push("😐 Failed to insert batch data!");
                    props.notificationsContext.notificationDispatch({
                        type:"ADD_NOTIFICATION",
                        payload:{
                            active:true,
                            notifications:props.notificationsContext.notificationState.notifications
                        }
                    });
                }
            }

        }else{
            if(waitObj.error==='Expired Token!'){
                if(props.authState && props.authDispatch)
                authUtil.refreshTokenAndProcedd(props.authState,props.authDispatch,()=>{
                    batchInit(props);
                });
            }else{
                if(props.notificationsContext){
                    props.notificationsContext.notificationState.notifications.push("😐 Failed to create batch!");
                    props.notificationsContext.notificationDispatch({
                        type:"ADD_NOTIFICATION",
                        payload:{
                            active:true,
                            notifications:props.notificationsContext.notificationState.notifications
                        }
                    });
                }
            }
        }
    }
    }catch(e){
        console.log(e);
        if(props.notificationsContext){
            props.notificationsContext.notificationState.notifications.push("😐 Failed to create batch!");
            props.notificationsContext.notificationDispatch({
                type:"ADD_NOTIFICATION",
                payload:{
                    active:true,
                    notifications:props.notificationsContext.notificationState.notifications
                }
            });
        }
    }
}

let openBatch=(props:{
    _id:string,
    authState:AUTHSTATE | undefined,
    authDispatch:React.Dispatch<{
        type: string;
        payload: AUTHSTATE;
    }> | undefined, 
    notificationsContext:{
        notificationState: NOTIFICATIONSTATE;
        notificationDispatch: React.Dispatch<{
            type: string;
            payload: NOTIFICATIONSTATE;
        }>;
    } | null,
    setViewLayout:React.Dispatch<React.SetStateAction<{
        view: number;
        data: {
            _id: string;
            tests: [
                {
                    name: string;
                    _id: string;
                }
            ];
            candidates: {
                name: string;
                email: string;
                regdNo: string;
            }[];
            name: string;
            dateOfCreation: string;
        } | null;
    }>>,
})=>{
    fetch(`${domain}/organisation/batch/getBatchData`,{
        method: 'POST',
        credentials:"include",
        headers:{
            'Content-Type': 'application/json'
        },
        body:JSON.stringify({
            batchId:props._id
        })
    }).then(response=>response.json())
    .then(data=>{
        if(data.success){
            props.setViewLayout({
                view:1,
                data:data.data
            });
        }else if(data.error==='Expired Token!'){
            if(props.authState && props.authDispatch)
            authUtil.refreshTokenAndProcedd(props.authState,props.authDispatch,()=>{
                openBatch(props);
            });
        }else if(props.notificationsContext){
            console.log(data.error);
            props.notificationsContext.notificationState.notifications.push("😐 Failed to view batch data!");
            props.notificationsContext.notificationDispatch({
                type:"ADD_NOTIFICATION",
                payload:{
                    active:true,
                    notifications:props.notificationsContext.notificationState.notifications
                }
            });
        }
    }).catch((e) => {
        console.log(e);
        if(props.notificationsContext){
            props.notificationsContext.notificationState.notifications.push("😐 Failed to view batch data!");
            props.notificationsContext.notificationDispatch({
                type:"ADD_NOTIFICATION",
                payload:{
                    active:true,
                    notifications:props.notificationsContext.notificationState.notifications
                }
            });
        }
    });
}

let addDataToBatch=async (props:{
    _id:string,
    obj:{
        name?:any,
        candidates?:any,
        csv?:File | null
    },
    notificationsContext:{
        notificationState: NOTIFICATIONSTATE;
        notificationDispatch: React.Dispatch<{
            type: string;
            payload: NOTIFICATIONSTATE;
        }>;
    } | null,
    authState:AUTHSTATE | undefined,
    authDispatch:React.Dispatch<{
        type: string;
        payload: AUTHSTATE;
    }> | undefined, 
    setViewLayout:React.Dispatch<React.SetStateAction<{
        view: number;
        data: {
            _id: string;
            tests: [
                {
                    name: string;
                    _id: string;
                }
            ];
            candidates: {
                name: string;
                email: string;
                regdNo: string;
            }[];
            name: string;
            dateOfCreation: string;
        } | null;
    }>>,
    setBatchEditMode:React.Dispatch<React.SetStateAction<{
        status: boolean;
        _id: string;
        name: string;
    }>>
})=>{
    try{
    let formdata=new FormData();
    if(props.obj.csv){
        formdata.append("csv",props.obj.csv);
        formdata.append("batchId",props._id);
    }else{
        formdata.append("batchId",props._id);
        if(props.obj.candidates)
            formdata.append("batchData",JSON.stringify(props.obj.candidates));
    }

    let data=await (await fetch(`${domain}/organisation/batch/addBatchData`,{
        method: 'POST',
        credentials:"include",
        body:formdata
    })).json();
    if(data.success){
        // add view
        console.log(data.data);
        props.setViewLayout({
            view:1,
            data:data.data
        });
    }else{
        if(data.error==='Expired Token!'){
            if(props.authState && props.authDispatch)
            authUtil.refreshTokenAndProcedd(props.authState,props.authDispatch,()=>{
                addDataToBatch(props);
            });
        }else if(props.notificationsContext){
            props.notificationsContext.notificationState.notifications.push("😐 Failed to insert batch data!");
            props.notificationsContext.notificationDispatch({
                type:"ADD_NOTIFICATION",
                payload:{
                    active:true,
                    notifications:props.notificationsContext.notificationState.notifications
                }
            });
        }
    }
    }catch(e){
        if(props.notificationsContext){
            props.notificationsContext.notificationState.notifications.push("😐 Failed to insert batch data!");
            props.notificationsContext.notificationDispatch({
                type:"ADD_NOTIFICATION",
                payload:{
                    active:true,
                    notifications:props.notificationsContext.notificationState.notifications
                }
            });
        }
    }
}

let renameBatch=async (props:{
    batchTestContext:{
        batchesState: BatchTestState[];
        testsState: BatchTestState[];
        batchesDispatcher: React.Dispatch<{
            type: string;
            payload: any;
        }>;
        testsDispatcher: React.Dispatch<any>;
    } | null,
    viewLayout:{
        view: number;
        data: {
            _id: string;
            tests: [
                {
                    name: string;
                    _id: string;
                }
            ];
            candidates: {
                name: string;
                email: string;
            regdNo: string;
        }[];
        name: string;
        dateOfCreation: string;
        } | null;
    },
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
        data: {
            _id: string;
            tests: [
                {
                    name: string;
                    _id: string;
                }
            ];
            candidates: {
                name: string;
                email: string;
                regdNo: string;
        }[];
        name: string;
        dateOfCreation: string;
        } | null;
    }>>,
    batchName:string
})=>{
    if(props.viewLayout.data?._id)
    fetch(`${domain}/organisation/batch/editBatch`,{
        method: 'POST',
        credentials:"include",
        headers:{
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            command:"RENAME",
            batchName:props.batchName,
            batchId:props.viewLayout.data._id
        })
    }).then(response=>response.json())
    .then(data=>{
        if(data.success){
            let newName=data.data;
            if(props.viewLayout.data)
                props.setViewLayout({
                    view:props.viewLayout.view,
                    data:{
                        _id:props.viewLayout.data._id,
                        candidates:props.viewLayout.data.candidates,
                        dateOfCreation:props.viewLayout.data.dateOfCreation,
                        name:newName,
                        tests:props.viewLayout.data.tests
                    }
                });

            if(props.viewLayout.data)
            props.batchTestContext?.batchesState.forEach(batch=>{
                if(batch._id===props.viewLayout.data?._id){
                    batch.name=newName;
                }
            });
            props.batchTestContext?.batchesDispatcher({
                type:"LOAD",
                payload:[...props.batchTestContext.batchesState]
            });

        }else{
            if(data.error==='Expired Token!'){
                if(props.authContext?.authState && props.authContext?.authDispatch)
                authUtil.refreshTokenAndProcedd(props.authContext.authState,props.authContext.authDispatch,()=>{
                    renameBatch(props);
                });
            }else if(props.notificationsContext){
                props.notificationsContext.notificationState.notifications.push("😐 Failed to rename batch!");
                props.notificationsContext.notificationDispatch({
                    type:"ADD_NOTIFICATION",
                    payload:{
                        active:true,
                        notifications:props.notificationsContext.notificationState.notifications
                    }
                });
            }
        }
    }).catch(err=>{
        console.log(err);
        if(props.notificationsContext){
            props.notificationsContext.notificationState.notifications.push("😐 Failed to rename batch!");
            props.notificationsContext.notificationDispatch({
                type:"ADD_NOTIFICATION",
                payload:{
                    active:true,
                    notifications:props.notificationsContext.notificationState.notifications
                }
            });
        }
    });
}

let deleteCandidates=(props:{
    candidates: ({
        name: string;
        email: string;
        regdNo: string;
    } | undefined)[],
    viewLayout:{
        view: number;
        data: {
            _id: string;
            tests: [
                {
                    name: string;
                    _id: string;
                }
            ];
            candidates: {
                name: string;
                email: string;
            regdNo: string;
        }[];
        name: string;
        dateOfCreation: string;
        } | null;
    },
    notificationsContext:{
        notificationState: NOTIFICATIONSTATE;
        notificationDispatch: React.Dispatch<{
            type: string;
            payload: NOTIFICATIONSTATE;
        }>;
    } | null,
    setViewLayout:React.Dispatch<React.SetStateAction<{
        view: number;
        data: {
            _id: string;
            tests: [
                {
                    name: string;
                    _id: string;
                }
            ];
            candidates: {
                name: string;
                email: string;
                regdNo: string;
        }[];
        name: string;
        dateOfCreation: string;
        } | null;
    }>>,
    authContext: {
        authState: AUTHSTATE;
        authDispatch: React.Dispatch<{
            type: string;
            payload: AUTHSTATE;
        }>;
    } | null
})=>{
    if(props.viewLayout.data)
    fetch(`${domain}/organisation/batch/editBatch`,{
        method: 'POST',
        credentials:"include",
        headers:{
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            command:"DEL_CANDIDATES",
            candiData:props.candidates,
            batchId:props.viewLayout.data._id
        })
    }).then(response=>response.json())
    .then(data=>{
        if(data.success){
            let map=new Map();
            props.candidates.forEach(candidate=>{
                map.set(candidate?.regdNo,true);
            });
            if(props.viewLayout.data)
                props.viewLayout.data.candidates=props.viewLayout.data.candidates.filter(candidate=>{
                    return !map.has(candidate.regdNo);
                });
            props.setViewLayout({
                view:1,
                data:props.viewLayout.data
            });
        }else{
            if(data.error==='Expired Token!'){
                if(props.authContext?.authState && props.authContext?.authDispatch)
                authUtil.refreshTokenAndProcedd(props.authContext.authState,props.authContext.authDispatch,()=>{
                    deleteCandidates(props);
                });
            }else if(props.notificationsContext){
                props.notificationsContext.notificationState.notifications.push("😐 Failed to edit batch!");
                props.notificationsContext.notificationDispatch({
                    type:"ADD_NOTIFICATION",
                    payload:{
                        active:true,
                        notifications:props.notificationsContext.notificationState.notifications
                    }
                });
            }
        }
    }).catch(err=>{
        console.log(err);
        if(props.notificationsContext){
            props.notificationsContext.notificationState.notifications.push("😐 Failed to edit batch!");
            props.notificationsContext.notificationDispatch({
                type:"ADD_NOTIFICATION",
                payload:{
                    active:true,
                    notifications:props.notificationsContext.notificationState.notifications
                }
            });
        }
    });
}

let deleteBatch=(props:{

})=>{

};

export default {
    batchInit,openBatch,addDataToBatch,renameBatch,deleteCandidates,deleteBatch
}