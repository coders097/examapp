"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
let resultSchema = new mongoose_1.default.Schema({
    results: [{
            name: {
                type: String,
                required: true
            },
            regdNo: {
                type: String,
                required: true
            },
            answerSheet: {
                prog: [{
                        _id: { type: String, required: true },
                        code: { type: String, required: true }
                    }],
                mcq: [{
                        id: { type: String, required: true },
                        answer: { type: String, required: true }
                    }]
            }
        }]
});
exports.default = mongoose_1.default.model("results", resultSchema);
