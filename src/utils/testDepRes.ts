import * as xlsx from 'xlsx';
import { AUTHSTATE } from "../contexts/authContext";
import { TestState } from "../contexts/batchTestContext";
import { NOTIFICATIONSTATE } from "../contexts/notificationContext";
import authUtil from './auth';
let domain="http://localhost:3002";

let deployTest=({testId,authContext,notificationsContext,setViewLayout,viewData}:{
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
    viewData:TestState
})=>{
    fetch(`${domain}/organisation/test/deployOrSuspendTest`,{
        method: "POST",
        credentials:"include",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            testId:testId
        })
    }).then(response =>response.json())
    .then(data=>{
        if(data.success){
            viewData.conductor.status=data.data;
            setViewLayout({
                view:1,
                data:{...viewData}
            });
        }else if(data.error==='Expired Token!'){
            if(authContext?.authState && authContext?.authDispatch)
            authUtil.refreshTokenAndProcedd(authContext.authState,authContext.authDispatch,()=>{
                deployTest({authContext,notificationsContext,setViewLayout,testId,viewData});
            });
        }else if(notificationsContext){
            console.log(data.error);
            notificationsContext.notificationState.notifications.push(data.error);
            notificationsContext.notificationDispatch({
                type:"ADD_NOTIFICATION",
                payload:{
                    active:true,
                    notifications:notificationsContext.notificationState.notifications
                }
            });
        }
    }).catch(error =>{
        console.error(error);
    });
}

let downloadPasskeys=({testId,authContext,notificationsContext}:{
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
    } | null
})=>{
    fetch(`${domain}/organisation/test/getPasskeys`,{
        method: 'POST',
        credentials:"include",
        headers:{
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            testId:testId
        })
    }).then(response =>response.json())
    .then(data =>{
        if(data.success){
            let renderData=data.data.map((line:string) =>{
                let obj:{[key:string]:any}={};
                let parts=line.split("<$>");
                obj["Name"]=parts[0];
                obj["Email"]=parts[1];
                obj["Regd"]=parts[2];
                obj["Passkey"]=parts[3];
                return obj;
            });
            let wb=xlsx.utils.book_new();
            let ws=xlsx.utils.json_to_sheet(renderData);
            xlsx.utils.book_append_sheet(wb,ws,"MySheet1");
            xlsx.writeFile(wb,"Passkeys"+Date.now()+".xlsx");
        }else if(data.error==='Expired Token!'){
            if(authContext?.authState && authContext?.authDispatch)
            authUtil.refreshTokenAndProcedd(authContext.authState,authContext.authDispatch,()=>{
                downloadPasskeys({authContext,notificationsContext,testId});
            });
        }else if(notificationsContext){
            console.log(data.error);
            notificationsContext.notificationState.notifications.push(data.error);
            notificationsContext.notificationDispatch({
                type:"ADD_NOTIFICATION",
                payload:{
                    active:true,
                    notifications:notificationsContext.notificationState.notifications
                }
            });
        }
    }).catch(err =>{
        console.error(err);
    });
}

let downloadResults=(dataStr:string) =>{
    dataStr=dataStr.trim();
    let commands=dataStr.replace(/\r/g,"").split("\n");

    let i=0;
    let recur=(results:any[])=>{
        if(i>=commands.length) return;
        if(commands[i].startsWith("::")){
            i++;
            return;
        }
        if(commands[i].startsWith("CANDIDATES")){
            let result:any[]=[];
            i++;
            recur(result);
            results.push({
                type: "CANDIDATES",
                data:result
            });
            recur(results);
        }else if(commands[i].startsWith("TYPE")){
            let command=commands[i];
            let result:any[]=[];
            i++;
            recur(result);
            results.push({
                type:"TYPE",
                name:command.split(" ")[2]+" "+command.split(" ")[3],
                data:result
            });
            recur(results);
        }else if(commands[i].startsWith("BATCH")){
            let command=commands[i];
            let result:any[]=[];
            i++;
            recur(result);
            results.push({
                type:"BATCH",
                name:command.split(" ")[2],
                data:result
            });
            recur(results);
        }else{
            // results.push(commands[i++]);
            let parts=commands[i++].split(" ");
            results.push({
                type:"CANDIDATE",
                sr:parts[0].replace(".",""),
                name:parts[1],
                regd:parts[2],
                email:parts[3],
                marks:parts[6]
            })
            recur(results);
        }
    }

    let _results:any[]=[];
    while(i<commands.length){
        recur(_results);
    }

    let results:{[key: string]:string}[]=[];
        let addObj=(obj:{
        TYPE: string,
        BATCH: string,
        SR: string,
        NAME: string,
        REGD: string,
        EMAIL: string,
        MARKS: string
        })=>{
        results.push(obj);
    };

    _results.forEach((types:any)=>{
        addObj({
            TYPE:types.name,
            BATCH:"",
            SR:"#########",
            NAME:"#########",
            REGD:"#########",
            EMAIL:"#########",
            MARKS:"#########",
        });
        types.data.forEach((batch:any)=>{
            addObj({
            BATCH:batch.name,
            EMAIL:"#########",
            MARKS:"#########",
            NAME:"#########",
            REGD:"#########",
            SR:"#########",
            TYPE:""
            });
            batch.data.forEach((candidates:any)=>{
                candidates.data.forEach((candidate:any)=>{
                    addObj({
                    BATCH:"",
                    TYPE:"",
                    EMAIL:candidate.email,
                    MARKS:candidate.marks,
                    NAME:candidate.name,
                    REGD:candidate.regd,
                    SR:candidate.sr
                    });
                });
            });
        });
    });


    let wb=xlsx.utils.book_new();
    let ws=xlsx.utils.json_to_sheet(results);
    xlsx.utils.book_append_sheet(wb,ws,"Results");
    xlsx.writeFile(wb,"Results"+Date.now()+".xlsx");
}

let getResults=({testId,button,authContext,notificationsContext}:{
    testId:string,
    button:HTMLButtonElement,
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
    } | null
})=>{
    fetch(`${domain}/organisation/test/getTestResults`,{
        method:"POST",
        headers:{
            'Content-Type':'application/json'
        },
        credentials: 'include',
        body:JSON.stringify({
            testId:testId
        })
    }).then(response=>response.json())
    .then(data=>{
        button.classList.remove("btn-loading");
        if(data.success){
            if((data.data=='RESULT GENERATION IN PROGRESS') || (data.data=='RESULT GENERATION STARTED')){
                if(notificationsContext){
                    notificationsContext.notificationState.notifications.push(data.data);
                    notificationsContext.notificationDispatch({
                        type:"ADD_NOTIFICATION",
                        payload:{
                            active:true,
                            notifications:notificationsContext.notificationState.notifications
                        }
                    });
                }
            }else{
                downloadResults(data.data);
            }
        }else if(data.error==='Expired Token!'){
            if(authContext?.authState && authContext?.authDispatch)
            authUtil.refreshTokenAndProcedd(authContext.authState,authContext.authDispatch,()=>{
                getResults({authContext,button,testId,notificationsContext});
            });
        }else if(notificationsContext){
            console.log(data.error);
            notificationsContext.notificationState.notifications.push("FAILED TO GET RESULTS :(");
            notificationsContext.notificationDispatch({
                type:"ADD_NOTIFICATION",
                payload:{
                    active:true,
                    notifications:notificationsContext.notificationState.notifications
                }
            });
        }
    }).catch(error=>{
        button.classList.remove("btn-loading");
        alert(error);
    });
}

export default {
    deployTest,downloadPasskeys,getResults
}