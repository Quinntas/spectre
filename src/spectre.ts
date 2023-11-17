import {ISpectre} from "./iSpectre";
import {MySQL} from "./mysql/mysql";
import {Strategy} from "./core/strategy";
import {Dynamo} from "./dynamo/dynamo";
import {Postgresql} from "./postgresql/postgresql";

export enum SpectreDatabases {
    mysql,
    dynamodb,
    postgresql
}

export class Spectre implements ISpectre {
    public strategy: Strategy

    public constructor(dataBase: SpectreDatabases, ...args: any[]) {
        this.strategy = this.setStrategy(dataBase, ...args)
    }

    private setStrategy(dataBase: SpectreDatabases, ...args: any[]): Strategy {
        switch (dataBase) {
            case SpectreDatabases.mysql:
                return new MySQL(args[0])
            case SpectreDatabases.postgresql:
                return new Postgresql(args[0])
            case SpectreDatabases.dynamodb:
                return new Dynamo(args[0], args[1], args[2])
            default:
                throw new Error(`Database not supported: ${dataBase}`)
        }
    }
}
