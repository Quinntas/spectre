import mysql from 'mysql'
import {Strategy} from "../core/strategy";
import {Result, result, SpectreError} from "../core/result";
import {ConnectionStringParser, IConnectionStringParameters} from "../core/parsers/connectionStringParser";

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

    private errorHandler(err: mysql.MysqlError): Result<any> {
        console.log(err)
        switch (err.code) {
            case "ER_DUP_ENTRY":
                return result(false, err.sqlMessage, true, SpectreError.DATABASE_DUPLICATE_ENTRY)
            case "ER_WRONG_VALUE":
                return result(false, err.sqlMessage, true, SpectreError.DATABASE_WRONG_VALUE)
            default:
                return result(false, err, true)
        }
    }

    public async rawQuery<ReturnValueType = any>(query: string): Promise<Result<ReturnValueType>> {
        const connection = this.connection
        const errorHandler = this.errorHandler
        return new Promise(function (resolve, reject) {
            connection.query(query, (err: mysql.MysqlError, values) => {
                if (err)
                    reject(errorHandler(err))
                resolve(result<ReturnValueType>(true, values, false))
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
