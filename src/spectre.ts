import {ISpectre} from "./iSpectre";
import {MySQL} from "./mysql/mysql";
import {Strategy} from "./core/strategy";
import {Dynamo} from "./dynamo/dynamo";
import {Postgresql} from "./postgresql/postgresql";

export {SpectreError, Result} from "./core/result";
export {partiql} from "./core/utils/templateStrings/partiql"
export {sql} from "./core/utils/templateStrings/sql"
export {Primitive} from "./core/utils/types/primitive"

export type SpectreConfig = {
    database: "postgresql" | "mysql"
    uri: string
} | {
    database: "dynamodb"
    region: string
    accessKeyId: string
    secretAccessKey: string
}

export class Spectre implements ISpectre {
    public strategy: Strategy

    public constructor(config: SpectreConfig) {
        this.strategy = this.setStrategy(config)
    }

    private setStrategy(config: SpectreConfig): Strategy {
        switch (config.database) {
            case "mysql":
                return new MySQL(config.uri)
            case"postgresql":
                return new Postgresql(config.uri)
            case "dynamodb":
                return new Dynamo(config.region, config.accessKeyId, config.secretAccessKey)
            default:
                throw new Error(`Database not supported`)
        }
    }
}
