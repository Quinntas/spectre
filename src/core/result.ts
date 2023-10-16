export enum SpectreError {
    DATABASE_CONNECTION_ERROR = "DATABASE_CONNECTION_ERROR",
    DATABASE_DUPLICATE_ENTRY = "DATABASE_DUPLICATE_ENTRY",
    DATABASE_WRONG_VALUE = "DATABASE_WRONG_VALUE",
    DATABASE_INTERNAL_ERROR = "DATABASE_INTERNAL_ERROR",
    DATABASE_BAD_REQUEST = "DATABASE_BAD_REQUEST",
    DATABASE_NOT_FOUND = "DATABASE_NOT_FOUND",
}

export class Result<ReturnValueType> {
    public isSuccessful: boolean;
    public returnValue: ReturnValueType;
    public isError: boolean;
    public errorType?: SpectreError;

    constructor(isSuccessful: boolean, returnValue: ReturnValueType, isError: boolean = false, errorType?: SpectreError) {
        this.isSuccessful = isSuccessful;
        this.returnValue = returnValue;
        this.isError = isError;
        this.errorType = errorType;
    }
}

export const result = <ReturnValueType>(isSuccessful: boolean, returnValue: ReturnValueType, isError: boolean = false, errorType?: SpectreError): Result<ReturnValueType> => {
    return new Result<ReturnValueType>(isSuccessful, returnValue, isError, errorType);
}