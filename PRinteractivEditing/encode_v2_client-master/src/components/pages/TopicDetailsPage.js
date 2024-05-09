import React, {Component} from 'react';
import {Table, Header, Icon, Confirm, Button, Loader} from 'semantic-ui-react';
import '../../css/TopicDetailsPage.Style.css';
import {bindActionCreators} from "redux";
import {topicMapActions} from "../../actions/topicmap.actions";
import {userActions} from "../../actions/user.actions";
import {alertActions} from "../../actions/alert.actions";
import {topicActions} from "../../actions/topic.actions";
import {Occurrence} from "../Occurrence"
import {connect} from "react-redux";
import {occurrenceActions} from "../../actions/occurrence.actions";
import {occurrenceTypeActions} from "../../actions/occurrenceType.actions";
import {TopicTableElement} from "../../components/TopicTableElement";
import { Link} from "react-router-dom";
import {scopeActions} from "../../actions/scope.actions";
import OperationSuccessModal from "../modals/OperationSuccessModal";
import OperationFailedModal from "../modals/OperationFailedModal";
import {associationTypeActions} from "../../actions/associationType.actions";

class TopicDetailsPage extends Component{
    constructor(){
        super(...arguments);
        this.state = {go:false, selectedTopicId:""};
        this.props.alertAction.clear();
        this.closeOperationSuccessModal = this.closeOperationSuccessModal.bind(this);
        this.closeOperationFailedModal = this.closeOperationFailedModal.bind(this);
    }

    componentWillMount() {
        this.prepareTopicDetails(this.props.match.params.topicId, this.props.user);
    }

    prepareTopicDetails(topicId, user){
        this.props.topicAction.getTopic(topicId, user);
        this.props.occurrenceAction.getAllOccurrences(topicId,user);
        this.props.occurrenceTypeAction.getAllOccurrenceType(user);
        this.props.scopeAction.getAllScopes(user);
        this.props.associationTypeAction.getAllAssociationType(user);
    }

    componentWillReceiveProps(nextProps,  nextContext) {
        if(this.props.match.params.topicId !== nextProps.match.params.topicId)
            this.prepareTopicDetails(nextProps.match.params.topicId, nextProps.user);
    }

    addOccurrence(topicId){
        this.props.occurrenceAction.addOccurrence(topicId);
    }

    closeDeleteOccConfirm(){
        this.props.occurrenceAction.closeDeleteOccConfirm();
    }

    closeOperationFailedModal(){
        this.props.occurrenceAction.closeOperationFailedModal();
    }

    closeOperationSuccessModal(){
        this.props.occurrenceAction.closeOperationSuccessModal();
    }

    deleteOccurrence(occurrenceToDelete, user){
        this.props.occurrenceAction.deleteOccurrence(occurrenceToDelete, user)
    }



