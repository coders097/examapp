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
let testDeployedController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { _id } = req.body;
    if (!_id) {
        errors_1.default.badRequestError(res);
        return;
    }
    Organisation_1.default.findById(_id)
        .populate({
        path: "tests",
        populate: {
            path: "conductor"
        }
    }).then(org => {
        let data = org.tests;
        data = data.sort((a, b) => (new Date(a.dateOfCreation).getTime() - new Date(b.dateOfCreation).getTime()));
        data = data.filter((a) => a.conductor.status == true);
        res.status(200).json({
            success: true,
            data: data
        });
    }).catch(err => {
        console.log(err);
        ;
        errors_1.default.internalServerError(res);
    });
});
let latestTestsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { _id } = req.body;
    if (!_id) {
        errors_1.default.badRequestError(res);
        return;
    }
    Organisation_1.default.findById(_id)
        .populate({
        path: "tests",
        populate: {
            path: "conductor"
        }
    }).then(org => {
        let data = org.tests;
        data = data.sort((a, b) => (new Date(b.dateOfCreation).getTime() - new Date(a.dateOfCreation).getTime()));
        res.status(200).json({
            success: true,
            data: data.slice(0, 5)
        });
    }).catch(err => {
        console.log(err);
        ;
        errors_1.default.internalServerError(res);
    });
});
let latestBatchesController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { _id } = req.body;
    if (!_id) {
        errors_1.default.badRequestError(res);
        return;
    }
    Organisation_1.default.findById(_id).populate("batches")
        .then(organisation => {
        res.status(200).json({
            success: true,
            data: organisation.batches
        });
    }).catch(err => {
        console.log(err);
        ;
        errors_1.default.internalServerError(res);
    });
});
exports.default = {
    testDeployedController,
    latestTestsController,
    latestBatchesController
};
