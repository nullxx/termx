const { BrowserWindow, ipcMain } = require('electron');
const sshStreams = []
const { Client } = require('ssh2');

const termDefault = 'xterm';

const initSSH = (event, { terminal, size, id }) => {
    const mainWindow = BrowserWindow.getFocusedWindow(); // by now only one window

    const sshStream = sshStreams.find((stream) => stream.id === id);
    if (sshStream) {

        if (sshStream.stream.isPaused()) {
            sshStream.stream.resume(); // resume if recover ssh session and it was left on paused
        }
        return;
    }

    const conn = new Client();

    conn.on('ready', () => {
        conn.shell({ term: termDefault, ...size }, (error, stream) => {
            if (error) return mainWindow.webContents.send('ssh-error', { id, error });

            let processingChunkBuffer = null;
            sshStreams.push({ stream, id });

            const onChunkWroten = (e, { chunk, id: newId }) => {
                const pcssChunkUint8Array = new Uint8Array(processingChunkBuffer.buffer, processingChunkBuffer.byteOffset, processingChunkBuffer.byteLength / Uint8Array.BYTES_PER_ELEMENT);

                if (stream.isPaused() && newId === id && Buffer.compare(pcssChunkUint8Array, chunk) === 0) {
                    stream.resume();
                    console.log('Stream resume');
                } else if (!stream.isPaused() && newId === id) {
                    console.warn('Stream was not paused while trying to resume it', id);
                }
            };

            ipcMain.on('ssh-chunkWroten', onChunkWroten);

            stream
                .on('close', (code, signal) => {
                    mainWindow.webContents.send('ssh-close', { id, code, signal });
                    ipcMain.removeListener('ssh-chunkWroten', onChunkWroten);
                    conn.end();
                })
                .on('data', (data) => {
                    stream.pause();
                    console.log('Stream pause');
                    processingChunkBuffer = Buffer.from(data, 'utf-8');
                    mainWindow.webContents.send('ssh-data', { id, data: processingChunkBuffer });
                })
                .stderr.on('data', (data) => mainWindow.webContents.send('ssh-stderr', { id, data }));
        })
    });

    try {
        const { address, username, password, port = 22, sshKey, sshPhrase } = terminal;

        conn.addListener('error', (error) => mainWindow.webContents.send('ssh-error', { id, error }));

        conn.connect({
            host: address,
            port: port,
            username,
            password,
            privateKey: sshKey,
            passphrase: sshPhrase
        });

    } catch (error) {
        mainWindow.webContents.send('ssh-error', { id, error });
    }
};

const sendCommandSSH = (event, { inputCommand, id }) => {
    const mainWindow = BrowserWindow.getFocusedWindow();

    const streamObj = sshStreams.find((stream) => stream.id === id);

    if (!streamObj || !streamObj.stream || streamObj.stream.closed) {
        if (streamObj && streamObj.stream && streamObj.stream.closed) {
            mainWindow.webContents.send('ssh-error', { id, error: new Error('Stream is closed') });
        }
        return;
    }
    return streamObj.stream.write(Buffer.from(inputCommand, 'utf-8'));
};

const onWindowResized = (event, { size: { rows, cols, height, width }, id }) => {
    const streamObj = sshStreams.find((stream) => stream.id === id);

    if (!streamObj || !streamObj.stream || streamObj.stream.closed) {
        return false;
    }

    return streamObj.stream.setWindow(rows, cols, height, width);
};

ipcMain.on('init-ssh', initSSH);
ipcMain.on('send-command-ssh', sendCommandSSH);
ipcMain.on('onWindowResized', onWindowResized);

