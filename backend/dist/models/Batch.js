"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
let batchSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true
    },
    candidates: [{
            name: {
                type: String,
                required: true
            },
            email: {
                type: String,
                required: true
            },
            regdNo: {
                type: String,
                required: true
            }
        }],
    dateOfCreation: {
        type: Date,
        default: Date.now
    },
    tests: [{
            type: mongoose_1.default.SchemaTypes.ObjectId,
            ref: "test"
        }]
});
exports.default = mongoose_1.default.model("batch", batchSchema);
