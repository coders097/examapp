import React, { createRef, useContext, useEffect } from 'react';
import '../styles/DialogBox.scss';
import TestLogo from '../assets/test.png';
import { DIALOGCONTEXT } from '../contexts/dialogContext';

const Dialog = () => {

    let dialogContext=useContext(DIALOGCONTEXT);

    function returnFunc(resolve:any, reject:any) {
        document.getElementById("buttonSuccessDialogBtn")?.addEventListener("click",()=>{
            let inputText=(document.getElementById("inputDialog") as HTMLInputElement)?.value;
            dialogContext?.setDialogDispatch({
                type: "CLOSE",
                payload:{
                    ...dialogContext.dialogState,
                    view:false
                }
            });
            resolve({
                status: true,
                text:inputText
            });
        });
        document.getElementById("buttonFailureDialogBtn")?.addEventListener("click",()=>{
            dialogContext?.setDialogDispatch({
                type: "CLOSE",
                payload:{
                    ...dialogContext.dialogState,
                    view:false
                }
            });
            reject({
                status: false
            });
        });
    }

    function getResult(){
        return new Promise(returnFunc);
    }

    useEffect(() =>{
        if(!dialogContext?.dialogState.getResult){
            dialogContext?.setDialogDispatch({
                type:"LOADGETRESULTFUNC",
                payload:{
                    ...dialogContext.dialogState,
                    getResult:getResult
                }
            });
        }
    },[dialogContext]);

    return (
        dialogContext?.dialogState.view?
        <div className="DialogBox DialogBox-popup">
            <img alt="" src={TestLogo}/>
            <h2>{dialogContext?.dialogState.question}</h2>
            <input type="text" id="inputDialog" placeholder={dialogContext?.dialogState.placeholder} />
            <div className="btn-holder">
                <button className="btn btn-red" id="buttonFailureDialogBtn"><span>CANCEL</span></button>
                <button className="btn btn-blue" id="buttonSuccessDialogBtn"><span>SUBMIT</span></button>
            </div>
        </div>:<></>
    );
};

export default Dialog;