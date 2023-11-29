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
exports.Dynamo = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const result_1 = require("../core/result");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
class Dynamo {
    constructor(region, accessKeyId, secretAccessKey) {
        const awsConfig = {
            region,
            credentials: {
                accessKeyId,
                secretAccessKey
            }
        };
        this.client = new client_dynamodb_1.DynamoDBClient({
            region: awsConfig.region,
            credentials: {
                accessKeyId: awsConfig.credentials.accessKeyId,
                secretAccessKey: awsConfig.credentials.secretAccessKey
            },
        });
        this.docClient = lib_dynamodb_1.DynamoDBDocumentClient.from(this.client);
    }
    ping() {
    }
    errorHandler(err) {
        switch (err.name) {
            case "ResourceNotFoundException":
                return (0, result_1.result)(false, err.message, true, result_1.SpectreError.DATABASE_BAD_REQUEST);
            default:
                return (0, result_1.result)(false, err.message, true, result_1.SpectreError.DATABASE_INTERNAL_ERROR);
        }
    }
    rawQuery(query, values) {
        return __awaiter(this, void 0, void 0, function* () {
            const command = new lib_dynamodb_1.ExecuteStatementCommand({
                Statement: query,
                Parameters: values,
                ConsistentRead: true,
            });
            try {
                const resultValues = yield this.docClient.send(command);
                return (0, result_1.result)(resultValues.Items.length > 0, resultValues, false);
            }
            catch (e) {
                throw this.errorHandler(e);
            }
        });
    }
}
exports.Dynamo = Dynamo;
