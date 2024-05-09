import React, {Component} from 'react';
import {Modal, Button, Form, Dropdown, Icon, Message} from "semantic-ui-react";
import {bindActionCreators} from "redux";
import {alertActions} from "../../actions/alert.actions";
import {topicTypeActions} from "../../actions/topicType.actions";
import {topicActions} from "../../actions/topic.actions";
import {topicConstants} from "../../constants/topicConstants";
import {connect} from "react-redux";
import {associationTypeActions} from "../../actions/associationType.actions";
import {topicMapActions} from "../../actions/topicmap.actions";
import OperationSuccessModal from "./OperationSuccessModal";
import OperationFailedModal from "./OperationFailedModal";

class CreateTopicModal extends Component{
    constructor(){
        super(...arguments);
        this.props.topicTypeAction.getAllTopicTypes(this.props.user);
        this.props.associationTypeAction.getAllAssociationType(this.props.user);
        this.props.alertAction.clear();
        this.onChangeName = ev => this.props.onChangeName(ev.target.value);
        this.onChangeSubjectLocator = ev => this.props.onChangeSubjectLocator(ev.target.value);
        this.onChangeSubjectIdentifier = ev => this.props.onChangeSubjectIdentifier(ev.target.value);
        this.onChangeTopicType = (ev, {value}) => this.props.onChangeTopicType(value);
        this.onChangeTopicToConnectIn = (ev, {value}) => this.props.onChangeTopicToConnectIn(value);
        this.onChangeTopicToConnectOut = (ev, {value}) => this.props.onChangeTopicToConnectOut(value);
        this.onChangeAssociationType = (ev, {value}) => this.props.onChangeAssociationType(value);
        this.onChangeScope = (ev, {value}) => this.props.onChangeScope(value);
        this.closeOperationSuccessModal = this.closeOperationSuccessModal.bind(this);
        this.closeOperationFailedModal = this.closeOperationFailedModal.bind(this);

        this.formSubmit = (newTopic, selectedTopicMap, user) => {
            this.handleTopicFormSubmit(newTopic,selectedTopicMap, user);
        }
    }

    handleTopicFormSubmit(newTopic, selectedTopicMap, user) {
        if(newTopic.topicTypes === "primary_notion"){
            const primaryNotion = selectedTopicMap.allTopics.filter(function(topic){
                return (topic.topicTypeName === "primary_notion")
            });
            if (primaryNotion.length > 0){
                this.props.alertAction.error("A topic of type PrimaryNotion is already present in this TopicMap.")
                return;
            }
        }
        newTopic.topicmapId=selectedTopicMap.id
        this.props.topicAction.createTopic(newTopic, user);
        }

    componentDidUpdate(prevProps) {
        const newTopicInserted = this.props.newTopic;
        if(newTopicInserted && newTopicInserted.id) {
            const links = [];
            if (newTopicInserted.allLinksOnIn) {
                newTopicInserted.allLinksOnIn.forEach(function (linksOnIn) {
                    const newLinks = {
                        topicIdIn: linksOnIn,
                        topicIdOut: newTopicInserted.id,
                        associationType: newTopicInserted.associationType,
                        topicmapId: newTopicInserted.topicmapId
                    };
                    links.push(newLinks)
                })
            }
            if (newTopicInserted.allLinksOnOut) {
                newTopicInserted.allLinksOnOut.forEach(function (linksOnOut) {
                    const newLinks = {
                        topicIdIn: newTopicInserted.id,
                        topicIdOut: linksOnOut,
                        associationType: newTopicInserted.associationType,
                        topicmapId: newTopicInserted.topicmapId
                    };
                    links.push(newLinks)
                })
            }
            if (links.length > 0) {
                this.props.linkedTopicsAction.saveAllLinkedTopics(links, this.props.user);
                this.props.topicAction.clearTopic();
            }

            this.props.topicAction.clearTopic();
        }
    }

    closeOperationSuccessModal(){
        this.props.topicAction.closeOperationSuccessModal();
    }

    closeOperationFailedModal(){
        this.props.topicAction.closeOperationFailedModal();
    }

    componentWillUnmount() {
        this.props.topicAction.clearTopic();
        if(this.props.selectedTopicMap)
            this.props.topicMapAction.getTopicMapById(this.props.selectedTopicMap.id, this.props.user)
    }

