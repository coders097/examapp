"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const refresh_key = process.env.REFRESH_KEY;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Organisation_1 = __importDefault(require("../models/Organisation"));
let cookieChecker = (req, res, next) => {
    let { email, password } = req.body;
    let { refresh_token } = req.cookies;
    if ((email.trim() === '') && (password.trim() === '')) {
        if (refresh_token) {
            let _data = jsonwebtoken_1.default.verify(refresh_token, refresh_key);
            Organisation_1.default.findById(_data._id)
                .then(organisation => {
                if (organisation && organisation.keepMeLoggedIn)
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
                else
                    next();
                return;
            }).catch(error => {
                next();
            });
        }
        else
            next();
    }
    else
        next();
};
exports.default = cookieChecker;
