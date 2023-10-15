import {Result} from "./result";
import {CreateTableDTO} from "./dto/createTableDTO";
import {InsertRowDTO} from "./dto/insertRowDTO";
import {UpdateRowDTO} from "./dto/updateRowDTO";
import {DeleteRowDTO} from "./dto/deleteRowDTO";
import {GetManyDTO} from "./dto/getManyDTO";

export interface Strategy {
	rawQuery(query: string): Promise<Result<any>>;

	createTable(createTableDTO: CreateTableDTO): Promise<Result<any>>;

	dropTable(tableName: string): Promise<Result<any>>;

	insertRow<ModelType>(insertRowDTO: InsertRowDTO<ModelType>): Promise<Result<any>>;

	updateRow<ModelType>(updateRowDTO: UpdateRowDTO<ModelType>): Promise<Result<any>>;

	deleteRow(deleteRowDTO: DeleteRowDTO): Promise<Result<any>>;

	getMany<ModelType>(getManyDTO: GetManyDTO<ModelType>): Promise<Result<any>>;
}
