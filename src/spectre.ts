import {MySQL} from "./mysql/mysql";
import {QueryDTO, Strategy} from "./core/strategy";
import {BaseConfig} from "./core/utils/types/baseConfig";
import {SpectreResult} from "./core/result";

export {SpectreError, SpectreResult} from "./core/result";
export {sql} from "./core/utils/templateStrings/sql"
export {Primitive} from "./core/utils/types/primitive"

export interface ISpectre extends Strategy {
}

export class Spectre implements ISpectre {
    private strategy: Strategy

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

    public ping(): Promise<void> {
        return this.strategy.ping()
    }

    public raw<ReturnValueType extends object = object>(queryDTO: QueryDTO): Promise<SpectreResult<ReturnValueType>> {
        return this.strategy.raw<ReturnValueType>(queryDTO);
    }
}
