import React, {Component} from 'react';
import {bindActionCreators} from "redux";
import {userActions} from "../actions/user.actions";
import {alertActions} from "../actions/alert.actions";
import {connect} from "react-redux";
import {Table, Icon, Input, Confirm, Label} from 'semantic-ui-react';
import {occurrenceTypeActions} from "../actions/occurrenceType.actions";
import {occurrenceTypeConstants} from "../constants/occurrenceTypeConstants";
import constants from '../constants/constants'

class OccurrenceType extends Component{
    constructor(){
        super(...arguments);
        this.onChangeOccurrenceTypeName = ev => this.props.onChangeOccurrenceTypeName(ev.target.value, this.props.index,);
        this.onChangeOccurrenceTypeDescription = ev => this.props.onChangeOccurrenceTypeDescription(ev.target.value, this.props.index,);
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
        this.disableOccurrenceType();
    }

    enableOccurrenceType = () =>{this.setState({disabled: !this.state.disabled})};
    disableOccurrenceType  = () =>{this.setState({disabled: true})};



   createOccurrenceType(occurrenceType, user){
        if( occurrenceType.name === undefined || occurrenceType.name === "" || occurrenceType.name.length > 30){
            this.setState({errorName:true});
            this.handleOpen();
        }else{
            this.setState({errorName:false});
            this.props.occurrenceTypeAction.createOccurrenceType(occurrenceType, user);

        }
    }


    deleteOccurrenceType(occurrenceType){
        if (!occurrenceType.id){
            this.props.occurrenceTypeAction.removeOccurrenceType();
        }else{
            this.props.occurrenceTypeAction.openDeleteOccTypeConfirm(occurrenceType.id);

        }
    }

    render(){
        const occurrenceType = this.props.occurrenceType;
        const disabled = this.state.disabled;
        const selectedSchema = this.props.selectedSchema;
        const user = this.props.user;


        if(occurrenceType.schemaId === undefined)
            occurrenceType.schemaId = selectedSchema.id


        return (
            <Table.Row >
                {this.props.isOpenDeleteOccTypeConfirm && <Confirm content = "Are you sure you want to delete this Occurrence Type? " open={this.props.isOpenDeleteOccTypeConfirm} onCancel={event=>this.props.occurrenceTypeAction.closeDeleteOccTypeConfirm()} onConfirm={event=> this.props.occurrenceTypeAction.deleteOccurrenceType(this.props.occurrenceTypeToDelete.occurrenceTypeId, user)} />}
                <Table.Cell textAlign="left">
                    <Input label={{ icon: 'asterisk', color: 'red'}} labelPosition='right corner' fluid type="text" disabled={disabled} error={this.state.errorName} onChange={this.onChangeOccurrenceTypeName} placeholder="Occurrence Type name.." onFocus={event => this.handleClose()} value={occurrenceType.name}/>
                    <Label basic color="red" pointing style={{display: this.state.isDisplayed}} >Occurrence Type name is required and it size must be less then 30 character</Label>
                </Table.Cell>
                <Table.Cell textAlign="left">
                    <Input fluid type="text" disabled={disabled} onChange={this.onChangeOccurrenceTypeDescription} placeholder="Occurrence Type description.." value={occurrenceType.description}/>
                </Table.Cell>
                <Table.Cell verticalAlign='middle' textAlign='center'>
                    <Icon name="save outline" onClick={event=>this.createOccurrenceType(occurrenceType, user)}/>
                    <br/>
                    <Icon name="pencil alternate" onClick={this.enableOccurrenceType}/>
                    <br/>
                    <Icon name="trash alternate outline" onClick={event=> this.deleteOccurrenceType(occurrenceType)}/>
                </Table.Cell>
            </Table.Row>
        )
    }
}

const mapStateToProps = (state) => ({...state.user, ...state.alert, ...state.topicmap, ...state.topic, ...state.occurrenceType, ...state.schema});

const mapDispatchToProps = (dispatch) => ({
    userAction: bindActionCreators(userActions, dispatch),
    alertAction: bindActionCreators(alertActions, dispatch),
    occurrenceTypeAction: bindActionCreators(occurrenceTypeActions, dispatch),
    onChangeOccurrenceTypeName: (value, index) =>{
        dispatch({ type: occurrenceTypeConstants.UPDATE_OCCURRENCE_TYPE_FIELD, key: 'name', value, index })},
    onChangeOccurrenceTypeDescription: (value, index) => {
        dispatch({type: occurrenceTypeConstants.UPDATE_OCCURRENCE_TYPE_FIELD, key: 'description', value, index})
    },
});

const connectedOccurrenceType = connect(mapStateToProps, mapDispatchToProps)(OccurrenceType);
export {connectedOccurrenceType as OccurrenceType}
//export * from './Occurrence'