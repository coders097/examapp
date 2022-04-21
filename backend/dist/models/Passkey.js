"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
let passketSchema = new mongoose_1.default.Schema({
    candidates: [{
            type: String
        }],
    answers: []
});
exports.default = mongoose_1.default.model("passkey", passketSchema);
