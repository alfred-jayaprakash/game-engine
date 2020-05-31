import React from 'react';
import JoinScreen from './JoinScreen';
import GameScreen from './GameScreen';
import AdminScreen from './AdminScreen';
import {Switch, Route} from 'react-router-dom';

const App = () => (
  <div className="app-routes">
    <Switch>
      <Route path="/" exact component={JoinScreen} />
      <Route path="/game" component={GameScreen} />
      <Route path="/admin" component={AdminScreen} />
    </Switch>
  </div>
);

export default App;
