import React, {Component} from 'react';
import {Button, Modal, Table, Icon} from "semantic-ui-react";
import {bindActionCreators} from "redux";
import {alertActions} from "../../actions/alert.actions";
import {AssociationType} from "../AssociationType.js";
import {connect} from "react-redux";
import {associationTypeActions} from "../../actions/associationType.actions";
import OperationSuccessModal from './OperationSuccessModal';
import OperationFailedModal from './OperationFailedModal'

class AssociationTypesModal extends Component{
    constructor(){
        super(...arguments);
        this.props.alertAction.clear();
        this.closeOperationSuccessModal = this.closeOperationSuccessModal.bind(this);
        this.closeOperationFailedModal = this.closeOperationFailedModal.bind(this);
    }

    closeOperationSuccessModal(){
        this.props.associationTypesAction.closeOperationSuccessModal();
    }

    closeOperationFailedModal(){
        this.props.associationTypesAction.closeOperationFailedModal();
    }

    saveAllAssociationTypes(types, user){
        types=types.filter(function(type){
            return type.name!=='' && type.id===undefined;

        });
        if(types !== undefined)
            this.props.associationTypesAction.saveAllAssociationTypes(types, user);
    }

    addAssociationType(){
        this.props.associationTypesAction.addNewAssociationType();
    }

    componentWillUnmount() {
        this.props.associationTypesAction.getAllAssociationType(this.props.user);
    }


    render() {
        const isOpenModal = this.props.isOpenModal;
        const user = this.props.user;
        const associationTypes = this.props.associationTypes;
        const selectedSchema= this.props.selectedSchema;
        let associationTypesToRender = [];

        if(selectedSchema != null) {

            if (associationTypes !== undefined && selectedSchema !== undefined) {
                associationTypesToRender = associationTypes.map((associationType, index) => {
                    if (associationType.schemaId === selectedSchema.id || !associationType.schemaId)
                        return <AssociationType key={index} index={index} associationType={associationType}/>
                });
            }


            return (

                <Modal dimmer="blurring" size="large" open={isOpenModal} onClose={this.props.callBacks.closeModal}>
                    <Modal.Header textAlign="center">"Association Types"</Modal.Header>
                    <Modal.Content scrolling>
                        <Table color="blue" unstackable celled>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell textAlign='left'>Association Type Name</Table.HeaderCell>
                                    <Table.HeaderCell textAlign='right'>Association Type Description</Table.HeaderCell>
                                    <Table.HeaderCell width={1} textAlign='center'><Icon name="plus"
                                                                                         onClick={event => this.addAssociationType()}/></Table.HeaderCell>
                                    <Table.HeaderCell textAlign='left'>Association Type Role Name</Table.HeaderCell>
                                    <Table.HeaderCell textAlign='left'>Association Type Role
                                        Description</Table.HeaderCell>

                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {associationTypesToRender.length > 0 ? associationTypesToRender : undefined}
                            </Table.Body>
                        </Table>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button negative onClick={this.props.callBacks.closeModal}>Cancel</Button>
                        <Button positive icon='checkmark' labelPosition='right' content='Save All'
                                onClick={event => this.saveAllAssociationTypes(associationTypes, user)}/>
                    </Modal.Actions>
                    {this.props.operationSuccessAssType &&
                        <OperationSuccessModal open={this.props.operationSuccessAssType}
                                               callBacks={{closeModal: this.closeOperationSuccessModal}}/>}
                    {this.props.operationFailedAssType && <OperationFailedModal open={this.props.operationFailedAssType}
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

const mapStateToProps= state => ({...state.alert, ...state.user, ...state.topicmap, ...state.associationType, ...state.schema});

const mapDispatchToProps = dispatch => ({
    alertAction: bindActionCreators(alertActions, dispatch),
    associationTypesAction: bindActionCreators(associationTypeActions, dispatch),

});

const connectedAssociationTypesModal = connect(mapStateToProps, mapDispatchToProps)(AssociationTypesModal);
export {connectedAssociationTypesModal as AssociationTypesModal};
//export * from './AssociationTypesModal';