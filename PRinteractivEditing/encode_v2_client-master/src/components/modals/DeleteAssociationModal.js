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

class DeleteAssociationModal extends Component{
    constructor() {
        super(...arguments);
        this.props.topicTypeAction.getAllTopicTypes(this.props.user);
        this.props.associationTypeAction.getAllAssociationType(this.props.user);
        this.closeOperationSuccessModal = this.closeOperationSuccessModal.bind(this);
        this.closeOperationFailedModal = this.closeOperationFailedModal.bind(this);
        this.props.alertAction.clear();
        this.onChangeAssociationToDelete = (ev, {value}) => {this.props.onChangeAssociationToDelete(value)};



        this.formSubmit = (associationsToDelete, user) => {
            this.handleAssociationFormSubmit(associationsToDelete, user);
        }





    }
    handleAssociationFormSubmit(associationsToDelete, user) {
        /*if(newAssociation.topicTypes === "primary_notion"){
            const primaryNotion = selectedTopicMap.allTopics.filter(function(topic){
                return (topic.topicTypeName === "primary_notion")
            });
            if (primaryNotion.length > 0){
                this.props.alertAction.error("A topic of type PrimaryNotion is already present in this TopicMap.")
                return;
            }
        }*/
        this.props.associationAction.deleteAssociation(associationsToDelete, user);
    }

    componentWillUnmount() {
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

        const alertType = this.props.alertType;
        const messages = this.props.messages;
        const selectedTopicMap = this.props.selectedTopicMap;
        const associationsToDelete= this.props.associationsToDelete;

        const allTopicMapAssociationsOptions=[];

        let cont=0;


        if(selectedTopicMap != null) {
            selectedTopicMap.allAssociations.forEach(function(element){
                allTopicMapAssociationsOptions.push({
                    key: cont++,
                    value: element.id,
                    text: element.id
                })
            })



            return (
                <Modal dimmer="blurring" size="tiny" open={isOpenModal} onClose={this.props.callBacks.closeModal}>
                    <Modal.Header>Delete Associations</Modal.Header>
                    <Modal.Content>
                        <Form>
                            <Form.Field>
                                <label htmlFor="associationName">Choose one or more Association to delete.</label>
                                <Dropdown placeholder="Choose Associations to delete" multiple search selection
                                           options={allTopicMapAssociationsOptions} onChange={this.onChangeAssociationToDelete}/>
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
                            this.formSubmit(associationsToDelete,user)
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

    onChangeAssociationToDelete: (value, key) => {
        dispatch({type: associationConstants.UPDATE_DELETE_ASSOCIATION_MODAL_FIELDS, key: 'associationsToDelete', value})
    },


});
const connectedDeleteAssociationModal = connect(mapStateToProps, mapDispatchToProps)(DeleteAssociationModal);
export {connectedDeleteAssociationModal as DeleteAssociationModal};
export * from './CreateAssociationModal';
