import React, { FC, RefObject } from 'react';
import { Terminal, TerminalIdentifier, TerminalSize } from '../types/termx/Terminal';

import { HistoryState } from '../types/termx/History';
import { RouteComponentProps } from 'react-router';
import { XTerm } from 'xterm-for-react';
import { Terminal as XTermTerminal } from 'xterm';
import styles from '../styles/Terminal'
import { useAlert } from 'react-alert'
import useBottomMenu from "../contexts/bottomMenu/useBottomMenu";
import { useHistory } from 'react-router-dom';
import { WebLinksAddon } from 'xterm-addon-web-links';
const { ipcRenderer, shell } = window.require('electron')

interface MatchParams {
    id: string;
}

interface TerminalsData {
    [index: string]: Buffer[];
}

const terminalsData: TerminalsData = {};

const addData = (id: TerminalIdentifier, data: Buffer, maxBufferSize: number) => {
    if (terminalsData[id]) {
        terminalsData[id].push(data);
        if (terminalsData[id].length >= maxBufferSize) {
            terminalsData[id] = terminalsData[id].slice(terminalsData[id].length - maxBufferSize);
        }
    } else {
        terminalsData[id] = [data];
    }
}

const getData = (id: TerminalIdentifier) => {
    return terminalsData[id] || [];
}

const getFitSize = (terminal: XTermTerminal): TerminalSize => {
    const BOTTOM_HEIGHT = 30;

    const height = window.innerHeight - BOTTOM_HEIGHT;
    const width = window.innerWidth;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const core = (terminal as any)._core;

    const rows = height / core._renderService.dimensions.actualCellHeight;
    const fullCols = width / core._renderService.dimensions.actualCellWidth;

    return { cols: Math.floor(fullCols), rows: Math.floor(rows), height, width };
}

const TerminalComponent: FC<RouteComponentProps<MatchParams>> = (props) => {
    const webLinksAddon = new WebLinksAddon((_e, url) => shell.openExternal(url));
    const bottomMenu = useBottomMenu();
    const term = React.useRef() as RefObject<XTerm>;
    const alert = useAlert();
    const history = useHistory<HistoryState>();

    const { data }: HistoryState = props.location.state as HistoryState;
    const { spec: terminalSpec, id }: Terminal = data as unknown as Terminal;

    const onResize = function (e?: UIEvent) {
        e?.preventDefault();

        if (!term || !term.current || !term.current?.terminal) return;
        const { cols, rows, height, width } = getFitSize(term.current?.terminal);

        term.current?.terminal.resize(cols, rows);
        ipcRenderer.send('onWindowResized', { size: { cols, rows, height, width }, id });
    };

    window.addEventListener('resize', onResize);

    React.useEffect(() => {
        if (!term || !term.current || !term.current?.terminal) return;

        term.current && term.current?.terminal.clear();

        getData(id).forEach((data: Buffer) => {
            term.current && term.current?.terminal.write(data, () => term.current?.terminal.scrollToBottom());
        });

        const onSSHData = (_e: UIEvent, { id: newDataId, data }: { id: TerminalIdentifier, data: Buffer }) => {
            if (!term.current) return;
            const maxBufferSize = term.current.terminal.getOption('scrollback');
            addData(newDataId, data, maxBufferSize);
            if (id === newDataId) { // if an event comes from other terminal id
                term.current?.terminal.write(data, () => {
                    ipcRenderer.send('ssh-chunkWroten', { chunk: data, id }); // notify chunk was end woritting
                });
            }
        };

        const onSSHError = (_event: UIEvent, { id: newDataId, error }: { id: TerminalIdentifier, error: Error }) => {
            alert.error('Connection erroned, ' + error.message, {
                onClose: () => {
                    bottomMenu.removeTerminal({ id: newDataId });
                    history.push('/');
                }
            });
        };
        const onSSHSTDError = (_event: UIEvent, { id: newDataId, data }: { id: TerminalIdentifier, data: Buffer }) => {
            if (newDataId === id) {
                alert.show('Connection erroned, ' + data);

            }
        }

        const onSSHClose = (_event: UIEvent, { id: newDataId, code, signal }: { id: TerminalIdentifier, code: string, signal: string | undefined }) => {
            alert.error(`Connection closed with code ${code} ${signal ? `(${signal})` : ''}`, {
                onClose: () => {
                    bottomMenu.removeTerminal({ id: newDataId });
                    history.push('/');
                }
            });
        };

        ipcRenderer.addListener('ssh-data', onSSHData);
        ipcRenderer.addListener('ssh-error', onSSHError);
        ipcRenderer.addListener('ssh-stderr', onSSHSTDError);
        ipcRenderer.addListener('ssh-close', onSSHClose);


        const onTerminalData = [
            term.current?.terminal.onBinary(e => {
                ipcRenderer.send('send-command-ssh', { inputCommand: Buffer.from(e, 'binary'), id });
            }),
            term.current?.terminal.onData(e => {
                ipcRenderer.send('send-command-ssh', { inputCommand: Buffer.from(e, 'utf-8'), id });
            }),
        ]



        ipcRenderer.send('init-ssh', { terminal: terminalSpec, id, size: getFitSize(term.current?.terminal) });
        onResize();
        return function cleanup() {
            onTerminalData.forEach(({ dispose }) => dispose());
            ipcRenderer.removeListener('ssh-data', onSSHData);
            ipcRenderer.removeListener('ssh-error', onSSHError);
            ipcRenderer.removeListener('ssh-stderr', onSSHSTDError);
            ipcRenderer.removeListener('ssh-close', onSSHClose);
            window.removeEventListener('resize', onResize);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [term, props.match.params.id]);

    return (
        <div style={styles.container}>
            <XTerm ref={term} addons={[webLinksAddon]} />
        </div>
    );
}


export default TerminalComponent;