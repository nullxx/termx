function saveData(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function getData(key) {
    const strValue = localStorage.getItem(key);
    if (!strValue) return null;
    return JSON.parse(strValue);
}

export { saveData, getData };