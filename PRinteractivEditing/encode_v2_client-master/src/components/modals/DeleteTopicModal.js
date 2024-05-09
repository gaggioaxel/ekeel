import React, {Component} from 'react';
import {Modal, Button, Form, Dropdown, Icon, Message} from "semantic-ui-react";
import {bindActionCreators} from "redux";
import {alertActions} from "../../actions/alert.actions";
import {topicActions} from "../../actions/topic.actions";
import {topicConstants} from "../../constants/topicConstants";
import {connect} from "react-redux";
import {topicMapActions} from "../../actions/topicmap.actions";
import OperationSuccessModal from "./OperationSuccessModal";
import OperationFailedModal from "./OperationFailedModal";

class DeleteTopicModal extends Component{
    constructor(){
        super(...arguments);
        this.onChangeTopicToDelete = (ev, {value}) => this.props.onChangeTopicToDelete(value);
        this.closeOperationSuccessModal = this.closeOperationSuccessModal.bind(this);
        this.closeOperationFailedModal = this.closeOperationFailedModal.bind(this);
        this.props.alertAction.clear();
        this.formSubmit = (topicsToDelete, user) => {
            //this.props.alertAction.clear();
            this.handleTopicFormSubmit(topicsToDelete, user);
        }

    }

    handleTopicFormSubmit(topicsToDelete, user) {
        this.props.topicAction.deleteTopicList(topicsToDelete, user)
    }

    closeOperationSuccessModal(){
        this.props.topicAction.closeOperationSuccessModal();
    }

    closeOperationFailedModal(){
        this.props.topicAction.closeOperationFailedModal();
    }

    componentWillUnmount() {
        if(this.props.selectedTopicMap)
            this.props.topicMapAction.getTopicMapById(this.props.selectedTopicMap.id, this.props.user);
        this.props.topicMapAction.getAllUserTopicMaps(this.props.user);
    }



    render(){
        const isOpenModal = this.props.isOpenModal;
        const selectedTopicMap = this.props.selectedTopicMap;
        const topicsToDelete = this.props.topicsToDelete;
        const messages = this.props.messages;
        const alertType = this.props.alertType;
        const user = this.props.user;
        const allTopicsOptions =[];
        let cont = 0;



        if(selectedTopicMap != null) {
            selectedTopicMap.allTopics.map(function (topic) {
                allTopicsOptions.push({
                    key: cont++,
                    value: topic.id,
                    text: topic.name
                })
            });

            return (
                <Modal dimmer="blurring" size="tiny" open={isOpenModal} onClose={this.props.callBacks.closeModal}>
                    <Modal.Header>Delete Topics</Modal.Header>
                    <Modal.Content>
                        <Form>
                            <Form.Field>
                                <label htmlFor="topicName">Choose one or more topic to delete.</label>
                                <Dropdown placeholder="Choose Topics to delete" multiple search selection
                                          options={allTopicsOptions} onChange={this.onChangeTopicToDelete}/>
                            </Form.Field>
                            {messages && <Form.Field>
                                <Message
                                    size="small"
                                    list={messages}
                                    color = {alertType === "alert-error" ? "red" : "green" }
                                    header={alertType === "alert-success" ? "Deleted!"  : "Ops! Something went wrong."}
                                />
                            </Form.Field>}
                        </Form>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button positive onClick={this.props.callBacks.closeModal}>Cancel</Button>
                        <Button negative icon='trash' labelPosition='right' content='Delete' onClick={(event) => {
                            this.formSubmit(topicsToDelete, user)
                        }}/>
                    </Modal.Actions>
                    {this.props.operationSuccessTopic &&
                        <OperationSuccessModal open={this.props.operationSuccessTopic}
                                               callBacks={{closeModal: this.closeOperationSuccessModal}}/>}
                    {this.props.operationFailedTopic && <OperationFailedModal open={this.props.operationFailedTopic}
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

const mapStateToProps= state => ({...state.alert, ...state.user, ...state.topicmap, ...state.topic, ...state.topicType, ...state.associationType, ...state.linkedTopics});

const mapDispatchToProps = dispatch => ({
    alertAction: bindActionCreators(alertActions, dispatch),
    topicAction: bindActionCreators(topicActions, dispatch),
    topicMapAction: bindActionCreators(topicMapActions, dispatch),
    onChangeTopicToDelete: (value) => {
        dispatch({type: topicConstants.UPDATE_TOPICS_TO_DELETE_LIST, key: 'topicsToDelete', value})
    },
});

const connectedDeleteTopicModal = connect(mapStateToProps, mapDispatchToProps)(DeleteTopicModal);
export {connectedDeleteTopicModal as DeleteTopicModal};
export * from './DeleteTopicModal';
