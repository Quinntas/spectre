"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Spectre = exports.SpectreDatabases = exports.sql = exports.partiql = exports.Result = exports.SpectreError = void 0;
const mysql_1 = require("./mysql/mysql");
const dynamo_1 = require("./dynamo/dynamo");
const postgresql_1 = require("./postgresql/postgresql");
var result_1 = require("./core/result");
Object.defineProperty(exports, "SpectreError", { enumerable: true, get: function () { return result_1.SpectreError; } });
Object.defineProperty(exports, "Result", { enumerable: true, get: function () { return result_1.Result; } });
var partiql_1 = require("./core/utils/templateStrings/partiql");
Object.defineProperty(exports, "partiql", { enumerable: true, get: function () { return partiql_1.partiql; } });
var sql_1 = require("./core/utils/templateStrings/sql");
Object.defineProperty(exports, "sql", { enumerable: true, get: function () { return sql_1.sql; } });
var SpectreDatabases;
(function (SpectreDatabases) {
    SpectreDatabases[SpectreDatabases["mysql"] = 0] = "mysql";
    SpectreDatabases[SpectreDatabases["dynamodb"] = 1] = "dynamodb";
    SpectreDatabases[SpectreDatabases["postgresql"] = 2] = "postgresql";
})(SpectreDatabases || (exports.SpectreDatabases = SpectreDatabases = {}));
class Spectre {
    constructor(dataBase, ...args) {
        this.strategy = this.setStrategy(dataBase, ...args);
    }
    setStrategy(dataBase, ...args) {
        switch (dataBase) {
            case SpectreDatabases.mysql:
                return new mysql_1.MySQL(args[0]);
            case SpectreDatabases.postgresql:
                return new postgresql_1.Postgresql(args[0]);
            case SpectreDatabases.dynamodb:
                return new dynamo_1.Dynamo(args[0], args[1], args[2]);
            default:
                throw new Error(`Database not supported: ${dataBase}`);
        }
    }
}
exports.Spectre = Spectre;
