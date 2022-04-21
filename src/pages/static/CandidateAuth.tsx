import React, { createRef, useContext, useEffect, useState } from "react";
import "../../styles/candidate/Auth.scss";
import Logo from "../../assets/logo.png";
import OrgLogo from "../../assets/nanotech.png";
import Form from "../../components/Form";
import candidateUtil from '../../utils/candidate';
import authUtil from '../../utils/auth';
import { AUTHCONTEXT } from "../../contexts/authContext";
import { useNavigate } from "react-router-dom";

let styles={
  option:{
    width: "100%",
    padding:"16px 18px",
    fontSize:"1.2rem"
  },
  select:{
    width: "100%",
    padding:"16px 18px",
    fontSize:"1.2rem",
    borderRadius: "6px",
    border: "solid rgb(158, 158, 158) 1.5px",
    outline: "none"
  }
}

const CandidateAuth = () => {

  let authContext=useContext(AUTHCONTEXT);
  let [selectedOrg,setSelectedOrg]=useState("");
  let navigate=useNavigate();
  let orgaSelect=createRef<HTMLSelectElement>();
  let examSelect=createRef<HTMLSelectElement>();

  let [orgExamInfo,setOrgExamInfo]=useState<{
    name: string,
    _id?: string,
    tests: {
      _id: string,
      name: string,
      dateOfCreation: string
      }[],
    dateOfCreation:string
  }[]>([]);

  useEffect(()=>{
      if(authContext?.authState.login && authContext?.authState.loginType==='candidate'){
        let testName="";
        let orgaId=selectedOrg;
        let testId=examSelect.current?.value;

        orgExamInfo.forEach((org)=>{
          if(org._id==orgaId){
            org.tests.forEach((test)=>{
              if(test._id==testId){
                testName = test.name;
              }
            })
          }
        });


        navigate("/candidate",{
          state:{
            _id:selectedOrg,
            testName:testName,
          }
        });
      }
  },[authContext]);

  useEffect(()=>{
    candidateUtil.orgaExamList(setOrgExamInfo);
  },[]);


  let giveExam=(obj:any)=>{
    let data:{[key:string]:any}={};
    data["name"]=obj.name;
    data["regd"]=obj.phone;
    data["key"]=obj.password;
    if(examSelect.current)
      data["testId"]=examSelect.current.value;
    
    if(data["testId"]=="Choose") {
      alert("Choose Fields!");
      return;
    }
    
    authUtil.loginCandidate({
      data:data as {
        name:string,
        regd:string,
        key:string,
        testId:string
      },
      authDispatch:authContext?.authDispatch
    });
  }
  return (
    <section className="CandidateAuth">
      <div className="logo">
        <img alt="main-logo" src={Logo} />
        <h2>Treno</h2>
        <img alt="org-logo" src={OrgLogo} />
      </div>
      <div className="content">
        <Form styling="form-google"
            name={{
                hint:"Candidate's Name",
                required:true,
            }}
            phone={{
                hint:"Candidate's Regdno",
                required:true
            }}
            password={{
                hint:"Passkey",
                checkRegex:"[0-9a-zA-Z]{7}",
                errorMessage:"Enter Valid Passkey!"
            }}
            submitClassName="btn btn-blue"
            submitName="Give Exam"
            onSubmitCallback={(e:any)=>giveExam(e)}
        >
          <select style={styles.select} ref={orgaSelect} onChange={e=>{
            setSelectedOrg(e.target.value);
          }}>
            <option style={styles.option} value="Choose">Select Organisation</option>
            {orgExamInfo.map((organisation,i)=>{
              return <option key={i} style={styles.option} value={organisation._id}>{organisation.name}</option>;
            })}
          </select>
          <select style={styles.select} ref={examSelect}>
            <option style={styles.option} value="Choose">Select Exam</option>
            {orgExamInfo.filter(organisation=>organisation._id==selectedOrg).map((organisation,i)=>{
              return <React.Fragment key={i}>
                {organisation.tests.map((test,i)=>{
                  return <option key={i} style={styles.option} value={test._id} >{test.name}</option>;
                })}
              </React.Fragment>
            })}
          </select>

        </Form>
      </div>
    </section>
  );
};

export default CandidateAuth;
