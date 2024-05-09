import React, {Component} from 'react';
import {Link} from "react-router-dom";
import {Message} from 'semantic-ui-react';

class MyMessage extends Component{

    componentWillUnmount() {
        this.props.callBacks.clearMessage();
    }

    render() {
        const messages = this.props.messages;
        const alertType = this.props.alertType;
        return(
            <Message
                size="mini"
                list={messages}
                color = {alertType === "alert-success" ? "green" : "red" }
                header= {alertType === "alert-success" ?  <Link to="/" style={{"color":"#41c750", "font-weight": "bold"}}> "Signed Up!" "Click here to login!"</Link> : "Ops! Something went wrong."}
            />
        )
    }
}

export default MyMessage;