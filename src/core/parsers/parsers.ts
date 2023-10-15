export function parseTableColumns(columns: object[]): string {
    return columns.map((column) => {
        const keys = Object.keys(column);
        const key = keys[0];
        const value = column[key];
        return `${key} ${value}`;
    }).join(", ");
}

export function parseRawRowData<ModelType>(data: ModelType): { keys: string, values: string } {
    const values = Object.values(data).map((value) => {
        if (typeof value === "string")
            return `'${value}'`
        return value
    })
    return {
        keys: Object.keys(data).join(", "),
        values: values.join(", ")
    }
}

export function parseUpdateData<ModelType>(data: ModelType): string {
    return Object.keys(data).map((key) => {
        return `${key} = '${data[key]}'`
    }).join(", ")
}