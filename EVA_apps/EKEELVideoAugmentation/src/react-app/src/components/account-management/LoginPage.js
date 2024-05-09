import React from "react";
import LoginHeader from './LoginHeader'
import LoginMenu from './login/LoginMenu'
import RegisterMenu from './register/RegisterMenu'
import {TokenContext} from './TokenContext'
import Header from '../Header/Header'
import {
  Link,
} from "react-router-dom";
import PasswordResetMenu from './password-reset/PasswordResetMenu'



export default class LoginPage extends React.Component {

    state= {
        switchToRegisterMenu: false, 
        switchToPasswordReset:false
      }

    static contextType = TokenContext;

    
    render(){
     
      return <div style={{height: window.innerHeight, width: '100%', background: '#f8f9fa'}}>
        <Header page="login" login={null} onClick ={ ()=> this.setState(prevState => ({switchToRegisterMenu: false,  switchToPasswordReset:false}))
      }/>

        <div class="container">
          
          {!this.state.switchToRegisterMenu && !this.state.switchToPasswordReset
          &&<div> <LoginMenu setToken={this.context.setToken} setNameSurname={this.context.setNameSurname} setContextEmail={this.context.setContextEmail}/>
          <div className="bottomLogin">
          <Link className="linkForgot" onClick={()=>this.setState(prevState => ({switchToPasswordReset: !prevState.switchToPasswordReset}))} switchToPasswordReset={this.state.switchToPasswordReset}>Forgot password?</Link>
          <p> Don't have an account? 
            <Link className="linkLogin" onClick ={ ()=> this.setState(prevState => ({switchToRegisterMenu: !prevState.switchToRegisterMenu}))} switchToRegisterMenu={this.state.switchToRegisterMenu}>Sign Up</Link>
            </p>
          </div>
          </div>
          }


          {this.state.switchToPasswordReset &&  <PasswordResetMenu setShowPasswordResetMenu={true} />}

          {this.state.switchToRegisterMenu && <RegisterMenu setSwitchToRegisterMenu= {()=> this.setState(prevState => ({switchToRegisterMenu: !prevState.switchToRegisterMenu}))}/>}
            
            
        </div>
      </div>
    }
}
