import {BaseDTO} from "./baseDTO";

export interface CreateTableDTO extends BaseDTO {
    columns: object[]
}