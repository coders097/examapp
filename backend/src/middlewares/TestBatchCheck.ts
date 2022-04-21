import express from 'express';
import Organisation from '../models/Organisation';
import E from '../controller/errors';

let testBatchCheck = async (req:express.Request, res:express.Response,next:express.NextFunction)=>{
    let {_id,batchId,testId} = req.body;
    try{
        let organisation=await Organisation.findById(_id);
        if(batchId){
            let contains=(organisation.batches as string[])
                            .find(_batchId=>_batchId.toString()===batchId.toString());
            if(!contains) {
                E.notFoundError(res);
                return;
            }
        }
        if(testId){
            let contains=(organisation.tests as string[])
                            .find(_testId=>_testId.toString()===testId.toString());
            if(!contains) {
                E.notFoundError(res);
                return;
            }
        }
        next();
    }catch(err){
        E.unAuthorizedError(res);
    }
}

export default testBatchCheck;