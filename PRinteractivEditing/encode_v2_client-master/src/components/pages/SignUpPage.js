import React, {Component} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {Button, Form} from 'semantic-ui-react';
import {Link} from 'react-router-dom';
import '../../css/App.css';
import '../../css/SignUpPage.Style.css';
import PropTypes from 'prop-types';
import {userConstants} from "../../constants/userConstants";
import {userActions} from "../../actions/user.actions";
import {alertActions} from "../../actions/alert.actions";
import constants from '../../constants/constants';
import MyMessage from '../messages/MyMessage'

class SignUpPage extends  Component {
    constructor(){
        super(...arguments);

        this.onChangeUsername = ev => this.props.onChangeUsername(ev.target.value);
        this.onChangeFirstName = ev => this.props.onChangeFirstName(ev.target.value);
        this.onChangeLastName = ev => this.props.onChangeLastName(ev.target.value);
        this.onChangePassword = ev => this.props.onChangePassword(ev.target.value);
        this.onChangeEmail = ev => this.props.onChangeEmail(ev.target.value);
        this.onChangeRetypedPassword = ev => this.props.onChangeRetypedPassword(ev.target.value);

        this.registerUser = (username, firstName, lastName, password, email, reTypedPassword) => ev => {
            ev.preventDefault();
            this.props.alertAction.clear();
            this.validateUserInformation(username, firstName, lastName, password, email, reTypedPassword);
        };

        //this.props.alertAction.clear= this.props.alertAction.clear().bind(this);
    };

    validateUserInformation (username, firstName, lastName, password, email, retypedPassword) {
        let foundErrors = 0;
        if (!username){
            this.props.alertAction.error(constants.USERNAME_FIELD_BLANK);
            foundErrors++;
        }
        if (!firstName){
            this.props.alertAction.error(constants.FIRSTNAME_FIELD_BLANK);
            foundErrors++;
        }
        if (!lastName){
            this.props.alertAction.error(constants.LASTNAME_FIELD_BLANK);
            foundErrors++;
        }
        if (!password){
            this.props.alertAction.error(constants.PASSWORD_FIELD_BLANK);
            foundErrors++;
        }
        if (!email){
            this.props.alertAction.error(constants.EMAIL_FIELD_BLANK);
            foundErrors++;
        }
        else{
            const allowed = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i;
            const isEmailOk = allowed.test(email);
            if (!isEmailOk) {
                this.props.alertAction.error(constants.WRONG_EMAIL_FORMAT);
                foundErrors++;
            }
        }
        if (!retypedPassword) {
            this.props.alertAction.error(constants.RETYPED_PASSWORD_FIELD_BLANK);
            foundErrors++;
        }
        if (password !== retypedPassword) {
            this.props.alertAction.error(constants.MISMATCH_TYPED_PASSWORD);
            foundErrors++;
        }
        if(foundErrors === 0)
            this.props.userAction.registration(username,  password, email, firstName, lastName);
    }

    render() {
        const messages = this.props.messages;
        const alertType = this.props.alertType;
        const username = this.props.username;
        const password = this.props.password;
        const email = this.props.email;
        const firstName = this.props.firstName;
        const lastName = this.props.lastName;
        const reTypedPassword = this.props.reTypedPassword;
        return(
            <div id="sign-up-page" className="all-screen-page">
                <div id="sign-up-page-logo">
                    <img  className="encode-logo" src={require('../../images/Encode_logo.png')} alt="Encode logo"/>
                </div>
                <div id="sign-up-form" className="sign-up-form">
                    {messages && <MyMessage alertType={alertType} messages={messages} callBacks={{clearMessage:this.props.alertAction.clear}}/>}
                    <Form onSubmit={this.registerUser(username, firstName, lastName, password, email, reTypedPassword)}>
                        <Form.Field>
                            <label htmlFor="name">Username</label>
                            <input type="text"
                                   id="sign-up-username"
                                   name="username"
                                   placeholder="Username"
                                   value={username}
                                   onChange={this.onChangeUsername}
                            />
                        </Form.Field>
                        <Form.Field>
                            <label htmlFor="email">Email</label>
                            <input type="email"
                                   id="sign-up-email"
                                   name="email"
                                   placeholder="example@domain.it"
                                   value={email}
                                   onChange={this.onChangeEmail}
                            />
                        </Form.Field>
                        <Form.Field>
                            <label htmlFor="firstName">First Name</label>
                            <input type="text"
                                   id="sign-up-firstName"
                                   name="firstName"
                                   placeholder="First Name"
                                   value={firstName}
                                   onChange={this.onChangeFirstName}
                            />
                        </Form.Field>
                        <Form.Field>
                            <label htmlFor="lastName">Last Name</label>
                            <input type="text"
                                   id="sign-up-lastName"
                                   name="lastName"
                                   placeholder="Last Name"
                                   value={lastName}
                                   onChange={this.onChangeLastName}
                            />
                        </Form.Field>
                        <Form.Field>
                            <label htmlFor="password">Password</label>
                            <input type="password"
                                   id="sign-up-password"
                                   name="password"
                                   placeholder="Digit a password"
                                   value={password}
                                   onChange={this.onChangePassword}
                            />
                        </Form.Field>
                        <Form.Field>
                            <label htmlFor="password">Re-Enter Password</label>
                            <input type="password"
                                   id="confirm-sign-up-password"
                                   name="reTypedPassword"
                                   placeholder="Re-Enter Password"
                                   value={reTypedPassword}
                                   onChange={this.onChangeRetypedPassword}
                            />
                        </Form.Field>
                        <Button inverted color="teal" fluid="true" type="submit">Sign Up</Button>
                        <p>Already registered? <Link to="/"><u>Login here</u></Link></p>
                    </Form>
                </div>
            </div>
        )
    }
}

SignUpPage.propTypes = {
    loggedIn: PropTypes.bool,
    registering: PropTypes.bool,
    user: PropTypes.object,
    messages: PropTypes.array,
    alertType: PropTypes.string,
    username: PropTypes.string,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    email: PropTypes.string,
    password: PropTypes.string,
    reTypedPassword: PropTypes.string,
};


const mapStateToProps = (state) => ({...state.user, ...state.alert});

const mapDispatchToProps = (dispatch) => ({
    onChangeUsername: value =>
        dispatch({ type: userConstants.UPDATE_SIGN_UP_FIELD, key: 'username', value }),
    onChangeFirstName: value =>
        dispatch({ type: userConstants.UPDATE_SIGN_UP_FIELD, key: 'firstName', value }),
    onChangeLastName: value =>
        dispatch({ type: userConstants.UPDATE_SIGN_UP_FIELD, key: 'lastName', value }),
    onChangePassword: value =>
        dispatch({ type: userConstants.UPDATE_SIGN_UP_FIELD, key: 'password', value }),
    onChangeEmail: value =>
        dispatch({type: userConstants.UPDATE_SIGN_UP_FIELD, key:'email', value}),
    onChangeRetypedPassword: value =>
        dispatch({type: userConstants.UPDATE_SIGN_UP_FIELD, key:'reTypedPassword', value}),
    userAction: bindActionCreators(userActions, dispatch),
    alertAction: bindActionCreators(alertActions, dispatch)
});

const connectedSignUpPage = connect(mapStateToProps, mapDispatchToProps)(SignUpPage);
export {connectedSignUpPage as SignUpPage};
export * from './SignUpPage';