import { AUTHSTATE } from "../contexts/authContext";

let domain="http://localhost:3002";

let orgaExamList=(setOrgExamInfo:any)=>{
    fetch(`${domain}/candidate/getOrgaExams`).then(response=>response.json())
    .then(data=>{
        if(data.success){
            setOrgExamInfo(data.data);
        }else console.log(data.error);
    }).catch(error=>{
        console.log(error);
    })
}

let getOrgaNamePic=(setOrganisationInfo: React.Dispatch<React.SetStateAction<{
    name: string;
    pic: string;
    _id: string;
    testName: string;
}>>,testName: string,organisationId:string)=>{
    let params=new URLSearchParams({
        orgaId:organisationId
    });
    fetch(`${domain}/candidate/getOrgaNamePic?${params.toString()}`)
        .then((response=>response.json()))
        .then(data=>{
            if(data.success){
                setOrganisationInfo({
                    ...data.data,
                    testName:testName
                });
            }else console.log(data.error);
        }).catch(error=>{
            console.log(error);
        });
}

let getQuestionSet=(setQuestionSet: React.Dispatch<React.SetStateAction<{
    programmingQuestions: {
        question: {
            title: string;
            description: string;
            examples: {
                input: string;
                output: string;
            }[];
        };
        testCasesFile: string;
        outputsFile: string;
        _id: string;
    }[];
    mcqQuestions: {
        question: string;
        options: string[];
        answer: string;
        id: string;
    }[];
    testTimeInMin: number;
}>>,testId: string)=>{
    fetch(`${domain}/candidate/getQuestionSet`,{
        method:"POST",
        credentials:"include",
        headers:{
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            testId:testId
        })
    }).then(response=>response.json())
    .then(data=>{
        if(data.success){
            data.data.testTimeInMin=parseInt(data.data.testTimeInMin+"");
            setQuestionSet(data.data);
        }else console.log(data.error);
    }).catch(error=>{
        console.error(error);
    })
};

let submitAnswers=({passkey,name,regdNo,answerSheet,testId,authContext,button}:{
    passkey?:string,
    name?:string,
    regdNo?:string,
    answerSheet:{
        prog: {
            _id: string;
            code: string;
        }[];
        mcq: {
            id: string;
            answer: string;
        }[];
    },
    testId?:string,
    authContext:{
        authState: AUTHSTATE;
        authDispatch: React.Dispatch<{
            type: string;
            payload: AUTHSTATE;
        }>;
    } | null
    button:HTMLButtonElement
})=>{
    // passkey,name,regdNo,answerSheet,testId    btn-loading
    fetch(`${domain}/candidate/submitAnswers`,{
        method: 'POST',
        headers:{
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            passkey,name,regdNo,answerSheet,testId
        })
    }).then(response=>response.json())
    .then(data=>{
        if(data.success){
            authContext?.authDispatch({
                type:"CANDI_LOGOUT",
                payload:{} as AUTHSTATE
            });
        }else{
            console.log(data.error);
            button.classList.remove("btn-loading");
        }
    }).catch(error=>{
       button.classList.remove("btn-loading");
    });
}

export default {
    orgaExamList,getOrgaNamePic,getQuestionSet,submitAnswers
}