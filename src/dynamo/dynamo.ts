import {DynamoDBClient, ExecuteTransactionCommand} from "@aws-sdk/client-dynamodb";
import {QueryDTO, Strategy} from "../core/strategy";
import {result, Result, SpectreError} from "../core/result";
import {DynamoDBDocumentClient, ExecuteStatementCommand,} from "@aws-sdk/lib-dynamodb";
import {Primitive} from "../core/utils/types/primitive";

interface AWSConfig {
    region: string
    credentials: {
        accessKeyId: string
        secretAccessKey: string
    }
}

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
            case "ResourceNotFoundException":
                return result(false, err.message, true, SpectreError.DATABASE_BAD_REQUEST);
            default:
                return result(false, err.message, true, SpectreError.DATABASE_INTERNAL_ERROR);
        }
    }

    public async rawQuery<ReturnValueType = any | any[]>(queryDTO: QueryDTO): Promise<Result<ReturnValueType>> {
        let command: ExecuteStatementCommand;

        if (Array.isArray(queryDTO)) {
            const dto: { Statement: string, Parameters: Primitive[] }[] = queryDTO.map(query => ({
                Statement: query.query,
                Parameters: query.values,
            }))

            command = new ExecuteTransactionCommand(dto);
        } else
            command = new ExecuteStatementCommand({
                Statement: queryDTO.query,
                Parameters: queryDTO.values,
                ConsistentRead: true,
            });

        try {
            const resultValues = await this.docClient.send(command)
            return result<ReturnValueType>(resultValues.Items.length > 0, resultValues as ReturnValueType, false);
        } catch (e) {
            throw this.errorHandler(e)
        }
    }
}