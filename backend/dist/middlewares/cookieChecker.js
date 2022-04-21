"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const refresh_key = process.env.REFRESH_KEY;
let cookieChecker = (req, res, next) => {
    let { email, password } = req.body;
    let { refresh_token } = req.cookies;
    if (refresh_token) {
    }
    next();
};
exports.default = cookieChecker;
