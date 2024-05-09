import Button from './Button'
import React from "react";

/**
 * React Component used as Header only in the LoginPage Component
 */
export default class LoginHeader extends React.Component {
    
    render() {
        return (
        <header className='header_login'>
        <Button onClick={this.props.onClick} color={!this.props.switchToRegisterMenu ? 'green' : 'red'} label={!this.props.switchToRegisterMenu ? 'No account? Register here' : 'Back to Login Menu'}/>
        </header>
    )
    }
}

