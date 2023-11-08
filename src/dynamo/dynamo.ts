import {DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {Strategy} from "../core/strategy";
import {Primitive} from "../core/utils/types/primitive";
import {Result} from "../core/result";
import {DynamoDBDocumentClient, ExecuteStatementCommand,} from "@aws-sdk/lib-dynamodb";

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

    constructor(region: string, accessKeyId: string, secretAccessKey: string) {
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

    public async rawQuery<ReturnValueType = any>(query: string, values: Primitive[]): Promise<Result<ReturnValueType>> {
        const command = new ExecuteStatementCommand({
            Statement: query,
            Parameters: values,
            ConsistentRead: true,
        });

        const result = await this.docClient.send(command)

        console.log(result)

        return {
            isSuccessful: true,
            returnValue: null,
            errorType: null,
            isError: false,
        };
    }
}