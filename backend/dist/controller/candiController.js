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
const Organisation_1 = __importDefault(require("../models/Organisation"));
const errors_1 = __importDefault(require("../controller/errors"));
const Test_1 = __importDefault(require("../models/Test"));
const Conductor_1 = __importDefault(require("../models/Conductor"));
const Result_1 = __importDefault(require("../models/Result"));
let shuffle = (arr) => {
    let rounds = 15;
    while (rounds-- > 0) {
        let i = Math.floor(Math.random() * arr.length);
        let j = Math.floor(Math.random() * arr.length);
        if (i < arr.length && j < arr.length) {
            let temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }
    }
};
let getOrgaExams = (req, res) => {
    let pipeline = [
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
    Organisation_1.default.aggregate(pipeline).then((results) => {
        res.status(200).json({ success: true, data: results });
    }).catch((error) => {
        console.error(error);
        errors_1.default.internalServerError(res);
    });
};
let orgaNamePic = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { orgaId } = req.query;
    try {
        let organisation = yield Organisation_1.default.findById(orgaId);
        if (organisation) {
            res.status(200).json({
                success: true,
                data: {
                    name: organisation.name,
                    pic: organisation.pic,
                    _id: organisation._id
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
let getQuestionSet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { testId } = req.body;
    try {
        let test = yield Test_1.default.findById(testId).populate("conductor");
        if (test) {
            let programmingQuestions = test.progQuestions;
            let mcqQuestions = [];
            let noOfQuestions = test.conductor.noOfQuestions;
            let testTimeInMin = test.conductor.testTimeInMin;
            let randomiseQuestion = test.conductor.randomiseQuestion;
            let allMCQs = test.mcqQuestions;
            if (randomiseQuestion) {
                shuffle(programmingQuestions);
                shuffle(allMCQs);
            }
            mcqQuestions = allMCQs.slice(0, noOfQuestions);
            mcqQuestions.forEach((mcq) => {
                mcq.answer = "";
            });
            res.status(200).json({
                success: true,
                data: {
                    programmingQuestions: programmingQuestions,
                    mcqQuestions: mcqQuestions,
                    testTimeInMin: testTimeInMin
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
let submitAnswers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { passkey, name, regdNo, answerSheet, testId } = req.body;
    if (!passkey || !name || !regdNo || !answerSheet || !testId) {
        errors_1.default.badRequestError(res);
        return;
    }
    try {
        let test = yield Test_1.default.findById(testId);
        let conductor = yield Conductor_1.default.findById(test.conductor);
        if (test && conductor) {
            // Check passkey
            let passkeys = conductor.passkeys;
            passkeys = passkeys.filter(passkey => passkey.includes(name) && passkey.includes(regdNo) && passkey.includes(passkey));
            if (passkeys.length == 1) {
                // ADD the result
                let resultId = conductor.results;
                if (!resultId) {
                    res.status(500).json({
                        success: false,
                        error: "Critical Error Result Set Not Found!"
                    });
                    return;
                }
                yield Result_1.default.updateOne({ '_id': resultId }, { $pull: { results: { id: 23 } } }, {
                    upsert: false
                });
                Result_1.default.findByIdAndUpdate(resultId, {
                    $push: { "results": {
                            name: name,
                            regdNo: regdNo,
                            answerSheet: answerSheet
                        } }
                }, {
                    new: true
                }).then(() => {
                    // Delete passkey
                    passkeys = conductor.passkeys;
                    passkeys = passkeys.filter(passkey => !(passkey.includes(regdNo) && passkey.includes(passkey)));
                    conductor.passkeys = passkeys;
                    conductor.save().then(() => {
                        res.status(200).json({
                            success: true
                        });
                    }).catch(() => {
                        errors_1.default.internalServerError(res);
                    });
                }).catch(err => {
                    console.log(err);
                    errors_1.default.internalServerError(res);
                });
            }
            else {
                errors_1.default.notFoundError(res);
            }
        }
        else
            errors_1.default.notFoundError(res);
    }
    catch (err) {
        errors_1.default.internalServerError(res);
    }
});
exports.default = {
    getOrgaExams, orgaNamePic, getQuestionSet, submitAnswers
};
