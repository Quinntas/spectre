import {Pool, PoolClient, QueryResult} from 'pg';
import {Strategy} from '../core/strategy';
import {Result, result, SpectreError} from '../core/result';
import {ConnectionStringParser, IConnectionStringParameters} from '../core/parsers/connectionStringParser';

export class PostgreSQL implements Strategy {
    private readonly databaseUrl: string;
    private connectionObject: IConnectionStringParameters;
    private readonly connectionPool: Pool;

    constructor(databaseUrl: string) {
        this.databaseUrl = databaseUrl;
        const connectionStringParser = new ConnectionStringParser({
            scheme: 'postgres',
            hosts: [],
        });
        this.connectionObject = connectionStringParser.parse(this.databaseUrl);
        this.connectionPool = this.setConnection();
    }

    private setConnection(): Pool {
        return new Pool({
            user: this.connectionObject.username,
            password: this.connectionObject.password,
            host: this.connectionObject.hosts[0].host,
            port: this.connectionObject.hosts[0].port,
            database: this.connectionObject.endpoint,
            ssl: {
                rejectUnauthorized: false,
            },
        });
    }

    private errorHandler(err: Error): Result<any> {
        console.error(err);

        if (err instanceof Error) {
            if (err.message.includes('no such table')) {
                return result(false, err.message, true, SpectreError.DATABASE_BAD_REQUEST);
            } else if (err.message.includes('duplicate key value')) {
                return result(false, err.message, true, SpectreError.DATABASE_DUPLICATE_ENTRY);
            } else if (err.message.includes('invalid input syntax')) {
                return result(false, err.message, true, SpectreError.DATABASE_WRONG_VALUE);
            }
        }

        return result(false, err, true);
    }

    public async rawQuery<ReturnValueType = any>(query: string): Promise<Result<ReturnValueType>> {
        let client: PoolClient | null = null;
        try {
            client = await this.getConnection();
            const values = await this.executeQuery(client, query);
            return result<ReturnValueType>(true, values.rows as ReturnValueType);
        } catch (err) {
            return this.errorHandler(err);
        } finally {
            if (client) {
                client.release();
            }
        }
    }

    private getConnection(): Promise<PoolClient> {
        return this.connectionPool.connect();
    }

    private executeQuery(client: PoolClient, query: string): Promise<QueryResult<any>> {
        return new Promise((resolve, reject) => {
            client.query(query, (err: Error, result: QueryResult<any>) => {
                if (err) {
                    reject(this.errorHandler(err));
                } else {
                    resolve(result);
                }
            });
        });
    }

    public async endConnectionPool(): Promise<void> {
        await this.connectionPool.end();
    }
}
