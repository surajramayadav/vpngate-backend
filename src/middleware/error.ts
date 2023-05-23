import ErrorHandler from '../utils/errorHandler'

    const errorMiddleware = (err, req, res, next) => {
        err.statusCode = err.statusCode || 500
        err.message = err.message || "Internal Server Error"
    
        // Wrong Mongodb id error
        if (err.name == "CastError") {
            const message = "Resource not found. Invalid :"+err.path
            err = new ErrorHandler(message, 400)
        }
    
        // Mongodb Duplicate key error
        if (err.code === 11000) {
            const message =" Email is already exits";
            err = new ErrorHandler(message, 400)
        }
    
    
        //  Wrong JWT error
        if (err.name == "JsonWebTokenError") {
            const message = "Token is invalid , try again"
            err = new ErrorHandler(message, 400)
        }
    
        //  Wrong JWT EXPIRE error
        if (err.name == "TokenExpiredError") {
            const message = "Token is Expired , try again"
            err = new ErrorHandler(message, 400)
        }
    
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
            // stack:err.stack
        })
    }
    
    
    export default errorMiddleware
    