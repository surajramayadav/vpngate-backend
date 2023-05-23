
    import { Request, Response, NextFunction } from 'express';
    const catchAsyncErrors =  asyncFun => (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(asyncFun(req, res, next))
            .catch(next)
    }
    export default catchAsyncErrors;