import express from 'express';
import Test from '../models/Test';
import E from '../controller/errors';
import Organisation from '../models/Organisation';
import Conductor from '../models/Conductor';
import xlsx from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import Batch from '../models/Batch';


let resultsOuputFunc=(data:Buffer)=>{
    let wb=xlsx.read(data);
    let ws=wb.Sheets[wb.SheetNames[0]];
    let batchData=xlsx.utils.sheet_to_json(ws);
    return batchData;
}

function idGen() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+S4());
};

let getTestData=async (req:express.Request, res: express.Response)=>{
    let {testId}=req.body;
    if(!testId) { 
        E.badRequestError(res);
        return;
    }
    try{
        let test=await Test.findById(testId).populate({
            path:"conductor",
            select:"status startDateTime endDateTime _id markPerQuestion noOfQuestions randomiseQuestion testTimeInMin"
        });
        if(test) {
            res.status(200).json({
                success: true,
                data:{
                    _id: test._id,
                    name:test.name,
                    mcqQuestions: test.mcqQuestions,
                    progQuestions: test.progQuestions,
                    batches: test.batches,
                    dateOfCreation: test.dateOfCreation,
                    conductor: test.conductor
                }
            });
        }else E.notFoundError(res);
    }catch(err){
        E.internalServerError(res);
    }
}

let addTest=async (req:express.Request, res: express.Response)=>{
    let {_id,testName} = req.body;
    if(!testName) {
        E.badRequestError(res);
        return;
    }
    try{
        let conductor = await Conductor.create({});
        let test=await Test.create({
            name:testName,
            conductor:conductor._id
        });
        let organization=await Organisation.findById(_id);
        if(test && organization){
            organization.tests.push(test._id);
            organization.save().then(() => {
                res.status(200).json({
                    success: true,
                    data:{
                        _id:test._id,
                        name: test.name,
                        dateOfCreation: test.dateOfCreation
                    }
                });
            }).catch(() =>{E.internalServerError(res)});
        }else E.notFoundError(res);
    }catch(e){
        E.internalServerError(res);
    }
}

// Commands
//    RENAME 
//    EDIT_PREFERENCES
let editTest=async (req:express.Request, res: express.Response)=>{
    let {testId,command,testName,startTime,endTime,batches,
        markPerQuestion,noOfQuestions,randomiseQuestion,testTimeInMin} = req.body;
    console.log(req.body);
    if(!testId || !command) {
        E.badRequestError(res);
        return;
    }
    let test=await Test.findById(testId);
    if(!test) {
        E.notFoundError(res);
        return;
    }
    try{
        if(command==='RENAME'){
            if(!testName) { E.badRequestError(res); return;}
            test.name=testName;
            test.save().then(() => { res.status(200).json({
                success: true,
                data:{
                    _id:test.id,
                    name:test.name,
                    dateOfCreation: test.dateOfCreation
                }
            }); }).catch(() => {E.internalServerError(res)});
        }else if(command==='EDIT_PREFERENCES'){
            if(!startTime || !endTime || !testTimeInMin || !batches || !markPerQuestion || !noOfQuestions || ((randomiseQuestion==undefined) || (randomiseQuestion==null))) 
                { E.badRequestError(res); return;}
            let conductor=await Conductor.findById(test.conductor);
            test.batches=batches;
            conductor.startDateTime=startTime;
            conductor.endDateTime=endTime;
            conductor.markPerQuestion=markPerQuestion;
            conductor.randomiseQuestion=randomiseQuestion;
            conductor.noOfQuestions=noOfQuestions;
            conductor.testTimeInMin=testTimeInMin;
            conductor.save()
                .then(() => {
                    test.save().then(() => { res.status(200).json({
                        success:true,
                        data:{
                            _id: test._id,
                            name:test.name,
                            mcqQuestions: test.mcqQuestions,
                            progQuestions: test.progQuestions,
                            batches: test.batches,
                            dateOfCreation: test.dateOfCreation,
                            conductor:{
                                status:conductor.status, 
                                startDateTime: conductor.startDateTime, 
                                endDateTime: conductor.endDateTime, 
                                _id: conductor._id, 
                                markPerQuestion: conductor.markPerQuestion, 
                                noOfQuestions: conductor.noOfQuestions, 
                                randomiseQuestion: conductor.randomiseQuestion,
                                testTimeInMin: conductor.testTimeInMin
                            }
                        }
                    }); }).catch((e:any) => {console.error(e);E.internalServerError(res)});
                }).catch((e:any) => {console.error(e);E.internalServerError(res)});
        }else E.badRequestError(res);
    }catch(e) {
        E.internalServerError(res);
    }
}

