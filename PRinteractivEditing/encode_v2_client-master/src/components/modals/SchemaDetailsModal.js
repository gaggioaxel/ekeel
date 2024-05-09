import React, {Component} from 'react';
import {Form, Icon, Message, Modal} from "semantic-ui-react";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import PropTypes from "prop-types";
import {alertActions} from "../../actions/alert.actions";
import {schemaActions} from "../../actions/schema.actions";
import {schemaConstants} from "../../constants/schemaConstants";
import OperationSuccessModal from "./OperationSuccessModal";
import OperationFailedModal from "./OperationFailedModal";

class SchemaDetailsModal extends Component{
    constructor(props){
        super(...arguments);
        this.props.alertAction.clear();
        this.state = ({
            isReadOnly: true,
            /*            topicMapToUpdate: this.props.topicMap*/
        });
        this.onChangeTitle = ev => this.props.onChangeTitle(ev.target.value);
        this.onChangeDescription = ev => this.props.onChangeDescription(ev.target.value);
        this.onChangeVersion = ev => this.props.onChangeVersion(ev.target.value);
        this.closeOperationSuccessModal = this.closeOperationSuccessModal.bind(this);
        this.closeOperationFailedModal = this.closeOperationFailedModal.bind(this);

        /*this.props.onTopicMapDetailsLoad(this.props.topicMapToUpdate);*/
        this.formSubmit = (schema, user) => {
            this.props.schemaAction.updateSchema(schema, user);
        };
    }

    allowModifyMappingDetails = () =>{this.setState({isReadOnly: !this.state.isReadOnly})};
    denyModifyMappingDetails  = () =>{this.setState({isReadOnly: true})};



    /*componentWillUnmount(){
        this.props.onUnloadTopicMapDetails();
    }*/
    closeOperationSuccessModal(){
        this.props.schemaAction.closeOperationSuccessModal();
    }

    closeOperationFailedModal(){
        this.props.schemaAction.closeOperationFailedModal();
    }

    render(){

        const isReadOnly = this.state.isReadOnly;
        const schema = this.props.schemaToUpdate;
        const messages = this.props.messages;
        const alertType = this.props.alertType;
        const user = this.props.user;
        console.log("ReadOnly---->", this.state.isReadOnly);
        console.log("Schema da aggiornare ---->", this.props.schemaToUpdate);

        return(
            <Modal
                size="small"
                open={this.props.isOpenModal}
                onClose={(event) => {this.denyModifyMappingDetails(); this.props.callBacks.closeModal()}}
            >
                <Modal.Header as="h3" color="blue">Modify Topic Maps Details</Modal.Header>
                <Modal.Content>
                    <Form size="small">
                        <Form.Field >
                            <label htmlFor="title">Name:</label>
                            <input
                                placeholder= 'Schema Name'
                                id="schema-title"
                                name="name"
                                value={schema.name}
                                readOnly={isReadOnly}
                                onChange={this.onChangeTitle}

                            />
                        </Form.Field>
                        <Form.Field >
                            <label htmlFor="description">Description:</label>
                            <input placeholder='Description'
                                   id="topic-map-description"
                                   name="description"
                                   value={schema.description}
                                   readOnly={isReadOnly}
                                   onChange={this.onChangeDescription}
                            />
                        </Form.Field>

                        <Form.Field >
                            <div className="div-modify-save-icon">
                                <Icon className="modify-icon" name="pencil" size="big" color="blue" onClick={this.allowModifyMappingDetails}/>
                                <Icon className="save-icon"
                                      disabled ={isReadOnly}
                                      name="save"
                                      size="big"
                                      color="blue"
                                      onClick={(event) => {this.denyModifyMappingDetails(); this.formSubmit(schema, user)}}/>
                            </div>
                        </Form.Field>
                    </Form>
                    {messages && <Message
                        size="mini"
                        list={messages}
                        color = {alertType === "alert-error" ? "red" : "green" }
                        header={alertType === "alert-success" ? "Success!"  : "Ops! Something went wrong."}
                    />}
                </Modal.Content>
                {this.props.operationSuccessSchema &&
                    <OperationSuccessModal open={this.props.operationSuccessSchema}
                                           callBacks={{closeModal: this.closeOperationSuccessModal}}/>}
                {this.props.operationFailedSchema && <OperationFailedModal open={this.props.operationFailedSchema}
                                                                           callBacks={{closeModal: this.closeOperationFailedModal}}/>}
            </Modal>
        )
    }
}

SchemaDetailsModal.propTypes = {
    user: PropTypes.object,
    schema: PropTypes.object,
    topicMapToUpdate: PropTypes.object,
    alertType: PropTypes.string,
    messages: PropTypes.array,
    isOpenModal: PropTypes.bool.isRequired,
    callBacks: PropTypes.shape({
        closeModal: PropTypes.func.isRequired
    })
};

const mapStateToProps = state => ({ ...state.user, ...state.alert, ...state.schema});

const mapDispatchToProps = (dispatch) => ({
    /* onTopicMapDetailsLoad: topicMap =>
         dispatch({type: topicMapConstants.UPDATE_TOPIC_MAP_MODAL_FIELDS, topicMap}),*/
    onChangeTitle: value =>
        dispatch({ type: schemaConstants.UPDATE_SCHEMA_MODAL_FIELDS, key: 'name', value }),
    onChangeDescription: value =>
        dispatch({ type: schemaConstants.UPDATE_SCHEMA_MODAL_FIELDS, key: 'description', value }),
    onChangeVersion: value =>
        dispatch({ type: schemaConstants.UPDATE_SCHEMA_MODAL_FIELDS, key: 'version', value }),
    schemaAction: bindActionCreators(schemaActions, dispatch),
    alertAction: bindActionCreators(alertActions, dispatch)
    /* onUnloadTopicMapDetails: () =>
         dispatch({ type: topicMapConstants.ON_UNLOAD_TOPIC_MAP_DETAILS}),*/
});

const connectedSchemaDetailsModal = connect(mapStateToProps, mapDispatchToProps)(SchemaDetailsModal);
export {connectedSchemaDetailsModal as SchemaDetailsModal}
export * from './SchemaDetailsModal'