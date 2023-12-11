import {DynamoDBClient, ExecuteTransactionCommand} from "@aws-sdk/client-dynamodb";
import {QueryDTO, Strategy} from "../core/strategy";
import {result, Result, SpectreError} from "../core/result";
import {DynamoDBDocumentClient, ExecuteStatementCommand,} from "@aws-sdk/lib-dynamodb";
import {AttributeValue, ParameterizedStatement} from "@aws-sdk/client-dynamodb/dist-types/models/models_0";
import {Primitive} from "../core/utils/types/primitive";

interface AWSConfig {
    region: string
    credentials: {
        accessKeyId: string
        secretAccessKey: string
    }
}

type ParameterType = 'S' | 'N'

type Parameter = {
    [key in ParameterType]: Primitive;
};

export class Dynamo implements Strategy {
    private readonly client: DynamoDBClient
    private readonly docClient: DynamoDBDocumentClient

    constructor(region: string | null, accessKeyId: string | null, secretAccessKey: string | null) {
        const awsConfig: AWSConfig = {
            region,
            credentials: {
                accessKeyId,
                secretAccessKey
            }
        }
        this.client = new DynamoDBClient({
            region: awsConfig.region,
            credentials: {
                accessKeyId: awsConfig.credentials.accessKeyId,
                secretAccessKey: awsConfig.credentials.secretAccessKey
            },
        })
        this.docClient = DynamoDBDocumentClient.from(this.client);
    }

    ping() {

    }

    private errorHandler(err: Error): Result<any> {
        switch (err.name) {
            case "DuplicateItemException":
                return result(false, err.message, true, SpectreError.DATABASE_DUPLICATE_ENTRY);
            case "TransactionCanceledException":
            case "ResourceNotFoundException":
                return result(false, err.message, true, SpectreError.DATABASE_BAD_REQUEST);
            default:
                return result(false, err.message, true, SpectreError.DATABASE_INTERNAL_ERROR);
        }
    }

    private parameterizeValues(values: Primitive[]) {
        let result: Parameter[] = []
        values.forEach(value => {
            if (typeof value === 'string')
                result.push({S: value} as Parameter)
            else if (typeof value === 'number')
                result.push({N: value.toString()} as Parameter)
            else
                throw new Error(`Type ${typeof value} not supported`)
        })
        return result
    }

    public async rawQuery<ReturnValueType = any | any[]>(queryDTO: QueryDTO): Promise<Result<ReturnValueType>> {
        let command;

        if (Array.isArray(queryDTO)) {
            const dto = queryDTO.map(query => ({
                Statement: query.query,
                Parameters: this.parameterizeValues(query.values) as AttributeValue[],
            } as ParameterizedStatement))

            command = new ExecuteTransactionCommand({
                TransactStatements: dto
            });
        } else
            command = new ExecuteStatementCommand({
                Statement: queryDTO.query,
                Parameters: queryDTO.values,
                ConsistentRead: true,
            });

        try {
            const resultValues = await this.docClient.send(command) as any
            return result<ReturnValueType>(resultValues.Items.length > 0, resultValues as ReturnValueType, false);
        } catch (e) {
            throw this.errorHandler(e)
        }
    }
}