export type TerminalIdentifier = string;

export interface TerminalSpec {
    port: number;
    label: string;
    address: string;
    username: string;
    password?: string;
    passwordId?: string;
    sshKey?: string;
    sshKeyId?: string;
    sshPhrase?: string;
    sshPhraseId?: string;
}

export interface Terminal {
    id: TerminalIdentifier;
    spec: TerminalSpec;
}

export interface TerminalSize {
    cols: number;
    rows: number;
    height: number;
    width: number;
}