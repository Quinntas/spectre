import {ISpectre} from "./iSpectre";
import {MySQL} from "./mysql/mysql";
import {Strategy} from "./core/strategy";
import {Dynamo} from "./dynamo/dynamo";

export enum SpectreDatabases {
    MySQL,
    DynamoDB,
}

export class Spectre implements ISpectre {
    public strategy: Strategy

    public constructor(dataBase: SpectreDatabases, ...args: any[]) {
        this.strategy = this.setStrategy(dataBase, ...args)
    }

    private setStrategy(dataBase: SpectreDatabases, ...args: any[]): Strategy {
        switch (dataBase) {
            case SpectreDatabases.MySQL:
                return new MySQL(args[0])
            case SpectreDatabases.DynamoDB:
                return new Dynamo(args[0], args[1], args[2])
            default:
                throw new Error(`Database not supported: ${dataBase}`)
        }
    }
}