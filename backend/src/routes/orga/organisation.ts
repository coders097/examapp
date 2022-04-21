import express from 'express';
const app=express.Router();
import batchController from '../../controller/batchController';
import testController from '../../controller/testController';
import deploymentController from '../../controller/deploymentController';
import jwtChecker from '../../middlewares/jwtAuth';
import Organisation from '../../models/Organisation';
import E from '../../controller/errors';
import testBatchCheck from '../../middlewares/TestBatchCheck';
import multer from 'multer';

let upload=multer({
    storage:multer.memoryStorage()
});

// @type  POST
// @route /organisation/batch/getBatchData
// @desc  for getting batch data
// @access PRIVATE
app.post('/batch/getBatchData',jwtChecker,testBatchCheck,batchController.getBatchData);

// @type  POST
// @route /organisation/batch/addBatch
// @desc  for adding a batch 
// @access PRIVATE
app.post('/batch/addBatch',jwtChecker,batchController.addBatch);

// @type  POST
// @route /organisation/batch/editBatch
// @desc  for editing a batch
// @access PRIVATE
app.post('/batch/editBatch',jwtChecker,testBatchCheck,batchController.editBatch);

// @type  POST
// @route /organisation/batch/addBatchData
// @desc  for adding batch data
// @access PRIVATE
app.post('/batch/addBatchData',upload.any(),jwtChecker,testBatchCheck,batchController.addBatchData);

// @type  POST
// @route /organisation/batch/deleteBatch
// @desc  for deleting batch
// @access PRIVATE
app.post('/batch/deleteBatch',jwtChecker,batchController.deleteBatch);

// @type  POST
// @route /organisation/getTestBatchInfo
// @desc  for getting test and batch info
// @access PRIVATE
app.post('/getTestBatchInfo',jwtChecker,async (req,res)=>{
    let {_id}=req.body;
    try{
        let organisation = await Organisation.findById(_id,{_id:1,tests:1,batches:1})
            .populate({
                path:"tests",
                select:"_id name dateOfCreation"
            }).populate({
                path:"batches",
                select:"_id name dateOfCreation"
            });
        if(organisation){ 
            res.status(200).json({
                success:true, 
                data:{
                    _id:organisation.id,
                    tests:organisation.tests,
                    batches:organisation.batches
                }
            });
        }else E.notFoundError(res);
    }catch(e){
        E.internalServerError(res);
    }
});

// @type  POST 
// @route /organisation/test/getTestData
// @desc  for getting test data
// @access PRIVATE
app.post('/test/getTestData',jwtChecker,testBatchCheck,testController.getTestData);

// @type  POST
// @route /organisation/test/addTest
// @desc  for adding a test
// @access PRIVATE
app.post('/test/addTest',jwtChecker,testController.addTest);

// @type  POST
// @route /organisation/test/editTest
// @desc  for editing a test
// @access PRIVATE
app.post('/test/editTest',jwtChecker,testBatchCheck,testController.editTest);

// @type  POST
// @route /organisation/test/addQuestionsToTest
// @desc  for adding questions to a test
// @access PRIVATE
app.post('/test/addQuestionsToTest',upload.any(),jwtChecker,testBatchCheck,testController.addQuestionsToTest);

// @type  POST
// @route /organisation/test/deleteTest
// @desc  for deleting test
// @access PRIVATE
app.post('/test/deleteTest',jwtChecker,testController.deleteTest);

// @type POST
// @route /organisation/test/addProgrammingQuestion
// @desc for adding programming question
// @access PRIVATE
app.post('/test/addProgrammingQuestion',upload.any(),jwtChecker,testController.addProgrammingQuestionsToTest);

// @type  POST
// @route /organisation/test/deployOrSuspendTest
// @desc  for deploying/suspending a test
// @access PRIVATE
app.post('/test/deployOrSuspendTest',jwtChecker,deploymentController.deployOrSuspendTest);

// @type  POST
// @route /organisation/test/getPasskeys
// @desc  for getting/generating passkeys for a test
// @access PRIVATE
app.post('/test/getPasskeys',jwtChecker,deploymentController.getPasskeys);

// @type  POST 
// @route /organisation/test/getTestResults
// @desc  for getting/generating results for a test
// @access PRIVATE
app.post('/test/getTestResults',jwtChecker,deploymentController.getResults);


export default app; 