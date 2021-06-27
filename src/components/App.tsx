import { MemoryRouter, Route, Switch } from 'react-router-dom';
import React, { FC } from 'react';

import AddNew from './AddNew';
import BottomMenu from './BottomMenu';
import Settings from './settings';
import Terminal from './Terminal';

const App: FC = (props) => (
  <MemoryRouter>
    <Switch>
      <React.Fragment>
        <BottomMenu {...props}>
          <Route exact path='/add-new' component={AddNew} />
          <Route exact path='/settings' component={Settings} />
          <Route exact path='/terminal/:id' component={Terminal} />
          <Route exact path="/" component={AddNew} />
        </BottomMenu>
      </React.Fragment>
    </Switch>
  </MemoryRouter>
);

export default App;