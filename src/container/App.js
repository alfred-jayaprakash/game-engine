import React from 'react';
import JoinScreen from './JoinScreen';
import GameScreen from './GameScreen';
import AdminScreen from './AdminScreen';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';

const App = () => (
  <div className="app-routes">
    <Router>
      <Switch>
        <Route path="/" exact component={JoinScreen} />
        <Route path="/game" component={GameScreen} />
        <Route path="/admin" component={AdminScreen} />
      </Switch>
    </Router>
  </div>
);

export default App;
