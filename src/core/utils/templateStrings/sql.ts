import {Primitive} from "../types/primitive";


export function sql(strings: TemplateStringsArray, ...values: Primitive[]): [string, Primitive[]] {
    let result = strings[0] ?? '';
    for (let i = 1; i < strings.length; i++)
        result += `?${strings[i] ?? ''}`;
    return [result, values]
}
