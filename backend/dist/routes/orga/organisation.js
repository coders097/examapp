"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = express_1.default.Router();
const batchController_1 = __importDefault(require("../../controller/batchController"));
const testController_1 = __importDefault(require("../../controller/testController"));
const deploymentController_1 = __importDefault(require("../../controller/deploymentController"));
const jwtAuth_1 = __importDefault(require("../../middlewares/jwtAuth"));
const Organisation_1 = __importDefault(require("../../models/Organisation"));
const errors_1 = __importDefault(require("../../controller/errors"));
const TestBatchCheck_1 = __importDefault(require("../../middlewares/TestBatchCheck"));
const multer_1 = __importDefault(require("multer"));
const analysisController_1 = __importDefault(require("../../controller/analysisController"));
let upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage()
});
// @type  POST
// @route /organisation/batch/getBatchData
// @desc  for getting batch data
// @access PRIVATE
app.post('/batch/getBatchData', jwtAuth_1.default, TestBatchCheck_1.default, batchController_1.default.getBatchData);
// @type  POST
// @route /organisation/batch/addBatch
// @desc  for adding a batch 
// @access PRIVATE
app.post('/batch/addBatch', jwtAuth_1.default, batchController_1.default.addBatch);
// @type  POST
// @route /organisation/batch/editBatch
// @desc  for editing a batch
// @access PRIVATE
app.post('/batch/editBatch', jwtAuth_1.default, TestBatchCheck_1.default, batchController_1.default.editBatch);
// @type  POST
// @route /organisation/batch/addBatchData
// @desc  for adding batch data
// @access PRIVATE
app.post('/batch/addBatchData', upload.any(), jwtAuth_1.default, TestBatchCheck_1.default, batchController_1.default.addBatchData);
// @type  POST
// @route /organisation/batch/deleteBatch
// @desc  for deleting batch
// @access PRIVATE
app.post('/batch/deleteBatch', jwtAuth_1.default, batchController_1.default.deleteBatch);
// @type  POST
// @route /organisation/getTestBatchInfo
// @desc  for getting test and batch info
// @access PRIVATE
app.post('/getTestBatchInfo', jwtAuth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { _id } = req.body;
    try {
        let organisation = yield Organisation_1.default.findById(_id, { _id: 1, tests: 1, batches: 1 })
            .populate({
            path: "tests",
            select: "_id name dateOfCreation"
        }).populate({
            path: "batches",
            select: "_id name dateOfCreation"
        });
        if (organisation) {
            res.status(200).json({
                success: true,
                data: {
                    _id: organisation.id,
                    tests: organisation.tests,
                    batches: organisation.batches
                }
            });
        }
        else
            errors_1.default.notFoundError(res);
    }
    catch (e) {
        errors_1.default.internalServerError(res);
    }
}));
// @type  POST 
// @route /organisation/test/getTestData
// @desc  for getting test data
// @access PRIVATE
app.post('/test/getTestData', jwtAuth_1.default, TestBatchCheck_1.default, testController_1.default.getTestData);
// @type  POST
// @route /organisation/test/addTest
// @desc  for adding a test
// @access PRIVATE
app.post('/test/addTest', jwtAuth_1.default, testController_1.default.addTest);
// @type  POST
// @route /organisation/test/editTest
// @desc  for editing a test
// @access PRIVATE
app.post('/test/editTest', jwtAuth_1.default, TestBatchCheck_1.default, testController_1.default.editTest);
// @type  POST
// @route /organisation/test/addQuestionsToTest
// @desc  for adding questions to a test
// @access PRIVATE
app.post('/test/addQuestionsToTest', upload.any(), jwtAuth_1.default, TestBatchCheck_1.default, testController_1.default.addQuestionsToTest);
// @type  POST
// @route /organisation/test/deleteTest
// @desc  for deleting test
// @access PRIVATE
app.post('/test/deleteTest', jwtAuth_1.default, testController_1.default.deleteTest);
// @type POST
// @route /organisation/test/addProgrammingQuestion
// @desc for adding programming question
// @access PRIVATE
app.post('/test/addProgrammingQuestion', upload.any(), jwtAuth_1.default, testController_1.default.addProgrammingQuestionsToTest);
// @type  POST
// @route /organisation/test/deployOrSuspendTest
// @desc  for deploying/suspending a test
// @access PRIVATE
app.post('/test/deployOrSuspendTest', jwtAuth_1.default, deploymentController_1.default.deployOrSuspendTest);
// @type  POST
// @route /organisation/test/getPasskeys
// @desc  for getting/generating passkeys for a test
// @access PRIVATE
app.post('/test/getPasskeys', jwtAuth_1.default, deploymentController_1.default.getPasskeys);
// @type  POST 
// @route /organisation/test/getTestResults
// @desc  for getting/generating results for a test
// @access PRIVATE
app.post('/test/getTestResults', jwtAuth_1.default, deploymentController_1.default.getResults);
// @type  POST 
// @route /organisation/test/getTestDeployed
// @desc  for getting the tests are deployed
// @access PRIVATE
app.post('/test/getTestDeployed', jwtAuth_1.default, analysisController_1.default.testDeployedController);
// @type  POST 
// @route /organisation/test/getLatestTests
// @desc  for getting the latest tests
// @access PRIVATE
app.post('/test/getLatestTests', jwtAuth_1.default, analysisController_1.default.latestTestsController);
// @type  POST 
// @route /organisation/test/getLatestBatches
// @desc  for getting the latest batches
// @access PRIVATE
app.post("/test/getLatestBatches", jwtAuth_1.default, analysisController_1.default.latestBatchesController);
exports.default = app;
