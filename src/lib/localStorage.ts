import _ from "lodash";

function saveData(key: string, value: unknown): void {
    let formatted: string;
    switch (typeof value) {
        case 'string':
            formatted = value;
            break;
        case 'object':
        default:
            formatted = JSON.stringify(value);
            break;
    }
    localStorage.setItem(key, formatted);
}

function getData<T>(key: string): T | null {
    const strValue = localStorage.getItem(key);
    if (!strValue) return null;
    return _.attempt(JSON.parse, strValue) instanceof Error ? strValue: JSON.parse(strValue);
}

export { saveData, getData };