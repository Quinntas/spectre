import {Spectre, sql} from "./src/spectre";

(async () => {
    const spectre = new Spectre({uri: "mysql://root:rootpwd@localhost:3306/test", database: "mysql"})

    const q = sql`
        SELECT *
        FROM users
        WHERE id = ${180}
    `

    const res = await spectre.strategy.rawQuery(q)

    console.log(res)
})()