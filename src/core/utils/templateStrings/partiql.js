"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.partiql = void 0;
function partiql(strings, ...values) {
    var _a, _b;
    let result = (_a = strings[0]) !== null && _a !== void 0 ? _a : '';
    for (let i = 1; i < strings.length; i++)
        result += `?${(_b = strings[i]) !== null && _b !== void 0 ? _b : ''}`;
    return [result, values];
}
exports.partiql = partiql;