    render() {
        const newTopic = this.props.newTopic;
        const user = this.props.user;
        const scopes = this.props.scopes;
        const topicTypes = this.props.topicTypes;
        const isOpenModal = this.props.isOpenModal;
        const selectedTopicMap = this.props.selectedTopicMap;
        const messages = this.props.messages;
        const alertType = this.props.alertType;
        const allScopeOptions= [];
        const allTopicTypesOptions = [];

        let cont = 0;

        if(selectedTopicMap != null){

            topicTypes.forEach(function(element){
                if(element.schemaId===selectedTopicMap.schemaId)
                    allTopicTypesOptions.push({
                        key: cont++,
                        value: element.id,
                        text: element.name
                    })
            });

            scopes.forEach(function(element){
                if(element.schemaId===selectedTopicMap.schemaId)
                    allScopeOptions.push({
                        key: cont++,
                        value: element.id,
                        text: element.name
                    })
            });


            return(
                <Modal dimmer="blurring" size="large" open={isOpenModal} onClose={this.props.callBacks.closeModal}>
                    <Modal.Header>Create new Topic</Modal.Header>
                    <Modal.Content scrolling>
                        <Form >
                            <Form.Field >
                                <label htmlFor="title">Name:</label>
                                <input
                                    placeholder= 'Topic name'
                                    id="topic-name"
                                    name="name"
                                    onChange={this.onChangeName}
                                    value={topicTypes.name}
                                />
                            </Form.Field>
                            <Form.Field >
                                <label htmlFor="title">Subject Locator:</label>
                                <input
                                    placeholder= 'Subject Locator:'
                                    id="topic-name"
                                    name="name"
                                    onChange={this.onChangeSubjectLocator}
                                />
                            </Form.Field>
                            <Form.Field >
                                <label htmlFor="title">Subject Identifier:</label>
                                <input
                                    placeholder= 'Subject Locator:'
                                    id="topic-name"
                                    name="name"
                                    onChange={this.onChangeSubjectIdentifier}
                                />
                            </Form.Field>
                            <Form.Field>
                                <label htmlFor="topicTypeName">Topic Type</label>
                                <Dropdown placeholder="Choose a Topic type" selection options={allTopicTypesOptions} onChange={this.onChangeTopicType}/>
                            </Form.Field>
                            <Form.Field>
                                <label htmlFor="scope">Scope</label>
                                <Dropdown placeholder="Choose a Scope" search selection options={allScopeOptions} onChange={this.onChangeScope}/>
                            </Form.Field>

                            {messages && <Form.Field>
                                <Message
                                    size="small"
                                    list={messages}
                                    color = {alertType === "alert-error" ? "red" : "green" }
                                    header={alertType === "alert-success" ? "Created!"  : "Ops! Something went wrong."}
                                />
                            </Form.Field>}
                        </Form>

                    </Modal.Content>
                    <Modal.Actions>
                        <Button negative onClick={this.props.callBacks.closeModal} >Cancel</Button>
                        <Button positive icon='checkmark' labelPosition='right' content='Create' onClick={(event) =>{ this.formSubmit(newTopic, selectedTopicMap, user)}}/>
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

const mapStateToProps= state => ({...state.alert, ...state.user, ...state.topicmap, ...state.topic, ...state.topicType, ...state.associationType,...state.scope ,...state.linkedTopics});

const mapDispatchToProps = dispatch => ({
    alertAction: bindActionCreators(alertActions, dispatch),
    topicTypeAction: bindActionCreators(topicTypeActions, dispatch),
    associationTypeAction: bindActionCreators(associationTypeActions, dispatch),
    topicAction: bindActionCreators(topicActions, dispatch),
    topicMapAction: bindActionCreators(topicMapActions, dispatch),
    onChangeName: value =>
        dispatch({ type: topicConstants.UPDATE_TOPIC_MODAL_FIELDS, key: 'name', value }),
    onChangeSubjectLocator: value =>
        dispatch({ type: topicConstants.UPDATE_TOPIC_MODAL_FIELDS, key: 'subjectLocator', value }),
    onChangeSubjectIdentifier: value =>{
        dispatch({ type: topicConstants.UPDATE_TOPIC_MODAL_FIELDS, key: 'subjectIdentifier', value })},
    onChangeTopicType: value => {
        dispatch({type: topicConstants.UPDATE_TOPIC_MODAL_FIELDS, key: 'topicTypeId', value})
    },
    onChangeTopicToConnectIn: (value, key) => {
        dispatch({type: topicConstants.UPDATE_TOPIC_LINKS_IN_FIELDS, key: 'topicToConnect', value})
    },
    onChangeTopicToConnectOut: (value, key) => {
        dispatch({type: topicConstants.UPDATE_TOPIC_LINKS_OUT_FIELDS, key: 'topicToConnect', value})
    },
    onChangeAssociationType: (value, key) => {
        dispatch({type: topicConstants.UPDATE_TOPIC_MODAL_FIELDS, key: 'associationType', value})
    },
    onChangeScope:(value, key) => {
        dispatch({type: topicConstants.UPDATE_TOPIC_MODAL_FIELDS, key: 'topicTopicScopes', value})
    }

});

const connectedCreateTopicModal = connect(mapStateToProps, mapDispatchToProps)(CreateTopicModal);
export {connectedCreateTopicModal as CreateTopicModal};
export * from './CreateTopicModal';