import React, { useContext, useEffect, useState } from 'react';
import '../../styles/organisation/Auth.scss';
import Logo from "../../assets/logo.png";
import Form from "../../components/Form";

import utils from '../../utils/auth';
import { AUTHCONTEXT } from '../../contexts/authContext';
import { useNavigate } from 'react-router-dom';

const OrganisationAuth = () => {

    let [logInView,setLogInView]=useState(false);
    let authContext=useContext(AUTHCONTEXT);
    let navigate=useNavigate();

    useEffect(()=>{
        utils.loginOrganization({
            email:"",
            password:""
        },authContext?.authDispatch);
    },[]);

    useEffect(()=>{
        // console.log(authContext?.authState);
        if(authContext?.authState.login){
            if(authContext?.authState.loginType==='organisation'){
                navigate("/organisation");
            }
        }
    },[authContext?.authState]);

    return (
        <section className="OrganisationAuth">
            <div className="logo">
                <img alt="main-logo" src={Logo} />
                <h2>Treno</h2>
            </div>
            <div className="content">
                <div className="menu">
                    <p className={logInView?"":"active"} onClick={()=>setLogInView(false)}>Signup</p>
                    <p className={logInView?"active":""} onClick={()=>setLogInView(true)}>Signin</p>
                </div>
                {logInView?
                <Form styling="form-google"
                    email={{
                        hint:"Organisation's Email",
                        required:true,
                    }}
                    password={{
                        hint:"Password",
                        errorMessage:"Enter Valid Password!"
                    }}
                    submitClassName="btn btn-blue"
                    submitName="Signin"
                    onSubmitCallback={(data:any)=>utils.loginOrganization(data,authContext?.authDispatch)}
                ></Form>
                :<Form styling="form-google"
                    name={{
                        hint:"Organisation's Name",
                        required:true,
                    }}
                    email={{
                        hint:"Organisation's Email",
                        required:true,
                    }}
                    phone={{
                        hint:"Organisation's Phone",
                        required:true
                    }}
                    password={{
                        hint:"Password",
                        errorMessage:"Enter Valid Password!"
                    }}
                    submitClassName="btn btn-blue"
                    submitName="Signup"
                    onSubmitCallback={(data:any)=>utils.signupOrganization(data,authContext?.authDispatch)}
                ></Form>}
            </div>
        </section>
    );
};

export default OrganisationAuth;