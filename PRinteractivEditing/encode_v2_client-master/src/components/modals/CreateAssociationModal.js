import React, {Component} from 'react';
import {Modal, Button, Form, Dropdown, Icon, Message} from "semantic-ui-react";
import {bindActionCreators} from "redux";
import {alertActions} from "../../actions/alert.actions";
import {topicTypeActions} from "../../actions/topicType.actions";
import {topicActions} from "../../actions/topic.actions";
import {associationConstants} from "../../constants/associationConstants";
import {connect} from "react-redux";
import {associationTypeActions} from "../../actions/associationType.actions";
import {topicMapActions} from "../../actions/topicmap.actions";
import {associationActions} from "../../actions/association.actions";
import OperationSuccessModal from "./OperationSuccessModal";
import OperationFailedModal from "./OperationFailedModal";

class CreateAssociationModal extends Component{
    constructor() {
        super(...arguments);
        this.props.topicTypeAction.getAllTopicTypes(this.props.user);
        this.props.associationTypeAction.getAllAssociationType(this.props.user);
        this.props.alertAction.clear();
        this.onChangeTopicType = (ev, {value}) => this.props.onChangeTopicType(value);
        this.onChangeTopicToConnectIn = (ev, {value}) => this.props.onChangeTopicToConnectIn(value);
        this.onChangeTopicToConnectOut = (ev, {value}) => this.props.onChangeTopicToConnectOut(value);
        this.onChangeAssociationType = (ev, {value}) => {this.props.onChangeAssociationType(value)};
        this.onChangeScope = (ev, {value}) => this.props.onChangeScope(value);
        this.onChangeTopicRoleToConnectIn=(ev, {value}) => this.props.onChangeTopicRoleToConnectIn(value);
        this.onChangeTopicRoleToConnectOut=(ev, {value}) => this.props.onChangeTopicRoleToConnectOut(value);
        this.closeOperationSuccessModal = this.closeOperationSuccessModal.bind(this);
        this.closeOperationFailedModal = this.closeOperationFailedModal.bind(this);


        this.formSubmit = (newAssociation, user) => {
            this.handleAssociationFormSubmit(newAssociation, user);
        }





    }
    handleAssociationFormSubmit(newAssociation, user) {
        /*if(newAssociation.topicTypes === "primary_notion"){
            const primaryNotion = selectedTopicMap.allTopics.filter(function(topic){
                return (topic.topicTypeName === "primary_notion")
            });
            if (primaryNotion.length > 0){
                this.props.alertAction.error("A topic of type PrimaryNotion is already present in this TopicMap.")
                return;
            }
        }*/
        this.props.associationAction.createAssociation(newAssociation, user);
    }
    componentWillUnmount() {
        this.props.associationAction.clearAssociation();
        if(this.props.selectedTopicMap)
            this.props.topicMapAction.getTopicMapById(this.props.selectedTopicMap.id, this.props.user)
    }


    closeOperationSuccessModal(){
        this.props.associationAction.closeOperationSuccessModal();
    }

    closeOperationFailedModal(){
        this.props.associationAction.closeOperationFailedModal();
    }


