import '../styles/BoxTab.css';

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
    onClick?: () => void;
    isSelected?: boolean

    [x: string]: unknown; // other props
}

const BoxTab: FC<BoxTabProps> = ({ title, icon, pushRoute, state, onClick, isSelected, ...props }) => {
    const history = useHistory<HistoryState>();
    
    const onButtonPress = () => {
        if (onClick) onClick();
        history.push(pushRoute, state);
    }

    return (

        <Button
            {...props}
            prefix={
                icon ? icon : <Icon name="RBChecked" size="16px" color="white" m={{ r: "0.5rem" }} />
            }
            bg="info700"
            hoverBg="info700"
            p={{ r: "1.5rem", l: "1rem" }}
            shadow="3"
            hoverShadow="4"
            textColor={{ xs: 'white', sm: 'white', md: 'white', lg: 'white', xl: 'white' }}
            hoverTextColor={{ xs: 'white', sm: 'white', md: 'white', lg: 'white', xl: 'white' }}
            style={{ ...props.style, ...styles.button }}
            onClick={onButtonPress}
            className={isSelected ? 'Tab active' : 'Tab'}
        >
            {title}
        </Button>

    )
};

export default BoxTab;