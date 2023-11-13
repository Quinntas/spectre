import {Strategy} from "../core/strategy";
import {Primitive} from "../core/utils/types/primitive";
import {result, Result} from "../core/result";
import {ConnectionStringParser, IConnectionStringParameters} from "../core/parsers/connectionStringParser";
import {Pool} from "pg";
import {sql} from "../core/utils/templateStrings/sql";

export class Postgresql implements Strategy {
    private connectionObject: IConnectionStringParameters;
    private readonly connectionPool: Pool;

    constructor(dateBaseUrl: string) {
        const connectionStringParser = new ConnectionStringParser({
            scheme: "postgresql",
            hosts: []
        });
        this.connectionObject = connectionStringParser.parse(dateBaseUrl);
        this.connectionPool = this.setConnection();
    }

    private setConnection(): Pool {
        return new Pool({
            host: this.connectionObject.hosts[0].host,
            port: this.connectionObject.hosts[0].port,
            user: this.connectionObject.username,
            password: this.connectionObject.password,
            database: this.connectionObject.endpoint,
            ssl: {
                rejectUnauthorized: this.connectionObject.options && this.connectionObject.options.ssl || false
            }
        });
    }

    async ping() {
        const [query, values] = sql`/* ping */ SELECT 1`
        await this.rawQuery(query, values)
    }

    private errorHandler(err: Error): Result<any> {
        switch (err.name) {
            default:
                return result(false, err.message, true)
        }
    }

    async rawQuery<ReturnValueType = any>(query: string, values: Primitive[]): Promise<Result<ReturnValueType>> {
        const client = await this.connectionPool.connect()
        try {
            const queryConfig = {
                text: query,
                values,
            }
            const resultValues = await client.query<ReturnValueType>(queryConfig)
            return result<ReturnValueType>(resultValues.rowCount > 0, resultValues.rows as ReturnValueType, false);
        } catch (e) {
            throw this.errorHandler(e)
        } finally {
            client.release()
        }
    }

    async disconnect() {
        await this.connectionPool.end()
    }

}