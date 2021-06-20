import { v4 as uuid } from 'uuid';

const keytar = window.require('keytar');

async function storeSecure({ service = 'ssh', account = uuid(), secureValue }: { service: string, account?: string, secureValue: string }): Promise<string> {
    await keytar.setPassword(service, account, secureValue);
    return account;
}

async function getStoredSecure({ service = 'ssh', account }: { service: string, account: string }): Promise<string> {
    return keytar.getPassword(service, account);
}
async function deleteStoredSecure({ service = 'ssh', account }: { service: string, account: string }): Promise<boolean> {
    return keytar.deletePassword(service, account);
}

export { storeSecure, getStoredSecure, deleteStoredSecure };