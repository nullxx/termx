import BottomMenuContext, { BottomMenuContextValue } from '../contexts/bottomMenu/BottomMenuContext';
import React, { FC } from 'react';
import { Terminal, TerminalIdentifier } from '../types/termx/Terminal';

import BoxTab from './BoxTab';
import { Icon } from 'atomize';
import { animations } from 'react-animation';
import style from '../styles/BottonMenu';
import { HistoryState } from "../types/termx/History";
import _ from 'lodash';
import { useHistory } from 'react-router-dom';

const BottomMenu: FC = (props) => {
    const [terminals, setTerminals] = React.useState<Terminal[]>([]);
    const [selected, setSelected] = React.useState<Terminal | null>(null);
    const history = useHistory<HistoryState>();

    React.useEffect(() => {
        const historyListen = history.listen((location) => {
            setSelected(null);

            const id = location.pathname.split('/').pop();
            if (!id) return;

            const selectedTerminal = terminals.find(terminal => terminal.id === id);
            if (!selectedTerminal) return;

            setSelected(selectedTerminal);
        });
        return () => {
            historyListen();
        }

    }, [history, terminals]);

    React.useEffect(() => {
        const lastAdded = terminals[terminals.length - 1];
        if (!lastAdded) return;
        history.push('/terminal/' + lastAdded?.id, { data: { spec: lastAdded?.spec, id: lastAdded?.id } });
        
    }, [history, terminals])


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
                    isSelected={selected === null}
                    icon={<Icon name="Add" size="16px" color="white"
                        m={{ r: "0.5rem" }} />}
                    onClick={() => setSelected(null)}
                    pushRoute="/"
                />

                {terminals.map((terminal, i) => {
                    const isSelected = _.isEqual(terminal, selected);

                    return (
                        <BoxTab
                            {...props}
                            title={terminal.spec.label}
                            isSelected={isSelected}
                            icon={<Icon name="Dribbble" size="16px" color="white"
                                m={{ r: "0.5rem" }} />}
                            m={{ l: "0.1rem" }}
                            pushRoute={"/terminal/" + terminal.id} // is this being used?
                            state={{ data: { id: terminal.id } }}
                            key={i}
                            // onClick={() => setSelected(terminal)}
                            style={{ animation: animations.slideIn }}
                        />
                    )
                })}
            </div>
        </>
    )
}

export default BottomMenu;