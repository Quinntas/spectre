import {Result} from "./result";

export interface Strategy {
    rawQuery<ReturnValueType = any>(query: string): Promise<Result<ReturnValueType>>
}
