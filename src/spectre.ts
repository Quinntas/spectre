import {ISpectre} from "./iSpectre";
import {MySQL} from "./mysql/mysql";
import {Strategy} from "./core/strategy";
import {Dynamo} from "./dynamo/dynamo";
import {partiql} from "./core/utils/templateStrings/partiql";

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

(async () => {
    const a = new Spectre(SpectreDatabases.DynamoDB,
        "us-east-1",
        "AKIAUVI6GUQQ3BTMKEXD",
        "0Sc47z/rqKf29Y5nj1/ASGJpT8NIPpTjwM/OIhi7"
    )

    const [b, c] = partiql`SELECT * FROM Test2 where id=${1}`

    const z = await a.strategy.rawQuery(b, c)

    console.log(z)
})()