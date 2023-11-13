import {Strategy} from "../core/strategy";
import {result, Result, SpectreError} from "../core/result";
import {Primitive} from "../core/utils/types/primitive";

import sqlite3 from 'sqlite3'
import {Database, open} from 'sqlite'
import {sqlite} from "../core/utils/templateStrings/sqlite";


export class Sqlite implements Strategy {
    private readonly filename: string
    private connection: Database<sqlite3.Database, sqlite3.Statement>

    constructor(filename: string) {
        this.filename = filename
        this.setup(filename)
    }

    private async setup(filename: string): Promise<void> {
        this.connection = await open({
            filename,
            driver: sqlite3.cached.Database
        })
    }


    public async ping() {
        const [query, values] = sqlite`/* ping */ SELECT ${1}`
        await this.rawQuery(query, values)
    }

    private errorHandler(err): Result<any> {
        if (err.code === "SQLITE_ERROR")
            return result(false, err.message, true, SpectreError.DATABASE_BAD_REQUEST)
        return result(false, err.message, true, SpectreError.DATABASE_INTERNAL_ERROR)

    }

    public async rawQuery<ReturnValueType = any>(query: string, values: Primitive[]): Promise<Result<ReturnValueType>> {
        if (!this.connection) await this.setup(this.filename)

        try {
            const returnValues = await this.connection.all(query, values)
            return result(returnValues.length > 0, returnValues as ReturnValueType, false)
        } catch (e) {
            throw this.errorHandler(e)
        }
    }

}