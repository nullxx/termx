import BottomMenuContext, { BottomMenuContextValue } from '../contexts/bottomMenu/BottomMenuContext';
import React, { FC } from 'react';
import { Terminal, TerminalIdentifier } from '../types/termx/Terminal';

import BoxTab from './BoxTab';
import { HistoryState } from "../types/termx/History";
import { Icon } from 'atomize';
import { IoIosSettings } from 'react-icons/io';
import { animations } from 'react-animation';
import style from '../styles/BottonMenu';
import { useHistory } from 'react-router-dom';

const BottomMenu: FC = (props) => {
    const [terminals, setTerminals] = React.useState<Terminal[]>([]);
    const [selected, setSelected] = React.useState<string | null>(null);
    const history = useHistory<HistoryState>();

    React.useEffect(() => {
        const historyListen = history.listen((location) => {
            const id = location.pathname.split('/').pop();

            switch (id) {
                case 'add-new':
                case 'settings':
                    setSelected(id);
                    break;
                default:
                    setSelected(null);

            }
            const selectedTerminal = terminals.find(terminal => terminal.id === id);
            if (!selectedTerminal) return;

            setSelected(selectedTerminal.id);
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
        if (terminals.length - 1 <= 0) {
            history.push('/');
        }
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
                    title="Settings"
                    isSelected={selected === 'settings'}
                    icon={<IoIosSettings size={30} />}
                    pushRoute="/settings"
                />

                <BoxTab
                    {...props}
                    title="Add new"
                    isSelected={selected === 'add-new' || !selected}
                    m={{ l: "0.1rem" }}
                    icon={<Icon name="Add" size="16px" color="white"
                        m={{ r: "0.5rem" }} />}
                    pushRoute="/add-new"
                />

                {terminals.map((terminal, i) => (
                    <BoxTab
                        {...props}
                        title={terminal.spec.label}
                        isSelected={selected === terminal.id}
                        icon={<Icon name="Dribbble" size="16px" color="white"
                            m={{ r: "0.5rem" }} />}
                        m={{ l: "0.1rem" }}
                        pushRoute={"/terminal/" + terminal.id} // is this being used?
                        state={{ data: { spec: terminal?.spec, id: terminal?.id } }}
                        key={i}
                        style={{ animation: animations.slideIn }}
                    />
                ))}
            </div>
        </>
    )
}

export default BottomMenu;