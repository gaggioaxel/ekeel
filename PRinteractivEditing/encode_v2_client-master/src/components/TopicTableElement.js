import React, {Component} from 'react';
import {bindActionCreators} from "redux";
import {Link} from 'react-router-dom'
import {topicMapActions} from "../actions/topicmap.actions";
import {userActions} from "../actions/user.actions";
import {associationTypeActions} from "../actions/associationType.actions";
import {alertActions} from "../actions/alert.actions";
import {topicActions} from "../actions/topic.actions";
import {connect} from "react-redux";
import {Table, Button, Header} from 'semantic-ui-react';

class TopicTableElement extends Component{

    render(){
        const association=this.props.association
        const topic = this.props.topic;
        const associationTypes= this.props.associationTypes;
        const selectedTopicMap = this.props.selectedTopicMap;
        const associations = this.props.associations;
        const mode = this.props.mode;
        let completeAssociationType;
        let completeAssociation;
        let topicId;
        let secondTopic;
        let secondTopicName;
        let secondTopicRole;
        let topicRole;

        if(topic) {
            associations.forEach(function (singleAssociation){
                if(singleAssociation.id===association.id)
                    completeAssociation=singleAssociation
            })

            if (mode === "incoming") {
                topicId = topic.id;
                if (selectedTopicMap && topic && completeAssociation) {
                    completeAssociation.associationTopicAssociationRoles.forEach(function (associationTR) {
                        if (associationTR.topicId !== topicId)
                            secondTopic = associationTR.topicId;
                    })

                    selectedTopicMap.allTopics.forEach(function(topicInTopicMap){
                        if(secondTopic===topicInTopicMap.id)
                            secondTopicName = topicInTopicMap.name

                    })

                    associationTypes.forEach(function(associationType){
                        if(completeAssociation.associationTypeId===associationType.id)
                            completeAssociationType=associationType
                    })

                    completeAssociationType.associationTypeRoles.forEach(function(role){
                        role.roleTopicAssociationRoles.forEach(function(topicsRole){
                            if(topicsRole.topicId===topic.id)
                                topicRole=role.name
                            if(topicsRole.topicId===secondTopic)
                                secondTopicRole=role.name
                        })
                    })
                }


            }
            let color;
            switch (completeAssociationType.name) {
                case "is_item":
                    color = "pink";
                    break;
                case "is_related":
                    color = "yellow";
                    break;
                case "is_suggested":
                    color = "red";
                    break;
                case "is_requirement":
                    color = "green";
                    break;
                default:
                    color = "lightblue";
            }


            return (
                <Table.Row>
                    <Table.Cell verticalAlign='top' textAlign="center">
                        <Header as='h3' style={{"cursor": "pointer"}} >{completeAssociationType.name ? completeAssociationType.name : association.id}</Header>
                    </Table.Cell>
                    <Table.Cell verticalAlign='top' textAlign="center">
                        <Link key={topicId} to={`/topic-details/${topicId}`}>
                            <Header as='h3' style={{"cursor": "pointer"}} >{topic.name ? topic.name : topic.id}</Header>
                            <Header as='h3' style={{"cursor": "pointer"}} >Role: {topicRole ? topicRole : topic.id}</Header>

                        </Link>
                    </Table.Cell>

                    <Table.Cell verticalAlign='top' textAlign="center">
                        <Link key={secondTopic} to={`/topic-details/${secondTopic}`}>
                            <Header as='h3' style={{"cursor": "pointer"}} >{secondTopicName ? secondTopicName : secondTopic}</Header>
                            <Header as='h3' style={{"cursor": "pointer"}} >Role: {secondTopicRole ? secondTopicRole : secondTopic}</Header>
                        </Link>
                    </Table.Cell>
                    <Table.Cell verticalAlign='top' textAlign="center">
                        <Button fluid icon="fork" color={color} content={association.id}/>
                    </Table.Cell>
                </Table.Row>
            )
        }else{
            return(
                <Table.Row>
                    <Table.Cell>{`No ${mode} topic found.`}</Table.Cell>
                    <Table.Cell/>
                </Table.Row>
            )
        }
    }
}

const mapStateToProps = (state) => ({...state.user, ...state.alert, ...state.topicmap, ...state.topic, ...state.associationType, ...state.association});

const mapDispatchToProps = (dispatch) => ({
    topicMapAction: bindActionCreators(topicMapActions, dispatch),
    userAction: bindActionCreators(userActions, dispatch),
    alertAction: bindActionCreators(alertActions, dispatch),
    topicAction: bindActionCreators(topicActions, dispatch),
    associationTypeAction: bindActionCreators(associationTypeActions, dispatch)

});

const connectedTopicTableElement = connect(mapStateToProps, mapDispatchToProps)(TopicTableElement);
export {connectedTopicTableElement as TopicTableElement}
