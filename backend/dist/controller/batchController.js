"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const xlsx_1 = __importDefault(require("xlsx"));
const errors_1 = __importDefault(require("../controller/errors"));
const Batch_1 = __importDefault(require("../models/Batch"));
const Organisation_1 = __importDefault(require("../models/Organisation"));
const Test_1 = __importDefault(require("../models/Test"));
let resultsOuputFuncHelper = (data) => {
    let wb = xlsx_1.default.read(data);
    let ws = wb.Sheets[wb.SheetNames[0]];
    let batchData = xlsx_1.default.utils.sheet_to_json(ws);
    return batchData;
};
let addBatchData = (req, res) => {
    let { batchData, batchId } = req.body;
    if (!batchId) {
        errors_1.default.badRequestError(res);
        return;
    }
    let results = [];
    try {
        if (req.files && req.files.length > 0) {
            results = resultsOuputFuncHelper(req.files[0].buffer);
        }
        else {
            if (!batchData) {
                errors_1.default.badRequestError(res);
                return;
            }
            else
                batchData = JSON.parse(batchData);
            batchData.forEach((batch) => {
                if (batch.Name && batch.Email && batch.Regd)
                    results.push(batch);
            });
        }
        if (results.length === 0) {
            errors_1.default.badRequestError(res);
            return;
        }
        Batch_1.default.findById(batchId).populate({
            path: "tests",
            select: "name _id"
        })
            .then(batch => {
            if (batch) {
                results.forEach(_data => {
                    if (_data.Name && _data.Email && _data.Regd)
                        batch.candidates.push({
                            name: _data.Name,
                            email: _data.Email,
                            regdNo: _data.Regd
                        });
                });
                batch.save().then(() => {
                    res.status(200).json({
                        success: true,
                        data: {
                            _id: batchId,
                            tests: batch.tests,
                            candidates: batch.candidates,
                            name: batch.name,
                            dateOfCreation: batch.dateOfCreation
                        }
                    });
                }).catch(() => {
                    errors_1.default.internalServerError(res);
                });
            }
            else
                errors_1.default.notFoundError(res);
        }).catch(error => {
            console.log(error);
            errors_1.default.internalServerError(res);
        });
    }
    catch (err) {
        console.log(err);
        errors_1.default.internalServerError(res);
    }
};
let addBatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { _id, batchName } = req.body;
    if (!batchName) {
        errors_1.default.badRequestError(res);
        return;
    }
    try {
        let organization = yield Organisation_1.default.findById(_id);
        if (organization) {
            let batch = yield Batch_1.default.create({ name: batchName });
            organization.batches.push(batch._id);
            organization.save()
                .then(() => {
                res.status(200).json({ success: true, data: {
                        name: batch.name,
                        _id: batch._id,
                        candidates: [],
                        dateOfCreation: batch.dateOfCreation,
                        tests: []
                    } });
            }).catch((error) => {
                errors_1.default.internalServerError(res);
            });
        }
        else
            throw new Error("Organisation Doesn't Exist");
    }
    catch (err) {
        console.log(err);
        errors_1.default.internalServerError(res);
    }
});
let editBatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { command, batchName, batchId, candiData } = req.body;
    if (!command || !batchId) {
        errors_1.default.badRequestError(res);
        return;
    }
    try {
        let batch = yield Batch_1.default.findById(batchId);
        if (!batch)
            throw new Error("Not Found");
        if (command === 'RENAME') {
            if (!batchName) {
                errors_1.default.badRequestError(res);
                return;
            }
            batch.name = batchName;
            batch.save().then(() => {
                res.status(200).json({
                    success: true,
                    data: batchName
                });
            }).catch((err) => { errors_1.default.internalServerError(res); });
        }
        else if (command === 'DEL_CANDIDATES') {
            if (!candiData)
                throw new Error("Not Correct Info");
            let map = new Map();
            candiData.forEach((candi) => {
                map.set(candi.regdNo, true);
            });
            batch.candidates = batch.candidates
                .filter(candidate => !map.has(candidate.regdNo));
            batch.save().then(() => { res.status(200).json({ success: true }); })
                .catch((e) => { errors_1.default.internalServerError(res); });
        }
        else
            errors_1.default.badRequestError(res);
    }
    catch (err) {
        console.log(err);
        errors_1.default.internalServerError(res);
    }
});
let getBatchData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { batchId } = req.body;
    if (!batchId) {
        errors_1.default.badRequestError(res);
        return;
    }
    try {
        let batch = yield Batch_1.default.findById(batchId).populate({
            path: "tests",
            select: "name _id"
        });
        if (batch) {
            res.status(200).json({
                success: true,
                data: {
                    _id: batchId,
                    tests: batch.tests,
                    candidates: batch.candidates,
                    name: batch.name,
                    dateOfCreation: batch.dateOfCreation
                }
            });
        }
        else
            errors_1.default.notFoundError(res);
    }
    catch (e) {
        errors_1.default.internalServerError(res);
    }
});
let deleteBatch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { _id, batchId } = req.body;
    if (!_id || !batchId) {
        errors_1.default.badRequestError(res);
        return;
    }
    try {
        let organization = yield Organisation_1.default.findById(_id);
        let batch = yield Batch_1.default.findById(batchId);
        if (organization && batch) {
            organization.batches = organization.batches.filter(_batchId => {
                return _batchId.toString() != batchId;
            });
            batch.tests.forEach(testId => {
                Test_1.default.updateOne({ _id: testId }, { $pull: { "batches": testId } }).then(() => { }).catch(() => { });
            });
            organization.save().then(() => {
                res.status(200).json({ success: true });
                Batch_1.default.deleteOne({ _id: batchId }).then(() => {
                    console.log("Deleted batch!");
                }).catch(() => { });
            });
        }
        else
            errors_1.default.notFoundError(res);
    }
    catch (e) {
        console.log(e);
        errors_1.default.internalServerError(res);
    }
});
exports.default = {
    addBatchData, addBatch, editBatch, getBatchData, deleteBatch
};
