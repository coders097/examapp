import { createContext ,useReducer } from 'react';

export interface AUTHSTATE{
    login: boolean;
    loginType: "organisation" | "candidate";
    orgData: {
        name: string;
        email: string;
        phone: string;
        pic:string;
        _id: string;
        notificationMode: boolean;
        keepMeLoggedIn: boolean;
    };
    candiData: {
        name?:string,
        email?:string,
        regd?:string,
        testId?:string,
        key?:string
    };
};

let state:AUTHSTATE={
    login:false,
    loginType:"organisation",
    orgData:{
        name:"",
        email:"",
        phone:"",
        pic:"",
        _id:"",
        notificationMode:true,
        keepMeLoggedIn:true
    },
    candiData:{
        name:"",
        email:"",
        regd:"",
        testId:""
    }
};

let reducer=(state:AUTHSTATE,action:{
    type:string,
    payload:AUTHSTATE
}) =>{
    switch(action.type){

        case "CANDI_LOGIN":
            return action.payload;

        case "CANDI_LOGOUT":
            return {
                login:false,
                loginType:"organisation",
                orgData:{
                    name:"",
                    email:"",
                    phone:"",
                    pic:"",
                    _id:"",
                    notificationMode:true,
                    keepMeLoggedIn:true
                },
                candiData:{}
            } as AUTHSTATE;

        case "ORG_LOGIN":
            return action.payload;

        case "ORG_LOGOUT":
            return {
                login:false,
                loginType:"organisation",
                orgData:{
                    name:"",
                    email:"",
                    phone:"",
                    pic:"",
                    _id:"",
                    notificationMode:true,
                    keepMeLoggedIn:true
                },
                candiData:{}
            } as AUTHSTATE;

        case "ORG_UPDATE":
            return action.payload;

        default:
            return state;
    
    }
};

export let AUTHCONTEXT=createContext<{ 
    authState:AUTHSTATE,
    authDispatch:React.Dispatch<{
        type: string;
        payload: AUTHSTATE;
    }>
} | null>(null);

let _toReturn=(props:any)=>{
    let [authState,authDispatch]=useReducer(reducer,state);
    return <AUTHCONTEXT.Provider value={{authState,authDispatch}}>
        {props.children}
    </AUTHCONTEXT.Provider>;
};

export default _toReturn;