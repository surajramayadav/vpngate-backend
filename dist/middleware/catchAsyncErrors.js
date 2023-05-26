"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const catchAsyncErrors = asyncFun => (req, res, next) => {
    Promise.resolve(asyncFun(req, res, next))
        .catch(next);
};
exports.default = catchAsyncErrors;
//# sourceMappingURL=catchAsyncErrors.js.map