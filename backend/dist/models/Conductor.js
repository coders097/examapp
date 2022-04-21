"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
let conductorScheme = new mongoose_1.default.Schema({
    status: {
        type: Boolean,
        default: false
    },
    startDateTime: {
        type: String,
        default: ""
    },
    endDateTime: {
        type: String,
        default: ""
    },
    markPerQuestion: {
        type: Number,
        default: 0
    },
    noOfQuestions: {
        type: Number,
        default: 0
    },
    randomiseQuestion: {
        type: Boolean,
        default: false
    },
    testTimeInMin: {
        type: Number,
        default: 15
    },
    passkeys: [{
            type: String,
            ref: "passkey"
        }],
    results: {
        type: mongoose_1.default.SchemaTypes.ObjectId,
        ref: "results"
    }
});
exports.default = mongoose_1.default.model("conductor", conductorScheme);
