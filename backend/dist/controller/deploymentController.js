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
const Conductor_1 = __importDefault(require("../models/Conductor"));
const Result_1 = __importDefault(require("../models/Result"));
const errors_1 = __importDefault(require("../controller/errors"));
const ResultGenerator_1 = __importDefault(require("../utils/ResultGenerator"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
let deployOrSuspendTest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // testId
    let { testId } = req.body;
    try {
        let test = yield Test_1.default.findById(testId);
        if (test) {
            let conductor = yield Conductor_1.default.findById(test.conductor);
            if (!conductor.status) {
                // checking test timing
                let currTime = Date.now();
                let startTime = new Date(conductor.startDateTime).getTime();
                let endTime = new Date(conductor.endDateTime).getTime();
                if ((startTime >= endTime) || (currTime > endTime)) {
                    res.status(400).json({
                        success: false,
                        error: "Invalid Test Times!"
                    });
                    return;
                }
                //
                conductor.status = true;
                // ******************** Create a result
                let result = yield Result_1.default.create({ results: [] });
                conductor.results = result._id;
            }
            else {
                conductor.status = false;
                conductor.passkeys = [];
            }
            conductor.save().then(() => {
                res.status(200).json({
                    success: true,
                    data: conductor.status
                });
            }).catch((err) => {
                errors_1.default.internalServerError(res);
                return;
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
let randomKey = () => {
    let alphabetSpace = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    let string = "";
    for (let i = 0; i < 7; i++) {
        let randomIndex = Math.floor(Math.random() * alphabetSpace.length);
        string += alphabetSpace[randomIndex];
    }
    return string;
};
let getPasskeys = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { testId } = req.body;
    try {
        let test = yield Test_1.default.findById(testId).populate("batches");
        let conductor = yield Conductor_1.default.findById(test.conductor);
        // if test is not deployed
        if (!conductor.status) {
            res.status(400).json({
                success: false,
                error: "Test Not Deployed"
            });
            return;
        }
        let passkeys = [];
        // if not generated passkeys
        if (conductor.passkeys.length == 0) {
            let batches = test.batches;
            let map = new Map();
            batches.forEach((batch) => {
                batch.candidates.forEach((candidate) => {
                    let key = randomKey();
                    while (map.has(key)) {
                        key = randomKey();
                    }
                    map.set(key, true);
                    passkeys.push(candidate.name + "<$>" + candidate.email + "<$>" + candidate.regdNo + "<$>" + key);
                });
            });
            conductor.passkeys = passkeys;
            yield conductor.save();
        }
        else
            passkeys = conductor.passkeys;
        res.status(200).json({
            success: true,
            data: passkeys
        });
    }
    catch (e) {
        errors_1.default.internalServerError(res);
    }
});
let getResults = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { testId } = req.body;
    if (!testId) {
        errors_1.default.badRequestError(res);
        return;
    }
    try {
        let test = yield Test_1.default.findById(testId).populate("conductor").populate({
            path: "batches",
            select: "name candidates"
        });
        let resultId = test.conductor.results;
        if (!resultId) {
            errors_1.default.notFoundError(res);
            return;
        }
        let resultData = "";
        try {
            let _data = fs.readFileSync(path.join(__dirname, "../../storage/results", resultId.toString()), 'utf8');
            resultData = _data;
        }
        catch (e) {
            let _data = "RESULT GENERATION IN PROGRESS";
            try {
                fs.writeFileSync(path.join(__dirname, "../../storage/results", resultId.toString()), _data);
            }
            catch (e) {
                errors_1.default.internalServerError(res);
                return;
            }
            resultData = "RESULT GENERATION STARTED";
        }
        res.status(200).json({ success: true, data: resultData });
        if (resultData == 'RESULT GENERATION STARTED') {
            let result = yield Result_1.default.findById(resultId);
            if (result) {
                let results = result.results;
                let markPerQuestion = test.conductor.markPerQuestion;
                let batches = test.batches;
                let mcqQuestions = test.mcqQuestions;
                let progQuestions = test.progQuestions;
                ResultGenerator_1.default.resultGenerator({
                    results, markPerQuestion, batches, mcqQuestions, progQuestions, resultId: resultId.toString(), noOfQuestions: test.conductor.noOfQuestions
                });
            }
            else {
                console.log("Result not found");
            }
        }
    }
    catch (e) {
        console.log(e);
    }
});
exports.default = {
    deployOrSuspendTest, getPasskeys, getResults
};