    render() {
        const isOpenModal = this.props.isOpenModal;
        const user = this.props.user;
        const newAssociation = this.props.newAssociation;
        const alertType = this.props.alertType;
        const messages = this.props.messages;
        const selectedTopicMap = this.props.selectedTopicMap;
        const associationTypes = this.props.associationTypes;
        const scopes = this.props.scopes;
        let selectedAssociation= null;
        const allScopeOptions = [];
        const allTopicOfMapOptions = [];
        const allRoleAssociationTypeOptions=[];
        const allAssociationTypeOptions = [];
        let cont=0;

        if(newAssociation.associationTypeId!==undefined)
            selectedAssociation=newAssociation.associationTypeId


        if (selectedTopicMap != null) {
            newAssociation.topicmapId=selectedTopicMap.id
            selectedTopicMap.allTopics.forEach(function (element) {
                allTopicOfMapOptions.push({
                    key: element.id,
                    value: element.id,
                    text: element.name
                })
            });


            scopes.forEach(function (element) {
                if (element.schemaId === selectedTopicMap.schemaId)
                    allScopeOptions.push({
                        key: cont++,
                        value: element.id,
                        text: element.name
                    })
            });


            associationTypes.forEach(function (element) {
                if (element.schemaId === selectedTopicMap.schemaId)
                    allAssociationTypeOptions.push({
                        key: element.id,
                        value: element.id,
                        text: element.name
                    });
                if(selectedAssociation===element.id) {
                    element.associationTypeRoles.forEach(function(role){
                        allRoleAssociationTypeOptions.push({
                            key: role.id,
                            value: role.id,
                            text: role.name
                        })
                    })


                }
            });



            return (
                <Modal dimmer="blurring" size="large" open={isOpenModal} onClose={this.props.callBacks.closeModal}>
                    <Modal.Header>Create new Association</Modal.Header>
                    <Modal.Content scrolling>
                        <Form>
                            <Form.Field>
                                <label htmlFor="scope">Scope</label>
                                <Dropdown placeholder="Choose a Scope" search selection options={allScopeOptions}
                                          onChange={this.onChangeScope}/>
                            </Form.Field>
                            <Form.Field>
                                <label htmlFor="associationType">Association Type</label>
                                <Dropdown placeholder="Choose an Association Type" search selection
                                          options={allAssociationTypeOptions}  onChange={this.onChangeAssociationType}/>
                            </Form.Field>
                            <Form.Field>
                                <Form.Field>
                                    <label htmlFor="IncomingTopic">Incoming topics</label>
                                    <Dropdown placeholder="Choose a Topic "  search selection
                                              options={allTopicOfMapOptions} onChange={this.onChangeTopicToConnectIn}/>
                                </Form.Field>
                                <Form.Field>
                                    <label htmlFor="IncomingTopic"> Incoming Topic Role</label>
                                    <Dropdown placeholder="Choose Incoming Topic Role"  search selection
                                              options={allRoleAssociationTypeOptions} onChange={this.onChangeTopicRoleToConnectIn}/>
                                </Form.Field>
                            </Form.Field>
                            <Form.Field>
                                <Form.Field>
                                    <label htmlFor="outgoingTopic">Outgoing topics</label>
                                    <Dropdown placeholder="Choose a Topic "  search selection
                                              options={allTopicOfMapOptions} onChange={this.onChangeTopicToConnectOut}/>
                                </Form.Field>
                                <Form.Field>
                                    <label htmlFor="outgoingTopic">Outgoing Topic Role</label>
                                    <Dropdown placeholder="Choose Outgoing Topic Role" search selection
                                              options={allRoleAssociationTypeOptions} onChange={this.onChangeTopicRoleToConnectOut}/>
                                </Form.Field>
                            </Form.Field>

                            {messages && <Form.Field>
                                <Message
                                    size="small"
                                    list={messages}
                                    color={alertType === "alert-error" ? "red" : "green"}
                                    header={alertType === "alert-success" ? "Created!" : "Ops! Something went wrong."}
                                />
                            </Form.Field>}
                        </Form>

                    </Modal.Content>
                    <Modal.Actions>
                        <Button negative onClick={this.props.callBacks.closeModal}>Cancel</Button>
                        <Button positive icon='checkmark' labelPosition='right' content='Create' onClick={(event) => {
                            this.formSubmit(newAssociation, user)
                        }}/>
                    </Modal.Actions>
                    {this.props.operationSuccessAss &&
                        <OperationSuccessModal open={this.props.operationSuccessAss}
                                               callBacks={{closeModal: this.closeOperationSuccessModal}}/>}
                    {this.props.operationFailedAss && <OperationFailedModal open={this.props.operationFailedAss}
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
const mapStateToProps= state => ({...state.alert, ...state.user, ...state.topicmap, ...state.topic, ...state.topicType, ...state.associationType,...state.scope , ...state.association});
const mapDispatchToProps = dispatch => ({
    alertAction: bindActionCreators(alertActions, dispatch),
    topicTypeAction: bindActionCreators(topicTypeActions, dispatch),
    associationTypeAction: bindActionCreators(associationTypeActions, dispatch),
    topicAction: bindActionCreators(topicActions, dispatch),
    topicMapAction: bindActionCreators(topicMapActions, dispatch),
    associationAction: bindActionCreators(associationActions, dispatch),

    onChangeTopicToConnectIn: (value, key) => {
        dispatch({type: associationConstants.UPDATE_ASSOCIATION_MODAL_FIELDS, key: 'topicToConnectIn', value})
    },
    onChangeTopicToConnectOut: (value, key) => {
        dispatch({type: associationConstants.UPDATE_ASSOCIATION_MODAL_FIELDS, key: 'topicToConnectOut', value})
    },
    onChangeTopicRoleToConnectIn: (value, key) => {
        dispatch({type: associationConstants.UPDATE_ASSOCIATION_MODAL_FIELDS, key: 'topicRoleToConnectIn', value})
    },
    onChangeTopicRoleToConnectOut: (value, key) => {
        dispatch({type: associationConstants.UPDATE_ASSOCIATION_MODAL_FIELDS, key: 'topicRoleToConnectOut', value})
    },
    onChangeAssociationType: (value, key) => {
        dispatch({type: associationConstants.UPDATE_ASSOCIATION_MODAL_FIELDS, key: 'associationTypeId', value})
    },
    onChangeScope:(value, key) => {
        dispatch({type: associationConstants.UPDATE_ASSOCIATION_MODAL_FIELDS, key: 'associationAssociationScopes', value})
    }

});
const connectedCreateAssociationModal = connect(mapStateToProps, mapDispatchToProps)(CreateAssociationModal);
export {connectedCreateAssociationModal as CreateAssociationModal};
export * from './CreateAssociationModal';