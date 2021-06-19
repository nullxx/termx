import BottomMenuContext, { BottomMenuContextValue } from '../contexts/bottomMenu/BottomMenuContext';
import React, { FC } from 'react';
import { Terminal, TerminalIdentifier } from '../types/termx/Terminal';

import BoxTab from './BoxTab';
import { Icon } from 'atomize';
import { animations } from 'react-animation';
import style from '../styles/BottonMenu';

const BottomMenu: FC = (props) => {
    const [terminals, setTerminals] = React.useState<Terminal[]>([]);

    const addTerminal = ({ spec, id }: Terminal) => {

        setTerminals((prevTerminals: Terminal[]) => [...prevTerminals, { spec, id }]);
    }

    const removeTerminal = ({ id }: { id: TerminalIdentifier }) => {
        setTerminals((prevTerminals) => prevTerminals.filter((t) => t.id !== id));
    }

    const contextValue: BottomMenuContextValue = {
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

                {terminals.map(({ spec: { label }, id }, i) => (
                    <BoxTab
                        {...props}
                        title={label}
                        icon={<Icon name="Dribbble" size="16px" color="white"
                            m={{ r: "0.5rem" }} />}
                        m={{ l: "0.1rem" }}
                        pushRoute={"/terminal/" + id}
                        state={{ data: { id } }}
                        key={i}
                        style={{ animation: animations.slideIn }}
                    />
                ))}
            </div>
        </>
    )
}

export default BottomMenu;