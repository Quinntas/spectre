import mysql from 'mysql'
import {Strategy} from "../core/strategy";
import {Result, result, SpectreError} from "../core/result";
import {CreateTableDTO} from "../core/dto/createTableDTO";
import {parseRawRowData, parseTableColumns, parseUpdateData} from "../core/parsers/parsers";
import {InsertRowDTO} from "../core/dto/insertRowDTO";
import {UpdateRowDTO} from "../core/dto/updateRowDTO";
import {DeleteRowDTO} from "../core/dto/deleteRowDTO";
import {ConnectionStringParser, IConnectionStringParameters} from "../core/parsers/connectionStringParser";
import {GetManyDTO} from "../core/dto/getManyDTO";

export class MySQL implements Strategy {
	private readonly dateBaseUrl: string;

	private connectionObject: IConnectionStringParameters

	private readonly connection: mysql.Connection

	public constructor(dateBaseUrl: string, autoConnect: boolean = true) {
		this.dateBaseUrl = dateBaseUrl;

		const connectionStringParser = new ConnectionStringParser({
			scheme: "mysql",
			hosts: []
		})

		this.connectionObject = connectionStringParser.parse(this.dateBaseUrl)

		this.connection = this.setConnection()

		if (autoConnect)
			this.connect()
	}

	private setConnection() {
		return mysql.createConnection({
			host: this.connectionObject.hosts[0].host,
			port: this.connectionObject.hosts[0].port,
			user: this.connectionObject.username,
			password: this.connectionObject.password,
			database: this.connectionObject.endpoint,
			ssl: {
				rejectUnauthorized: false
			}
		})
	}

	public async deleteRow(deleteRowDTO: DeleteRowDTO): Promise<Result<any>> {
		const query = `DELETE FROM ${deleteRowDTO.tableName} WHERE ${deleteRowDTO.where}`
		return this.rawQuery(query)
	}

	public async updateRow<ModelType>(updateRowDTO: UpdateRowDTO<ModelType>): Promise<Result<any>> {
		const query = `UPDATE ${updateRowDTO.tableName} SET ${parseUpdateData(updateRowDTO.data)} WHERE ${updateRowDTO.where}`
		return this.rawQuery(query)
	}

	public async insertRow<ModelType>(insertRowDTO: InsertRowDTO<ModelType>): Promise<Result<any>> {
		const {keys, values} = parseRawRowData(insertRowDTO.data)
		const query = `INSERT INTO ${insertRowDTO.tableName} (${keys}) VALUES (${values})`
		return this.rawQuery(query)
	}

	public async dropTable(tableName: string): Promise<Result<any>> {
		const query = `DROP TABLE ${tableName}`
		return this.rawQuery(query)
	}

	public async createTable(createTableDTO: CreateTableDTO): Promise<Result<any>> {
		const query = `CREATE TABLE ${createTableDTO.tableName} (${parseTableColumns(createTableDTO.columns)})`
		return this.rawQuery(query)
	}

	private errorHandler(err: mysql.MysqlError): Result<any> {
		console.log(err)
		switch (err.code) {
			case "ER_DUP_ENTRY":
				return result(false, err.sqlMessage, true, SpectreError.DATABASE_DUPLICATE_ENTRY)
			case "ER_WRONG_VALUE":
				return result(false, err.sqlMessage, true, SpectreError.DATABASE_WRONG_VALUE)
			default:
				result(false, err, true)
		}
	}

	public async getMany<ModelType>(getManyDTO: GetManyDTO<ModelType>): Promise<Result<any>> {
		const query = `SELECT * FROM ${getManyDTO.tableName} WHERE ${getManyDTO.filter} IN (${getManyDTO.values})`
		return this.rawQuery(query)
	}

	public async rawQuery(query: string): Promise<Result<any>> {
		const connection = this.connection
		const errorHandler = this.errorHandler
		const isSelect = query.toLowerCase().includes('select')
		return new Promise(function (resolve, reject) {
			connection.query(query, (err: mysql.MysqlError, values) => {
				if (err)
					reject(errorHandler(err))
				else if (isSelect && values.length === 0)
					resolve(result(false, [], false))
				resolve(result(true, values, false))
			})
		})
	}

	private connect() {
		this.connection.connect()
	}

	private endConnection() {
		this.connection.end()
	}
}
