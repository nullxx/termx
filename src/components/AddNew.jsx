import { Button, Checkbox, Icon, Image, Input, Label, Textarea } from "atomize";
import { getData, saveData } from '../lib/localStorage';

// import BottomMenu from './BottomMenu';
import HistoryBox from "./HistoryBox";
import PropTypes from 'prop-types';
import React from 'react';
import { VSeparator } from './Separator';
import _ from 'lodash';
import icon from '../assets/codificacion.png';
import styles from '../styles/AddNew';
import { useAlert } from 'react-alert'
import useBottomMenu from "../contexts/bottomMenu/useBottomMenu";
import { useHistory } from "react-router-dom";

const { v4: uuid } = require('uuid');

const AddNew = () => {
    const alert = useAlert();
    const bottomMenu = useBottomMenu();
    const history = useHistory();

    const [label, setLabel] = React.useState('');
    const [address, setAddress] = React.useState('');
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [port, setPort] = React.useState(22);
    const [useSSHKey, setUseSSHKey] = React.useState(false);
    const [sshKey, setSSHKey] = React.useState('');
    const [sshPhrase, setSSHPhrase] = React.useState('');

    const [historyData, setHistoryData] = React.useState(getData('history') || []);

    const runSSH = (history, port, label, address, username, password, sshKey, sshPhrase) => {

        if ([port, label, address, username, (password || sshKey)].filter((e) => e.length === 0).length > 0) {
            return alert.show('Please fill all the fields');
        }

        const parsedPort = _.parseInt(port, 10);
        if (!_.isInteger(parsedPort)) {
            return alert.info('Port should be an integer');
        }

        const terminal = { port: parsedPort, label, address, username, password, sshKey, sshPhrase };

        const id = uuid();
        history.push('/terminal/' + id, JSON.stringify({ terminal, id }));
        bottomMenu.addTerminal({ terminal, id });
    }

    const saveSSH = (port, label, address, username, password, sshKey, sshPhrase) => {

        if ([port, label, address, username, (password || sshKey)].filter((e) => e.length === 0).length > 0) {
            return alert.show('Please fill all the fields');
        }

        const parsedPort = _.parseInt(port, 10);
        if (!_.isInteger(parsedPort)) {
            return alert.info('Port should be an integer');
        }

        const toSave = { terminal: { port, label, address, username, password, sshKey, sshPhrase } };
        const prev = getData('history') || [];
        let savedPrevIndex = prev.findIndex(({ terminal }) => toSave.terminal.address === terminal.address);

        if (savedPrevIndex !== -1) {
            prev[savedPrevIndex] = toSave;
        } else {
            prev.push(toSave);
        }

        saveData('history', prev);
        setHistoryData(prev);

        alert.success('Saved!', { timeout: 2500 });
    }

    const editSSH = (terminal) => {
        const { port, label, address, username, password, sshKey, sshPhrase } = terminal;
        setPort(port);
        setLabel(label);
        setAddress(address);
        setUsername(username);
        setPassword(password);
        setSSHKey(sshKey);
        setSSHPhrase(sshPhrase);
        setUseSSHKey(sshKey.length > 0 && password.length === 0);
    };

    const deleteSSH = (terminal) => {
        const prev = getData('history') || [];
        let deletedArr = prev.filter(({ terminal: t }) => t.address !== terminal.address);

        saveData('history', deletedArr);
        setHistoryData(deletedArr);

        alert.success(`Address ${terminal.address} has been deleted!`, { timeout: 2500 });
    }

    return (
        <>
            <div style={styles.container}>
                <div style={styles.iconContainer}>
                    <Image src={icon} w="10rem" style={styles.imageIcon} />
                </div>
                <div style={styles.form}>

                    <Input
                        placeholder="Label"
                        value={label}
                        p={{ x: "2.5rem" }}
                        prefix={
                            <Icon
                                name="Bookmark"
                                size="16px"
                                cursor="pointer"
                                pos="absolute"
                                top="50%"
                                left="0.75rem"
                                transform="translateY(-50%)"
                            />
                        }
                        onChange={(e) => setLabel(e.target.value)}
                    />

                    <VSeparator />

                    <Input
                        placeholder="Address"
                        value={address}
                        p={{ x: "2.5rem" }}
                        prefix={
                            <Icon
                                name="Dribbble"
                                size="16px"
                                cursor="pointer"
                                pos="absolute"
                                top="50%"
                                left="0.75rem"
                                transform="translateY(-50%)"
                            />
                        }
                        onChange={(e) => setAddress(e.target.value)}
                    />

                    <VSeparator />

                    <Input
                        placeholder="Username"
                        value={username}
                        p={{ x: "2.5rem" }}
                        prefix={
                            <Icon
                                name="UserSolid"
                                size="16px"
                                cursor="pointer"
                                pos="absolute"
                                top="50%"
                                left="0.75rem"
                                transform="translateY(-50%)"
                            />
                        }
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <VSeparator />
                    <Input
                        placeholder="Port"
                        p={{ x: "2.5rem" }}
                        value={port}
                        prefix={
                            <Icon
                                name="Next"
                                size="16px"
                                cursor="pointer"
                                pos="absolute"
                                top="50%"
                                left="0.75rem"
                                transform="translateY(-50%)"
                            />
                        }
                        onChange={(e) => setPort(e.target.value)}
                    />

                    <VSeparator />

                    <Label align="center" textWeight="600" m={{ b: "0.5rem" }} style={styles.sshLabel}>
                        <Checkbox checked={useSSHKey} onChange={(e) => setUseSSHKey(e.target.checked)} /> Use SSH key
                    </Label>

                    <VSeparator />
                    {useSSHKey ? (
                        <>
                            <Textarea placeholder="Private key" value={sshKey} onChange={(e) => setSSHKey(e.target.value)} />
                            <VSeparator height={7} />
                            <Input
                                placeholder="Phrase"
                                p={{ x: "2.5rem" }}
                                type="password"
                                value={sshPhrase}
                                prefix={
                                    <Icon
                                        name="LockSolid"
                                        size="16px"
                                        cursor="pointer"
                                        pos="absolute"
                                        top="50%"
                                        left="0.75rem"
                                        transform="translateY(-50%)"
                                    />
                                }
                                onChange={(e) => setSSHPhrase(e.target.value)}
                            />
                        </>
                    ) : (
                        <Input
                            placeholder="Password"
                            p={{ x: "2.5rem" }}
                            type="password"
                            value={password}
                            prefix={
                                <Icon
                                    name="LockSolid"
                                    size="16px"
                                    cursor="pointer"
                                    pos="absolute"
                                    top="50%"
                                    left="0.75rem"
                                    transform="translateY(-50%)"
                                />
                            }
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    )}

                    <VSeparator />

                    <div style={styles.actionsContainer}>

                        <Button
                            suffix={
                                <Icon name="FolderSolid" size="20px" color="white" />
                            }
                            shadow="3"
                            hoverShadow="4"
                            m={{ r: "1rem" }}
                            onClick={() => saveSSH(port, label, address, username, password, sshKey, sshPhrase)}
                        >
                            Save it
                        </Button>

                        <Button
                            suffix={
                                <Icon name="Play" size="20px" color="white" />
                            }
                            shadow="3"
                            hoverShadow="4"
                            bg="success700"
                            hoverBg="success600"
                            m={{ r: "1rem" }}
                            onClick={() => runSSH(history, port, label, address, username, password, sshKey, sshPhrase)}
                        >
                            Connect
                        </Button>

                    </div>

                    <div style={styles.historyContainer}>

                        {historyData.map(({ terminal }, i) => (
                            <HistoryBox
                                key={i}
                                terminal={terminal}
                                onClick={() => runSSH(history, terminal.port, terminal.label, terminal.address, terminal.username, terminal.password, terminal.sshKey, terminal.sshPhrase)}
                                onEdit={editSSH}
                                onDelete={deleteSSH}
                            />
                        ))}

                    </div>
                </div>
            </div>
        </>
    );
}

AddNew.propTypes = {
    history: PropTypes.object
};


export default AddNew;
