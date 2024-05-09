import React, {Component} from 'react';
import {Form, Icon, Message, Modal} from "semantic-ui-react";
import {topicMapActions} from "../../actions/topicmap.actions";
import {topicMapConstants} from "../../constants/topicmapConstants";
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import PropTypes from "prop-types";
import {alertActions} from "../../actions/alert.actions";
import OperationSuccessModal from "./OperationSuccessModal";
import OperationFailedModal from "./OperationFailedModal";

class TopicMapDetailsModal extends Component{
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
        this.formSubmit = (topicMap, user) => {
            this.props.topicMapAction.updateTopicMap(topicMap, user);
        };

    }

    allowModifyMappingDetails = () =>{this.setState({isReadOnly: !this.state.isReadOnly})};
    denyModifyMappingDetails  = () =>{this.setState({isReadOnly: true})};

    fromTimestampToDate(timestamp){
        let date = new Date(timestamp);
        let year =/* '0' + */date.getFullYear();
        let month =/* '0' + */date.getMonth();
        let day = date.getDate();
        if (month<10)
            month='0'+month;
        //return [year,month,day].join("-");
        return `${year}-${month}-${day}`;
    }

    /*componentWillUnmount(){
        this.props.onUnloadTopicMapDetails();
    }*/

    closeOperationSuccessModal(){
        this.props.topicMapAction.closeOperationSuccessModal();
    }

    closeOperationFailedModal(){
        this.props.topicMapAction.closeOperationFailedModal();
    }

    render(){
        const creationDate = this.fromTimestampToDate(this.props.topicMapToUpdate.creationDate);
        const lastModifyDate = this.fromTimestampToDate(this.props.topicMapToUpdate.lastModifyDate);
        const isReadOnly = this.state.isReadOnly;
        //const topicMap = this.props.topicMap;
        const topicMap = this.props.topicMapToUpdate;
        const messages = this.props.messages;
        const alertType = this.props.alertType;
        const user = this.props.user;
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
                            <label htmlFor="title">Title:</label>
                            <input
                                placeholder= 'Topic Map Title'
                                id="topic-map-title"
                                name="title"
                                value={topicMap.title}
                                readOnly={isReadOnly}
                                onChange={this.onChangeTitle}

                            />
                        </Form.Field>
                        <Form.Field >
                            <label htmlFor="description">Description:</label>
                            <input placeholder='Description'
                                   id="topic-map-description"
                                   name="description"
                                   value={topicMap.description}
                                   readOnly={isReadOnly}
                                   onChange={this.onChangeDescription}
                            />
                        </Form.Field>
                        <Form.Group width={4}>
                            <Form.Field >
                                <label htmlFor="version">Version:</label>
                                <input placeholder='Version'
                                       id="topic-map-version"
                                       name="version"
                                       value={topicMap.version}
                                       readOnly={isReadOnly}
                                       onChange={this.onChangeVersion}
                                />
                            </Form.Field>
                            <Form.Field >
                                <label htmlFor="creationDate">Creation Date:</label>
                                <input
                                    id="topic-map-version"
                                    name="version"
                                    type="date"
                                    value={creationDate}
                                    readOnly
                                />
                            </Form.Field>
                            <Form.Field >
                                <label htmlFor="creationDate">Last Modify Date:</label>
                                <input
                                    id="topic-map-version"
                                    name="version"
                                    type="date"
                                    value={lastModifyDate}
                                    readOnly
                                    //defaultValue="0000-00-00"
                                />
                            </Form.Field>
                        </Form.Group>
                        <Form.Field >
                            <div className="div-modify-save-icon">
                                <Icon className="modify-icon" name="pencil" size="big" color="blue" onClick={this.allowModifyMappingDetails}/>
                                <Icon className="save-icon"
                                      disabled ={isReadOnly}
                                      name="save"
                                      size="big"
                                      color="blue"
                                      onClick={(event) => {this.denyModifyMappingDetails(); this.formSubmit(topicMap, user)}}/>
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
                {this.props.operationSuccessTopicMap &&
                    <OperationSuccessModal open={this.props.operationSuccessTopicMap}
                                           callBacks={{closeModal: this.closeOperationSuccessModal}}/>}
                {this.props.operationFailedTopicMap && <OperationFailedModal open={this.props.operationFailedTopicMap}
                                                                           callBacks={{closeModal: this.closeOperationFailedModal}}/>}
            </Modal>
        )
    }
}

TopicMapDetailsModal.propTypes = {
    user: PropTypes.object,
    topicMapToUpdate: PropTypes.object,
    alertType: PropTypes.string,
    messages: PropTypes.array,
    isOpenModal: PropTypes.bool.isRequired,
    callBacks: PropTypes.shape({
        closeModal: PropTypes.func.isRequired
    })
};

const mapStateToProps = state => ({ ...state.topicmap, ...state.user, ...state.alert});

const mapDispatchToProps = (dispatch) => ({
   /* onTopicMapDetailsLoad: topicMap =>
        dispatch({type: topicMapConstants.UPDATE_TOPIC_MAP_MODAL_FIELDS, topicMap}),*/
    onChangeTitle: value =>
        dispatch({ type: topicMapConstants.UPDATE_TOPIC_MAP_MODAL_FIELDS, key: 'title', value }),
    onChangeDescription: value =>
       dispatch({ type: topicMapConstants.UPDATE_TOPIC_MAP_MODAL_FIELDS, key: 'description', value }),
    onChangeVersion: value =>
       dispatch({ type: topicMapConstants.UPDATE_TOPIC_MAP_MODAL_FIELDS, key: 'version', value }),
    topicMapAction: bindActionCreators(topicMapActions, dispatch),
    alertAction: bindActionCreators(alertActions, dispatch)
   /* onUnloadTopicMapDetails: () =>
        dispatch({ type: topicMapConstants.ON_UNLOAD_TOPIC_MAP_DETAILS}),*/
});

const connectedTopicMapDetailsModal = connect(mapStateToProps, mapDispatchToProps)(TopicMapDetailsModal);
export {connectedTopicMapDetailsModal as TopicMapDetailsModal}
export * from './TopicMapDetailsModal'

