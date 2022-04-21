import express from 'express';
import Organisation from '../models/Organisation';
import E from '../controller/errors';
import Test from '../models/Test';
import Conductor from '../models/Conductor';
import Result from '../models/Result';

let shuffle=(arr:any[]) =>{
    let rounds=15;
    while(rounds-->0){
        let i=Math.floor(Math.random()*arr.length);
        let j=Math.floor(Math.random()*arr.length);
        if(i<arr.length && j<arr.length){
            let temp=arr[i];
            arr[i]=arr[j];
            arr[j]=temp;
        }
    }
}

let getOrgaExams=(req:express.Request, res: express.Response)=>{
    let pipeline=[
        {
          $lookup: {
            from: "tests",
            localField: "tests",
            foreignField: "_id",
            as: "tests",
            pipeline: [
              {
                $lookup: {
                  from: "conductors",
                  localField: "conductor",
                  foreignField: "_id",
                  as: "conductor",
                },
              },
              { $unwind: "$conductor" },
              { $match: { "conductor.status": true } },
            ],
          },
        },
        {
          $unset: [
            "batches",
            "notifications",
            "keepMeLoggedIn",
            "password",
            "phone",
            "email",
            "pic",
            "__v",
            "tests.batches",
            "tests.mcqQuestions",
            "tests.progQuestions",
            "tests.__v",
            "tests.conductor",
          ],
        },
    ];
    Organisation.aggregate(pipeline).then((results)=>{
        res.status(200).json({success:true,data:results});
    }).catch((error)=>{
        console.error(error);
        E.internalServerError(res);
    })
}

let orgaNamePic=async (req:express.Request, res: express.Response)=>{
    let {orgaId}=req.query;
    try{
        let organisation=await Organisation.findById(orgaId);
        if(organisation){
            res.status(200).json({
                success:true,
                data:{
                    name:organisation.name,
                    pic:organisation.pic,
                    _id:organisation._id
                }
            });
        }else E.notFoundError(res);
    }catch(err){
        E.internalServerError(res);
    }
}

let getQuestionSet=async (req:express.Request, res: express.Response)=>{
    let {testId}=req.body;
    try{
        let test=await Test.findById(testId).populate("conductor");
        if(test){
            let programmingQuestions=test.progQuestions;
            let mcqQuestions:any=[];
            let noOfQuestions=test.conductor.noOfQuestions;
            let testTimeInMin=test.conductor.testTimeInMin;
            let randomiseQuestion=test.conductor.randomiseQuestion;
            let allMCQs:any[]=test.mcqQuestions;
            if(randomiseQuestion){
                shuffle(programmingQuestions);
                shuffle(allMCQs);
            }
            mcqQuestions=allMCQs.slice(0,noOfQuestions);
            mcqQuestions.forEach((mcq:any)=>{
                mcq.answer="";
            });
            res.status(200).json({
                success:true,
                data:{
                    programmingQuestions:programmingQuestions,
                    mcqQuestions:mcqQuestions,
                    testTimeInMin:testTimeInMin
                }
            })
        }else E.notFoundError(res);
    }catch(err){
        E.internalServerError(res);
    }
}

let submitAnswers=async (req:express.Request, res: express.Response)=>{
    let {passkey,name,regdNo,answerSheet,testId}=req.body;
    if(!passkey || !name || !regdNo || !answerSheet || !testId){
        E.badRequestError(res);
        return;
    }
    try{
        let test=await Test.findById(testId);
        let conductor=await Conductor.findById(test.conductor);
        if(test && conductor) {
            // Check passkey
            let passkeys:string[] = conductor.passkeys;
            passkeys = passkeys.filter(passkey => passkey.includes(name as string) && passkey.includes(regdNo as string) && passkey.includes(passkey as string));
            if(passkeys.length == 1){
                // ADD the result
                let resultId=conductor.results;
                if(!resultId) {
                    res.status(500).json({
                        success:false,
                        error:"Critical Error Result Set Not Found!"
                    });
                    return;
                }
                await Result.updateOne(
                    { '_id': resultId }, 
                    { $pull: { results: { id: 23 } } },{
                        upsert:false
                    }
                );
                Result.findByIdAndUpdate(resultId,{
                    $push:{"results":{
                        name:name,
                        regdNo:regdNo,
                        answerSheet:answerSheet
                    }}
                },{
                    new:true
                }).then(()=>{
                    // Delete passkey
                    passkeys = conductor.passkeys;
                    passkeys = passkeys.filter(passkey => !(passkey.includes(regdNo) && passkey.includes(passkey)));
                    conductor.passkeys=passkeys;
                    conductor.save().then(()=>{
                        res.status(200).json({
                            success:true
                        });
                    }).catch(()=>{
                        E.internalServerError(res);
                    });
                }).catch(err=>{
                    console.log(err);
                    E.internalServerError(res);
                });
            }else{ E.notFoundError(res); } 
        }else E.notFoundError(res);
    }catch(err){
        E.internalServerError(res);
    }
}

export default {
    getOrgaExams,orgaNamePic,getQuestionSet,submitAnswers
}