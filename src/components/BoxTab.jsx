import { Button, Icon } from 'atomize';

import PropTypes from 'prop-types';
import React from 'react';
import styles from '../styles/BoxTab';
import { useHistory } from 'react-router-dom';

const BoxTab = ({ title, icon, pushRoute, data, ...props }) => {
    const history = useHistory();

    const onClick = () => {
        history.push(pushRoute, JSON.stringify(data));
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

BoxTab.propTypes = {
    title: PropTypes.string,
    subtitle: PropTypes.string,
    icon: PropTypes.node,
    history: PropTypes.object,
    pushRoute: PropTypes.string,
    data: PropTypes.object,
    style: PropTypes.object,
};

export default BoxTab;