import { Button, Checkbox, Icon, Image, Input, Label, Textarea } from "atomize";
import React, { FC } from 'react';
import { TerminalIdentifier, TerminalSpec } from '../types/termx/Terminal';
import { deleteStoredSecure, getStoredSecure, storeSecure } from "../lib/secureStorage";
import { getData, saveData } from '../lib/localStorage';

import HistoryBox from "./HistoryBox";
import { HistoryState } from "../types/termx/History";
import PropTypes from 'prop-types';
import { VSeparator } from './Separator';
import _ from 'lodash';
import icon from '../assets/codificacion.png';
import styles from '../styles/AddNew';
import { useAlert } from 'react-alert'
import useBottomMenu from "../contexts/bottomMenu/useBottomMenu";
import { useHistory } from "react-router-dom";
import { v4 as uuid } from 'uuid';

const logger = window.require('electron-log');

const AddNew: FC = () => {
    const alert = useAlert();
    const bottomMenu = useBottomMenu();
    const history = useHistory<HistoryState>();

    const [label, setLabel] = React.useState<string>('');
    const [address, setAddress] = React.useState<string>('');
    const [username, setUsername] = React.useState<string>('');
    const [password, setPassword] = React.useState<string>('');
    const [port, setPort] = React.useState<string>('22');
    const [useSSHKey, setUseSSHKey] = React.useState<boolean>(false);
    const [sshKey, setSSHKey] = React.useState<string>('');
    const [sshPhrase, setSSHPhrase] = React.useState<string>('');

    const [historyData, setHistoryData] = React.useState<TerminalSpec[]>(getData('history') as TerminalSpec[] || []);

    const runSSH = ({ port, label, address, username, password, sshKey, sshPhrase }: TerminalSpec) => {

        if ([port, label, address, username, (password || sshKey)].filter((e) => !e).length > 0) {
            return alert.show('Please fill all the fields');
        }

        const spec: TerminalSpec = { port, label, address, username, password, sshKey, sshPhrase };

        const id: TerminalIdentifier = uuid();
        history.push('/terminal/' + id, { data: { spec, id } });
        bottomMenu.addTerminal({ spec, id });
    }

    const saveSSH = async ({ port, label, address, username, password, sshKey, sshPhrase }: TerminalSpec) => {

        if ([port, label, address, username, (password || sshKey)].filter((e) => !e).length > 0) {
            return alert.show('Please fill all the fields');
        }

        const toSaveSpec: TerminalSpec = { port, label, address, username, password: '', sshKey: '', sshPhrase: '' };

        if (password) toSaveSpec.passwordId = await storeSecure({ service: `termx-ssh-${address}`, secureValue: password });
        if (sshKey) toSaveSpec.sshKeyId = await storeSecure({ service: `termx-ssh-${address}`, secureValue: sshKey });
        if (sshPhrase) toSaveSpec.sshPhraseId = await storeSecure({ service: `termx-ssh-${address}`, secureValue: sshPhrase });

        const prev: TerminalSpec[] = getData('history') as TerminalSpec[] || [];
        const savedPrevIndex = prev.findIndex((spec) => toSaveSpec.address === spec.address);

        if (savedPrevIndex !== -1) {
            prev[savedPrevIndex] = toSaveSpec;
        } else {
            prev.push(toSaveSpec);
        }

        saveData('history', prev);
        setHistoryData(prev);

        alert.success('Saved!', { timeout: 2500 });
    }

    const decodeSSH = async (terminalSpec: TerminalSpec) => {
        const decodedTerminalSpec = _.clone(terminalSpec);

        if (decodedTerminalSpec.passwordId) decodedTerminalSpec.password = await getStoredSecure({ service: `termx-ssh-${decodedTerminalSpec.address}`, account: decodedTerminalSpec.passwordId });
        if (decodedTerminalSpec.sshKeyId) decodedTerminalSpec.sshKey = await getStoredSecure({ service: `termx-ssh-${decodedTerminalSpec.address}`, account: decodedTerminalSpec.sshKeyId });
        if (decodedTerminalSpec.sshPhraseId) decodedTerminalSpec.sshPhrase = await getStoredSecure({ service: `termx-ssh-${decodedTerminalSpec.address}`, account: decodedTerminalSpec.sshPhraseId });

        return decodedTerminalSpec;
    }

    const editSSH = async (terminal: TerminalSpec) => {
        try {
            const { port, label, address, username, password, sshKey, sshPhrase } = await decodeSSH(terminal);
            setPort(port.toString());
            setLabel(label);
            setAddress(address);
            setUsername(username);
            setPassword(password || '');
            setSSHKey(sshKey || '');
            setSSHPhrase(sshPhrase || '');
            setUseSSHKey((sshKey || '').length > 0 && (password || '').length === 0);
        } catch (error) {
            logger.error(editSSH.name, error);
            alert.error(error.message);
        }
    };

    const deleteSSH = (terminalSpec: TerminalSpec) => {
        try {
            const deletedPassword = terminalSpec.passwordId ? deleteStoredSecure({ service: `termx-ssh-${terminalSpec.address}`, account: terminalSpec.passwordId }) : true;
            const deletedSSHKey = terminalSpec.sshKeyId ? deleteStoredSecure({ service: `termx-ssh-${terminalSpec.address}`, account: terminalSpec.sshKeyId }) : true;
            const deletedSSHPhrase = terminalSpec.sshPhraseId ? deleteStoredSecure({ service: `termx-ssh-${terminalSpec.address}`, account: terminalSpec.sshPhraseId }) : true;

            if (!deletedPassword || !deletedSSHKey || !deletedSSHPhrase) {
                throw new Error('Cannot delete password from secure store');
            }

            const prev: TerminalSpec[] = getData('history') as TerminalSpec[] || [];
            const deletedArr = prev.filter((spec) => spec.address !== terminalSpec.address);

            saveData('history', deletedArr);
            setHistoryData(deletedArr);

            alert.success(`Address ${terminalSpec.address} has been deleted!`, { timeout: 2500 });
        } catch (error) {
            logger.error(deleteSSH.name, error);
        }
    }

    const onHistoryClick = (terminal: TerminalSpec) => {
        decodeSSH(terminal)
            .then((terminalDecoded) => runSSH(terminalDecoded))
            .catch(err => {
                logger.error(onHistoryClick.name, err);
                alert.error(err.message);
            });
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
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLabel(e.target.value)}
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
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddress(e.target.value)}
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
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
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
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPort(e.target.value)}
                    />

                    <VSeparator />

                    <Label align="center" textWeight="600" m={{ b: "0.5rem" }} style={styles.sshLabel}>
                        <Checkbox checked={useSSHKey} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUseSSHKey(e.target.checked)} /> Use SSH key
                    </Label>

                    <VSeparator />
                    {useSSHKey ? (
                        <>
                            <Textarea placeholder="Private key" value={sshKey} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSSHKey(e.target.value)} />
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
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSSHPhrase(e.target.value)}
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
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
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
                            onClick={() => saveSSH({ port: _.parseInt(port, 10), label, address, username, password, sshKey, sshPhrase })}
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
                            onClick={() => runSSH({ port: _.parseInt(port, 10), label, address, username, password, sshKey, sshPhrase })}
                        >
                            Connect
                        </Button>

                    </div>

                    <div style={styles.historyContainer}>

                        {historyData.map((terminalSpec, i) => (
                            <HistoryBox
                                key={i}
                                terminalSpec={terminalSpec}
                                onClick={() => onHistoryClick(terminalSpec)}
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
