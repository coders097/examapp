import { createContext, useReducer } from "react";

export interface DIALOGSTATE{
    view:boolean,
    placeholder:string,
    question:string,
    getResult:(()=>Promise<any>) | null,
    parent:string
}

let state:DIALOGSTATE={
    view:false,
    placeholder:"",
    question:"",
    getResult:null,
    parent:""
};

let reducer=(state:DIALOGSTATE,action:{
    type: string, 
    payload:DIALOGSTATE
})=>{
    switch(action.type){
        case "LOADGETRESULTFUNC":
            return action.payload;

        case "RUN":
            return action.payload;

        case "CLOSE":
            return action.payload;

        default:
            return state;
    }
};

export let DIALOGCONTEXT=createContext<{
    dialogState:DIALOGSTATE,
    setDialogDispatch:React.Dispatch<{
        type: string;
        payload: DIALOGSTATE;
    }>
} | null>(null);

let _return=(props:any)=>{

    let [dialogState,setDialogDispatch]=useReducer(reducer,state);

    return <DIALOGCONTEXT.Provider value={{
        dialogState,
        setDialogDispatch
    }}>
        {props.children}
    </DIALOGCONTEXT.Provider>;
}

export default _return;