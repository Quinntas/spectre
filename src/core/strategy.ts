import {SpectreResult} from "./result";
import {Primitive} from "./utils/types/primitive";

export type QueryDTO = [query: string, values: Primitive[]]

export interface Strategy {
    raw<ReturnValueType extends object = any>(queryDTO: QueryDTO): Promise<SpectreResult<ReturnValueType>>

    ping(): Promise<void>
}
