import {BaseDTO} from "./baseDTO";

export interface InsertRowDTO<ModelType> extends BaseDTO {
    data: ModelType
}