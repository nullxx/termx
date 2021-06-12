import 'react-contexify/dist/ReactContexify.css';
import './styles/index.css';

import { Provider as AlertProvider, positions, transitions } from 'react-alert';
import { DebugEngine, Provider as StyletronProvider } from "styletron-react";

import AlertTemplate from 'react-alert-template-basic';
import App from './components/App'
import React from 'react'
import { StyleReset } from 'atomize';
import { Client as Styletron } from 'styletron-engine-atomic';
import { render } from 'react-dom';

const debug = process.env.NODE_ENV === "production" ? void 0 : new DebugEngine();

const engine = new Styletron();

// optional configuration
const alertOptions = {
    // you can also just use 'bottom center'
    position: positions.BOTTOM_CENTER,
    timeout: 5000,
    offset: '10px',
    // you can also just use 'scale'
    transition: transitions.SCALE
}

const RootComponent = () => (
    <>
        <StyletronProvider value={engine} debug={debug} debugAfterHydration>
            <StyleReset />
            <AlertProvider template={AlertTemplate} {...alertOptions}>
                <App />
            </AlertProvider>
        </StyletronProvider>
    </>
);
render(<RootComponent />, document.getElementById('root'))