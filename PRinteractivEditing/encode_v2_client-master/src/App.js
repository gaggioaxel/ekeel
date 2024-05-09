import React, { Component } from 'react';
import {Route, Router, Switch} from 'react-router-dom';
import {history} from './config/history'
import {SignUpPage} from './components/pages/SignUpPage';
import {LoginPage} from "./components/pages/LoginPage";
import {PrivateRoute} from "./config/PrivateRoute";
import {TopicDetailsPage} from './components/pages/TopicDetailsPage';
import {HomePage} from "./components/pages/HomePage";
import './css/App.css';

class App extends Component {
  render() {
    return (
        <div className="all-screen-page">
      <Router history={history}>
        <Switch>
          <Route exact path="/sign-up" component = {SignUpPage}/>
          <Route exact path="/" component={LoginPage}/>
          <PrivateRoute exact path="/home"  component = {HomePage}/>
          <PrivateRoute exact path="/home/node-info" component={TopicDetailsPage}/>
          <PrivateRoute exact path="/topic-details/:topicId" component={TopicDetailsPage} /> }/>
        </Switch>
      </Router>
        </div>
    );
  }
}

export default App;
