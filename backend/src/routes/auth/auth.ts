import express from 'express';
import authController from '../../controller/authController';
let app=express.Router();
import cookieLogIn from '../../middlewares/cookieLogIn';
import jwtChecker from '../../middlewares/jwtAuth';
import multer from 'multer';

const upload=multer({
    storage:multer.memoryStorage()
});

// @type  GET
// @route /auth/candidate/login
// @desc  for logging in candidate 
// @access PUBLIC
app.get("/candidate/login",authController.candidateLogin);

// @type  POST
// @route /auth/organisation/login
// @desc  for logging in organisation
// @access PUBLIC
app.post("/organisation/login",cookieLogIn,authController.organizationLogin);

// @type  POST
// @route /auth/organisation/signup
// @desc  for signing up organisation
// @access PUBLIC
app.post("/organisation/signup",authController.organizationSignup);

// @type  POST
// @route /auth/refreshToken 
// @desc  for refreshing the jwt
// @access PUBLIC
app.post("/refreshToken",authController.refreshToken);

// @type  GET
// @route /auth/organisation/logout
// @desc  for logging out organisation
// @access PUBLIC
app.get("/organisation/logout",authController.organizationLogout);

// @type POST
// @route /auth/organisation/testing
// @desc  for testing
// @access PRIVATE
app.post("/organisation/testing",jwtChecker,(req,res)=>{
    res.status(200).json({success:true});
});

// @type  POST
// @route /auth/organisation/feedback
// @desc  for user giving feedback
// @access PRIVATE
app.post("/organisation/feedback",jwtChecker,upload.any(),authController.feedback);


// @type  POST
// @route /auth/organisation/settings
// @desc  for editing settings of organisation
// @access PRIVATE
app.post("/organisation/settings",jwtChecker,authController.settings);


// @type  POST
// @route /auth/organisation/editProfile
// @desc  for editing organisation profile
// @access PRIVATE
app.post("/organisation/editProfile",upload.any(),jwtChecker,authController.editProfile);

// @type  GET
// @route /auth/organisation/getPic
// @desc  for getting organisation pic
// @access PUBLIC
app.get("/organisation/getPic",authController.getPic);

// @type  POST
// @route /auth/organisation/deleteProfile
// @desc  for deleting organisation profile
// @access PRIVATE
app.post("/organisation/deleteProfile",jwtChecker,authController.deleteProfile);

export default app;