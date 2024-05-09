import React, {Component} from 'react';
import {Button, Modal, Table, Icon} from "semantic-ui-react";
import {bindActionCreators} from "redux";
import {alertActions} from "../../actions/alert.actions";
import {EffortType} from "../EffortType";
import {connect} from "react-redux";
import {effortTypeActions} from "../../actions/effortType.actions";
import OperationSuccessModal from './OperationSuccessModal';
import OperationFailedModal from './OperationFailedModal'


class EffortTypesModal extends Component{
    constructor(){
        super(...arguments);
        this.props.alertAction.clear();
        this.closeOperationSuccessModal = this.closeOperationSuccessModal.bind(this);
        this.closeOperationFailedModal = this.closeOperationFailedModal.bind(this);
    }

    closeOperationSuccessModal(){
        this.props.effortTypeAction.closeOperationSuccessModal();
    }

    closeOperationFailedModal(){
        this.props.effortTypeAction.closeOperationFailedModal();
    }

    saveAllEffortTypes(types, user){
        types= types.filter(function(type){
            return type.name!==''&& type.id===undefined;

        });

        if(types !== undefined)
            this.props.effortTypeAction.saveAllEffortTypes(types, user);
    }

    addEffortType(){
        this.props.effortTypeAction.addNewEffortType();
    }

    render() {

        const isOpenModal = this.props.isOpenModal;
        const user = this.props.user;
        const selectedSchema= this.props.selectedSchema;
        const effortTypes= this.props.effortTypes;
        let effortTypesToRender = [];

        if(selectedSchema != null) {
            if (effortTypes !== undefined ) {
                effortTypesToRender = effortTypes.map((effortType, index) => {
                    if (effortType.schemaId === selectedSchema.id || !effortType.schemaId)
                        return <EffortType key={index} index={index} effortType={effortType}/>
                });
            }


            return (
                <Modal dimmer="blurring" size="large" open={isOpenModal} onClose={this.props.callBacks.closeModal}>
                    <Modal.Header textAlign="center">"Effort Types"</Modal.Header>
                    <Modal.Content scrolling>
                        <Table color="blue" unstackable celled>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell textAlign='left'>Effort Type Metric Type</Table.HeaderCell>
                                    <Table.HeaderCell textAlign='right'>Effort Type Description</Table.HeaderCell>
                                    <Table.HeaderCell width={1} textAlign='center'><Icon name="plus"
                                                                                         onClick={event => this.addEffortType()}/></Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {effortTypesToRender.length > 0 ? effortTypesToRender : undefined}
                            </Table.Body>
                        </Table>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button negative onClick={this.props.callBacks.closeModal}>Cancel</Button>
                        <Button positive icon='checkmark' labelPosition='right' content='Save All'
                                onClick={event => this.saveAllEffortTypes(effortTypes, user)}/>
                    </Modal.Actions>
                    {this.props.operationSuccessEffType &&
                        <OperationSuccessModal open={this.props.operationSuccessEffType}
                                               callBacks={{closeModal: this.closeOperationSuccessModal}}/>}
                    {this.props.operationFailedEffType && <OperationFailedModal open={this.props.operationFailedEffType}
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

const mapStateToProps= state => ({...state.alert, ...state.user, ...state.topicmap, ...state.topicType, ...state.schema,...state.effortType});

const mapDispatchToProps = dispatch => ({
    alertAction: bindActionCreators(alertActions, dispatch),
    effortTypeAction: bindActionCreators(effortTypeActions, dispatch),

});

const connectedEffortTypesModal = connect(mapStateToProps, mapDispatchToProps)(EffortTypesModal);
export {connectedEffortTypesModal as EffortTypesModal};
//export * from './EffortTypesModal';