const { BrowserWindow, ipcMain } = require('electron');
const sshStreams = []
const { Client } = require('ssh2');

ipcMain.on('init-ssh', (event, { terminal, id }) => {
    const mainWindow = BrowserWindow.getFocusedWindow(); // by now only one window

    if (sshStreams.find((stream) => stream.id === id)) {
        return;
    }

    const conn = new Client();

    conn.on('ready', () => {
        conn.shell((err, stream) => {
            if (err) return mainWindow.webContents.send('ssh-error', err);

            sshStreams.push({ stream, id });

            stream
                .on('close', (code, signal) => mainWindow.webContents.send('ssh-close', { code, signal }) && conn.end())
                .on('data', (data) => mainWindow.webContents.send('ssh-data', { id, data }))
                .stderr.on('data', (data) => mainWindow.webContents.send('ssh-stderr', data));
        })
    });

    try {
        const { address, username, password, port = 22, sshKey, sshPhrase } = terminal;

        conn.addListener('error', (error) => mainWindow.webContents.send('ssh-error', error));

        conn.connect({
            host: address,
            port: port,
            username,
            password,
            privateKey: sshKey,
            passphrase: sshPhrase
        });

    } catch (error) {
        mainWindow.webContents.send('ssh-error', error);
    }
});


ipcMain.on('send-command-ssh', (event, { inputCommand, id }) => {
    const mainWindow = BrowserWindow.getFocusedWindow();

    const streamObj = sshStreams.find((stream) => stream.id === id);

    if (!streamObj || !streamObj.stream || streamObj.stream.closed) {
        return mainWindow.webContents.send('ssh-error', 'Stream not found');
    }

    streamObj.stream.write(inputCommand);
});
