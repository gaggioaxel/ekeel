import React, {Component} from 'react';
import {bindActionCreators} from "redux";
import {userActions} from "../actions/user.actions";
import {alertActions} from "../actions/alert.actions";
import {connect} from "react-redux";
import {Table, Icon, Input, Confirm, Label} from 'semantic-ui-react';
import {topicTypeConstants} from "../constants/topicTypeConstants";
import {topicTypeActions} from "../actions/topicType.actions";
import constants from '../constants/constants'

class TopicType extends Component{
    constructor(props){
        super(...arguments);
        this.onChangeTopicTypeName = ev => this.props.onChangeTopicTypeName(ev.target.value, this.props.index,);
        this.onChangeTopicTypeDescription = ev => this.props.onChangeTopicTypeDescription(ev.target.value, this.props.index,);
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
        this.disableTopicType();
    }

    enableTopicType = () =>{this.setState({disabled: !this.state.disabled})};
    disableTopicType  = () =>{this.setState({disabled: true})};

    createTopicType(topicType, user){
        if(topicType.name === undefined || topicType.name === "" || topicType.name.length > 30){
            this.setState({errorName:true});
            this.handleOpen();
        }else{
            this.setState({errorName:false});
            this.props.topicTypeAction.createTopicType(topicType, user);
        }
    }

    deleteTopicType(topicType){
        if(!topicType.id){
            this.props.topicTypeAction.removeTopicType();
        }else{
            this.props.topicTypeAction.openDeleteTopicTypeConfirm(topicType.id);
        }
    }

    render(){
        const topicType = this.props.topicType;
        const disabled = this.state.disabled;
        const selectedSchema = this.props.selectedSchema;
        const user = this.props.user;

        if(topicType.schemaId === undefined)
            topicType.schemaId=selectedSchema.id;

        return (

            <Table.Row >
                {this.props.isOpenDeleteTopicTypeConfirm && <Confirm content = "Are you sure you want to delete this Topic Type? " open={this.props.isOpenDeleteTopicTypeConfirm} onCancel={event=>this.props.topicTypeAction.closeDeleteTopicTypeConfirm()} onConfirm={event=> this.props.topicTypeAction.deleteTopicType(this.props.topicTypeToDelete.topicTypeId, user)} />}
                <Table.Cell textAlign="left">
                    <Input label={{ icon: 'asterisk', color: 'red'}} labelPosition='right corner' fluid type="text" disabled={disabled} error={this.state.errorName} onChange={this.onChangeTopicTypeName} placeholder="Topic Type name.." onFocus={event => this.handleClose()} value={topicType.name}/>
                    <Label basic color="red" pointing style={{display: this.state.isDisplayed}} >Topic Type name is required and it size must be less then 30 character</Label>
                </Table.Cell>
                <Table.Cell textAlign="left">
                    <Input fluid type="text" disabled={disabled} onChange={this.onChangeTopicTypeDescription} placeholder="Topic Type description.." value={topicType.description}/>
                </Table.Cell>
                <Table.Cell verticalAlign='middle' textAlign='center'>
                    <Icon name="save outline" onClick={event=> this.createTopicType(topicType, user)}/>
                    <br/>
                    <Icon name="pencil alternate" onClick={this.enableTopicType}/>
                    <br/>
                    <Icon name="trash alternate outline" onClick={event=> this.deleteTopicType(topicType)}/>
                </Table.Cell>
            </Table.Row>
        )
    }
}

const mapStateToProps = (state) => ({...state.user, ...state.alert, ...state.topicmap, ...state.topic, ...state.occurrenceType, ...state.topicType, ...state.schema});

const mapDispatchToProps = (dispatch) => ({
    userAction: bindActionCreators(userActions, dispatch),
    alertAction: bindActionCreators(alertActions, dispatch),
    topicTypeAction: bindActionCreators(topicTypeActions, dispatch),
    onChangeTopicTypeName: (value, index) =>{
        dispatch({ type: topicTypeConstants.UPDATE_TOPIC_TYPE_FIELD, key: 'name', value, index })},
    onChangeTopicTypeDescription: (value, index) => {
        dispatch({type: topicTypeConstants.UPDATE_TOPIC_TYPE_FIELD, key: 'description', value, index})
    },
});

const connectedTopicType = connect(mapStateToProps, mapDispatchToProps)(TopicType);
export {connectedTopicType as TopicType}
//export * from './Occurrence'