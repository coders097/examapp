import {createContext, useReducer} from 'react';

export interface NOTIFICATIONSTATE{
    active: boolean;
    notifications:string[];
}

let state:NOTIFICATIONSTATE={
    active:false,
    notifications:[]
};

let reducer=(state:NOTIFICATIONSTATE,action:{
    type:string,
    payload:NOTIFICATIONSTATE
})=>{
    switch(action.type){

        case "ADD_NOTIFICATION":
            return action.payload;
        case "LOAD_NOTIFICATIONS":
            return action.payload;
        case "OPEN_CLOSE_NOTIFICATION_VIEW":
            return action.payload;

        default:
            return state;
    }
}

export let NOTIFICATIONCONTEXT=createContext<{
    notificationState:NOTIFICATIONSTATE,
    notificationDispatch:React.Dispatch<{
        type: string;
        payload: NOTIFICATIONSTATE;
    }>
} | null>(null);

let _toReturn=(props:any)=>{

    let [notificationState,notificationDispatch]=useReducer(reducer,state);

    return <NOTIFICATIONCONTEXT.Provider value={{notificationState,notificationDispatch}}>
        {props.children}
    </NOTIFICATIONCONTEXT.Provider>;
}

export default _toReturn; 