import React, {Component} from 'react';
import {bindActionCreators} from "redux";
import {userActions} from "../actions/user.actions";
import {alertActions} from "../actions/alert.actions";
import {connect} from "react-redux";
import {Table, Icon, Input, Confirm, Label} from 'semantic-ui-react';
import {effortTypeConstants} from "../constants/effortTypeConstants";
import {effortTypeActions} from "../actions/effortType.actions";
import constants from '../constants/constants'

class EffortType extends Component{
    constructor(props){
        super(...arguments);
        this.onChangeEffortTypeMetricType = ev => this.props.onChangeEffortTypeMetricType(ev.target.value, this.props.index,);
        this.onChangeEffortTypeDescription = ev => this.props.onChangeEffortTypeDescription(ev.target.value, this.props.index,);
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
        this.disableEffortType();
        this.props.effortTypeAction.getAllEffortType(this.props.user)

    }

    enableEffortType = () =>{this.setState({disabled: !this.state.disabled})};
    disableEffortType  = () =>{this.setState({disabled: true})};

    createEffortType(effortType, user){
        if(effortType.metricType === undefined || effortType.metricType === "" || effortType.metricType.length > 30){
            this.setState({errorName:true});
            this.handleOpen();
        }else{
            this.setState({errorName:false});
            this.props.effortTypeAction.createEffortType(effortType, user);
        }
    }

    deleteEffortType(effortType){
        if(!effortType.id){
            this.props.effortTypeAction.removeEffortType();
        }else{
            this.props.effortTypeAction.openDeleteEffTypeConfirm(effortType.id);
        }
    }

    render(){
        const effortType = this.props.effortType
        const disabled = this.state.disabled;
        const selectedSchema = this.props.selectedSchema;
        const user = this.props.user;

        if(effortType.schemaId === undefined)
            effortType.schemaId=selectedSchema.id;

        return (

            <Table.Row >
                {this.props.isOpenDeleteEffTypeConfirm && <Confirm content = "Are you sure you want to delete this Effort Type? " open={this.props.isOpenDeleteEffTypeConfirm} onCancel={event=>this.props.effortTypeAction.closeDeleteEffTypeConfirm()} onConfirm={event=> this.props.effortTypeAction.deleteEffortType(this.props.effortTypeToDelete.effortTypeId, user)} />}
                <Table.Cell textAlign="left">
                    <Input label={{ icon: 'asterisk', color: 'red'}} labelPosition='right corner' fluid type="text" disabled={disabled} error={this.state.errorName} onChange={this.onChangeEffortTypeMetricType} placeholder="Effort Type metric type.." onFocus={event => this.handleClose()} value={effortType.metricType}/>
                    <Label basic color="red" pointing style={{display: this.state.isDisplayed}} >Effort Type MetricType is required and it size must be less then 30 character</Label>
                </Table.Cell>
                <Table.Cell textAlign="left">
                    <Input fluid type="text" disabled={disabled} onChange={this.onChangeEffortTypeDescription} placeholder="EffortType description.." value={effortType.description}/>
                </Table.Cell>
                <Table.Cell verticalAlign='middle' textAlign='center'>
                    <Icon name="save outline" onClick={event=> this.createEffortType(effortType, user)}/>
                    <br/>
                    <Icon name="pencil alternate" onClick={this.enableEffortType}/>
                    <br/>
                    <Icon name="trash alternate outline" onClick={event=> this.deleteEffortType(effortType)}/>
                </Table.Cell>
            </Table.Row>
        )
    }
}

const mapStateToProps = (state) => ({...state.user, ...state.alert, ...state.topicmap, ...state.topic, ...state.occurrenceType, ...state.topicType, ...state.schema,...state.effortType});

const mapDispatchToProps = (dispatch) => ({
    userAction: bindActionCreators(userActions, dispatch),
    alertAction: bindActionCreators(alertActions, dispatch),
    effortTypeAction: bindActionCreators(effortTypeActions,dispatch),
    onChangeEffortTypeMetricType: (value, index) =>{
        dispatch({ type: effortTypeConstants.UPDATE_EFFORT_TYPE_MODAL_FIELDS, key: 'metricType', value, index })},
    onChangeEffortTypeDescription: (value, index) => {
        dispatch({type: effortTypeConstants.UPDATE_EFFORT_TYPE_MODAL_FIELDS, key: 'description', value, index})
    },
});

const connectedEffortType = connect(mapStateToProps, mapDispatchToProps)(EffortType);
export {connectedEffortType as EffortType}
//export * from './Occurrence'