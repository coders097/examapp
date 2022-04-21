"use strict";
// 400 -> BAD REQUEST
// 404 -> Not found
// 401 -> Unauthorized
// 500 -> Internal Server Error
Object.defineProperty(exports, "__esModule", { value: true });
let badRequestError = (res) => {
    res.status(400).json({
        success: false,
        error: "Bad Request"
    });
};
let notFoundError = (res) => {
    res.status(404).json({
        success: false,
        error: "Not Found Error"
    });
};
let unAuthorizedError = (res) => {
    res.status(401).json({
        success: false,
        error: "Unauthorised"
    });
};
let internalServerError = (res) => {
    res.status(500).json({
        success: false,
        error: "Internal Server Error"
    });
};
exports.default = {
    badRequestError, internalServerError, unAuthorizedError, notFoundError
};
