import xlsx from 'xlsx';
import express from 'express';
import E from '../controller/errors';
import Batch from '../models/Batch';
import Organisation from '../models/Organisation';

let resultsOuputFuncHelper=(data:Buffer)=>{
    let wb=xlsx.read(data);
    let ws=wb.Sheets[wb.SheetNames[0]];
    let batchData=xlsx.utils.sheet_to_json(ws);
    return batchData;
}

let addBatchData=(req:express.Request, res: express.Response)=>{
    let {batchData,batchId}=req.body;
    if(!batchId){
        E.badRequestError(res);
        return;
    }
    let results:{
        Name:any,
        Email:any,
        Regd:any
    }[]=[];
    try{
        if(req.files && req.files.length>0){
            results=resultsOuputFuncHelper((req.files as Express.Multer.File[])[0].buffer) as {
                Name:any,
                Email:any,
                Regd:any
            }[];
        }else{
            if(!batchData) {
                E.badRequestError(res);
                return;
            } else batchData=JSON.parse(batchData);
            batchData.forEach((batch:{Name:any, Email:any, Regd:any})=>{
                if(batch.Name && batch.Email && batch.Regd) 
                results.push(batch);
            });
        }
        if(results.length===0){
            E.badRequestError(res);
            return;
        }
        Batch.findById(batchId).populate({
            path:"tests",
            select:"name _id"
        })
            .then(batch=>{
                if(batch){
                    results.forEach(_data=>{
                        if(_data.Name && _data.Email && _data.Regd) 
                            batch.candidates.push({
                                name:_data.Name,
                                email:_data.Email,
                                regdNo:_data.Regd
                            });
                    });
                    batch.save().then(()=>{
                        res.status(200).json({
                            success: true,
                            data:{
                                _id:batchId,
                                tests:batch.tests,
                                candidates:batch.candidates,
                                name: batch.name,
                                dateOfCreation: batch.dateOfCreation
                            }
                        });
                    }).catch(()=>{
                        E.internalServerError(res);
                    });
                }else E.notFoundError(res);
            }).catch(error=>{
                console.log(error);
                E.internalServerError(res);
            });
    }catch(err){
        console.log(err);
        E.internalServerError(res);
    }
}


let addBatch =async (req: express.Request, res: express.Response)=>{
    let {_id,batchName} = req.body;
    if(!batchName){
        E.badRequestError(res);
        return;
    }
    try{
        let organization=await Organisation.findById(_id);
        if(organization){
            let batch=await Batch.create({name:batchName});
            organization.batches.push(batch._id);
            organization.save()
                .then(()=>{
                    res.status(200).json({success:true,data:{
                        name:batch.name,
                        _id:batch._id, 
                        candidates:[],
                        dateOfCreation:batch.dateOfCreation,
                        tests:[]
                    }});
                }).catch((error:any)=>{
                    E.internalServerError(res);
                });
        }else throw new Error("Organisation Doesn't Exist");
    }catch (err){
        console.log(err);
        E.internalServerError(res);
    }
}

let editBatch = async (req:express.Request, res: express.Response)=>{
    let {command,batchName,batchId,candiData} = req.body;
    if(!command || !batchId){
        E.badRequestError(res);
        return;
    }
    try{
        let batch = await Batch.findById(batchId);
        if(!batch) throw new Error("Not Found");
        if(command==='RENAME'){
            if(!batchName){ E.badRequestError(res); return; }
            batch.name = batchName;
            batch.save().then(()=>{
                res.status(200).json({
                    success:true,
                    data:batchName
                });
            }).catch((err:any)=>{E.internalServerError(res)});
        }else if(command==='DEL_CANDIDATES'){
            if(!candiData) 
                throw new Error("Not Correct Info");
            let map=new Map();
            candiData.forEach((candi:{name:string,email:string,regdNo:string})=>{
                map.set(candi.regdNo,true);
            })
            batch.candidates=(batch.candidates as {name:string,email:string,regdNo:string}[])
                                .filter(candidate=>!map.has(candidate.regdNo));
            batch.save().then(()=>{res.status(200).json({success:true})})
                .catch((e:any)=>{E.internalServerError(res)});
        }else E.badRequestError(res);
    }catch (err){
        console.log(err);
        E.internalServerError(res);
    }
}

let getBatchData=async (req:express.Request, res: express.Response)=>{
    let {batchId}=req.body;
    if(!batchId) {
        E.badRequestError(res);
        return;
    }
    try{
        let batch=await Batch.findById(batchId).populate({
            path:"tests",
            select:"name _id"
        });
        if(batch){
            res.status(200).json({
                success: true,
                data:{
                    _id:batchId,
                    tests:batch.tests,
                    candidates:batch.candidates,
                    name: batch.name,
                    dateOfCreation: batch.dateOfCreation
                }
            });
        }else E.notFoundError(res);
    }catch(e){
        E.internalServerError(res);
    }
};

let deleteBatch = (req:express.Request, res: express.Response) => {
    
}

export default {
    addBatchData,addBatch,editBatch,getBatchData,deleteBatch
};