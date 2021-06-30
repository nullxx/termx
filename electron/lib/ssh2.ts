import { BrowserWindow, ipcMain } from 'electron';
import { Client, ClientChannel } from 'ssh2';
import { TerminalIdentifier, TerminalSize, TerminalSpec } from '../../src/types/termx/Terminal';

import { getFileName } from './utils';
import logger from 'electron-log';

interface SSHDatas {
    id: TerminalIdentifier;
    stream: ClientChannel;
    client: Client
}

let sshStreams: SSHDatas[] = []

const termDefault = 'xterm';

const initSSH = (_event: Electron.IpcMainEvent, { terminal, size, id }: { terminal: TerminalSpec, size: TerminalSize, id: TerminalIdentifier }) => {
    logger.debug(getFileName(__filename), initSSH.name, 'init', { size, id });

    const mainWindow = BrowserWindow.getFocusedWindow(); // by now only one window

    const sshStream = sshStreams.find((stream) => stream.id === id);
    if (sshStream) {
        logger.debug(getFileName(__filename), initSSH.name, 'stream', 'isPaused', sshStream.stream.isPaused());
        if (sshStream.stream.isPaused()) {
            logger.debug(getFileName(__filename), initSSH.name, 'stream', 'resuming');
            sshStream.stream.resume(); // resume if recover ssh session and it was left on paused
        }
        return;
    }

    const conn = new Client();

    conn.on('ready', () => {
        conn.shell({ term: termDefault, ...size }, (error, stream) => {
            if (error) {
                logger.error(getFileName(__filename), initSSH.name, 'shell', error);
                mainWindow?.webContents.send('ssh-error', { id, error });
                return;
            }

            sshStreams.push({ stream, id, client: conn });

            stream
                .on('close', (code: string, signal: string | undefined) => {
                    logger.warn(getFileName(__filename), initSSH.name, 'stream', 'close', { code, signal, id });
                    mainWindow?.webContents.send('ssh-close', { id, code, signal });
                    conn.end();
                    sshStreams = sshStreams.filter(({ id: idTodelete }) => idTodelete !== id);
                })
                .on('data', (data: string) => {
                    const dataBuffered = Buffer.from(data, 'utf-8');
                    ipcMain.once('ssh-chunkWroten', (_e, { chunk, id: newId }) => newId === id && Buffer.compare(chunk, dataBuffered) === 0 && stream.resume());
                    stream.pause();

                    mainWindow?.webContents.send('ssh-data', { id, data });
                })
                .stderr.on('data', (data: string) => {
                    logger.warn(getFileName(__filename), initSSH.name, 'stream', 'stderr', 'data', { data });
                    mainWindow?.webContents.send('ssh-stderr', { id, data });
                });
        })
    });

    try {
        const { address, username, password, port = 22, sshKey, sshPhrase } = terminal;

        conn.addListener('error', (error) => mainWindow?.webContents.send('ssh-error', { id, error }));

        conn.connect({
            host: address,
            port: port,
            username,
            password,
            privateKey: sshKey,
            passphrase: sshPhrase
        });

    } catch (error) {
        mainWindow?.webContents.send('ssh-error', { id, error });
    }
};

const sendCommandSSH = (_event: Electron.IpcMainEvent, { inputCommand, id }: { inputCommand: string, id: TerminalIdentifier }) => {
    logger.debug(getFileName(__filename), sendCommandSSH.name, 'init', { inputCommand, id });
    const mainWindow = BrowserWindow.getFocusedWindow();

    const streamObj = sshStreams.find((stream) => stream.id === id);

    if (!streamObj || !streamObj.stream || streamObj.stream.destroyed) {
        if (streamObj && streamObj.stream && streamObj.stream.destroyed) {
            mainWindow?.webContents.send('ssh-error', { id, error: new Error('Stream is closed') });
        }
        return;
    }

    logger.debug(getFileName(__filename), sendCommandSSH.name, 'writting to stream');
    if (streamObj.stream.isPaused()) { // if the stream is paused, wait until the next resume to write the stream
        streamObj.stream.once('resume', () => streamObj.stream.write(inputCommand));
    } else {
        streamObj.stream.write(inputCommand);
    }
};

const onWindowResized = (_event: Electron.IpcMainEvent, { size: { rows, cols, height, width }, id }: { size: TerminalSize, id: TerminalIdentifier }) => {
    logger.debug(getFileName(__filename), onWindowResized.name, 'init', { size: { rows, cols, height, width }, id });
    const streamObj = sshStreams.find((stream) => stream.id === id);

    if (!streamObj || !streamObj.stream || streamObj.stream.destroyed) {
        return false;
    }

    logger.debug(getFileName(__filename), onWindowResized.name, 'setting remote window', { rows, cols, height, width });
    return streamObj.stream.setWindow(rows, cols, height, width);
};

/**
 * @param {Object} obj
 * @param {number} obj.time - the time in seconds to check alive
 */
const checkAliveCron = ({ time }: { time: number }) => {
    logger.debug(getFileName(__filename), checkAliveCron.name, 'params', { time });

    const interval: NodeJS.Timeout = setInterval(() => {
        sshStreams.forEach(({ stream, id }) => {
            try {
                logger.debug(getFileName(__filename), checkAliveCron.name, 'stream', { destroyed: stream.destroyed, id });
                if (stream.destroyed) {
                    const mainWindow = BrowserWindow.getFocusedWindow();
                    mainWindow?.webContents.send('ssh-error', { id, error: new Error('Stream is closed') });
                    clearInterval(interval);
                }
            } catch (error) {
                logger.error(getFileName(__filename), checkAliveCron.name, error);
            }
        });
    }, time * 1000);
}

checkAliveCron({ time: 10 });
ipcMain.on('init-ssh', initSSH);
ipcMain.on('send-command-ssh', sendCommandSSH);
ipcMain.on('onWindowResized', onWindowResized);

