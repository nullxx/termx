function saveData(key: string, value: unknown) : void {
    localStorage.setItem(key, JSON.stringify(value));
}

function getData(key: string) : unknown {
    const strValue = localStorage.getItem(key);
    if (!strValue) return null;
    return JSON.parse(strValue);
}

export { saveData, getData };