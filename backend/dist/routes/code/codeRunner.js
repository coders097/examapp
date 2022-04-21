"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
let app = express_1.default.Router();
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const child_process_1 = require("child_process");
// @type  POST
// @route /code/compile
// @desc  for compiling code from candidate
// @access PRIVATE
app.post("/compile", (req, res) => {
    let { type, code, inputs } = req.body;
    fs_1.default.writeFileSync(path_1.default.join(__dirname, "../../../codeRunner/input"), inputs, "utf-8");
    let PATH = "";
    if (type === "java") {
        fs_1.default.writeFileSync(path_1.default.join(__dirname, "../../../codeRunner/Solution.java"), code, "utf-8");
        PATH = `node "${path_1.default.join(__dirname, "../../../codeRunner/javaRunner.js")}"`;
    }
    if (type === "python") {
        fs_1.default.writeFileSync(path_1.default.join(__dirname, "../../../codeRunner/Solution.py"), code, "utf-8");
        PATH = `node "${path_1.default.join(__dirname, "../../../codeRunner/pythonRunner.js")}"`;
    }
    if (type === "c_cpp") {
        fs_1.default.writeFileSync(path_1.default.join(__dirname, "../../../codeRunner/Solution.c"), code, "utf-8");
        PATH = `node "${path_1.default.join(__dirname, "../../../codeRunner/cRunner.js")}"`;
    }
    (0, child_process_1.exec)(PATH, (err, stdout, stderr) => {
        if (err) {
            console.log(err.message);
            res.status(200).json({ success: false });
        }
        else if (stderr) {
            console.log(stderr);
            res.status(200).json({
                success: true,
                data: stderr
            });
        }
        else {
            res.status(200).json({
                success: true,
                data: stdout
            });
        }
    });
});
exports.default = app;
