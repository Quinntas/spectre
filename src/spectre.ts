import {ISpectre} from "./iSpectre";
import {MySQL} from "./mysql/mysql";
import {Strategy} from "./core/strategy";
import {Postgresql} from "./postgresql/postgresql";


export class Spectre implements ISpectre {
    public strategy: Strategy

    public constructor(databaseConnectionUrl: string) {
        this.strategy = this.setStrategy(databaseConnectionUrl)
    }

    private setStrategy(databaseConnectionUrl: string) {
        const databaseType = databaseConnectionUrl.split("://")[0]

        switch (databaseType) {
            case "mysql":
                return new MySQL(databaseConnectionUrl)
            case "postgres":
            case "postgresql" :
                return new Postgresql(databaseType, databaseConnectionUrl)
            default:
                throw new Error(`Database not supported: ${databaseType}`)
        }
    }
}