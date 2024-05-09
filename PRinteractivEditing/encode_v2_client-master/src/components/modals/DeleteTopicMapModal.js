import React, {Component} from 'react';
import {topicMapActions} from "../../actions/topicmap.actions";
import {alertActions} from "../../actions/alert.actions";
import {Button, Icon, Message, Modal} from "semantic-ui-react";
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import OperationSuccessModal from "./OperationSuccessModal";
import OperationFailedModal from "./OperationFailedModal";

class DeleteTopicMapModal extends Component{
    constructor() {
        super(...arguments);
        this.props.alertAction.clear();
        this.closeOperationSuccessModal = this.closeOperationSuccessModal.bind(this);
        this.closeOperationFailedModal = this.closeOperationFailedModal.bind(this);
    }

    closeOperationSuccessModal(){
        this.props.topicMapAction.closeOperationSuccessModal();
    }

    closeOperationFailedModal(){
        this.props.topicMapAction.closeOperationFailedModal();
    }
    render() {
        const messages = this.props.messages;
        const alertType = this.props.alertType;
        const topicMapToDelete = this.props.topicMapIdToDelete;
        const user = this.props.user;
        const isOpenModal = this.props.isOpenModal;
        if(topicMapToDelete) {
            return (
                <Modal dimmer="blurring" size="small" open={isOpenModal} onClose={this.props.callBacks.closeModal}>
                    <Modal.Header>Delete Topic Map?</Modal.Header>
                    <Modal.Content>
                        <p>Are you sure you want to delete your Topic Map: <b>{topicMapToDelete.id}</b></p>
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
                                onClick={(event) => this.props.topicMapAction.deleteTopicMap(topicMapToDelete.id, user)}/>
                    </Modal.Actions>
                    {this.props.operationSuccessTopicMap &&
                        <OperationSuccessModal open={this.props.operationSuccessTopicMap}
                                               callBacks={{closeModal: this.closeOperationSuccessModal}}/>}
                    {this.props.operationFailedTopicMap &&
                        <OperationFailedModal open={this.props.operationFailedTopicMap}
                                              callBacks={{closeModal: this.closeOperationFailedModal}}/>}
                </Modal>
            )
        }else{
            return(
                <Modal style={{"text-align":"center", "color":"red", "font-weight": "bold"}} dimmer="blurring" size="tiny" open={isOpenModal} onClose={this.props.callBacks.closeModal}>
                    <Modal.Header>Ops<Icon name="warning" color ="red"/> Something went wrong<Icon name="warning" color ="red"/></Modal.Header>
                    <Modal.Content >
                        Please select a Topic Map!
                    </Modal.Content>
                </Modal>
            )
        }
    }
}

DeleteTopicMapModal.propTypes = {
    deleting: PropTypes.string,
    topicMapToDelete: PropTypes.object,
    user: PropTypes.object,
    callBacks: PropTypes.shape({
        isOpenTopicMapModal: PropTypes.func
    })
};

const mapStateToProps = state => ({...state.alert, ...state.user, ...state.topicmap});

const mapDispatchToProps = (dispatch) => ({
    topicMapAction: bindActionCreators(topicMapActions, dispatch),
    alertAction: bindActionCreators(alertActions, dispatch)
});

const connectedDeleteTopicMapModal = connect(mapStateToProps, mapDispatchToProps)(DeleteTopicMapModal);
export {connectedDeleteTopicMapModal as DeleteTopicMapModal}
export * from './DeleteTopicMapModal'