import {MySQL} from "./mysql/mysql";
import {Strategy} from "./core/strategy";
import {BaseConfig} from "./core/utils/types/baseConfig";

export {SpectreError, SpectreResult} from "./core/result";
export {sql} from "./core/utils/templateStrings/sql"
export {Primitive} from "./core/utils/types/primitive"

export interface ISpectre {
    strategy: Strategy
}

export class Spectre implements ISpectre {
    public strategy: Strategy

    public constructor(config: BaseConfig) {
        this.strategy = this.setStrategy(config)
    }

    private setStrategy(config: BaseConfig): Strategy {
        switch (config.database) {
            case "mysql":
                const mysqlConfig = {
                    uri: config.uri,
                    database: config.database
                }
                return new MySQL(mysqlConfig)
            default:
                throw new Error(`Database not supported`)
        }
    }
}
