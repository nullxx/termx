const keytar = window.require('keytar');
const { v4: uuid } = require('uuid');

async function storeSecure({ service = 'ssh', account = uuid(), secureValue }) {
    await keytar.setPassword(service, account, secureValue);
    return account;
}

async function getStoredSecure({ service = 'ssh', account }) {
    return keytar.getPassword(service, account);
}

export { storeSecure, getStoredSecure };