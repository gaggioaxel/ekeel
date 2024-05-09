import React, {Component} from 'react';
import {Button, Modal, Form, Message, Icon} from "semantic-ui-react";
import {bindActionCreators} from "redux";
import {topicMapConstants} from "../../constants/topicmapConstants";
import {alertActions} from "../../actions/alert.actions";
import {topicMapActions} from "../../actions/topicmap.actions";
import {connect} from "react-redux";
import PropTypes from 'prop-types';
import OperationSuccessModal from "./OperationSuccessModal";
import OperationFailedModal from "./OperationFailedModal";

class TopicMapModal extends Component{
    constructor(){
        super(...arguments);
        this.props.alertAction.clear();
        this.onChangeTitle = ev => this.props.onChangeTitle(ev.target.value);
        this.onChangeDescription = ev => this.props.onChangeDescription(ev.target.value);
        this.onChangeVersion = ev => this.props.onChangeVersion(ev.target.value);
        this.closeOperationSuccessModal = this.closeOperationSuccessModal.bind(this);
        this.closeOperationFailedModal = this.closeOperationFailedModal.bind(this);

        this.formSubmit = (newTopicMap, user) => {
            this.props.alertAction.clear();
            this.handleTopicMapFormSubmit(newTopicMap, user);
        }
    }

    handleTopicMapFormSubmit(newTopicMap, user){
        let errors = 0;
        if(!newTopicMap) {
            errors++;
            this.props.alertAction.error("Please specify TopicMap's information!");
        }else {
            if (!newTopicMap.title) {
                this.props.alertAction.error("Please specify a TopicMap's title!");
                errors++;
            }
            if (newTopicMap.title && newTopicMap.title.length > 60) {
                this.props.alertAction.error("Please specify a title with less then 60 characters!");
                errors++;
            }
            if (newTopicMap.description && newTopicMap.description.length > 200) {
                this.props.alertAction.error("Please specify a description with less then 200 characters! Now are: " + newTopicMap.description.length);
                errors++;
            }
            if (newTopicMap.version && newTopicMap.version.length > 8) {
                this.props.alertAction.error("Please specify a title with less then 8 characters! Now are: " + newTopicMap.version.length);
                errors++;
            }
        }

        if(errors === 0 && newTopicMap.id)
            this.props.topicMapAction.updateTopicMap(newTopicMap, user);
        else if(errors === 0 && !newTopicMap.id) {
            newTopicMap.creationDate= new window.Date().getTime();
            this.props.topicMapAction.createTopicMap(newTopicMap, user);
        }
    }

    componentWillUnmount() {
        this.props.topicMapAction.getAllUserTopicMaps(this.props.user)
    }

    closeOperationSuccessModal(){
        this.props.topicMapAction.closeOperationSuccessModal();
    }

    closeOperationFailedModal(){
        this.props.topicMapAction.closeOperationFailedModal();
    }

    render() {
        const isOpenModal = this.props.isOpenModal;
        const user = this.props.user;
        const newTopicMap = this.props.newTopicMap;
        const alertType = this.props.alertType;
        const messages = this.props.messages;
        const selectedSchema = this.props.selectedSchema;



        if(selectedSchema != null) {
            if (newTopicMap.schemaId === undefined)
                newTopicMap.schemaId = selectedSchema.id


            return (
                <Modal dimmer="blurring" size="small" open={isOpenModal} onClose={this.props.callBacks.closeModal}>
                    <Modal.Header>Create new Topic Map</Modal.Header>
                    <Modal.Content>
                        <Form>
                            <Form.Field>
                                <label htmlFor="title">Title:</label>
                                <input
                                    placeholder='Topic Map Title'
                                    id="topic-map-title"
                                    name="title"
                                    onChange={this.onChangeTitle}
                                />
                            </Form.Field>
                            <Form.Field>
                                <label htmlFor="description">Description:</label>
                                <input placeholder='Description'
                                       id="topic-map-description"
                                       name="description"
                                       onChange={this.onChangeDescription}
                                />
                            </Form.Field>
                            <Form.Field>
                                <label htmlFor="version">Version:</label>
                                <input placeholder='Version'
                                       id="topic-map-version"
                                       name="version"
                                       onChange={this.onChangeVersion}
                                />
                            </Form.Field>
                        </Form>
                        {messages && <Message
                            size="mini"
                            list={messages}
                            color={alertType === "alert-error" ? "red" : "green"}
                            header={alertType === "alert-success" ? "Created!" : "Ops! Something went wrong."}
                        />}
                    </Modal.Content>
                    <Modal.Actions>
                        <Button negative onClick={this.props.callBacks.closeModal}>Cancel</Button>
                        <Button positive icon='checkmark' labelPosition='right' content='Create' onClick={(event) => {
                            this.formSubmit(newTopicMap, user)
                        }}/>
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
                        Please select a Schema!
                    </Modal.Content>
                </Modal>
            )
        }
    }
}

TopicMapModal.propTypes = {
    user: PropTypes.object,
    newTopicMap: PropTypes.object,
    alertType: PropTypes.string,
    messages: PropTypes.array,
    isOpenModal: PropTypes.bool.isRequired,
    callBacks: PropTypes.shape({
        closeModal: PropTypes.func.isRequired
    })
};

const mapStateToProps= state => ({...state.alert, ...state.user, ...state.topicmap, ...state.schema});

const mapDispatchToProps = dispatch => ({
    alertAction: bindActionCreators(alertActions, dispatch),
    topicMapAction: bindActionCreators(topicMapActions, dispatch),
    onChangeTitle: value =>
        dispatch({ type: topicMapConstants.UPDATE_TOPIC_MAP_MODAL_FIELDS, key: 'title', value }),
    onChangeDescription: value =>
        dispatch({ type: topicMapConstants.UPDATE_TOPIC_MAP_MODAL_FIELDS, key: 'description', value }),
    onChangeVersion: value =>
        dispatch({ type: topicMapConstants.UPDATE_TOPIC_MAP_MODAL_FIELDS, key: 'version', value }),
    /*onCreateTopicMapLoad: () =>
        dispatch({type: topicMapConstants.ON_LOAD_TOPIC_MAP_CREATE})*/
});

const connectedTopicMapModal = connect(mapStateToProps, mapDispatchToProps)(TopicMapModal);
export {connectedTopicMapModal as TopicMapModal};
export * from './TopicMapModal';