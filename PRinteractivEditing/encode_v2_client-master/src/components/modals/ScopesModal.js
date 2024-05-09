import React, {Component} from 'react';
import {Button, Modal, Table, Icon} from "semantic-ui-react";
import {bindActionCreators} from "redux";
import {alertActions} from "../../actions/alert.actions";
import {scopeActions} from "../../actions/scope.actions";
import {Scope} from "../Scope";
import {connect} from "react-redux";
import PropTypes from 'prop-types';
import OperationSuccessModal from './OperationSuccessModal';
import OperationFailedModal from './OperationFailedModal'

class ScopesModal extends Component{
    constructor(){
        super(...arguments);
        this.props.alertAction.clear();
        this.closeOperationSuccessModal = this.closeOperationSuccessModal.bind(this);
        this.closeOperationFailedModal = this.closeOperationFailedModal.bind(this);
    }

    closeOperationSuccessModal(){
        this.props.scopeAction.closeOperationSuccessModal();
    }

    closeOperationFailedModal(){
        this.props.scopeAction.closeOperationFailedModal();
    }

    saveAllScopes(scopes, user){
        if(scopes !== undefined){
            this.props.scopeAction.saveAllScopes(scopes, user)
        }
    }

    addScope(){
        this.props.scopeAction.addNewScope()
    }

    componentWillUnmount() {
        this.props.scopeAction.clearNotSavedScopes();
    }

    render() {
        const isOpenModal = this.props.isOpenModal;
        const user = this.props.user;
        const scopes = this.props.scopes;
        const selectedSchema= this.props.selectedSchema;
        let scopesToRender = [];

        if(selectedSchema != null) {

            if (scopes !== undefined) {
                scopesToRender = scopes.map((scope, index) => {
                    if (scope.schemaId === selectedSchema.id || !scope.schemaId)
                        return <Scope key={index} index={index} scope={scope}/>
                });
            }

            return (
                <Modal dimmer="blurring" size="large" open={isOpenModal} onClose={this.props.callBacks.closeModal}>
                    <Modal.Header textAlign="center">"Scopes"</Modal.Header>
                    <Modal.Content scrolling>
                        <Table color="blue" unstackable celled>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell textAlign='left'>Scope name</Table.HeaderCell>
                                    <Table.HeaderCell textAlign='right'>Scope description</Table.HeaderCell>
                                    <Table.HeaderCell width={1} textAlign='center'>
                                        <Icon name="plus" onClick={event => this.addScope()}/>
                                    </Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {scopesToRender.length > 0 ? scopesToRender : undefined}
                            </Table.Body>
                        </Table>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button negative onClick={this.props.callBacks.closeModal}>Cancel</Button>
                        <Button positive icon='checkmark' labelPosition='right' content='Save All'
                                onClick={event => this.saveAllScopes(scopes, user)}/>
                    </Modal.Actions>
                    {this.props.operationSuccessScope && <OperationSuccessModal open={this.props.operationSuccessScope} callBacks={{closeModal: this.closeOperationSuccessModal}}/>}
                    {this.props.operationFailedScope && <OperationFailedModal open={this.props.operationFailedScope} callBacks={{closeModal: this.closeOperationFailedModal}}/>}
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

ScopesModal.propTypes = {
    user: PropTypes.object,
    newTopicMap: PropTypes.object,
    alertType: PropTypes.string,
    messages: PropTypes.array,
    isOpenModal: PropTypes.bool.isRequired,
    callBacks: PropTypes.shape({
        closeModal: PropTypes.func.isRequired
    })
};

const mapStateToProps= state => ({...state.alert, ...state.user, ...state.topicmap, ...state.scope, ...state.schema});

const mapDispatchToProps = dispatch => ({
    alertAction: bindActionCreators(alertActions, dispatch),
    scopeAction: bindActionCreators(scopeActions, dispatch),

});

const connectedScopesModal = connect(mapStateToProps, mapDispatchToProps)(ScopesModal);
export {connectedScopesModal as ScopesModal};
export * from './ScopesModal';