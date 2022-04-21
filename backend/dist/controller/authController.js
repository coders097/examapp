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
const errors_1 = __importDefault(require("../controller/errors"));
const Organisation_1 = __importDefault(require("../models/Organisation"));
const Notification_1 = __importDefault(require("../models/Notification"));
const Test_1 = __importDefault(require("../models/Test"));
const Batch_1 = __importDefault(require("../models/Batch"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const FeedBack_1 = __importDefault(require("../models/FeedBack"));
const saltRounds = 14;
const jwt_key = process.env.JWT_KEY;
const refresh_key = process.env.REFRESH_KEY;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const util_1 = require("util");
let candidateLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { name, regd, key, testId } = req.query;
    if (!name || !regd || !key || !testId) {
        errors_1.default.badRequestError(res);
        return;
    }
    try {
        let test = yield Test_1.default.findById(testId).populate("conductor");
        if (!test) {
            errors_1.default.notFoundError(res);
            return;
        }
        // Check Timing
        let currTime = Date.now();
        let startTime = new Date(test.conductor.startDateTime).getTime();
        let endTime = new Date(test.conductor.endDateTime).getTime();
        if (currTime < startTime || currTime > endTime) {
            errors_1.default.unAuthorizedError(res);
            return;
        }
        ///////////////
        let passkeys = test.conductor.passkeys;
        passkeys = passkeys.filter(passkey => passkey.includes(name) && passkey.includes(regd) && passkey.includes(key));
        if (passkeys.length == 1) {
            let resStrArr = passkeys[0].split("<$>");
            res.status(200).json({
                success: true,
                data: {
                    name: resStrArr[0],
                    email: resStrArr[1],
                    regd: resStrArr[2],
                    testId: testId
                }
            });
        }
        else {
            errors_1.default.notFoundError(res);
        }
    }
    catch (err) {
        console.log(err);
        errors_1.default.internalServerError(res);
    }
});
let successLogInSignUp = (req, res, organisation) => {
    let timeInMinutes = 120;
    let expires = Math.floor(Date.now() / 1000) + 60 * timeInMinutes;
    let token = jsonwebtoken_1.default.sign({
        name: organisation.name,
        _id: organisation._id,
        exp: expires,
    }, jwt_key);
    let refreshTimeExpires = Math.floor(Date.now() / 1000) + 60 * 3000;
    let refreshToken = jsonwebtoken_1.default.sign({
        name: organisation.name,
        _id: organisation._id,
        exp: refreshTimeExpires
    }, refresh_key);
    res.cookie("token", token, {
        maxAge: 8147483647,
        path: "/",
        secure: true,
        httpOnly: true
    });
    res.cookie("refresh_token", refreshToken, {
        maxAge: 8147483647,
        path: "/",
        secure: true,
        httpOnly: true
    });
    res.status(200).json({
        success: true,
        data: {
            name: organisation.name,
            email: organisation.email,
            phone: organisation.phone,
            pic: organisation.pic,
            _id: organisation._id
        }
    });
};
let organizationLogin = (req, res) => {
    let { email, password } = req.body;
    if (!email || !password) {
        errors_1.default.badRequestError(res);
        return;
    }
    Organisation_1.default.findOne({ email: email })
        .then((organisation) => {
        if (organisation && bcryptjs_1.default.compareSync(password, organisation.password)) {
            successLogInSignUp(req, res, organisation);
        }
        else {
            errors_1.default.unAuthorizedError(res);
        }
    })
        .catch((error) => {
        errors_1.default.notFoundError(res);
    });
};
let organizationSignup = (req, res) => {
    let { name, phone, email, password } = req.body;
    if (!email || !password || !name || !phone) {
        errors_1.default.badRequestError(res);
        return;
    }
    Organisation_1.default.findOne({ email: email })
        .then((organisation) => {
        if (organisation)
            errors_1.default.notFoundError(res);
        else {
            Notification_1.default.create({
                active: true
            }).then(notification => {
                let hashedPassword = bcryptjs_1.default.hashSync(password, saltRounds);
                Organisation_1.default.create({
                    name: name,
                    email: email,
                    phone: phone,
                    password: hashedPassword,
                    pic: "",
                    notifications: notification._id
                }).then(organisation => {
                    successLogInSignUp(req, res, organisation);
                }).catch((error) => {
                    console.error(error);
                    errors_1.default.internalServerError(res);
                });
            }).catch((error) => {
                console.error(error);
                errors_1.default.internalServerError(res);
            });
        }
    })
        .catch((error) => {
        errors_1.default.internalServerError(res);
    });
};
let refreshToken = (req, res) => {
    console.log("Refreshing token");
    try {
        let { refresh_token } = req.cookies;
        if (refresh_token) {
            let _data = jsonwebtoken_1.default.verify(refresh_token, refresh_key);
            let timeInMinutes = 120;
            let expires = Math.floor(Date.now() / 1000) + 60 * timeInMinutes;
            let token = jsonwebtoken_1.default.sign({
                name: _data.name,
                _id: _data._id,
                exp: expires,
            }, jwt_key);
            let refreshTimeExpires = Math.floor(Date.now() / 1000) + 60 * 3000;
            let refreshToken = jsonwebtoken_1.default.sign({
                name: _data.name,
                _id: _data._id,
                exp: refreshTimeExpires
            }, refresh_key);
            res.cookie("token", token, {
                maxAge: 8147483647,
                path: "/",
                secure: true,
                httpOnly: true
            });
            res.cookie("refresh_token", refreshToken, {
                maxAge: 8147483647,
                path: "/",
                secure: true,
                httpOnly: true
            });
            res.status(200).json({
                success: true
            });
        }
        else
            res.status(404).json({
                success: false
            });
    }
    catch (e) {
        res.status(404).json({
            success: false
        });
    }
};
let organizationLogout = (req, res) => {
    res.cookie("token", "", {
        maxAge: -1,
        path: "/",
        secure: true,
        httpOnly: true
    });
    res.cookie("refresh_token", "", {
        maxAge: -1,
        path: "/",
        secure: true,
        httpOnly: true
    });
    res.status(200).send({
        success: true
    });
};
let feedback = (req, res) => {
    let { feedback, name, _id } = req.body;
    let pics = [];
    if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
            let picName = `${name}_${_id}_${Date.now()}` + path_1.default.extname(file.originalname);
            try {
                fs_1.default.writeFileSync(path_1.default.join(__dirname, "../../storage/feedbacks/", picName), file.buffer);
                pics.push(picName);
            }
            catch (err) {
                console.log(err);
            }
        });
    }
    FeedBack_1.default.create({
        type: "organization",
        feedback: feedback,
        pics: pics
    }).then(feed => {
        res.status(200).json({ success: true });
    }).catch(err => {
        console.log(err);
        errors_1.default.internalServerError(res);
    });
};
let settings = (req, res) => {
    let { notificationFlag, keepMeLoggedInFlag, _id, resetFlag } = req.body;
    if (resetFlag) {
        notificationFlag = true;
        keepMeLoggedInFlag = true;
    }
    console.log("notification", notificationFlag, " ", "keepMeLoggedInFlag", keepMeLoggedInFlag);
    Organisation_1.default.findById(_id)
        .then(organisation => {
        if (organisation) {
            if (keepMeLoggedInFlag || keepMeLoggedInFlag === false)
                organisation.keepMeLoggedIn = keepMeLoggedInFlag;
            organisation.save()
                .then(() => {
                if (notificationFlag || notificationFlag === false)
                    Notification_1.default.findById(organisation.notifications)
                        .then(notification => {
                        notification.active = notificationFlag;
                        notification.save()
                            .then(() => {
                            res.status(200).json({
                                success: true,
                                data: {
                                    notificationMode: notification.active,
                                    keepMeLoggedIn: organisation.keepMeLoggedIn
                                }
                            });
                        }).catch((error) => {
                            errors_1.default.internalServerError(res);
                        });
                    }).catch(error => {
                        errors_1.default.internalServerError(res);
                    });
                else
                    res.status(200).json({
                        success: true,
                        data: {
                            keepMeLoggedIn: organisation.keepMeLoggedIn
                        }
                    });
            }).catch((err) => {
                errors_1.default.internalServerError(res);
            });
        }
    }).catch(err => {
        errors_1.default.internalServerError(res);
    });
};
let editProfile = (req, res) => {
    let { name, email, phone, password, _id, oldPassword } = req.body;
    if (!oldPassword) {
        errors_1.default.badRequestError(res);
        return;
    }
    let pic = null;
    if (req.files && req.files.length > 0) {
        let file = req.files[0];
        try {
            pic = `${_id}_${Date.now()}_${file.originalname}`;
            fs_1.default.writeFileSync(path_1.default.join(__dirname, "../../storage/profile", pic), file.buffer);
        }
        catch (e) {
            pic = null;
        }
    }
    Organisation_1.default.findById(_id)
        .then(organization => {
        if (!bcryptjs_1.default.compareSync(oldPassword, organization.password)) {
            errors_1.default.unAuthorizedError(res);
            return;
        }
        if (name)
            organization.name = name;
        if (email)
            organization.email = email;
        if (password) {
            organization.password = bcryptjs_1.default.hashSync(password, saltRounds);
        }
        if (phone)
            organization.phone = phone;
        if (pic) {
            let oldPic = organization.pic;
            if (oldPic.trim() !== "")
                (0, util_1.promisify)(fs_1.default.unlink)(path_1.default.join(__dirname, "../../storage/profile", oldPic))
                    .then(() => { }).catch(() => { });
            organization.pic = pic;
        }
        organization.save()
            .then(() => {
            res.status(200).json({
                success: true,
                data: {
                    name: organization.name,
                    email: organization.email,
                    pic: organization.pic,
                    phone: organization.phone
                }
            });
        }).catch((err) => {
            console.log(err);
            errors_1.default.internalServerError(res);
        });
    }).catch(err => {
        console.log(err);
        errors_1.default.internalServerError(res);
    });
};
let getPic = (req, res) => {
    let { pic } = req.query;
    if (pic.trim() === "") {
        res.status(404).send();
    }
    try {
        fs_1.default.createReadStream(path_1.default.join(__dirname, "../../storage/profile", pic)).pipe(res);
    }
    catch (err) {
        res.status(404).send();
    }
};
let deleteProfile = (req, res) => {
    let { checkString, _id } = req.body;
    let i = checkString.indexOf("<$>DELETE");
    if (i === -1) {
        errors_1.default.badRequestError(res);
    }
    else {
        let password = checkString.substring(0, i);
        Organisation_1.default.findById(_id)
            .then((organisation => {
            if (bcryptjs_1.default.compareSync(password, organisation.password)) {
                let notification = organisation.notifications;
                let tests = organisation.tests;
                let batches = organisation.batches;
                organisation.delete().then(() => {
                    res.cookie("token", "", {
                        maxAge: -1,
                        path: "/",
                        secure: true,
                        httpOnly: true
                    });
                    res.cookie("refresh_token", "", {
                        maxAge: -1,
                        path: "/",
                        secure: true,
                        httpOnly: true
                    });
                    res.status(200).json({ success: true });
                    Notification_1.default.deleteOne({ _id: notification })
                        .then(() => { }).catch(err => console.log(err));
                    if (tests.length > 0)
                        Test_1.default.deleteMany({ _id: { $in: tests } })
                            .then(() => { }).catch(console.log);
                    if (batches.length > 0)
                        Batch_1.default.deleteMany({ _id: { $in: batches } })
                            .then(() => { }).catch(console.log);
                }).catch((err) => {
                    errors_1.default.internalServerError(res);
                });
            }
            else
                errors_1.default.unAuthorizedError(res);
        })).catch((error) => {
            errors_1.default.internalServerError(res);
        });
    }
};
exports.default = {
    candidateLogin, organizationLogin,
    organizationSignup, refreshToken, editProfile,
    organizationLogout, feedback, settings, getPic, deleteProfile
};
