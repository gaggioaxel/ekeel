/*modal to create a Schema*/
import React, {Component} from 'react';
import {Button, Modal, Form, Message} from "semantic-ui-react";
import {bindActionCreators} from "redux";
import {schemaConstants} from "../../constants/schemaConstants";
import {alertActions} from "../../actions/alert.actions";
import {schemaActions} from "../../actions/schema.actions";
import {connect} from "react-redux";
import PropTypes from 'prop-types';
import OperationSuccessModal from "./OperationSuccessModal";
import OperationFailedModal from "./OperationFailedModal";


class SchemaModal extends Component {
    constructor() {
        super(...arguments);
        this.props.alertAction.clear();
        this.onChangeName = ev => this.props.onChangeName(ev.target.value);
        this.onChangeDescription = ev => this.props.onChangeDescription(ev.target.value);
        this.closeOperationSuccessModal = this.closeOperationSuccessModal.bind(this);
        this.closeOperationFailedModal = this.closeOperationFailedModal.bind(this);


        this.formSubmit = (newSchema, user) => {
            this.props.alertAction.clear();
            this.handleSchemaFormSubmit(newSchema, user);
        }
    }

    handleSchemaFormSubmit(newSchema, user){
        let errors = 0;
        if(!newSchema) {
            errors++;
            this.props.alertAction.error("Please specify Schema's information!");
        }else {
            if (!newSchema.name) {

                this.props.alertAction.error("Please specify a Schema's name!");
                errors++;
            }
            if (newSchema.name && newSchema.name.length > 60) {
                this.props.alertAction.error("Please specify a name with less then 60 characters!");
                errors++;
            }
            if (newSchema.description && newSchema.description.length > 200) {
                this.props.alertAction.error("Please specify a description with less then 200 characters! Now are: " + newSchema.description.length);
                errors++;
            }
        }

        if(errors === 0 && newSchema.id)
            this.props.schemaAction.updateSchema(newSchema, user);
        else if(errors === 0 && !newSchema.id){
            this.props.schemaAction.createSchema(newSchema, user);
        }

    }

    closeOperationSuccessModal(){
        this.props.schemaAction.closeOperationSuccessModal();
    }

    closeOperationFailedModal(){
        this.props.schemaAction.closeOperationFailedModal();
    }
    render() {
        const isOpenModal = this.props.isOpenModal;
        const user = this.props.user;
        const newSchema = this.props.newSchema;
        const alertType = this.props.alertType;
        const messages = this.props.messages;
        return(
            <Modal dimmer="blurring" size="small" open={isOpenModal} onClose={this.props.callBacks.closeModal}>
                <Modal.Header>Create new Schema</Modal.Header>
                <Modal.Content>
                    <Form >
                        <Form.Field >
                            <label htmlFor="Name">Name:</label>
                            <input
                                placeholder= 'Schema Name'
                                id="schema-modal-name"
                                name="name"
                                onChange={this.onChangeName}
                            />
                        </Form.Field>
                        <Form.Field >
                            <label htmlFor="description">Description:</label>
                            <input placeholder='Description'
                                   id="schema-modal-description"
                                   name="description"
                                   onChange={this.onChangeDescription}
                            />
                        </Form.Field>
                    </Form>
                    {messages && <Message
                        size="mini"
                        list={messages}
                        color = {alertType === "alert-error" ? "red" : "green" }
                        header={alertType === "alert-success" ? "Created!"  : "Ops! Something went wrong."}
                    />}
                </Modal.Content>
                <Modal.Actions>
                    <Button negative onClick={this.props.callBacks.closeModal} >Cancel</Button>
                    <Button positive icon='checkmark' labelPosition='right' content='Create' onClick={(event) =>{ this.formSubmit(newSchema, user)}}/>
                </Modal.Actions>
                {this.props.operationSuccessSchema &&
                    <OperationSuccessModal open={this.props.operationSuccessSchema}
                                           callBacks={{closeModal: this.closeOperationSuccessModal}}/>}
                {this.props.operationFailedSchema && <OperationFailedModal open={this.props.operationFailedSchema}
                                                                            callBacks={{closeModal: this.closeOperationFailedModal}}/>}
            </Modal>
        )
    }
}

SchemaModal.propTypes = {
    user: PropTypes.object,
    newSchema: PropTypes.object,
    alertType: PropTypes.string,
    messages: PropTypes.array,
    isOpenModal: PropTypes.bool.isRequired,
    callBacks: PropTypes.shape({
        closeModal: PropTypes.func.isRequired
    })
};

const mapStateToProps= state => ({...state.alert, ...state.user, ...state.schema});

const mapDispatchToProps = dispatch => ({
    alertAction: bindActionCreators(alertActions, dispatch),
    schemaAction: bindActionCreators(schemaActions, dispatch),
    onChangeName: value =>
        dispatch({ type: schemaConstants.UPDATE_SCHEMA_MODAL_FIELDS, key: 'name', value }),
    onChangeDescription: value =>
        dispatch({ type: schemaConstants.UPDATE_SCHEMA_MODAL_FIELDS, key: 'description', value })
    /*onCreateTopicMapLoad: () =>
        dispatch({type: topicMapConstants.ON_LOAD_TOPIC_MAP_CREATE})*/
});

const connectedSchemaModal = connect(mapStateToProps, mapDispatchToProps)(SchemaModal);
export {connectedSchemaModal as SchemaModal};
export * from './SchemaModal';