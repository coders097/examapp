"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const candiController_1 = __importDefault(require("../../controller/candiController"));
const app = express_1.default.Router();
// @type  POST
// @route /candidate/getQuestionSet
// @desc  for getting the questionSet
// @access PRIVATE
app.post("/getQuestionSet", candiController_1.default.getQuestionSet);
// @type  POST
// @route /candidate/submitAnswers 
// @desc  for submitting the answers
// @access PRIVATE  
app.post("/submitAnswers", candiController_1.default.submitAnswers);
// @type  GET
// @route /candidate/getOrgaExams 
// @desc  for getting all orga and their exams
// @access PUBLIC 
app.get("/getOrgaExams", candiController_1.default.getOrgaExams);
// @type  GET
// @route /candidate/getOrgaNamePic 
// @desc  for getting the required organisation's name & pic
// @access PUBLIC 
app.get("/getOrgaNamePic", candiController_1.default.orgaNamePic);
exports.default = app;
