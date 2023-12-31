import mysql from 'mysql';
import {Strategy} from "../core/strategy";
import {Result, result, SpectreError} from "../core/result";
import {ConnectionStringParser, IConnectionStringParameters} from "../core/parsers/connectionStringParser";

export class MySQL implements Strategy {
	private readonly dateBaseUrl: string;
	private connectionObject: IConnectionStringParameters;
	private readonly connectionPool: mysql.Pool;

	constructor(dateBaseUrl: string) {
		this.dateBaseUrl = dateBaseUrl;
		const connectionStringParser = new ConnectionStringParser({
			scheme: "mysql",
			hosts: []
		});
		this.connectionObject = connectionStringParser.parse(this.dateBaseUrl);
		this.connectionPool = this.setConnection();
	}

	private setConnection(): mysql.Pool {
		return mysql.createPool({
			host: this.connectionObject.hosts[0].host,
			port: this.connectionObject.hosts[0].port,
			user: this.connectionObject.username,
			password: this.connectionObject.password,
			database: this.connectionObject.endpoint,
			ssl: {
				rejectUnauthorized: false
			}
		});
	}

	private errorHandler(err: mysql.MysqlError): Result<any> {
		console.log(err);
		switch (err.code) {
			case "ER_NO_SUCH_TABLE":
				return result(false, err.sqlMessage, true, SpectreError.DATABASE_BAD_REQUEST);
			case "ER_DUP_ENTRY":
				return result(false, err.sqlMessage, true, SpectreError.DATABASE_DUPLICATE_ENTRY);
			case "ER_WRONG_VALUE":
			case "ER_TRUNCATED_WRONG_VALUE":
				return result(false, err.sqlMessage, true, SpectreError.DATABASE_WRONG_VALUE);
			default:
				return result(false, err, true);
		}
	}

	public async rawQuery<ReturnValueType = any>(query: string): Promise<Result<ReturnValueType>> {
		let connection: mysql.PoolConnection = await this.getConnection();
		try {
			const values = await this.executeQuery(connection, query);
			const isSelect = query.toLowerCase().includes("select") 
			if (isSelect && values.length === 0)
				return result<ReturnValueType>(false, values, false);
			return result<ReturnValueType>(true, values, false);
		} catch (err) {
			throw err;
		} finally {
			connection.release();
		}
	}

	private getConnection(): Promise<mysql.PoolConnection> {
		return new Promise((resolve, reject) => {
			this.connectionPool.getConnection((err, connection) => {
				if (err) {
					reject(this.errorHandler(err));
				}
				resolve(connection);
			});
		});
	}

	private executeQuery(connection: mysql.PoolConnection, query: string): Promise<any> {
		return new Promise((resolve, reject) => {
			connection.query(query, (err: mysql.MysqlError, values) => {
				if (err) {
					reject(this.errorHandler(err));
				}
				resolve(values);
			});
		});
	}

	public endConnectionPool(): Promise<void> {
		return new Promise((resolve, reject) => {
			this.connectionPool.end((err) => {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});
		});
	}
}
