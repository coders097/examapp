import express from 'express';
import candiController from '../../controller/candiController';
const app=express.Router();

// @type  POST
// @route /candidate/getQuestionSet
// @desc  for getting the questionSet
// @access PRIVATE
app.post("/getQuestionSet",candiController.getQuestionSet);

// @type  POST
// @route /candidate/submitAnswers 
// @desc  for submitting the answers
// @access PRIVATE  
app.post("/submitAnswers",candiController.submitAnswers);

// @type  GET
// @route /candidate/getOrgaExams 
// @desc  for getting all orga and their exams
// @access PUBLIC 
app.get("/getOrgaExams",candiController.getOrgaExams);

// @type  GET
// @route /candidate/getOrgaNamePic 
// @desc  for getting the required organisation's name & pic
// @access PUBLIC 
app.get("/getOrgaNamePic",candiController.orgaNamePic);

export default app; 