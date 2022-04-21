"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = __importDefault(require("../../controller/authController"));
let app = express_1.default.Router();
const cookieLogIn_1 = __importDefault(require("../../middlewares/cookieLogIn"));
const jwtAuth_1 = __importDefault(require("../../middlewares/jwtAuth"));
const multer_1 = __importDefault(require("multer"));
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage()
});
// @type  GET
// @route /auth/candidate/login
// @desc  for logging in candidate 
// @access PUBLIC
app.get("/candidate/login", authController_1.default.candidateLogin);
// @type  POST
// @route /auth/organisation/login
// @desc  for logging in organisation
// @access PUBLIC
app.post("/organisation/login", cookieLogIn_1.default, authController_1.default.organizationLogin);
// @type  POST
// @route /auth/organisation/signup
// @desc  for signing up organisation
// @access PUBLIC
app.post("/organisation/signup", authController_1.default.organizationSignup);
// @type  POST
// @route /auth/refreshToken 
// @desc  for refreshing the jwt
// @access PUBLIC
app.post("/refreshToken", authController_1.default.refreshToken);
// @type  GET
// @route /auth/organisation/logout
// @desc  for logging out organisation
// @access PUBLIC
app.get("/organisation/logout", authController_1.default.organizationLogout);
// @type POST
// @route /auth/organisation/testing
// @desc  for testing
// @access PRIVATE
app.post("/organisation/testing", jwtAuth_1.default, (req, res) => {
    res.status(200).json({ success: true });
});
// @type  POST
// @route /auth/organisation/feedback
// @desc  for user giving feedback
// @access PRIVATE
app.post("/organisation/feedback", jwtAuth_1.default, upload.any(), authController_1.default.feedback);
// @type  POST
// @route /auth/organisation/settings
// @desc  for editing settings of organisation
// @access PRIVATE
app.post("/organisation/settings", jwtAuth_1.default, authController_1.default.settings);
// @type  POST
// @route /auth/organisation/editProfile
// @desc  for editing organisation profile
// @access PRIVATE
app.post("/organisation/editProfile", upload.any(), jwtAuth_1.default, authController_1.default.editProfile);
// @type  GET
// @route /auth/organisation/getPic
// @desc  for getting organisation pic
// @access PUBLIC
app.get("/organisation/getPic", authController_1.default.getPic);
// @type  POST
// @route /auth/organisation/deleteProfile
// @desc  for deleting organisation profile
// @access PRIVATE
app.post("/organisation/deleteProfile", jwtAuth_1.default, authController_1.default.deleteProfile);
exports.default = app;
