import {BaseDTO} from "./baseDTO";
import {WhereDTO} from "./whereDTO";

export interface UpdateRowDTO<DataType> extends BaseDTO, WhereDTO {
    data: DataType
}