    render(){
        const topic =this.props.foundTopic;
        const occurrences = this.props.occurrences;
        const occurrenceTypes = this.props.occurrenceTypes;
        const user = this.props.user;
        const selectedTopicMap = this.props.selectedTopicMap;
        let occurrencesToRender = [];
        let associationToRender=[];
        if(occurrences !== undefined){
            occurrences.forEach(function(occurrence){
                if(occurrence.topicId===topic.id)
                    occurrencesToRender.push(occurrence)
            })
            occurrencesToRender = occurrencesToRender.map((occurrence, index) =>(
                <Occurrence key={index} index={index} occurrence={occurrence} selectedTopicMap={selectedTopicMap} occurrenceTypes={occurrenceTypes} callBacks={{closeScopesModal: this.onClickTopicLink}}/>
            ));
        }
        const haveOccurrences = occurrencesToRender.length > 0;
        if(topic != null) {

        if(topic!=null) {
            selectedTopicMap.allAssociations.forEach(function (association) {
                topic.topicTopicAssociationRoles.forEach(function (topicAssociation) {
                    if (association.id === topicAssociation.associationId) {
                        associationToRender.push(<TopicTableElement association={association} key={association.id} topic={topic} mode={"incoming"} />)
                    }
                })
            })
        }else{
            associationToRender.push(<TopicTableElement selectedTopicMap={selectedTopicMap} key={0} topic={undefined} mode={"incoming"} />)
        }

            return (
                <div id="node-page" className="all-screen-page margin-div">
                    <div id="topicDetailsTitle" className="topic-details-title">
                        <Table color="blue" inverted unstackable>
                            <Table.Header>
                                <Table.Row>
                                    <Table.HeaderCell textAlign='left'><Icon name="arrow left" onClick={this.props.history.goBack}/><Link to="/home"><Icon inverted name="home"/></Link></Table.HeaderCell>
                                    <Table.HeaderCell/>
                                    <Table.HeaderCell textAlign='center'> <Header as="h1" style={{"color":"white"}}>{topic.name}</Header></Table.HeaderCell>
                                    <Table.HeaderCell  textAlign='right'><Icon name="sitemap" />Id: {topic.id}</Table.HeaderCell>
                                </Table.Row>
                            </Table.Header>
                        </Table>
                    </div>
                    {haveOccurrences ? occurrencesToRender : undefined}
                    <Button fluid style={{marginTop:"1%"}} color="green" content="Add new Occurrence" icon="plus" onClick={event => this.addOccurrence(topic.id)} />


                     <div id="incoming-topics-table" className="relation-div">
                        <Table color="blue" unstackable celled>
                            <Table.Header>
                                <Table.Row>

                                    <Table.HeaderCell textAlign="center">AssociationType</Table.HeaderCell>
                                    <Table.HeaderCell textAlign="center">Topic</Table.HeaderCell>
                                    <Table.HeaderCell textAlign="center">associated Topic</Table.HeaderCell>
                                    <Table.HeaderCell textAlign="center">association id</Table.HeaderCell>

                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {associationToRender.length > 0 ? associationToRender: undefined}
                            </Table.Body>
                        </Table>

                    </div>

                    {this.props.isOpenDeleteOccConfirm && <Confirm content = "Are you sure you want to delete this occurrence? " open={this.props.isOpenDeleteOccConfirm} onCancel={event=>this.closeDeleteOccConfirm()} onConfirm={event=> this.deleteOccurrence(this.props.occurrenceToDelete, user)} />}
                    {this.props.operationSuccess && <OperationSuccessModal open={this.props.operationSuccess} callBacks={{closeModal: this.closeOperationSuccessModal}} />}
                    {this.props.operationFailed && <OperationFailedModal open={this.props.operationFailed} callBacks={{closeModal: this.closeOperationFailedModal}} />}

                </div>

            )
        }else{
            return(
                <Loader size='massive'>Loading</Loader>
            )
        }
    }
}
const mapStateToProps = (state) => ({...state.user, ...state.alert, ...state.topicmap, ...state.topic, ...state.occurrence, ...state.occurrenceType, ...state.scope});

const mapDispatchToProps = (dispatch) => ({
    topicMapAction: bindActionCreators(topicMapActions, dispatch),
    userAction: bindActionCreators(userActions, dispatch),
    alertAction: bindActionCreators(alertActions, dispatch),
    topicAction: bindActionCreators(topicActions, dispatch),
    occurrenceAction: bindActionCreators(occurrenceActions, dispatch),
    occurrenceTypeAction: bindActionCreators(occurrenceTypeActions, dispatch),
    scopeAction: bindActionCreators(scopeActions, dispatch),
    associationTypeAction: bindActionCreators(associationTypeActions, dispatch),
});

const connectedTopicDetailsPage = connect(mapStateToProps, mapDispatchToProps)(TopicDetailsPage);
export {connectedTopicDetailsPage as TopicDetailsPage}
export * from './TopicDetailsPage'
