import { AUTHSTATE } from '../contexts/authContext';
import { NOTIFICATIONSTATE } from '../contexts/notificationContext';
import authUtil from './auth';

let domain="http://localhost:3002";

let getTestBatchInfo=(props:{
    batchesDispatcher:React.Dispatch<{
        type: string;
        payload: any;
    }> | undefined,
    testsDispatcher:React.Dispatch<{
        type: string;
        payload: any;
    }> | undefined,
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
    } | null
})=>{
    fetch(`${domain}/organisation/getTestBatchInfo`,{
        method:"POST",
        credentials:"include"
    }).then(response =>response.json())
    .then(data =>{
        console.log(data);
        if(data.success){
            if(props.batchesDispatcher)
            props.batchesDispatcher({
                type:"LOAD",
                payload:data.data.batches.sort((a:any,b:any)=>new Date(b.dateOfCreation).getTime()-new Date(a.dateOfCreation).getTime()) 
            });
            if(props.testsDispatcher)
            props.testsDispatcher({
                type:"LOAD",
                payload:data.data.tests.sort((a:any,b:any)=>new Date(b.dateOfCreation).getTime()-new Date(a.dateOfCreation).getTime())
            });
        }else{
            if(data.error==='Expired Token!'){
                if(props.authState && props.authDispatch)
                authUtil.refreshTokenAndProcedd(props.authState,props.authDispatch,()=>{
                    getTestBatchInfo(props);
                });
            }else{
                if(props.notificationsContext){
                    props.notificationsContext.notificationState.notifications.push("😐 Failed to load batches & test!");
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
    }).catch(error =>{
        console.error(error);
        if(props.notificationsContext){
            props.notificationsContext.notificationState.notifications.push("😐 Failed to load batches & test!");
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

export default {
    getTestBatchInfo
}