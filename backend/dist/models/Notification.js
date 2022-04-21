"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// notifications
const mongoose_1 = __importDefault(require("mongoose"));
let NotificationScheme = new mongoose_1.default.Schema({
    active: {
        type: "boolean",
        default: true
    },
    notifications: [{
            type: String,
        }]
});
exports.default = mongoose_1.default.model("notifications", NotificationScheme);
