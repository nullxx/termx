import BottomMenuContext from '../contexts/bottomMenu/BottomMenuContext';
import BoxTab from './BoxTab';
import { Icon } from 'atomize';
import PropTypes from 'prop-types';
import React from 'react';
import { animations } from 'react-animation';
import style from '../styles/BottonMenu';
const BottomMenu = (props) => {
    const [terminals, setTerminals] = React.useState([]);

    const addTerminal = ({ terminal, id }) => {
        setTerminals((prevTerminals) => [...prevTerminals, { terminal, id }]);
    }

    const removeTerminal = ({ id }) => {
        setTerminals((prevTerminals) => prevTerminals.filter((t) => t.id !== id));
    }

    const contextValue = {
        addTerminal,
        removeTerminal
    };

    return (
        <>
            <BottomMenuContext.Provider value={contextValue}>
                {props.children}
            </BottomMenuContext.Provider>

            <div style={style.container}>
                <BoxTab
                    {...props}
                    title="Add new"
                    icon={<Icon name="Add" size="16px" color="white"
                        m={{ r: "0.5rem" }} />}
                    pushRoute="/"
                />

                {terminals.map(({ terminal: { label }, id }, i) => (
                    <BoxTab
                        {...props}
                        title={label}
                        icon={<Icon name="Dribbble" size="16px" color="white"
                            m={{ r: "0.5rem" }} />}
                        m={{ l: "0.1rem" }}
                        pushRoute={"/terminal/" + id}
                        data={{ id }}
                        key={i}
                        style={{ animation: animations.slideIn }}
                    />
                ))}
            </div>
        </>
    )
}

BottomMenu.propTypes = {
    children: PropTypes.node,
    history: PropTypes.object,
    onClick: PropTypes.func,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func
};

export default BottomMenu;