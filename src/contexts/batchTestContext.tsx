import react,{createContext,useReducer} from 'react';

export interface BatchTestState{
    _id: string, 
    name: string,
    dateOfCreation:string 
}

export interface TestState{
    _id: string,
    name:string,
    mcqQuestions: {
        question:string,
        options:string[],
        answer:string,
        id:string, 
    }[],
    progQuestions: {
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
    batches:string[],
    dateOfCreation: string,
    conductor: {
        status:boolean, 
        startDateTime:string, 
        endDateTime:string, 
        _id:string ,
        markPerQuestion:number, 
        noOfQuestions:number,
        randomiseQuestion:boolean,
        testTimeInMin:number
    }
}

let _batchesState:BatchTestState[]=[];
let _testsState:BatchTestState[]=[];

let batchReducer=(state:BatchTestState[],action:{
    type: string,
    payload:any
})=>{
    if(action.type === "LOAD"){
        return action.payload;
    }
    else
    return state;
}

let testReducer=(state:BatchTestState[],action:{
    type: string,
    payload:any
})=>{
    if(action.type === "LOAD"){
        return action.payload;
    }
    else
    return state;
}

export let BATCHTESTCONTEXT=createContext<{
    batchesState:BatchTestState[],
    testsState: BatchTestState[],
    batchesDispatcher:react.Dispatch<{
        type: string;
        payload: any;
    }>,
    testsDispatcher:react.Dispatch<{
        type: string;
        payload: any;
    }>
} | null>(null);

export default (props:{children:any})=>{

    let [batchesState,batchesDispatcher] = useReducer(batchReducer,_batchesState);
    let [testsState,testsDispatcher] = useReducer(testReducer,_testsState);

    return <BATCHTESTCONTEXT.Provider value={{
        batchesState,testsState,batchesDispatcher,testsDispatcher
    }}>
        {props.children}
    </BATCHTESTCONTEXT.Provider>
};