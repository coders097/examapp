import React, { createRef, useContext, useEffect, useState } from 'react';
import '../../styles/organisation/Settings-org.scss';
import OrgLogo from '../../assets/nanotech.png';
import { AUTHCONTEXT } from '../../contexts/authContext';
import { DIALOGCONTEXT } from '../../contexts/dialogContext';
import { NOTIFICATIONCONTEXT } from '../../contexts/notificationContext';

import utils from '../../utils/auth';
let domain="http://localhost:3002";

const Settings = () => {

    let authContext=useContext(AUTHCONTEXT);
    let dialogContext=useContext(DIALOGCONTEXT);
    let notificationContext=useContext(NOTIFICATIONCONTEXT);
    let [picFile,setPicFile]=useState<File | null>(null);
    let picFileInput=createRef<HTMLInputElement>();
    let notificationCheck=createRef<HTMLInputElement>();
    let loggedInCheck=createRef<HTMLInputElement>();

    let nameRef=createRef<HTMLInputElement>();
    let emailRef=createRef<HTMLInputElement>();
    let phoneRef=createRef<HTMLInputElement>();
    let passwordRef=createRef<HTMLInputElement>();
    let [profileState,setProfileState]=useState<{
        name:string,email:string,phone:string,password:string
    }>({name:"",email:"",phone:"",password:""});

    useEffect(()=>{
        if(authContext){
            if(notificationCheck.current)
                notificationCheck.current.checked=authContext.authState.orgData.notificationMode;
            if(loggedInCheck.current)
                loggedInCheck.current.checked=authContext.authState.orgData.keepMeLoggedIn;
            if(passwordRef.current)
                passwordRef.current.value="";
            setPicFile(null);
        }
    },[authContext?.authState]);

    let updateSettings=(role:string) => {
        switch(role) {
            case "reset":
                    utils.settings(authContext,notificationContext,{
                        resetFlag:true
                    });
                break;
            case "save":
                    if(loggedInCheck.current && notificationCheck.current)
                        utils.settings(authContext,notificationContext,{
                            keepMeLoggedInFlag:loggedInCheck.current.checked,
                            notificationFlag:notificationCheck.current.checked
                        });
                break;
            case "delete":
                dialogContext?.setDialogDispatch({
                    type:"RUN",
                    payload:{
                        getResult:dialogContext.dialogState.getResult,
                        placeholder:"Enter your current password and then type <$>DELETE",
                        question:"Do you wanna delete this account?",
                        view:true,
                        parent:"DELETEPROFILE"
                    }
                });
                break;
            default:
                return "";
        }
    };

    let updateProfile=(oldPassword:string)=>{
        let details:{[key:string]:any}={};
        if(profileState.name!="" && profileState.name!==authContext?.authState.orgData.name){
            let name=profileState.name;
            if(name!=""){
                details.name=name;
            }
        }
        details.oldPassword=oldPassword;
        details.picFile=picFile;
        
        if(profileState.phone!="" && profileState.phone!=authContext?.authState.orgData.phone){
            let phone=profileState.phone;
            if(phone.length>=10){
                details.phone=phone;
            }
        }

        if(profileState.email!="" && profileState.email!==authContext?.authState.orgData.email){
            details.email=profileState.email;
        }

        if(profileState.password!=""){
            if(!(profileState.password.length>5)){
                alert("Please provide valid password!");
                return;
            }
            details.password=profileState.password;
        }
        utils.updateOrganizationProfile(authContext,notificationContext,details);
    };

    useEffect(()=>{
        if(dialogContext?.dialogState.view && dialogContext?.dialogState.parent==="SETTINGS"){
            if(dialogContext.dialogState.getResult)
            dialogContext.dialogState.getResult().then((result:any)=>{
                if(result.status){
                    //oldpassword -> result.text
                    updateProfile(result.text);
                }
            }).catch((error)=>{
                console.log(error);
            });
        }
        if(dialogContext?.dialogState.view && dialogContext?.dialogState.parent==="DELETEPROFILE"){
            if(dialogContext.dialogState.getResult)
            dialogContext.dialogState.getResult().then((result:any)=>{
                if(result.status){
                    if((result.text as string).includes("<$>DELETE")){
                        let index=(result.text as string).indexOf("<$>DELETE");
                        if(index+'<$>DELETE'.length===(result.text as string).length)
                            utils.deleteProfile(authContext,result.text);
                        else alert("Enter properly to delete!");
                    }else alert("Enter properly to delete!");
                }
            }).catch((error)=>{
                console.log(error);
            })
        }

    },[ dialogContext]);

    return (
        <div className="Settings-org">
            <h2>Basic Details</h2>
            <img src={
                authContext?.authState.orgData.pic===""?OrgLogo:`${domain}/auth/organisation/getPic?${authContext?
                    (new URLSearchParams({pic:authContext.authState.orgData.pic}).toString()):""}`
            } alt="org-logo" onError={e=>{
                console.log("pic error");
                (e.target as HTMLImageElement).src=OrgLogo;
            }}/>
            <div className="box">
                <p>Name</p>
                <input type="text" ref={nameRef} defaultValue={authContext?.authState.orgData.name}/>
            </div>
            <div className="box">
                <p>Email</p>
                <input type="email" ref={emailRef} defaultValue={authContext?.authState.orgData.email}/>
            </div>
            <div className="box">
                <p>Password</p>
                <input type="password" ref={passwordRef} placeholder="Enter new password if you wanna change..."/>
            </div>
            <div className="box">
                <p>Phone</p>
                <input type="number" ref={phoneRef} defaultValue={authContext?.authState.orgData.phone}/>
            </div>
            <div className="control">
                <input ref={picFileInput} type="file" style={{display:"none"}} onChange={(e)=>{
                    if(e.target.files){
                        if(e.target.files.length>0){
                            setPicFile(e.target.files[0]);
                        }else setPicFile(null);
                    }
                }}/>
                <button className="btn btn-pale" onClick={()=>picFileInput.current?.click()}><span>Change Pic</span></button>
                {picFile && <p>New Pic Selected</p>}
                <button className='btn btn-blue' onClick={()=>{
                    if(nameRef.current && emailRef.current && phoneRef.current && passwordRef.current){
                        if(emailRef.current.value.trim().length>0){
                            if(!emailRef.current.checkValidity()){
                                alert("Enter a valid email!");
                                return;
                            }
                        }
                        setProfileState({
                            name:nameRef.current.value.trim(),
                            email:emailRef.current.value.trim(),
                            phone:phoneRef.current.value.trim(),
                            password:passwordRef.current.value.trim()
                        });
                    }
                    dialogContext?.setDialogDispatch({
                        type:"RUN",
                        payload:{
                            getResult:dialogContext.dialogState.getResult,
                            placeholder:"Enter your current password...",
                            question:"Do you confirm this change?",
                            view:true,
                            parent:"SETTINGS"
                        }
                    });
                }}><span>Save</span></button>
            </div>

            <h2>Additional Preferences</h2>
            <div className="box">
                <p>Show Notifications</p>
                <label className="switch">
                    <input type="checkbox" ref={notificationCheck} defaultChecked={authContext?.authState.orgData.notificationMode}/>
                    <span className="slider round"></span>
                </label>
                <p>Keep me logged in </p>
                <label className="switch">
                    <input type="checkbox" ref={loggedInCheck} defaultChecked={authContext?.authState.orgData.keepMeLoggedIn}/>
                    <span className="slider round"></span>
                </label>
            </div>
            <div className="control">
                <button className="btn btn-pale" onClick={()=>updateSettings("reset")}><span>Reset</span></button>
                <button className="btn btn-pale" onClick={()=>updateSettings("save")}><span>SAVE</span></button>
                <button className="btn btn-red" onClick={()=>updateSettings("delete")}><span>Delete Profile</span></button>
            </div>
        </div>
    );
};

export default Settings;