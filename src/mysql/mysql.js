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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MySQL = void 0;
const mysql_1 = __importDefault(require("mysql"));
const result_1 = require("../core/result");
const connectionStringParser_1 = require("../core/parsers/connectionStringParser");
const sql_1 = require("../core/utils/templateStrings/sql");
class MySQL {
    constructor(dateBaseUrl) {
        const connectionStringParser = new connectionStringParser_1.ConnectionStringParser({
            scheme: "mysql",
            hosts: []
        });
        this.connectionObject = connectionStringParser.parse(dateBaseUrl);
        this.connectionPool = this.setConnection();
        this.applyQueryFormatToPoolConnections();
    }
    ping() {
        return __awaiter(this, void 0, void 0, function* () {
            const [query, values] = (0, sql_1.sql) `/* ping */ SELECT ${1}`;
            yield this.rawQuery(query, values);
        });
    }
    setConnection() {
        return mysql_1.default.createPool({
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
    errorHandler(err) {
        console.log(err);
        switch (err.code) {
            case "ER_EMPTY_QUERY":
            case "ER_PARSE_ERROR":
            case "ER_BAD_FIELD_ERROR:":
            case "ER_NO_SUCH_TABLE":
                return (0, result_1.result)(false, err.sqlMessage, true, result_1.SpectreError.DATABASE_BAD_REQUEST);
            case "ER_DUP_ENTRY":
                return (0, result_1.result)(false, err.sqlMessage, true, result_1.SpectreError.DATABASE_DUPLICATE_ENTRY);
            case "ER_WRONG_VALUE":
            case "ER_TRUNCATED_WRONG_VALUE":
                return (0, result_1.result)(false, err.sqlMessage, true, result_1.SpectreError.DATABASE_WRONG_VALUE);
            default:
                return (0, result_1.result)(false, err, true);
        }
    }
    applyQueryFormatToPoolConnections() {
        this.connectionPool.on('connection', (connection) => {
            connection.config.queryFormat = function (query, values) {
                if (!values)
                    return query;
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
                            if (values[index] === null)
                                return 'NULL';
                            return txt;
                    }
                }.bind(this));
            };
        });
    }
    rawQuery(query, values) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = yield this.getConnection();
            try {
                const resultValues = yield this.executeQuery(connection, query, values);
                return (0, result_1.result)(resultValues.length > 0, resultValues, false);
            }
            catch (err) {
                throw err;
            }
            finally {
                connection.release();
            }
        });
    }
    getConnection() {
        return new Promise((resolve, reject) => {
            this.connectionPool.getConnection((err, connection) => {
                if (err) {
                    reject(this.errorHandler(err));
                }
                resolve(connection);
            });
        });
    }
    executeQuery(connection, query, values) {
        return new Promise((resolve, reject) => {
            connection.query(query, values, (err, values) => {
                if (err) {
                    reject(this.errorHandler(err));
                }
                resolve(values);
            });
        });
    }
    endConnectionPool() {
        return new Promise((resolve, reject) => {
            this.connectionPool.end((err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
}
exports.MySQL = MySQL;
