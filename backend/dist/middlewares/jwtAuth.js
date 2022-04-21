"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwt_key = process.env.JWT_KEY;
let jwtCheckToken = (req, res, next) => {
    let { token } = req.cookies;
    if (token) {
        try {
            let data = jsonwebtoken_1.default.verify(token, jwt_key);
            req.body._id = data["_id"];
            next();
        }
        catch (e) {
            res.status(401).send({
                success: false,
                error: 'Expired Token!'
            });
        }
    }
    else {
        res.status(401).send({
            success: false,
            error: 'Authentication Error'
        });
    }
};
exports.default = jwtCheckToken;
