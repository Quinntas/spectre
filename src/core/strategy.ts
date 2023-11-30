import {Result} from "./result";
import {Primitive} from "./utils/types/primitive";

type QueryValue = { query: string, values: Primitive[] }

export type QueryDTO = QueryValue | QueryValue[]

export interface Strategy {
    rawQuery<ReturnValueType = any>(queryDTO: QueryDTO): Promise<Result<ReturnValueType>>

    ping()
}
