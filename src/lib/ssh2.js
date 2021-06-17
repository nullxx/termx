const { BrowserWindow, ipcMain } = require('electron');
const sshStreams = []
const { Client } = require('ssh2');

const termDefault = 'xterm';

ipcMain.on('init-ssh', (event, { terminal, size, id }) => {
    const mainWindow = BrowserWindow.getFocusedWindow(); // by now only one window

    if (sshStreams.find((stream) => stream.id === id)) {
        return;
    }

    const conn = new Client();

    conn.on('ready', () => {
        conn.shell({ term: termDefault, ...size }, (error, stream) => {
            if (error) return mainWindow.webContents.send('ssh-error', { id, error });

            sshStreams.push({ stream, id });

            stream
                .on('close', (code, signal) => mainWindow.webContents.send('ssh-close', { id, code, signal }) && conn.end())
                .on('data', (data) => mainWindow.webContents.send('ssh-data', { id, data: Buffer.from(data, 'utf-8') }))
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
});


ipcMain.on('send-command-ssh', (event, { inputCommand, id }) => {
    const mainWindow = BrowserWindow.getFocusedWindow();

    const streamObj = sshStreams.find((stream) => stream.id === id);

    if (!streamObj || !streamObj.stream || streamObj.stream.closed) {
        return mainWindow.webContents.send('ssh-error', { id, error: new Error('Stream not found') });
    }
    return streamObj.stream.write(Buffer.from(inputCommand, 'utf-8'));
});

ipcMain.on('onWindowResized', (event, { size: { rows, cols, height, width }, id }) => {
    const streamObj = sshStreams.find((stream) => stream.id === id);

    if (!streamObj || !streamObj.stream || streamObj.stream.closed) {
        return false;
    }

    return streamObj.stream.setWindow(rows, cols, height, width);
});

