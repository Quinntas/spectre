import {Strategy} from "../core/strategy";
import {CreateTableDTO} from "../core/dto/createTableDTO";
import {result, Result, SpectreError} from "../core/result";
import {DeleteRowDTO} from "../core/dto/deleteRowDTO";
import {InsertRowDTO} from "../core/dto/insertRowDTO";
import {UpdateRowDTO} from "../core/dto/updateRowDTO";
import {ConnectionStringParser, IConnectionStringParameters} from "../core/parsers/connectionStringParser";
import {Client, QueryResult} from "pg";
import {parseRawRowData, parseTableColumns, parseUpdateData} from "../core/parsers/parsers";
import {GetManyDTO} from "src/core/dto/getManyDTO";

export class Postgresql implements Strategy {
	private readonly dateBaseUrl: string;

	private connectionObject: IConnectionStringParameters

	private readonly client: Client

	public constructor(scheme: string, dateBaseUrl: string, autoConnect: boolean = true) {
		this.dateBaseUrl = dateBaseUrl;

		const connectionStringParser = new ConnectionStringParser({
			scheme,
			hosts: []
		})

		this.connectionObject = connectionStringParser.parse(this.dateBaseUrl)

		this.client = this.setConnection()

		if (autoConnect)
			this.connect()
	}

	getMany<ModelType>(getManyDTO: GetManyDTO<ModelType>): Promise<Result<any>> {
		throw new Error("Method not implemented.");
	}

	public disconnect() {
		return Promise.resolve(this.client.end())
	}

	public connect() {
		return Promise.resolve(this.client.connect())
	}

	private setConnection() {
		return new Client({
			host: this.connectionObject.hosts[0].host,
			port: this.connectionObject.hosts[0].port,
			user: this.connectionObject.username,
			password: this.connectionObject.password,
			database: this.connectionObject.endpoint
		})
	}

	createTable(createTableDTO: CreateTableDTO): Promise<Result<any>> {
		const query = `CREATE TABLE ${createTableDTO.tableName} (${parseTableColumns(createTableDTO.columns)})`
		return this.rawQuery(query)
	}

	deleteRow(deleteRowDTO: DeleteRowDTO): Promise<Result<any>> {
		const query = `DELETE FROM ${deleteRowDTO.tableName} WHERE ${deleteRowDTO.where}`
		return this.rawQuery(query)
	}

	dropTable(tableName: string): Promise<Result<any>> {
		const query = `DROP TABLE ${tableName}`
		return this.rawQuery(query)
	}

	insertRow<ModelType>(insertRowDTO: InsertRowDTO<ModelType>): Promise<Result<any>> {
		const {keys, values} = parseRawRowData(insertRowDTO.data)
		const query = `INSERT INTO "${insertRowDTO.tableName}" (${keys}) VALUES (${values})`
		return this.rawQuery(query)
	}

	private errorHandler(err: object): Result<any> {
		switch (err['code']) {
			case '23505':
				return result(false, err['detail'], true, SpectreError.DATABASE_DUPLICATE_ENTRY)
			default:
				return result(false, err['message'], true, SpectreError.DATABASE_INTERNAL_ERROR)
		}
	}

	async rawQuery(query: string): Promise<Result<any>> {
		const isSelect = query.toLowerCase().includes('select')

		let response: QueryResult

		try {
			response = await this.client.query(query)
		} catch (err) {
			throw this.errorHandler(err)
		}

		if (isSelect && response.rowCount === 0)
			result(false, [], false)

		return result(true, response.rows, false)
	}

	updateRow<ModelType>(updateRowDTO: UpdateRowDTO<ModelType>): Promise<Result<any>> {
		const query = `UPDATE ${updateRowDTO.tableName} SET ${parseUpdateData(updateRowDTO.data)} WHERE ${updateRowDTO.where}`
		return this.rawQuery(query)
	}

}
