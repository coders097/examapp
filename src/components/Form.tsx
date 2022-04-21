import React, { createRef } from 'react';
import '../styles/Form.scss';

const Form = (props:{
    // To Style
    styling:string,
    // Submit Functions
    onSubmitCallback?:Function,
    submitName?:string,
    submitClassName?:string,
    // Properties
    name?:{
        hint?:string,
        required?:boolean
    } | boolean,
    email?:{
        hint?:string,
        required?:boolean
    } | boolean,
    phone?:{
        hint?:string,
        required?:boolean
    } | boolean,
    password?:{
        hint?:string,
        checkRegex?:string,
        errorMessage?:string,
        checkFunction?:(password:string,errorMessRef:React.RefObject<HTMLSpanElement>) => boolean
    } | boolean, 
    picInput?:{
        required?:boolean,
        defaultPic?:string,
        defaultBackground?:string
    } | boolean,
    textArea?:{
        hint?:string,
        required?:boolean
    } | boolean,
    children?:any
}) => {

    let nameBoxRef=createRef<HTMLDivElement>();
    let nameFieldBoxRef=createRef<HTMLDivElement>();

    let emailBoxRef=createRef<HTMLDivElement>();
    let emailFieldBoxRef=createRef<HTMLDivElement>();

    let phoneBoxRef=createRef<HTMLDivElement>();
    let phoneFieldBoxRef=createRef<HTMLDivElement>();

    let passwordBoxRef=createRef<HTMLDivElement>();
    let passwordFieldBoxRef=createRef<HTMLDivElement>();
    let passwordErrorMessage=createRef<HTMLParagraphElement>();

    let picInputRef=createRef<HTMLInputElement>();
    let picViewRef=createRef<HTMLImageElement>();
    let picErrorMessage=createRef<HTMLParagraphElement>();

    let textAreaFieldBoxRef=createRef<HTMLDivElement>();

    return (
        <form className={props.styling}>
 
            {/* //Pic Input */}
            {props.picInput && <div className="pic-input-box">
                <input type="file" ref={picInputRef} style={{display:"none"}} onChange={(e)=>{
                    if(e.target.files && e.target.files.length>0){
                        let url=URL.createObjectURL(e.target.files[0]);
                        if(picViewRef.current) {
                            picViewRef.current.src=url;
                            (picViewRef.current.parentElement?.children[0] as HTMLDivElement).style.display="unset";
                            (picViewRef.current.parentElement?.children[1] as HTMLDivElement).style.display="none";
                        }                        
                        setTimeout(()=>{
                            URL.revokeObjectURL(url);
                        },2500);
                    }else{
                        if(picViewRef.current) {
                            (picViewRef.current.parentElement?.children[0] as HTMLDivElement).style.display="none";
                            (picViewRef.current.parentElement?.children[1] as HTMLDivElement).style.display="flex";
                        }
                    }
                }}/>
                <div>
                    <img alt="pic" src={((props.picInput instanceof Object) && props.picInput.defaultPic)?props.picInput.defaultPic:""} 
                        ref={picViewRef}
                        style={((props.picInput instanceof Object) && props.picInput.defaultPic)?{}:{display:"none"}}/>
                    <div style={((props.picInput instanceof Object) && props.picInput.defaultPic)?{display:"none"}:{}}>A</div>
                    <button onClick={(e)=>{
                        e.preventDefault();
                        picInputRef.current?.click();
                    }}>Select Pic</button>
                </div>
                <p ref={picErrorMessage} style={{display:"none"}}>Please select an image</p>
            </div>}

            {/* "Name" */}
            {props.name && <div className="input-box" ref={nameBoxRef}>
                <div className="input-field" ref={nameFieldBoxRef}>
                    <input type="text" placeholder=" " required={((props.name instanceof Object) && props.name.required)?true:false} onChange={(e)=>{ 
                        if(e.target.value.trim()==='') {
                            nameBoxRef.current?.classList.add("--show-error-message");
                            nameFieldBoxRef.current?.classList.add("--error");
                        }else{
                            nameBoxRef.current?.classList.remove("--show-error-message");
                            nameFieldBoxRef.current?.classList.remove("--error");
                        }
                    }}
                    onBlur={(e)=>{
                        if(picViewRef.current){
                            if(e.target.value.trim()!=='')
                            (picViewRef.current.parentElement?.children[1] as HTMLDivElement).innerHTML=e.target.value.trim()[0];
                        }
                    }}/>
                    <span>{((props.name instanceof Object) && props.name.hint)?props.name.hint:"Name"}</span>
                </div>
                <p className="--error-message">Please enter a valid name</p>
            </div>}

            {/* "Email" */}
            {props.email && <div className="input-box" ref={emailBoxRef}>
                <div className="input-field" ref={emailFieldBoxRef}>
                    <input type="email" placeholder=" " required={((props.email instanceof Object) && props.email.required)?true:false} onChange={(e)=>{ 
                        if(!e.target.checkValidity()) {
                            emailBoxRef.current?.classList.add("--show-error-message");
                            emailFieldBoxRef.current?.classList.add("--error");
                        }else{
                            emailBoxRef.current?.classList.remove("--show-error-message");
                            emailFieldBoxRef.current?.classList.remove("--error");
                        }
                    }}/>
                    <span>{((props.email instanceof Object) && props.email.hint)?props.email.hint:"Email"}</span>
                </div>
                <p className="--error-message">Please enter a valid email</p>
            </div>}

            {/* "Phone" */}
            {props.phone && <div className="input-box" ref={phoneBoxRef}>
                <div className="input-field" ref={phoneFieldBoxRef}>
                    <input type="number" placeholder=" " required={((props.phone instanceof Object) && props.phone.required)?true:false} onChange={(e)=>{ 
                        if(e.target.value.length<10) {
                            phoneBoxRef.current?.classList.add("--show-error-message");
                            phoneFieldBoxRef.current?.classList.add("--error");
                        }else{
                            phoneBoxRef.current?.classList.remove("--show-error-message");
                            phoneFieldBoxRef.current?.classList.remove("--error");
                        }
                    }}/>
                    <span>{((props.phone instanceof Object) && props.phone.hint)?props.phone.hint:"Phone"}</span>
                </div>
                <p className="--error-message">Please enter a valid number</p>
            </div>}

            {/* "Password" */}
            {props.password && <div className="input-box" ref={passwordBoxRef}>
                <div className="input-field" ref={passwordFieldBoxRef}>
                    <input type="password" placeholder=" " required={true}
                    pattern={((props.password instanceof Object) && props.password.checkRegex)?props.password.checkRegex:undefined}
                    onChange={(e)=>{
                        let check=false;
                        if((props.password instanceof Object) && props.password.checkRegex){
                            check=!e.target.checkValidity();
                        } else if((props.password instanceof Object) && props.password.checkFunction){
                            check=props.password.checkFunction(e.target.value,passwordErrorMessage);
                        } else{
                            if(e.target.value.trim()==="") check=true;
                        }
                        if(check) {
                            passwordBoxRef.current?.classList.add("--show-error-message");
                            passwordFieldBoxRef.current?.classList.add("--error");
                        }else{
                            passwordBoxRef.current?.classList.remove("--show-error-message");
                            passwordFieldBoxRef.current?.classList.remove("--error");
                        }
                    }}/>
                    <span>{((props.password instanceof Object) && props.password.hint)?props.password.hint:"Password"}</span>
                </div>
                <p className="--error-message" ref={passwordErrorMessage}>{((props.password instanceof Object) && props.password.errorMessage)?props.password.errorMessage:"Please enter a valid password"}</p>
            </div>}

            {/* "Details" */}
            {(props.textArea) && <div className="input-box">
                <div className="input-field" ref={textAreaFieldBoxRef}>
                    <textarea rows={2} placeholder=" " required={((props.textArea instanceof Object) && props.textArea.required)?props.textArea.required:false}/>
                    <span>{((props.textArea instanceof Object) && props.textArea.hint)?props.textArea.hint:"Details"}</span>
                </div>
                <p className="--error-message">Sorry:( this one is not available</p>
            </div>}

            {props.children}

            <button onClick={(e)=>{
                e.preventDefault();
                let data:{[key:string]:any}={};
                if(props.name){
                    data["name"]=(nameFieldBoxRef.current?.children[0] as HTMLInputElement).value;
                }
                if(props.email){
                    data["email"]=(emailFieldBoxRef.current?.children[0] as HTMLInputElement).value;
                }
                if(props.password){
                    data["password"]=(passwordFieldBoxRef.current?.children[0] as HTMLInputElement).value;
                }
                if(props.phone){
                    data["phone"]=(phoneFieldBoxRef.current?.children[0] as HTMLInputElement).value;
                }
                if(props.textArea){
                    data["details"]=(textAreaFieldBoxRef.current?.children[0] as HTMLTextAreaElement).value;
                }
                if(props.onSubmitCallback) props.onSubmitCallback(data);
            }} className={props.submitClassName?props.submitClassName:"submit-btn"}><span>{props.submitName?props.submitName:"Submit"}</span></button>  
        </form>
    );
};

export default Form;