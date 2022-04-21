"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
let orgaSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    pic: {
        type: String
    },
    tests: [{
            type: mongoose_1.default.SchemaTypes.ObjectId,
            ref: "test"
        }],
    batches: [{
            type: mongoose_1.default.SchemaTypes.ObjectId,
            ref: "batch"
        }],
    dateOfCreation: {
        type: Date,
        default: Date.now
    },
    notifications: {
        type: mongoose_1.default.SchemaTypes.ObjectId,
        required: true,
        ref: "notifications"
    },
    keepMeLoggedIn: {
        type: Boolean,
        default: true
    }
});
exports.default = mongoose_1.default.model("organisation", orgaSchema);
