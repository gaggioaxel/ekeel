import React, {Component} from 'react';
import {Button, Modal, Table, Icon} from "semantic-ui-react";
import {bindActionCreators} from "redux";
import {alertActions} from "../../actions/alert.actions";
import {TopicType} from "../TopicType";
import {connect} from "react-redux";
import {topicTypeActions} from "../../actions/topicType.actions";
import OperationSuccessModal from './OperationSuccessModal';
import OperationFailedModal from './OperationFailedModal'


class TopicTypesModal extends Component{
    constructor(){
        super(...arguments);
        this.props.alertAction.clear();
        this.closeOperationSuccessModal = this.closeOperationSuccessModal.bind(this);
        this.closeOperationFailedModal = this.closeOperationFailedModal.bind(this);
    }

    closeOperationSuccessModal(){
        this.props.topicTypeAction.closeOperationSuccessModal();
    }

    closeOperationFailedModal(){
        this.props.topicTypeAction.closeOperationFailedModal();
    }

    saveAllTopicTypes(types, user){
        types= types.filter(function(type){
            return type.name!==''&& type.id===undefined;

        });

        if(types !== undefined)
            this.props.topicTypeAction.saveAllTopicTypes(types, user);
    }

    addTopicType(){
        this.props.topicTypeAction.addNewTopicType();
    }

    componentWillUnmount() {
        this.props.topicTypeAction.getAllTopicTypes(this.props.user)
    }

    render() {

        const isOpenModal = this.props.isOpenModal;
        const user = this.props.user;
        const selectedSchema= this.props.selectedSchema;
        const topicTypes = this.props.topicTypes;
        let topicTypesToRender = [];

        if(selectedSchema != null) {
            if (topicTypes !== undefined) {
                topicTypesToRender = topicTypes.map((topicType, index) => {
                    if (topicType.schemaId === selectedSchema.id || !topicType.schemaId)
                        return <TopicType key={index} index={index} topicType={topicType}/>
                });
            }


            return (
                <Modal dimmer="blurring" size="large" open={isOpenModal} onClose={this.props.callBacks.closeModal}>
                    <Modal.Header textAlign="center">"Topic Types"</Modal.Header>
                    <Modal.Content scrolling>
                        <Table color="blue" unstackable celled>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell textAlign='left'>Topic Type Name</Table.HeaderCell>
                                    <Table.HeaderCell textAlign='right'>Topic Type Description</Table.HeaderCell>
                                    <Table.HeaderCell width={1} textAlign='center'><Icon name="plus" onClick={event => this.addTopicType()}/></Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {topicTypesToRender.length > 0 ? topicTypesToRender : undefined}
                            </Table.Body>
                        </Table>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button negative onClick={this.props.callBacks.closeModal}>Cancel</Button>
                        <Button positive icon='checkmark' labelPosition='right' content='Save All'
                                onClick={event => this.saveAllTopicTypes(topicTypes, user)}/>
                    </Modal.Actions>
                    {this.props.operationSuccessTopicType &&
                        <OperationSuccessModal open={this.props.operationSuccessTopicType}
                                               callBacks={{closeModal: this.closeOperationSuccessModal}}/>}
                    {this.props.operationFailedTopicType &&
                        <OperationFailedModal open={this.props.operationFailedTopicType}
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

const mapStateToProps= state => ({...state.alert, ...state.user, ...state.topicmap, ...state.topicType, ...state.schema});

const mapDispatchToProps = dispatch => ({
    alertAction: bindActionCreators(alertActions, dispatch),
    topicTypeAction: bindActionCreators(topicTypeActions, dispatch),

});

const connectedTopicTypesModal = connect(mapStateToProps, mapDispatchToProps)(TopicTypesModal);
export {connectedTopicTypesModal as TopicTypesModal};
//export * from './TopicTypesModal';