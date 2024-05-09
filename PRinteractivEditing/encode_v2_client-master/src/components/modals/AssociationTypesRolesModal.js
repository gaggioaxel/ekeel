import React, {Component} from 'react';
import {Button, Modal, Icon, Form, Dropdown, Message} from "semantic-ui-react";
import {bindActionCreators} from "redux";
import {alertActions} from "../../actions/alert.actions";
import {connect} from "react-redux";
import {associationTypeActions} from "../../actions/associationType.actions";
import {associationTypeConstants} from "../../constants/associationTypeConstants";
import {topicTypeActions} from "../../actions/topicType.actions";
import {topicActions} from "../../actions/topic.actions";
import {topicMapActions} from "../../actions/topicmap.actions";
import {associationActions} from "../../actions/association.actions";

class AssociationTypesRolesModal extends Component {
    constructor(){
        super(...arguments);
        this.props.alertAction.clear();
        this.closeOperationSuccessModal = this.closeOperationSuccessModal.bind(this);
        this.closeOperationFailedModal = this.closeOperationFailedModal.bind(this);
        this.onChangeTopicType = (ev, {value}) => this.props.onChangeTopicType(value);
        this.onChangeAssociationType = (ev, {value}) => {this.props.onChangeAssociationType(value)};
        this.onChangeAssociationTypeRole=(ev, {value}) => this.props.onChangeAssociationTypeRole(value);

        this.formSubmit = (newAssociationTypesRolesTopicType, user) => {
            this.handleAssociationFormSubmit(newAssociationTypesRolesTopicType, user);
        }

    }
    closeOperationSuccessModal(){
        this.props.associationTypeAction.closeOperationSuccessModal();
    }

    closeOperationFailedModal(){
        this.props.associationTypeAction.closeOperationFailedModal();
    }
    handleAssociationFormSubmit(newAssociationTypesRolesTopicType, user) {
        /*if(newAssociation.topicTypes === "primary_notion"){
            const primaryNotion = selectedTopicMap.allTopics.filter(function(topic){
                return (topic.topicTypeName === "primary_notion")
            });
            if (primaryNotion.length > 0){
                this.props.alertAction.error("A topic of type PrimaryNotion is already present in this TopicMap.")
                return;
            }
        }*/
        this.props.associationTypeAction.updateAssociationTypeRoleTopicType(newAssociationTypesRolesTopicType, user);
    }
    componentWillUnmount() {
        this.props.associationTypeAction.getAllAssociationType(this.props.user);
    }

    render() {
        const newAssociationTypesRolesTopicType = this.props.newAssociationTypesRolesTopicType
        const isOpenModal = this.props.isOpenModal;
        const user = this.props.user;
        const alertType = this.props.alertType;
        const selectedSchema= this.props.selectedSchema;
        const messages = this.props.messages;
        const selectedTopicMap = this.props.selectedTopicMap;
        const topicTypes = this.props.topicTypes;
        const associationTypes = this.props.associationTypes;
        let selectedAssociation= null;
        const allTopicTypesOptions = [];
        const allRoleAssociationTypeOptions=[];
        const allAssociationTypeOptions = [];
        let cont=0;

        if(newAssociationTypesRolesTopicType.associationTypeId!==undefined)
            selectedAssociation=newAssociationTypesRolesTopicType.associationTypeId

        if (selectedSchema != null && selectedTopicMap != null) {

            topicTypes.forEach(function (element) {
                if (element.schemaId === selectedTopicMap.schemaId)
                    allTopicTypesOptions.push({
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
                if (selectedAssociation === element.id) {
                    element.associationTypeRoles.forEach(function (role) {
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
                    <Modal.Header>Give to a TopicType an Association Type Role</Modal.Header>
                    <Modal.Content scrolling>
                        <Form>
                            <Form.Field>
                                <label htmlFor="scope">Topic Type</label>
                                <Dropdown placeholder="Choose a Topic Type" search multiple selection options={allTopicTypesOptions}
                                          onChange={this.onChangeTopicType}/>
                            </Form.Field>
                            <Form.Field>
                                <label htmlFor="associationType">Association Type</label>
                                <Dropdown placeholder="Choose an Association Type" search selection options={allAssociationTypeOptions}
                                          onSelect={this.selectedAssociation = this.value}
                                          onChange={this.onChangeAssociationType}/>
                            </Form.Field>
                            <Form.Field>
                                    <label htmlFor="IncomingTopic"> Association Type Role</label>
                                    <Dropdown placeholder="Choose a Role" search selection options={allRoleAssociationTypeOptions}
                                              onChange={this.onChangeAssociationTypeRole}/>
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
                            this.formSubmit(newAssociationTypesRolesTopicType, user)
                        }}/>
                    </Modal.Actions>
                </Modal>
            )
        }else{
            return(
                <Modal style={{"text-align":"center", "color":"red", "font-weight": "bold"}} dimmer="blurring" size="tiny" open={isOpenModal} onClose={this.props.callBacks.closeModal}>
                    <Modal.Header>Ops<Icon name="warning" color ="red"/> Something went wrong<Icon name="warning" color ="red"/></Modal.Header>
                    <Modal.Content >
                        Please select a Schema and a Topic Map!
                    </Modal.Content>
                </Modal>
            )
        }
    }
}
const mapStateToProps= state => ({...state.alert, ...state.user, ...state.topicmap, ...state.associationType, ...state.schema, ...state.topicType});

const mapDispatchToProps = dispatch => ({
    alertAction: bindActionCreators(alertActions, dispatch),
    topicTypeAction: bindActionCreators(topicTypeActions, dispatch),
    associationTypeAction: bindActionCreators(associationTypeActions, dispatch),
    topicAction: bindActionCreators(topicActions, dispatch),
    topicMapAction: bindActionCreators(topicMapActions, dispatch),
    associationAction: bindActionCreators(associationActions, dispatch),
    onChangeAssociationType: (value, key) => {
        dispatch({type: associationTypeConstants.UPDATE_ASSOCIATION_TYPE_ROLE_TOPIC_TYPE_FIELD, key: 'associationTypeId', value})
    },
    onChangeAssociationTypeRole: (value, key)=>{
        dispatch({type: associationTypeConstants.UPDATE_ASSOCIATION_TYPE_ROLE_TOPIC_TYPE_FIELD, key: 'roleId', value})
    },
    onChangeTopicType: (value, key)=>{
        dispatch({type: associationTypeConstants.UPDATE_ASSOCIATION_TYPE_ROLE_TOPIC_TYPE_FIELD, key: 'topicTypeId', value})
    }
});

const connectedAssociationTypesRolesModal = connect(mapStateToProps, mapDispatchToProps)(AssociationTypesRolesModal);
export {connectedAssociationTypesRolesModal as AssociationTypesRolesModal};
//export * from './AssociationTypesModal';