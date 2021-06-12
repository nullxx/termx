import { MemoryRouter, Redirect, Route, Switch } from 'react-router-dom';

import AddNew from './AddNew';
import BottomMenu from './BottomMenu';
import React from 'react';
import Terminal from './Terminal';

const App = (props) => (
  <MemoryRouter>
    <Switch>
      <BottomMenu {...props}>
        <Route exact path='/terminal/:id' component={Terminal} />
        <Route exact path='/' component={AddNew} />
        <Redirect to="/" />
      </BottomMenu>
    </Switch>
  </MemoryRouter>
);

export default App;