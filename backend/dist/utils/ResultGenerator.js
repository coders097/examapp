"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const cp = __importStar(require("child_process"));
let runnAndOutput = (lang) => {
    if (lang === "java") {
        try {
            cp.execSync(`javac "${path.join(__dirname, "./Solution.java")}"`);
            let res = cp.execSync(`java -classpath "${__dirname}" Solution < "${path.join(__dirname, "./input")}"`);
            return res.toString();
        }
        catch (e) {
            return e.message;
        }
    }
    else if (lang === "python") {
        try {
            let data = cp.execSync(`python "${path.join(__dirname, "./Solution.py")}" < "${path.join(__dirname, "./input")}"`);
            return data.toString();
        }
        catch (e) {
            return e.message;
        }
    }
    else
        return "";
};
let resultGenerator = ({ results, markPerQuestion, batches, mcqQuestions, progQuestions, resultId, noOfQuestions }) => {
    let resultSheet = fs.createWriteStream(path.join(__dirname, "../../storage/results", resultId));
    let mcqSet = new Map();
    mcqQuestions.forEach((question) => {
        mcqSet.set(question.id, question.answer);
    });
    let batchCandi = new Map();
    batches.forEach((batch) => {
        batch.candidates.forEach((candidate) => {
            batchCandi.set(candidate.regdNo, {
                email: candidate.email,
                name: candidate.name,
                regdNo: candidate.regdNo
            });
        });
    });
    let answerSets = new Map();
    results.forEach(result => {
        answerSets.set(result.regdNo, result);
    });
    let totalMarks = noOfQuestions * markPerQuestion;
    // MCQ VERIFICATION
    resultSheet.write("TYPE :: MCQ RESULTS\n");
    batches.forEach(batch => {
        resultSheet.write("BATCH :: " + batch.name + "\n");
        resultSheet.write("CANDIDATES :: \n");
        batch.candidates.forEach((candidate, i) => {
            resultSheet.write(`${i + 1}. ${candidate.name.replace(" ", "_")} ${candidate.email} ${candidate.regdNo} MARKS = `);
            let correctNo = 0;
            let individualAns = answerSets.get(candidate.regdNo);
            if (individualAns) {
                individualAns.answerSheet.mcq.forEach(answer => {
                    if (answer.answer.trim() == mcqSet.get(answer.id))
                        correctNo++;
                });
            }
            resultSheet.write(`${correctNo * markPerQuestion}/${totalMarks} \n`);
        });
        resultSheet.write(":: \n");
        resultSheet.write(":: \n");
    });
    resultSheet.write(":: \n");
    // PROG VERIFICATION
    totalMarks = progQuestions.length * markPerQuestion;
    let actualProgResults = new Map();
    let progQuestionTestCases = new Map();
    progQuestions.forEach((question) => {
        let output = fs.readFileSync(path.join(__dirname, "../../storage/outputFiles", question.outputsFile)).toString().trim();
        actualProgResults.set(question._id.toString(), output);
        let testCase = fs.readFileSync(path.join(__dirname, "../../storage/testCases", question.testCasesFile)).toString().trim();
        progQuestionTestCases.set(question._id.toString(), testCase);
    });
    resultSheet.write("TYPE :: PROG RESULTS\n");
    batches.forEach(batch => {
        resultSheet.write("BATCH :: " + batch.name + "\n");
        resultSheet.write("CANDIDATES :: \n");
        batch.candidates.forEach((candidate, i) => {
            var _a;
            resultSheet.write(`${i + 1}. ${candidate.name.replace(" ", "_")} ${candidate.email} ${candidate.regdNo} MARKS = `);
            let correctNo = 0;
            let allProgAnswers = (_a = answerSets.get(candidate.regdNo)) === null || _a === void 0 ? void 0 : _a.answerSheet.prog;
            allProgAnswers === null || allProgAnswers === void 0 ? void 0 : allProgAnswers.forEach(progAns => {
                var _a;
                try {
                    let progData = progAns.code.split("<$%$%$>");
                    if (progData.length == 2) {
                        if (progData[0] == "java") {
                            fs.writeFileSync(path.join(__dirname, "../../dist/utils/", "Solution.java"), progData[1], "utf-8");
                        }
                        else if (progData[0] == "python") {
                            fs.writeFileSync(path.join(__dirname, "../../dist/utils/", "Solution.py"), progData[1], "utf-8");
                        }
                    }
                    fs.writeFileSync(path.join(__dirname, "../../dist/utils/", "input"), progQuestionTestCases.get(progAns._id), "utf-8");
                    let check1 = progData[1].trim() == "" ? "error" : runnAndOutput(progData[0]).trim();
                    let check2 = (_a = actualProgResults.get(progAns._id)) === null || _a === void 0 ? void 0 : _a.trim();
                    if (check1 == check2) {
                        correctNo++;
                    }
                    console.log(candidate.name);
                    console.log(check1, "\n", check2, "\n___");
                }
                catch (e) { }
            });
            resultSheet.write(`${correctNo * markPerQuestion}/${totalMarks} \n`);
        });
        resultSheet.write(":: \n");
        resultSheet.write(":: \n");
    });
    resultSheet.write(":: \n");
    resultSheet.end();
};
exports.default = {
    resultGenerator
};
