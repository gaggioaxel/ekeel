import React, {Component} from 'react';
import {Table, Icon, Form, TextArea, Dropdown} from 'semantic-ui-react';
import {bindActionCreators} from "redux";
import {userActions} from "../actions/user.actions";
import {alertActions} from "../actions/alert.actions";
import {scopeActions} from "../actions/scope.actions";
import {connect} from "react-redux";
import {occurrenceConstants} from "../constants/occurrenceConstants";

class ScopedObject extends Component{
    constructor(){
        super(...arguments);

        this.onChangeScopedContent = (ev) => this.props.onChangeScopedContent(ev.target.value, this.props.index, this.props.scopedObject.id.occurrenceId);
        this.onChangeScopedName = (ev, {value}) => this.props.onChangeScopedName(value, this.props.index, this.props.scopedObject.id.occurrenceId);
        this.deleteScopedOccurrence = (ev) => this.props.deleteScopedOccurrence(this.props.index, this.props.scopedObject.id.occurrenceId);
        this.state = ({disabled:true});
    }

    componentWillUnmount() {
        this.disableScopedObject();
    }

    enableScopedObject = () =>{this.setState({disabled: !this.state.disabled})};
    disableScopedObject  = () =>{this.setState({disabled: true})};

    render() {
        let scopedObject = this.props.scopedObject;
        const disabled = this.state.disabled;
        return (
            <Table.Row>
                <Table.Cell>
                    <Dropdown placeholder="Choose a Scope.." disabled={disabled} selection options={this.props.scope}
                              value={scopedObject.id.scopeName} onChange={this.onChangeScopedName}/>
                </Table.Cell>
                <Table.Cell>
                    <Form>
                        <TextArea placeholder='Content..' disabled={disabled} onChange={this.onChangeScopedContent} value={scopedObject.content}/>
                    </Form>
                </Table.Cell>
                <Table.Cell/>
                <Table.Cell>
                    <Icon name="pencil alternate" onClick={this.enableScopedObject}/>
                    <br/>
                    <Icon name="trash alternate outline" onClick={this.deleteScopedOccurrence}/></Table.Cell>
            </Table.Row>
        )
    }
}

const mapStateToProps = (state) => ({...state.user, ...state.alert, ...state.topicmap, ...state.topic, ...state.scope, ...state.occurrence});

const mapDispatchToProps = (dispatch) => ({
    userAction: bindActionCreators(userActions, dispatch),
    alertAction: bindActionCreators(alertActions, dispatch),
    scopeAction: bindActionCreators(scopeActions, dispatch),
    onChangeScopedName: (value, index, occurrenceId) =>{
        dispatch({ type: occurrenceConstants.UPDATE_ID_OF_SCOPED_OCCURRENCE, key: 'scopeName', value, index, occurrenceId })},
    onChangeScopedContent: (value, index, occurrenceId) => {
        dispatch({type: occurrenceConstants.UPDATE_SCOPED_OCCURRENCE, key: 'content', value, index, occurrenceId})},
    deleteScopedOccurrence: (index, occurrenceId) => {
        dispatch({type: occurrenceConstants.DELETE_SCOPED_OCCURRENCE, index, occurrenceId})},

});

const connectedScopedObject = connect(mapStateToProps, mapDispatchToProps)(ScopedObject);
export {connectedScopedObject as ScopedObject}