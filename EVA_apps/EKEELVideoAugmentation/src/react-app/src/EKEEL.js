import React, { useContext } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
  useParams,
} from "react-router-dom";

import Dashboard from './components/Dashboard/Dashboard';
import Welcome from './components/Welcome/Welcome';
import App from './App';
import EditProfile from './components/EditProfile/EditProfile'

import {TokenContext} from './components/account-management/TokenContext'
import LoginPage from './components/account-management/LoginPage'
import Comparison from './components/Comparison/Comparison.js'
import Test from './components/Comparison/test.js'
import C_Start from './components/Comparison/C_Start.js'
import Result from './components/Comparison/Result.js'
/**
 * This React component is the Top Component of the app, showing the appropriate component for each http url
 */

export default class AuthExample extends React.Component {


  initToken = () => {
    const tokenString = sessionStorage.getItem('token');
    const userToken = JSON.parse(tokenString);
    //console.log(userToken)
    if(userToken != null)
      return userToken?.token

    let loggedInUser = localStorage.getItem("user");
    const loggedToken = JSON.parse(loggedInUser);

    return loggedToken?.token
  };

  setToken = userToken => {
    let t = JSON.stringify(userToken)
    sessionStorage.setItem('token', t);
    this.setState({contextValue: {...this.state.contextValue, token: userToken.token}});

    //console.log(t)
    if( t == '""'){
      //logout
      /*this.setState({contextValue: {...this.state.contextValue, email: ''}});
      this.setState({contextValue: {...this.state.contextValue, nameSurname:''}});*/
     // console.log("logged out")
      localStorage.clear();

    }
    
  };

  initNameSurname = () => {
    const nameSurnameString = sessionStorage.getItem('nameSurname');
    //console.log("log",nameSurnameString)
    const userNameSurname = JSON.parse(nameSurnameString);
    if(userNameSurname != null){
      let result = userNameSurname ? userNameSurname.name+' '+userNameSurname.surname : ''
      return result
    }

    let loggedInUser = localStorage.getItem("user");
    const logged = JSON.parse(loggedInUser);
    let r = logged ? logged.name+' '+logged.surname : ''

    return r
  };

  setNameSurname = userNameAndSurname => {
    sessionStorage.setItem('nameSurname', JSON.stringify(userNameAndSurname));
    this.setState({contextValue: {...this.state.contextValue, nameSurname: userNameAndSurname.name+' '+userNameAndSurname.surname}});
  };

  initContextEmail = () => {
    const emailString = sessionStorage.getItem('email');
    const userEmail = JSON.parse(emailString);
    if(userEmail != null){
      let result = userEmail ? userEmail : ''
      return result
    }

    let loggedInUser = localStorage.getItem("user");
    const logged = JSON.parse(loggedInUser);
    let r = logged ? logged.email : ''

    return r
  };

  setContextEmail = userEmail => {
    sessionStorage.setItem('email', JSON.stringify(userEmail));
    this.setState({contextValue: {...this.state.contextValue, email: userEmail}});
  };

  state= {
    switchToRegisterMenu: false, 
    contextValue :{
      token:this.initToken(),
      setToken: this.setToken,
      nameSurname:this.initNameSurname(),
      setNameSurname: this.setNameSurname,
      email: this.initContextEmail(),
      setContextEmail: this.setContextEmail,
    }
  }

  render(){
    return (
      
      <TokenContext.Provider value={this.state.contextValue} >
        <Router>
          <div>
            <Switch>
              <Route exact path="/">
                {this.state.contextValue.token ? <Redirect to="/dashboard" /> : <Welcome/>}
              </Route>
              <Route path="/login">
                <LoginPage />
              </Route>
              <PrivateRoute path="/dashboard" children= {<Dashboard />}/>
              <PrivateRoute path="/app/:id/:title" children={<AppPage/>}/>
              <PrivateRoute path="/editProfile/:user" children={<EditProfilePage/>}/>
              <PrivateRoute path="/comparisonSearch" children={<Comparison/>}/>
              <PrivateRoute path="/comparison" children={<C_Start/>}/>
              <PrivateRoute path="/comparisonResult" children={<Result/>}/>
              <Route path="/test" children={<Test/>}></Route>
            </Switch>
          </div>
        </Router>
        </TokenContext.Provider>
    );
  }
  
}



function PrivateRoute({ children, ...rest }) {
  let tokenContext = useContext(TokenContext);
  return (
    <Route
      {...rest}
      render={({ location }) =>
      tokenContext.token ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: "/",
              state: { from: location }
            }}
          />
        )
      }
    />
  );
}


function AppPage() {
  let {id} = useParams()
  let {title} = useParams()
  return (
    <App videoUrl={"https://www.youtube.com/watch?v=" + `${id}`} videoId={`${id}`} videoTitle={`${title}`}/>  
  )
}

function EditProfilePage() {
  let {user} = useParams()
  return (
    <EditProfile user={`${user}`}/>  
  )
}
