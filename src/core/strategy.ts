import {Result} from "./result";
import {Primitive} from "./utils/types/primitive";

export interface Strategy {
    rawQuery<ReturnValueType = any>(query: string, values: Primitive[]): Promise<Result<ReturnValueType>>

    ping()
}
