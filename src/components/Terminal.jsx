import PropTypes from 'prop-types';
import React from 'react';
import { XTerm } from 'xterm-for-react';
import styles from '../styles/Terminal'
import { useAlert } from 'react-alert'
import useBottomMenu from "../contexts/bottomMenu/useBottomMenu";
import { useHistory } from 'react-router-dom';
const { ipcRenderer } = window.require('electron')

const terminalsData = {};

const addData = (id, data) => {
    if (terminalsData[id]) {
        terminalsData[id].push(data);
    } else {
        terminalsData[id] = [data];
    }
}

const getData = (id) => {
    return terminalsData[id] || [];
}

const getFitSize = (terminal) => {
    const BOTTOM_HEIGHT = 30;

    const height = window.innerHeight - BOTTOM_HEIGHT;
    const width = window.innerWidth;

    const rows = height / terminal._core._renderService.dimensions.actualCellHeight;
    const fullCols = width / terminal._core._renderService.dimensions.actualCellWidth;

    return { cols: Math.floor(fullCols), rows: Math.floor(rows), height, width };
}

const Terminal = (props) => {
    const bottomMenu = useBottomMenu();
    const term = React.useRef();
    const alert = useAlert();
    const history = useHistory();

    const { terminal, id } = JSON.parse(props.location.state);

    const onResize = function (e) {
        if (e) e.preventDefault();
        if (!term || !term.current || !term.current.terminal) return;
        const { cols, rows, height, width } = getFitSize(term.current.terminal);

        term.current.terminal.resize(cols, rows);
        ipcRenderer.send('onWindowResized', { size: { cols, rows, height, width }, id });
    };

    window.addEventListener('resize', onResize);

    React.useEffect(() => {
        if (!term || !term.current || !term.current.terminal) return;

        term.current && term.current.terminal.clear();

        getData(id).forEach((data) => {
            term.current && term.current.terminal.write(data, () => term.current.terminal.scrollToBottom());
        });

        const onSSHData = (e, { id: newDataId, data }) => {
            if (!term.current) return;
            addData(newDataId, data);
            if (id === newDataId) { // if an event comes from other terminal id
                term.current.terminal.write(Buffer.from(data, 'utf-8'));
            }
        };

        const onSSHError = (event, { id: newDataId, error }) => {
            alert.error('Connection erroned, ' + error.message, {
                onClose: () => {
                    bottomMenu.removeTerminal({ id: newDataId });
                    history.push('/');
                }
            });
        };
        const onSSHSTDError = (event, { id: newDataId, data }) => {
            if (newDataId === id) {
                alert.warn('Connection erroned, ' + data);

            }
        }

        const onSSHClose = (event, { id: newDataId, code, signal }) => {
            alert.error(`Connection closed with code ${code} (${signal})`, {
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


        const onTerminalData = term.current.terminal.onData(e => {
            ipcRenderer.send('send-command-ssh', { inputCommand: e, id });
        });

        ipcRenderer.send('init-ssh', { terminal, id, size: getFitSize(term.current.terminal) });
        onResize(null);
        return function cleanup() {
            onTerminalData.dispose();
            ipcRenderer.removeListener('ssh-data', onSSHData);
            ipcRenderer.removeListener('ssh-error', onSSHError);
            ipcRenderer.removeListener('ssh-stderr', onSSHSTDError);
            ipcRenderer.removeListener('ssh-close', onSSHClose);
            window.removeEventListener('resize', onResize);
        };
    }, [term, props.match.params.id]);

    return (
        <div style={styles.container}>
            <XTerm ref={term} />
        </div>
    );
}

Terminal.propTypes = {
    location: PropTypes.object,
    history: PropTypes.object,
    match: PropTypes.object
};

export default Terminal;