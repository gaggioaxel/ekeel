import React, {Component} from 'react';
import {bindActionCreators} from "redux";
import {userActions} from "../actions/user.actions";
import {alertActions} from "../actions/alert.actions";
import {connect} from "react-redux";
import {Table, Icon, Input, Confirm, Label} from 'semantic-ui-react';
import {scopeActions} from "../actions/scope.actions";
import {scopeConstants} from "../constants/scopeConstants";
import constants from '../constants/constants'

class Scope extends Component{
    constructor(){
        super(...arguments);
        this.onChangeScopeName = ev => this.props.onChangeScopeName(ev.target.value, this.props.index,);
        this.onChangeScopeDescription = ev => this.props.onChangeScopeDescription(ev.target.value, this.props.index,);
        this.state = ({disabled:true, errorName: false, isOpen:false, isDisplayed:"none"});
    }

    handleOpen = () => {
        this.setState({ isOpen: true , isHidden: false});

        this.timeout = setTimeout(() => {
            this.setState({ isOpen: false, isDisplayed:"inline" })
        }, constants.TIMEOUT_LENGTH)
    };

    handleClose = () => {
        this.setState({ isOpen: false, isDisplayed: "none" });
        clearTimeout(this.timeout)
    };

    componentWillUnmount() {
        this.disableScope();
    }

    enableScope = () =>{this.setState({disabled: !this.state.disabled})};
    disableScope  = () =>{this.setState({disabled: true})};

    saveScope(scope, user){
        if(scope.name === undefined || scope.name === "" || scope.name.length > 30){
            this.setState({errorName:true});
            this.handleOpen();
        }else{
            this.setState({errorName:false});
            this.props.scopeAction.saveScope(scope, user);
        }
    }

    deleteScope(scopeToDelete){
        if(!scopeToDelete.id){
            this.props.scopeAction.removeScope();
        }else{
            this.props.scopeAction.openDeleteScopeConfirm(scopeToDelete.id);
        }
    }

    render(){
        const scope = this.props.scope;
        const disabled = this.state.disabled;
        const user = this.props.user;
        const selectedSchema= this.props.selectedSchema;


        if(scope.schemaId === undefined)
            scope.schemaId = selectedSchema.id

        return (
            <Table.Row >
                {this.props.isOpenDeleteScopeConfirm && <Confirm content = "Are you sure you want to delete this Scope? " open={this.props.isOpenDeleteScopeConfirm} onCancel={event=>this.props.scopeAction.closeDeleteScopeConfirm()} onConfirm={event=> this.props.scopeAction.deleteScope(this.props.scopeToDelete, user)} />}
                <Table.Cell textAlign="left">
                    <Input label={{ icon: 'asterisk', color: 'red'}} labelPosition='right corner' fluid type="text" disabled={disabled} error={this.state.errorName} onChange={this.onChangeScopeName} placeholder="Scope name.." onFocus={event => this.handleClose()} value={scope.name}/>
                    <Label basic color="red" pointing style={{display: this.state.isDisplayed}} >Scope name is required and it size must be less then 30 character</Label>
                </Table.Cell>
                <Table.Cell textAlign="left">
                    <Input fluid type="text"  disabled={disabled} onChange={this.onChangeScopeDescription} placeholder="Scope description.." value={scope.description}/>
                </Table.Cell>
                <Table.Cell verticalAlign='middle' textAlign='center'>
                    <Icon name="save outline" onClick={event=> this.saveScope(scope, user)}/>
                    <br/>
                    <Icon name="pencil alternate" onClick={this.enableScope}/>
                    <br/>
                    <Icon name="trash alternate outline" onClick={event=> this.deleteScope(scope)}/></Table.Cell>
            </Table.Row>
        )
    }
}

const mapStateToProps = (state) => ({...state.user, ...state.alert, ...state.topicmap, ...state.topic, ...state.scope, ...state.schema});

const mapDispatchToProps = (dispatch) => ({
    userAction: bindActionCreators(userActions, dispatch),
    alertAction: bindActionCreators(alertActions, dispatch),
    scopeAction: bindActionCreators(scopeActions, dispatch),
    onChangeScopeName: (value, index) =>{
        dispatch({ type: scopeConstants.UPDATE_SCOPE_FIELD, key: 'name', value, index })},
    onChangeScopeDescription: (value, index) => {
        dispatch({type: scopeConstants.UPDATE_SCOPE_FIELD, key: 'description', value, index})
    },
});

const connectedScope = connect(mapStateToProps, mapDispatchToProps)(Scope);
export {connectedScope as Scope}
//export * from './Occurrence'