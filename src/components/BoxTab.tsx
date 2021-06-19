import { Button, Icon } from 'atomize';
import React, { FC } from 'react';

import { HistoryState } from '../types/termx/History';
import styles from '../styles/BoxTab';
import { useHistory } from 'react-router-dom';

interface BoxTabProps {
    title: string;
    icon: React.ReactElement,
    pushRoute: string;
    state?: HistoryState;
    style?: React.CSSProperties;

    [x: string]: unknown; // other props
}

const BoxTab: FC<BoxTabProps> = ({ title, icon, pushRoute, state, ...props }) => {
    const history = useHistory<HistoryState>();

    const onClick = () => {
        history.push(pushRoute, state);
    }

    return (
        <Button
            {...props}
            prefix={
                icon ? icon : <Icon name="RBChecked" size="16px" color="white" m={{ r: "0.5rem" }} />
            }
            bg="info700"
            hoverBg="info800"
            p={{ r: "1.5rem", l: "1rem" }}
            shadow="3"
            hoverShadow="4"
            style={{ ...props.style, ...styles.button }}
            onClick={onClick}
        >
            {title}
        </Button>
    )
};

export default BoxTab;