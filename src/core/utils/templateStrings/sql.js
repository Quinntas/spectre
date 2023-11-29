"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sql = void 0;
function sql(strings, ...values) {
    var _a, _b;
    let result = (_a = strings[0]) !== null && _a !== void 0 ? _a : '';
    for (let i = 1; i < strings.length; i++)
        result += `$${i}${(_b = strings[i]) !== null && _b !== void 0 ? _b : ''}`;
    return [result, values];
}
exports.sql = sql;
