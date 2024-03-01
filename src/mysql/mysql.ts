import {QueryDTO, Strategy} from "../core/strategy";
import {result, resultError, SpectreError, SpectreResult} from "../core/result";
import {ConnectionStringParser, IConnectionStringParameters} from "../core/parsers/connectionStringParser";
import {sql} from "../core/utils/templateStrings/sql";
import {MySQLConfig} from "./mysql.config";
import * as mysql from "mysql";

export class MySQL implements Strategy {
    private connectionObject: IConnectionStringParameters;
    private readonly connectionPool: mysql.Pool;

    constructor(mysqlConfig: MySQLConfig) {
        const connectionStringParser = new ConnectionStringParser({
            scheme: "mysql",
            hosts: []
        });
        this.connectionObject = connectionStringParser.parse(mysqlConfig.uri);
        try {
            this.connectionPool = this.setConnection();
        } catch (err) {
            console.error(err);
            throw resultError("Could not connect to the database", SpectreError.DATABASE_CONNECTION_ERROR)
        }
    }

    public async ping() {
        const q = sql`/* ping */ SELECT ${1}`
        await this.raw(q)
    }

    private setConnection(): mysql.Pool {
        return mysql.createPool({
            host: this.connectionObject.hosts[0].host,
            port: this.connectionObject.hosts[0].port,
            user: this.connectionObject.username,
            password: this.connectionObject.password,
            database: this.connectionObject.endpoint,
            waitForConnections: true,
            connectionLimit: this.connectionObject.options && this.connectionObject.options.connectionLimit || 10,
            queueLimit: this.connectionObject.options && this.connectionObject.options.queueLimit || 0,
            ssl: {
                rejectUnauthorized: this.connectionObject.options && this.connectionObject.options.ssl || false
            }
        });
    }

    private errorHandler(err: mysql.MysqlError) {
        switch (err.code) {
            case "ER_EMPTY_QUERY":
            case "ER_PARSE_ERROR":
            case "ER_BAD_FIELD_ERROR:":
            case "ER_NO_SUCH_TABLE":
                return resultError(err.sqlMessage, SpectreError.DATABASE_NOT_FOUND);
            case "ER_DUP_ENTRY":
                return resultError(err.sqlMessage, SpectreError.DATABASE_DUPLICATE_ENTRY);
            case "ER_WRONG_VALUE":
            case "ER_TRUNCATED_WRONG_VALUE":
            case "ER_NO_TABLES_USED":
                return resultError(err.sqlMessage, SpectreError.DATABASE_WRONG_VALUE);
            default:
                return resultError(err.message, SpectreError.DATABASE_INTERNAL_ERROR);
        }
    }

    public async raw<ReturnValueType extends object = any>(queryDTO: QueryDTO): Promise<SpectreResult<ReturnValueType>> {
        let connection: mysql.PoolConnection = await this.getConnection();
        try {
            const resultValues = await this.executeQuery(connection, queryDTO);
            const isArrayAndHasItems = Array.isArray(resultValues) && resultValues.length > 0;
            const isSuccessful = isArrayAndHasItems || resultValues.affectedRows > 0;
            const isArrayAndHasOneItem = isArrayAndHasItems && resultValues.length === 1;
            return result<ReturnValueType>(isSuccessful, isArrayAndHasOneItem ? resultValues[0] : resultValues, false);
        } catch (err) {
            throw err
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

    private executeQuery(connection: mysql.PoolConnection, queryDTO: QueryDTO): Promise<any> {
        return new Promise((resolve, reject) => {
            connection.query(
                queryDTO[0],
                queryDTO[1],
                (err: mysql.MysqlError, values) => {
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