let addQuestionsToTest=async (req:express.Request, res: express.Response)=>{
    let {testId,question,options,answer,questionId}=req.body;
    if(!testId){
        E.badRequestError(res);
        return;
    }
    try{ 
        let results:any=[];
        if(req.files && req.files.length>0){
            let tempData=resultsOuputFunc((req.files as Express.Multer.File[])[0].buffer);
            tempData.forEach((data:any) =>{
                if(data["Question"] && data["Answer"] && (Object.keys(data).length >= 6)){
                    let question=data["Question"];
                    let options:any[]=[];
                    Object.keys(data).forEach(key =>{
                        if((key!="Question") && (key!="Answer")){
                            options.push(data[key]);
                        }
                    });
                    let answer=data["Answer"];
                    let id=idGen();
                    results.push({
                        question:question,
                        options:options,
                        answer:answer,
                        id:id
                    });
                }
            });
        }else{
            if(!question || !options || !answer){
                E.badRequestError(res);
                return;
            }
            results.push({
                question:question,
                options:JSON.parse(options),
                answer:answer,
                id:idGen()
            });
        }
        let test=await Test.findById(testId);
        if(questionId){
            let editFileArray=test.mcqQuestions.filter((_question:any)=>_question.id==questionId);
            if(editFileArray.length>0){
                editFileArray[0].question=question;
                editFileArray[0].options=JSON.parse(options);
                editFileArray[0].answer=answer;
            }
        }
        else results.forEach((result:any) => {
            test.mcqQuestions.push(result);
        });
        test.save().then(() => { res.status(200).json({
            success: true,
            data:test.mcqQuestions
        })}).catch((e:any)=>{
            console.log(e);
            E.internalServerError(res);
        });
    }catch(e) {
        E.internalServerError(res);
    }
}

let addProgrammingQuestionsToTest=async (req:express.Request, res: express.Response)=>{
    let {testId,progQuestion,questionId}=req.body;
    if(!testId || !progQuestion){
        E.badRequestError(res);
        return;
    }
    progQuestion=JSON.parse(progQuestion);
    if(req.files && (req.files.length<2) && !questionId ){
        E.badRequestError(res);
        return;
    }
    let testCasesFile="";
    let outputFile="";
    if(req.files){
        try{
            (req.files as Express.Multer.File[]).forEach(file => {
                if((file.fieldname=="testCasesFile") && (testCasesFile=="")){
                    testCasesFile="testCasesFile"+Date.now();
                    fs.writeFileSync(path.join(__dirname,"../../storage/testCases/",testCasesFile),file.buffer);
                }else if((file.fieldname=="outputsFile") && (outputFile=="")){
                    outputFile="outputsFile"+(Date.now()+1);
                    fs.writeFileSync(path.join(__dirname,"../../storage/outputFiles/",outputFile),file.buffer);
                }
            })
        }catch(err){
            console.log(err);
            E.internalServerError(res);
            return;
        }
    }
    if((testCasesFile==="" || outputFile==="") && !questionId){
        E.badRequestError(res);
        return;
    }
    if(questionId){
        if(testCasesFile!==""){
            fs.unlink(path.join(__dirname,"../../storage/testCases/",progQuestion["testCasesFile"]),(err)=>{
                console.log(err);
            });
            progQuestion["testCasesFile"]=testCasesFile;
        }
        if(outputFile!=""){
            fs.unlink(path.join(__dirname,"../../storage/outputFiles/",progQuestion["outputsFile"]),(err)=>{
                console.log(err);
            });
            progQuestion["outputsFile"]=outputFile;
        }
    }else{
        progQuestion["testCasesFile"]=testCasesFile;
        progQuestion["outputsFile"]=outputFile;
    }
    try{
        let test=await Test.findById(testId);
        if(!test){
            E.notFoundError(res);
            return;
        }
        if(questionId){
            progQuestion._id=questionId;
            test.progQuestions=test.progQuestions.map((question:{_id:string,testCasesFile:string,outputFile:string}) =>{
                if(question._id==questionId){
                    return {
                        ...progQuestion,
                        testCasesFile:(testCasesFile=="")?question.testCasesFile:testCasesFile,
                        outputsFile:(outputFile=="")?question.outputFile:outputFile
                    };
                }else return question;
            });
        }else test.progQuestions.push(progQuestion);
        test.save()
            .then(() =>{
                res.status(200).json({
                    success: true,
                    data:test.progQuestions
                });
            }).catch((e:any)=>{
                console.log(e);
                E.internalServerError(res);
            })
    }catch(e){
        E.internalServerError(res);
    }
};

let deleteTest = async (req:express.Request, res: express.Response) => {
    let {_id,testId} = req.body;
    if(!_id || !testId){
        E.badRequestError(res);
        return;
    }
    try{
        let organization=await Organisation.findById(_id);
        let test=await Test.findById(testId);
        if(organization && test){
            organization.tests=(organization.tests as string[]).filter(_testId=>{
                return _testId.toString()!=testId;
            });
            (test.batches as string[]).forEach(batchId=>{
                Batch.updateOne({_id:batchId},{$pull:{"tests":testId}}).then(()=>{}).catch(()=>{});
            });
            organization.save().then(()=>{
                res.status(200).json({success:true});
                Test.deleteOne({_id:testId}).then(()=>{
                    console.log("Deleted test!");
                }).catch(()=>{});
            });
        }else E.notFoundError(res);
    }catch(e){
        console.log(e);
        E.internalServerError(res);
    }
}

export default {
    addTest,editTest,addQuestionsToTest,getTestData,addProgrammingQuestionsToTest,deleteTest
};