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
const Organisation_1 = __importDefault(require("../models/Organisation"));
const errors_1 = __importDefault(require("../controller/errors"));
let testBatchCheck = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let { _id, batchId, testId } = req.body;
    try {
        let organisation = yield Organisation_1.default.findById(_id);
        if (batchId) {
            let contains = organisation.batches
                .find(_batchId => _batchId.toString() === batchId.toString());
            if (!contains) {
                errors_1.default.notFoundError(res);
                return;
            }
        }
        if (testId) {
            let contains = organisation.tests
                .find(_testId => _testId.toString() === testId.toString());
            if (!contains) {
                errors_1.default.notFoundError(res);
                return;
            }
        }
        next();
    }
    catch (err) {
        errors_1.default.unAuthorizedError(res);
    }
});
exports.default = testBatchCheck;
