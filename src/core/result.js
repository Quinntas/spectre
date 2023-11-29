"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.result = exports.Result = exports.SpectreError = void 0;
var SpectreError;
(function (SpectreError) {
    SpectreError["DATABASE_CONNECTION_ERROR"] = "DATABASE_CONNECTION_ERROR";
    SpectreError["DATABASE_DUPLICATE_ENTRY"] = "DATABASE_DUPLICATE_ENTRY";
    SpectreError["DATABASE_WRONG_VALUE"] = "DATABASE_WRONG_VALUE";
    SpectreError["DATABASE_INTERNAL_ERROR"] = "DATABASE_INTERNAL_ERROR";
    SpectreError["DATABASE_BAD_REQUEST"] = "DATABASE_BAD_REQUEST";
    SpectreError["DATABASE_NOT_FOUND"] = "DATABASE_NOT_FOUND";
})(SpectreError || (exports.SpectreError = SpectreError = {}));
class Result {
    constructor(isSuccessful, returnValue, isError = false, errorType) {
        this.isSuccessful = isSuccessful;
        this.returnValue = returnValue;
        this.isError = isError;
        this.errorType = errorType;
    }
}
exports.Result = Result;
const result = (isSuccessful, returnValue, isError = false, errorType) => {
    return new Result(isSuccessful, returnValue, isError, errorType);
};
exports.result = result;
