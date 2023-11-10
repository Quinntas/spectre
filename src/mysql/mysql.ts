import mysql from 'mysql';
import {Strategy} from "../core/strategy";
import {Result, result, SpectreError} from "../core/result";
import {ConnectionStringParser, IConnectionStringParameters} from "../core/parsers/connectionStringParser";
import {Primitive} from "../core/utils/types/primitive";
import {sql} from "../core/utils/templateStrings/sql";

export class MySQL implements Strategy {
    private connectionObject: IConnectionStringParameters;
    private readonly connectionPool: mysql.Pool;

    constructor(dateBaseUrl: string) {
        const connectionStringParser = new ConnectionStringParser({
            scheme: "mysql",
            hosts: []
        });
        this.connectionObject = connectionStringParser.parse(dateBaseUrl);
        this.connectionPool = this.setConnection();
        this.applyQueryFormatToPoolConnections()
    }

    public async ping() {
        const [query, values] = sql`/* ping */ SELECT ${1}`
        await this.rawQuery(query, values)
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

    private errorHandler(err: mysql.MysqlError): Result<any> {
        console.log(err);
        switch (err.code) {
            case "ER_EMPTY_QUERY":
            case "ER_PARSE_ERROR":
            case "ER_BAD_FIELD_ERROR:":
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

    private applyQueryFormatToPoolConnections() {
        this.connectionPool.on('connection', (connection) => {
            connection.config.queryFormat = function (query, values) {
                if (!values) return query;
                return query.replace(/\$\d+/g, function (txt) {
                    const index = parseInt(txt.slice(1)) - 1;
                    switch (typeof values[index]) {
                        case 'boolean':
                            return values[index] ? 'TRUE' : 'FALSE';
                        case 'string':
                        case 'number':
                            return values[index];
                        case 'object':
                            return this.escape(JSON.stringify(values[index]));
                        default:
                            if (values[index] === null) return 'NULL';
                            return txt
                    }
                }.bind(this));
            }
        });
    }

    public async rawQuery<ReturnValueType = any>(query: string, values: Primitive[]): Promise<Result<ReturnValueType>> {
        let connection: mysql.PoolConnection = await this.getConnection();
        try {
            const resultValues = await this.executeQuery(connection, query, values);
            return result<ReturnValueType>(values.length !== 0, resultValues, false);
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

    private executeQuery(connection: mysql.PoolConnection, query: string, values: Primitive[]): Promise<any> {
        return new Promise((resolve, reject) => {
            connection.query(
                query,
                values,
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