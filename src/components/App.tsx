import { MemoryRouter, Redirect, Route, Switch } from 'react-router-dom';
import React, { FC } from 'react';

import AddNew from './AddNew';
import BottomMenu from './BottomMenu';
import Terminal from './Terminal';
import { initializeTitleBar } from '../styles/TopBar';

const App: FC = (props) => {
  initializeTitleBar(); // initialize titlebar
  return (
    <MemoryRouter>
      <Switch>
        <React.Fragment>
          <BottomMenu {...props}>
            <Route exact path='/terminal/:id' component={Terminal} />
            <Route exact path='/' component={AddNew} />
            <Redirect to="/" />
          </BottomMenu>
        </React.Fragment>
      </Switch>
    </MemoryRouter>
  )
};

export default App;