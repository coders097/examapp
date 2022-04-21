import express from 'express';
import Test from '../models/Test';
import Conductor from '../models/Conductor';
import Result from '../models/Result';
import E from '../controller/errors';
import ResultGeneratorUtils from '../utils/ResultGenerator';
import * as fs from 'fs';
import * as path from 'path';


let deployOrSuspendTest= async (req:express.Request, res: express.Response)=>{
    // testId
    let {testId} = req.body;
    try{
        let test=await Test.findById(testId);
        if(test){
            let conductor=await Conductor.findById(test.conductor);
            if(!conductor.status){
                // checking test timing
                let currTime=Date.now();
                let startTime=new Date(conductor.startDateTime).getTime();
                let endTime=new Date(conductor.endDateTime).getTime();
                if((startTime>=endTime) || (currTime>endTime)){
                    res.status(400).json({
                        success: false,
                        error:"Invalid Test Times!"
                    });
                    return;
                }
                //
                conductor.status=true;
                // ******************** Create a result
                let result =await Result.create({results:[]});
                conductor.results=result._id;
            }else{
                conductor.status=false;
                conductor.passkeys=[];
            }
            conductor.save().then(()=>{
                res.status(200).json({
                    success: true,
                    data:conductor.status
                });
            }).catch((err:any)=>{
                E.internalServerError(res);
                return;
            });
        }else E.notFoundError(res);
    }catch(e){
        console.log(e);
        E.internalServerError(res);
    }
}

let randomKey=()=>{
    let alphabetSpace="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    let string="";
    for(let i=0;i<7;i++){
        let randomIndex=Math.floor(Math.random()*alphabetSpace.length);
        string+=alphabetSpace[randomIndex];
    }
    return string;
}

let getPasskeys=async (req:express.Request, res: express.Response)=>{
    let {testId} = req.body;
    try{
        let test=await Test.findById(testId).populate("batches");
        let conductor=await Conductor.findById(test.conductor);
        // if test is not deployed
        if(!conductor.status){
            res.status(400).json({
                success: false,
                error:"Test Not Deployed"
            });
            return;
        }
        let passkeys:string[]=[];
        // if not generated passkeys
        if(conductor.passkeys.length == 0){
            let batches=test.batches;
            let map=new Map();
            batches.forEach((batch:any)=>{
                batch.candidates.forEach((candidate:any)=>{
                    let key=randomKey();
                    while(map.has(key)){
                        key=randomKey();
                    }
                    map.set(key,true);
                    passkeys.push(candidate.name+"<$>"+candidate.email+"<$>"+candidate.regdNo+"<$>"+key);
                })
            });
            conductor.passkeys=passkeys;
            await conductor.save();
        }else passkeys=conductor.passkeys;
        res.status(200).json({
            success: true,
            data:passkeys
        });
    }catch(e){
        E.internalServerError(res);
    }
}

let getResults=async (req:express.Request, res: express.Response)=>{
    let {testId}=req.body;
    if(!testId) {
        E.badRequestError(res);
        return;
    }
    try{
        let test=await Test.findById(testId).populate("conductor").populate({
            path:"batches",
            select:"name candidates"
        });
        let resultId=test.conductor.results;
        if(!resultId){
            E.notFoundError(res);
            return;
        }

        let resultData="";
        try{
            let _data=fs.readFileSync(path.join(__dirname,"../../storage/results",resultId.toString()),'utf8');
            resultData=_data;
        }catch(e){
            let _data="RESULT GENERATION IN PROGRESS";
            try{
                fs.writeFileSync(path.join(__dirname,"../../storage/results",resultId.toString()),_data);
            }catch(e){
                E.internalServerError(res);
                return;
            }
            resultData="RESULT GENERATION STARTED";
        }

        res.status(200).json({success:true,data:resultData});

        if(resultData=='RESULT GENERATION STARTED'){

            let result=await Result.findById(resultId);
            if(result){
                let results:{
                    name: string,
                    regdNo:string,
                    answerSheet:{
                        prog:{
                            _id:string,
                            code:string
                        }[],
                        mcq:{
                            id:string,
                            answer:string
                        }[]
                    }
                }[]=result.results;
                let markPerQuestion=test.conductor.markPerQuestion;
                let batches:{
                    name:string,
                    candidates:{
                        name:string,
                        email:string,
                        regdNo: string
                    }[]
                }[]=test.batches;
                let mcqQuestions:{
                    answer:string,
                    id:string
                }[]=test.mcqQuestions;
                let progQuestions:{
                    _id:string,
                    testCasesFile:string,
                    outputsFile:string
                }[]=test.progQuestions;
    
                ResultGeneratorUtils.resultGenerator({
                    results,markPerQuestion,batches,mcqQuestions,progQuestions,resultId:resultId.toString(),noOfQuestions:test.conductor.noOfQuestions
                });
            }else{
                console.log("Result not found");
            }

        }

    }catch(e){
        console.log(e);
    }
}


export default {
    deployOrSuspendTest,getPasskeys,getResults
}