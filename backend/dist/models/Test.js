"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
let testSchema = new mongoose_1.default.Schema({
    name: {
        type: String
    },
    mcqQuestions: [{
            question: {
                type: String,
                required: true
            },
            options: [{
                    type: String
                }],
            answer: {
                type: String,
                required: true
            },
            id: {
                type: String,
                required: true
            }
        }],
    progQuestions: [{
            question: {
                title: {
                    type: String,
                    required: true
                },
                description: {
                    type: String,
                    required: true
                },
                examples: [{
                        input: {
                            type: String
                        },
                        output: {
                            type: String
                        }
                    }]
            },
            testCasesFile: {
                type: String
            },
            outputsFile: {
                type: String
            }
        }],
    batches: [{
            type: mongoose_1.default.SchemaTypes.ObjectId,
            ref: "batch"
        }],
    dateOfCreation: {
        type: Date,
        default: Date.now
    },
    conductor: {
        type: mongoose_1.default.SchemaTypes.ObjectId,
        ref: "conductor"
    }
});
exports.default = mongoose_1.default.model("test", testSchema);
