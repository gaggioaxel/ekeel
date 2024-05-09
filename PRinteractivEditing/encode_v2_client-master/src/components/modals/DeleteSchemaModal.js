import React, {Component} from 'react';
import {schemaActions} from "../../actions/schema.actions";
import {alertActions} from "../../actions/alert.actions";
import {Button, Icon, Message, Modal} from "semantic-ui-react";
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import OperationSuccessModal from "./OperationSuccessModal";
import OperationFailedModal from "./OperationFailedModal";

class DeleteSchemaModal extends Component{
    constructor() {
        super(...arguments);
        this.props.alertAction.clear();
        this.closeOperationSuccessModal = this.closeOperationSuccessModal.bind(this);
        this.closeOperationFailedModal = this.closeOperationFailedModal.bind(this);
    }

    closeOperationSuccessModal(){
        this.props.schemaAction.closeOperationSuccessModal();
    }

    closeOperationFailedModal(){
        this.props.schemaAction.closeOperationFailedModal();
    }
    render(){
        const messages = this.props.messages;
        const alertType = this.props.alertType;
        const schemaToDelete = this.props.schemaIdToDelete;
        const user = this.props.user;
        const isOpenModal = this.props.isOpenModal;
        if(schemaToDelete) {
            return (
                <Modal dimmer="blurring" size="small" open={isOpenModal} onClose={this.props.callBacks.closeModal}>
                    <Modal.Header>Delete Schema?</Modal.Header>
                    <Modal.Content>
                        <p>Are you sure you want to delete your Schema: <b>{schemaToDelete.name}</b></p>
                        {messages && <Message
                            size="mini"
                            list={messages}
                            color={alertType === "alert-error" ? "red" : "green"}
                            header={alertType === "alert-success" ? "Deleted!" : "Ops! Something went wrong."}
                        />}
                    </Modal.Content>
                    <Modal.Actions>
                        <Button negative onClick={this.props.callBacks.closeModal}>No</Button>
                        <Button positive icon='checkmark' labelPosition='right' content='Yes'
                                onClick={(event) => this.props.schemaAction.deleteSchema(schemaToDelete.id, user)}/>
                    </Modal.Actions>
                    {this.props.operationSuccessSchema &&
                        <OperationSuccessModal open={this.props.operationSuccessSchema}
                                               callBacks={{closeModal: this.closeOperationSuccessModal}}/>}
                    {this.props.operationFailedSchema && <OperationFailedModal open={this.props.operationFailedSchema}
                                                                               callBacks={{closeModal: this.closeOperationFailedModal}}/>}
                </Modal>
            )
        }else{
            return(
                <Modal style={{"text-align":"center", "color":"red", "font-weight": "bold"}} dimmer="blurring" size="tiny" open={isOpenModal} onClose={this.props.callBacks.closeModal}>
                    <Modal.Header>Ops<Icon name="warning" color ="red"/> Something went wrong<Icon name="warning" color ="red"/></Modal.Header>
                    <Modal.Content >
                        Please select a Schema!
                    </Modal.Content>
                </Modal>
            )
        }
    }
}
DeleteSchemaModal.propTypes = {
    deleting: PropTypes.string,
    schemaIdToDelete: PropTypes.string,
    user: PropTypes.object,
    callBacks: PropTypes.shape({
        isOpenSchemaModal: PropTypes.func
    })
};

const mapStateToProps = state => ({...state.alert, ...state.user, ...state.schema});

const mapDispatchToProps = (dispatch) => ({
    schemaAction: bindActionCreators(schemaActions, dispatch),
    alertAction: bindActionCreators(alertActions, dispatch)
});

const connectedDeleteSchemaModal = connect(mapStateToProps, mapDispatchToProps)(DeleteSchemaModal);
export {connectedDeleteSchemaModal as DeleteSchemaModal}
export * from './DeleteSchemaModal'