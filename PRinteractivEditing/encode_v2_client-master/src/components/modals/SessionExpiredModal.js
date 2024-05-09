import React, {Component} from 'react';
import {Modal, Header, Button, Icon} from "semantic-ui-react";
import {Link} from "react-router-dom";

class SessionExpiredModal extends  Component{
    render() {
        return(
            <Modal open={this.props.isOpenModal} basic size='small'>
                <Header icon='archive' content='Session Expired Message' />
                <Modal.Content>
                    <p>
                        Your session is expired, if you want reload it, click on button below!!
                    </p>
                </Modal.Content>
                <Modal.Actions>
                    <Button as={Link} to="/" color='green' inverted>
                        <Icon name='checkmark' /> Reload
                    </Button>
                </Modal.Actions>
            </Modal>
        )
    }
}

export default SessionExpiredModal;