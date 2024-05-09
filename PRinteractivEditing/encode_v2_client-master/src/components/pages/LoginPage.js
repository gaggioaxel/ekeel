import React, {Component} from 'react';
import '../../images/Encode_logo.png';
import '../../css/App.css';
import '../../css/LoginPage.Style.css';
import {connect} from "react-redux";
import {Button, Form} from "semantic-ui-react";
import {Link} from "react-router-dom";
import MyMessage from '../messages/MyMessage';
import {userConstants} from '../../constants/userConstants';
import PropTypes from 'prop-types';
import {userActions} from "../../actions/user.actions";
import {alertActions} from "../../actions/alert.actions";
import constants from '../../constants/constants';
import {bindActionCreators} from "redux";

class LoginPage extends  Component{
    constructor(){
        super(...arguments);
        this.props.onLogout();
        this.onChangeEmail = ev => this.props.onChangeEmail(ev.target.value);
        this.onChangePassword = ev => this.props.onChangePassword(ev.target.value);
        this.loginUser = (email, password) => ev => {
            ev.preventDefault();
            this.props.alertAction.clear();
            this.validateUserInformation(email, password);
        };
    }

    validateUserInformation(email, password){
        let nFoundErrors = 0;
        if(!email){
            this.props.alertAction.error(constants.EMAIL_FIELD_BLANK);
            nFoundErrors++
        }
        if(!password){
            this.props.alertAction.error(constants.PASSWORD_FIELD_BLANK);
            nFoundErrors++
        }

        if(nFoundErrors === 0) {
            this.props.userAction.login(email, password);
        }
    }

    render() {
        const email = this.props.email;
        const password = this.props.password;
        const alertType = this.props.alertType;
        const messages = this.props.messages;
        return(
            <div id="login-page" className="all-screen-page" >
                <div id="login-page-logo">
                    
                    <img className="encode-logo" src={require('../../images/Encode_logo.png')} alt="Encode logo"/>
                </div>
                <div id="login-form">
                    <Form className="attached" >
                        <Form.Field fluid="true">
                            <label htmlFor="email">Email</label>
                            <input type="text"
                                   id="email"
                                   name="email"
                                   placeholder="example@domain.it"
                                   //pattern = "[a-zA-Z0-9]+"
                                   value={email}
                                   onChange={this.onChangeEmail}
                                   //onKeyPress={(event) => this.handleKeyPress(event, username, password)}
                            />
                        </Form.Field >
                        <Form.Field fluid="true">
                            <label htmlFor="password">Password</label>
                            <input
                                type="password"
                                id="login_password"
                                name="password"
                                placeholder="Digit a password"
                                value={password}
                                onChange={this.onChangePassword}
                                //onKeyPress={(event) => this.handleKeyPress(event, username, password)}
                                required
                            />
                        </Form.Field>
                        <Button.Group widths='6' size='large' >
                            <Button as={Link}
                                    to="/home"
                                    id='login-button'
                                    onClick={this.loginUser(email, password)}
                                    >
                                Login
                            </Button>
                            <Button.Or />
                            <Button as={Link}
                                    to="/sign-up"
                                    style={{"color":"white", "height": '100%'}}
                                    color="green">
                                Sign Up
                            </Button>
                        </Button.Group>
                        <p><Link to="/"><u>Forget Email or Password? </u></Link></p>
                    </Form>
                    {messages && <MyMessage alertType ={alertType} messages={messages} callBacks={{clearMessage: this.props.alertAction.clear}}/>}
                </div>
            </div>
        );
    }
}
LoginPage.propsType = {
    email: PropTypes.string,
    password: PropTypes.string,
    alertType: PropTypes.string,
    messages: PropTypes.array,
    loggedIn: PropTypes.bool,
    registering: PropTypes.bool,
    user: PropTypes.object,
    onLogout: PropTypes.func
};

const mapStateToProps = state => ({...state.user, ...state.alert});

const mapDispatchToProps = dispatch => ({
    onChangeEmail: value =>
        dispatch({ type: userConstants.UPDATE_LOGIN_FIELD, key: 'email', value }),
    onChangePassword: value =>
        dispatch({ type: userConstants.UPDATE_LOGIN_FIELD, key: 'password', value }),
    userAction: bindActionCreators(userActions, dispatch),
    alertAction: bindActionCreators(alertActions, dispatch),
    onLogout: () =>
        dispatch(userActions.logout())
});

const connectedLoginPage = connect(mapStateToProps, mapDispatchToProps)(LoginPage);
export {connectedLoginPage as LoginPage};
export * from './LoginPage';