"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Postgresql = void 0;
const result_1 = require("../core/result");
const connectionStringParser_1 = require("../core/parsers/connectionStringParser");
const pg_1 = require("pg");
const sql_1 = require("../core/utils/templateStrings/sql");
class Postgresql {
    constructor(dateBaseUrl) {
        const connectionStringParser = new connectionStringParser_1.ConnectionStringParser({
            scheme: "postgresql",
            hosts: []
        });
        this.connectionObject = connectionStringParser.parse(dateBaseUrl);
        this.connectionPool = this.setConnection();
    }
    setConnection() {
        return new pg_1.Pool({
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
    ping() {
        return __awaiter(this, void 0, void 0, function* () {
            const [query, values] = (0, sql_1.sql) `/* ping */ SELECT 1`;
            yield this.rawQuery(query, values);
        });
    }
    errorHandler(err) {
        switch (err.name) {
            default:
                return (0, result_1.result)(false, err.message, true);
        }
    }
    rawQuery(query, values) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield this.connectionPool.connect();
            try {
                const queryConfig = {
                    text: query,
                    values,
                };
                const resultValues = yield client.query(queryConfig);
                return (0, result_1.result)(resultValues.rowCount > 0, resultValues.rows, false);
            }
            catch (e) {
                throw this.errorHandler(e);
            }
            finally {
                client.release();
            }
        });
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.connectionPool.end();
        });
    }
}
exports.Postgresql = Postgresql;
