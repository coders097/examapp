// 400 -> BAD REQUEST
// 404 -> Not found
// 401 -> Unauthorized
// 500 -> Internal Server Error

import express from 'express';

let badRequestError = (res:express.Response)=>{
    res.status(400).json({
        success: false,
        error:"Bad Request"
    });
};

let notFoundError = (res:express.Response)=>{
    res.status(404).json({
        success: false,
        error:"Not Found Error"
    });
};

let unAuthorizedError = (res:express.Response)=>{
    res.status(401).json({
        success: false,
        error:"Unauthorised"
    });
};

let internalServerError = (res:express.Response)=>{
    res.status(500).json({
        success: false,
        error:"Internal Server Error"
    });
};

export default {
    badRequestError , internalServerError , unAuthorizedError , notFoundError
};