import { Terminal, TerminalIdentifier } from '../../types/termx/Terminal';

import { createContext } from 'react'

export interface BottomMenuContextValue {
    addTerminal: (terminal: Terminal) => void;
    removeTerminal: ({ id }: { id: TerminalIdentifier }) => void;
}

const Context = createContext<BottomMenuContextValue | unknown>({});

export default Context;