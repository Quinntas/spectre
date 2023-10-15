import {BaseDTO} from "./baseDTO";

export interface GetManyDTO<ModelType> extends BaseDTO {
	filter: string
	values: ModelType[]
}
