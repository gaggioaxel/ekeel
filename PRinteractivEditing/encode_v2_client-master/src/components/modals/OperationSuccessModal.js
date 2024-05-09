import React, {Component} from 'react';
import {Icon, Modal} from "semantic-ui-react";

class OperationSuccessModal extends Component{

    render() {
        return(
            <Modal style={{"textAlign":"center", "color":"green", "fontWeight": "bold"}} dimmer="blurring" size="tiny" open={this.props.open} onClose={this.props.callBacks.closeModal}>
                <Modal.Header>OK!<Icon name="check" color ="green"/></Modal.Header>
                <Modal.Content >
                    Operation correctly  carried out!
                </Modal.Content>
            </Modal>
        )
    }
}

export default OperationSuccessModal;