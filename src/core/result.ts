export enum SpectreError {
    DATABASE_CONNECTION_ERROR = "DATABASE_CONNECTION_ERROR",
    DATABASE_DUPLICATE_ENTRY = "DATABASE_DUPLICATE_ENTRY",
    DATABASE_WRONG_VALUE = "DATABASE_WRONG_VALUE",
    DATABASE_INTERNAL_ERROR = "DATABASE_INTERNAL_ERROR",
    DATABASE_BAD_REQUEST = "DATABASE_BAD_REQUEST",
    DATABASE_NOT_FOUND = "DATABASE_NOT_FOUND",
}


export class SpectreResult<ReturnValueType> {
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

export class SpectreResultError extends Error {
    private errorType: SpectreError;

    constructor(result: SpectreResult<{ message: string }>) {
        super(result.returnValue.message);
        this.errorType = result.errorType;
        this.name = "ResultError";
        this.message = result.returnValue.message;
    }
}

export const resultError = (message: string, error: SpectreError): SpectreResultError => {
    return new SpectreResultError(result(false, {message}, true, error));
}

export const result = <ReturnValueType>(isSuccessful: boolean, returnValue: ReturnValueType, isError: boolean = false, errorType?: SpectreError): SpectreResult<ReturnValueType> => {
    return new SpectreResult<ReturnValueType>(isSuccessful, returnValue, isError, errorType);
}