"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const errorHandler_1 = __importDefault(require("../utils/errorHandler"));
const errorMiddleware = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";
    // Wrong Mongodb id error
    if (err.name == "CastError") {
        const message = "Resource not found. Invalid :" + err.path;
        err = new errorHandler_1.default(message, 400);
    }
    // Mongodb Duplicate key error
    if (err.code === 11000) {
        const message = " Email is already exits";
        err = new errorHandler_1.default(message, 400);
    }
    //  Wrong JWT error
    if (err.name == "JsonWebTokenError") {
        const message = "Token is invalid , try again";
        err = new errorHandler_1.default(message, 400);
    }
    //  Wrong JWT EXPIRE error
    if (err.name == "TokenExpiredError") {
        const message = "Token is Expired , try again";
        err = new errorHandler_1.default(message, 400);
    }
    res.status(err.statusCode).json({
        success: false,
        message: err.message,
        // stack:err.stack
    });
};
exports.default = errorMiddleware;
//# sourceMappingURL=error.js.map