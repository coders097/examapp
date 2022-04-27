"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const Test_1 = __importDefault(require("../models/Test"));
const errors_1 = __importDefault(require("../controller/errors"));
const Organisation_1 = __importDefault(require("../models/Organisation"));
const Conductor_1 = __importDefault(require("../models/Conductor"));
const xlsx_1 = __importDefault(require("xlsx"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const Batch_1 = __importDefault(require("../models/Batch"));
let resultsOuputFunc = (data) => {
    let wb = xlsx_1.default.read(data);
    let ws = wb.Sheets[wb.SheetNames[0]];
    let batchData = xlsx_1.default.utils.sheet_to_json(ws);
    return batchData;
};
function idGen() {
    var S4 = function () {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return (S4() + S4() + S4());
}
;
let getTestData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { testId } = req.body;
    if (!testId) {
        errors_1.default.badRequestError(res);
        return;
    }
    try {
        let test = yield Test_1.default.findById(testId).populate({
            path: "conductor",
            select: "status startDateTime endDateTime _id markPerQuestion noOfQuestions randomiseQuestion testTimeInMin"
        });
        if (test) {
            res.status(200).json({
                success: true,
                data: {
                    _id: test._id,
                    name: test.name,
                    mcqQuestions: test.mcqQuestions,
                    progQuestions: test.progQuestions,
                    batches: test.batches,
                    dateOfCreation: test.dateOfCreation,
                    conductor: test.conductor
                }
            });
        }
        else
            errors_1.default.notFoundError(res);
    }
    catch (err) {
        errors_1.default.internalServerError(res);
    }
});
let addTest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { _id, testName } = req.body;
    if (!testName) {
        errors_1.default.badRequestError(res);
        return;
    }
    try {
        let conductor = yield Conductor_1.default.create({});
        let test = yield Test_1.default.create({
            name: testName,
            conductor: conductor._id
        });
        let organization = yield Organisation_1.default.findById(_id);
        if (test && organization) {
            organization.tests.push(test._id);
            organization.save().then(() => {
                res.status(200).json({
                    success: true,
                    data: {
                        _id: test._id,
                        name: test.name,
                        dateOfCreation: test.dateOfCreation
                    }
                });
            }).catch(() => { errors_1.default.internalServerError(res); });
        }
        else
            errors_1.default.notFoundError(res);
    }
    catch (e) {
        errors_1.default.internalServerError(res);
    }
});
// Commands
//    RENAME 
//    EDIT_PREFERENCES
let editTest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { testId, command, testName, startTime, endTime, batches, markPerQuestion, noOfQuestions, randomiseQuestion, testTimeInMin } = req.body;
    console.log(req.body);
    if (!testId || !command) {
        errors_1.default.badRequestError(res);
        return;
    }
    let test = yield Test_1.default.findById(testId);
    if (!test) {
        errors_1.default.notFoundError(res);
        return;
    }
    try {
        if (command === 'RENAME') {
            if (!testName) {
                errors_1.default.badRequestError(res);
                return;
            }
            test.name = testName;
            test.save().then(() => {
                res.status(200).json({
                    success: true,
                    data: {
                        _id: test.id,
                        name: test.name,
                        dateOfCreation: test.dateOfCreation
                    }
                });
            }).catch(() => { errors_1.default.internalServerError(res); });
        }
        else if (command === 'EDIT_PREFERENCES') {
            if (!startTime || !endTime || !testTimeInMin || !batches || !markPerQuestion || !noOfQuestions || ((randomiseQuestion == undefined) || (randomiseQuestion == null))) {
                errors_1.default.badRequestError(res);
                return;
            }
            let conductor = yield Conductor_1.default.findById(test.conductor);
            test.batches = batches;
            conductor.startDateTime = startTime;
            conductor.endDateTime = endTime;
            conductor.markPerQuestion = markPerQuestion;
            conductor.randomiseQuestion = randomiseQuestion;
            conductor.noOfQuestions = noOfQuestions;
            conductor.testTimeInMin = testTimeInMin;
            conductor.save()
                .then(() => {
                test.save().then(() => {
                    res.status(200).json({
                        success: true,
                        data: {
                            _id: test._id,
                            name: test.name,
                            mcqQuestions: test.mcqQuestions,
                            progQuestions: test.progQuestions,
                            batches: test.batches,
                            dateOfCreation: test.dateOfCreation,
                            conductor: {
                                status: conductor.status,
                                startDateTime: conductor.startDateTime,
                                endDateTime: conductor.endDateTime,
                                _id: conductor._id,
                                markPerQuestion: conductor.markPerQuestion,
                                noOfQuestions: conductor.noOfQuestions,
                                randomiseQuestion: conductor.randomiseQuestion,
                                testTimeInMin: conductor.testTimeInMin
                            }
                        }
                    });
                }).catch((e) => { console.error(e); errors_1.default.internalServerError(res); });
            }).catch((e) => { console.error(e); errors_1.default.internalServerError(res); });
        }
        else
            errors_1.default.badRequestError(res);
    }
    catch (e) {
        errors_1.default.internalServerError(res);
    }
});
let addQuestionsToTest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { testId, question, options, answer, questionId } = req.body;
    if (!testId) {
        errors_1.default.badRequestError(res);
        return;
    }
    try {
        let results = [];
        if (req.files && req.files.length > 0) {
            let tempData = resultsOuputFunc(req.files[0].buffer);
            tempData.forEach((data) => {
                if (data["Question"] && data["Answer"] && (Object.keys(data).length >= 6)) {
                    let question = data["Question"];
                    let options = [];
                    Object.keys(data).forEach(key => {
                        if ((key != "Question") && (key != "Answer")) {
                            options.push(data[key]);
                        }
                    });
                    let answer = data["Answer"];
                    let id = idGen();
                    results.push({
                        question: question,
                        options: options,
                        answer: answer,
                        id: id
                    });
                }
            });
        }
        else {
            if (!question || !options || !answer) {
                errors_1.default.badRequestError(res);
                return;
            }
            results.push({
                question: question,
                options: JSON.parse(options),
                answer: answer,
                id: idGen()
            });
        }
        let test = yield Test_1.default.findById(testId);
        if (questionId) {
            let editFileArray = test.mcqQuestions.filter((_question) => _question.id == questionId);
            if (editFileArray.length > 0) {
                editFileArray[0].question = question;
                editFileArray[0].options = JSON.parse(options);
                editFileArray[0].answer = answer;
            }
        }
        else
            results.forEach((result) => {
                test.mcqQuestions.push(result);
            });
        test.save().then(() => {
            res.status(200).json({
                success: true,
                data: test.mcqQuestions
            });
        }).catch((e) => {
            console.log(e);
            errors_1.default.internalServerError(res);
        });
    }
    catch (e) {
        errors_1.default.internalServerError(res);
    }
});
let addProgrammingQuestionsToTest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { testId, progQuestion, questionId } = req.body;
    if (!testId || !progQuestion) {
        errors_1.default.badRequestError(res);
        return;
    }
    progQuestion = JSON.parse(progQuestion);
    if (req.files && (req.files.length < 2) && !questionId) {
        errors_1.default.badRequestError(res);
        return;
    }
    let testCasesFile = "";
    let outputFile = "";
    if (req.files) {
        try {
            req.files.forEach(file => {
                if ((file.fieldname == "testCasesFile") && (testCasesFile == "")) {
                    testCasesFile = "testCasesFile" + Date.now();
                    fs.writeFileSync(path.join(__dirname, "../../storage/testCases/", testCasesFile), file.buffer);
                }
                else if ((file.fieldname == "outputsFile") && (outputFile == "")) {
                    outputFile = "outputsFile" + (Date.now() + 1);
                    fs.writeFileSync(path.join(__dirname, "../../storage/outputFiles/", outputFile), file.buffer);
                }
            });
        }
        catch (err) {
            console.log(err);
            errors_1.default.internalServerError(res);
            return;
        }
    }
    if ((testCasesFile === "" || outputFile === "") && !questionId) {
        errors_1.default.badRequestError(res);
        return;
    }
    if (questionId) {
        if (testCasesFile !== "") {
            fs.unlink(path.join(__dirname, "../../storage/testCases/", progQuestion["testCasesFile"]), (err) => {
                console.log(err);
            });
            progQuestion["testCasesFile"] = testCasesFile;
        }
        if (outputFile != "") {
            fs.unlink(path.join(__dirname, "../../storage/outputFiles/", progQuestion["outputsFile"]), (err) => {
                console.log(err);
            });
            progQuestion["outputsFile"] = outputFile;
        }
    }
    else {
        progQuestion["testCasesFile"] = testCasesFile;
        progQuestion["outputsFile"] = outputFile;
    }
    try {
        let test = yield Test_1.default.findById(testId);
        if (!test) {
            errors_1.default.notFoundError(res);
            return;
        }
        if (questionId) {
            progQuestion._id = questionId;
            test.progQuestions = test.progQuestions.map((question) => {
                if (question._id == questionId) {
                    return Object.assign(Object.assign({}, progQuestion), { testCasesFile: (testCasesFile == "") ? question.testCasesFile : testCasesFile, outputsFile: (outputFile == "") ? question.outputFile : outputFile });
                }
                else
                    return question;
            });
        }
        else
            test.progQuestions.push(progQuestion);
        test.save()
            .then(() => {
            res.status(200).json({
                success: true,
                data: test.progQuestions
            });
        }).catch((e) => {
            console.log(e);
            errors_1.default.internalServerError(res);
        });
    }
    catch (e) {
        errors_1.default.internalServerError(res);
    }
});
let deleteTest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { _id, testId } = req.body;
    if (!_id || !testId) {
        errors_1.default.badRequestError(res);
        return;
    }
    try {
        let organization = yield Organisation_1.default.findById(_id);
        let test = yield Test_1.default.findById(testId);
        if (organization && test) {
            organization.tests = organization.tests.filter(_testId => {
                return _testId.toString() != testId;
            });
            test.batches.forEach(batchId => {
                Batch_1.default.updateOne({ _id: batchId }, { $pull: { "tests": testId } }).then(() => { }).catch(() => { });
            });
            organization.save().then(() => {
                res.status(200).json({ success: true });
                Test_1.default.deleteOne({ _id: testId }).then(() => {
                    console.log("Deleted test!");
                }).catch(() => { });
            });
        }
        else
            errors_1.default.notFoundError(res);
    }
    catch (e) {
        console.log(e);
        errors_1.default.internalServerError(res);
    }
});
exports.default = {
    addTest, editTest, addQuestionsToTest, getTestData, addProgrammingQuestionsToTest, deleteTest
};
