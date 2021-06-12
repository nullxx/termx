import { Button, Icon } from "atomize";
import {
    Item,
    Menu,
    useContextMenu
} from "react-contexify";

import PropTypes from 'prop-types';
import React from 'react';
import styles from '../styles/HistoryBox';

const MENU_ID = "menu-id";

const HistoryBox = ({ terminal, onClick, onEdit, onDelete }) => {
    const cusMenuId = MENU_ID + '_' + terminal.address;
    const { show } = useContextMenu({
        id: cusMenuId
    });

    const onAction = ({ data: { action, data } }) => {
        if (action === 'edit') {
            onEdit(data);
        } else if (action === 'delete') {
            onDelete(data);
        }
    }
    return (
        <>
            <Menu id={cusMenuId}>
                <Item onClick={onAction} data={{ action: 'edit', data: terminal }} key={0}>
                    <Icon
                        name="Edit"
                        size="20px"
                        cursor="pointer"
                    />
                    <span>Edit</span>
                </Item>
                <Item onClick={onAction} data={{ action: 'delete', data: terminal }} key={1}>
                    <Icon
                        name="Delete"
                        size="20px"
                        cursor="pointer"
                    />
                    <span>Delete</span>
                </Item>
            </Menu>

            <Button
                onContextMenu={show}
                style={styles.historyButton}
                suffix={
                    <Icon
                        name="External"
                        size="16px"
                        color="white"
                        m={{ l: "1rem" }}
                    />
                }
                shadow="3"
                hoverShadow="4"
                m={{ r: "1rem" }}
                onClick={onClick}
            >
                <h3>{terminal.label}</h3>
            </Button>
        </>
    )
}

HistoryBox.propTypes = {
    terminal: PropTypes.object,
    history: PropTypes.object,
    onClick: PropTypes.func,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func
};

export default HistoryBox;