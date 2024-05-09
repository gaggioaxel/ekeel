import React, {Component} from 'react';
import {Icon, Modal} from "semantic-ui-react";

class OperationFailedModal extends Component{
    render() {
        return(
            <Modal style={{"textAlign":"center", "color":"red", "fontWeight": "bold"}} dimmer="blurring" size="tiny" open={this.props.open} onClose={event => this.props.callBacks.closeModal()}>
                <Modal.Header>Ops<Icon name="warning" color ="red"/> Something went wrong<Icon name="warning" color ="red"/></Modal.Header>
                <Modal.Content >
                    An error occurred during operation!
                </Modal.Content>
            </Modal>
        )
    }
}

export default  OperationFailedModal;