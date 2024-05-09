import React, {Component} from 'react';
import {Button, Modal, Table, Icon} from "semantic-ui-react";
import {bindActionCreators} from "redux";
import {alertActions} from "../../actions/alert.actions";
import {occurrenceTypeActions} from "../../actions/occurrenceType.actions";
import {OccurrenceType} from "../OccurrenceType";
import {connect} from "react-redux";
import OperationSuccessModal from './OperationSuccessModal';
import OperationFailedModal from './OperationFailedModal'

class OccurrenceTypesModal extends Component{
    constructor(){
        super(...arguments);
        this.props.alertAction.clear();
        this.closeOperationSuccessModal = this.closeOperationSuccessModal.bind(this);
        this.closeOperationFailedModal = this.closeOperationFailedModal.bind(this);
    }

    closeOperationSuccessModal(){
        this.props.occurrenceTypesAction.closeOperationSuccessModal();
    }

    closeOperationFailedModal(){
        this.props.occurrenceTypesAction.closeOperationFailedModal();
    }

    saveAllOccurrenceTypes(types, user){
        types=types.filter(function(type){
            return type.name!=='';

        });
        if(types !== undefined){
            this.props.occurrenceTypesAction.saveAllOccurrenceTypes(types, user)
        }
    }

    addOccurrenceType(){

        this.props.occurrenceTypesAction.addNewOccurrenceType();
    }
    componentWillUnmount() {
        this.props.occurrenceTypesAction.getAllOccurrenceType(this.props.user)
    }

    render() {
        const isOpenModal = this.props.isOpenModal;
        const selectedSchema= this.props.selectedSchema;
        const user = this.props.user;
        const occurrenceTypes = this.props.occurrenceTypes;
        let occurrenceTypesToRender = [];

        if(selectedSchema != null) {
            if (occurrenceTypes !== undefined) {
                occurrenceTypesToRender = occurrenceTypes.map((occurrenceType, index) => {
                    if (occurrenceType.schemaId === selectedSchema.id || !occurrenceType.schemaId)
                        return <OccurrenceType key={index} index={index} occurrenceType={occurrenceType}/>;
                });
            }


            return (
                <Modal dimmer="blurring" size="large" open={isOpenModal} onClose={this.props.callBacks.closeModal}>
                    <Modal.Header textAlign="center">"Occurrence Types"</Modal.Header>
                    <Modal.Content scrolling>
                        <Table color="blue" unstackable celled>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell textAlign='left'>Occurrence Type Name</Table.HeaderCell>
                                    <Table.HeaderCell textAlign='right'>Occurrence Type Description</Table.HeaderCell>
                                    <Table.HeaderCell width={1} textAlign='center'><Icon name="plus"
                                                                                         onClick={event => this.addOccurrenceType()}/></Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {occurrenceTypesToRender.length > 0 ? occurrenceTypesToRender : undefined}
                            </Table.Body>
                        </Table>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button negative onClick={this.props.callBacks.closeModal}>Cancel</Button>
                        <Button positive icon='checkmark' labelPosition='right' content='Save All'
                                onClick={event => this.saveAllOccurrenceTypes(occurrenceTypes, user)}/>
                    </Modal.Actions>
                    {this.props.operationSuccessOccType &&
                        <OperationSuccessModal open={this.props.operationSuccessOccType}
                                               callBacks={{closeModal: this.closeOperationSuccessModal}}/>}
                    {this.props.operationFailedOccType && <OperationFailedModal open={this.props.operationFailedOccType}
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

const mapStateToProps= state => ({...state.alert, ...state.user, ...state.topicmap, ...state.occurrenceType, ...state.schema});

const mapDispatchToProps = dispatch => ({
    alertAction: bindActionCreators(alertActions, dispatch),
    occurrenceTypesAction: bindActionCreators(occurrenceTypeActions, dispatch),

});

const connectedOccurrenceTypesModal = connect(mapStateToProps, mapDispatchToProps)(OccurrenceTypesModal);
export {connectedOccurrenceTypesModal as OccurrenceTypesModal};
export * from './OccurrenceTypesModal';