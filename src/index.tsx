import 'react-contexify/dist/ReactContexify.css';
import './styles/index.css';

import * as React from 'react';

import { Provider as AlertProvider, positions, transitions } from 'react-alert';
import { DebugEngine, Provider as StyletronProvider } from "styletron-react";

import AlertTemplateAtomize from './modules/alert-template-atomize';
import App from './components/App';
import { StyleReset } from 'atomize';
import { Client as Styletron } from 'styletron-engine-atomic';
import { render } from 'react-dom';

const debug = process.env.NODE_ENV === "production" ? void 0 : new DebugEngine();
const engine = new Styletron();

Object.assign(window.console, window.require('electron-log').functions); // override browser console with logger

const alertOptions = {
    position: positions.TOP_RIGHT,
    timeout: 5000,
    offset: '65px',
    transition: transitions.SCALE
}

const RootComponent = () => (
    <>
        <StyletronProvider value={engine} debug={debug} debugAfterHydration>
            <StyleReset />
            <AlertProvider template={AlertTemplateAtomize} {...alertOptions}>
                <App />
            </AlertProvider>
        </StyletronProvider>
    </>
);
render(<RootComponent />, document.getElementById('root'))