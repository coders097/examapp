let domain = "http://localhost:3002";
import { AUTHSTATE } from '../contexts/authContext';
import { NOTIFICATIONSTATE } from '../contexts/notificationContext';
import authUtil from './auth';

let loadTestDeployed = (reducer:(args:any)=>{},authContext:{
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
} | null) => {
    fetch(`${domain}/organisation/test/getTestDeployed`,{
        method: "POST",
        credentials:"include"
    }).then(response => response.json())
    .then(data=>{
        if(data.success){
            reducer(data.data);
        }else if(data.error==='Expired Token!'){
            if(authContext?.authState && authContext?.authDispatch)
            authUtil.refreshTokenAndProcedd(authContext.authState,authContext.authDispatch,()=>{
                loadTestDeployed(reducer,authContext,notificationsContext);
            });
        }else if(notificationsContext){
            console.log(data.error);
            notificationsContext.notificationState.notifications.push("Something went wrong!");
            notificationsContext.notificationDispatch({
                type:"ADD_NOTIFICATION",
                payload:{
                    active:true,
                    notifications:notificationsContext.notificationState.notifications
                }
            });
        }
    }).catch(err =>{
        console.log(err);
    });
};

let loadLatestTests = (reducer:(args:any)=>{},authContext:{
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
} | null) => {
    fetch(`${domain}/organisation/test/getLatestTests`,{
        method: "POST",
        credentials:"include"
    }).then(response => response.json())
    .then(data=>{
        if(data.success){
            reducer(data.data);
        }else if(data.error==='Expired Token!'){
            if(authContext?.authState && authContext?.authDispatch)
            authUtil.refreshTokenAndProcedd(authContext.authState,authContext.authDispatch,()=>{
                loadLatestTests(reducer,authContext,notificationsContext);
            });
        }else if(notificationsContext){
            console.log(data.error);
            notificationsContext.notificationState.notifications.push("Something went wrong!");
            notificationsContext.notificationDispatch({
                type:"ADD_NOTIFICATION",
                payload:{
                    active:true,
                    notifications:notificationsContext.notificationState.notifications
                }
            });
        }
    }).catch(err =>{
        console.log(err);
    });
};

let loadLatestBatches = (reducer:(args:any)=>{},authContext:{
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
} | null) => {
    fetch(`${domain}/organisation/test/getLatestBatches`,{
        method: "POST",
        credentials:"include"
    }).then(response => response.json())
    .then(data=>{
        if(data.success){
            reducer(data.data);
        }else if(data.error==='Expired Token!'){
            if(authContext?.authState && authContext?.authDispatch)
            authUtil.refreshTokenAndProcedd(authContext.authState,authContext.authDispatch,()=>{
                loadLatestBatches(reducer,authContext,notificationsContext);
            });
        }else if(notificationsContext){
            console.log(data.error);
            notificationsContext.notificationState.notifications.push("Something went wrong!");
            notificationsContext.notificationDispatch({
                type:"ADD_NOTIFICATION",
                payload:{
                    active:true,
                    notifications:notificationsContext.notificationState.notifications
                }
            });
        }
    }).catch(err =>{
        console.log(err);
    });
};

export default {
  loadTestDeployed,
  loadLatestTests,
  loadLatestBatches,
};
