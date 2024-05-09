import React, {Component} from 'react';
import {bindActionCreators} from "redux";
import {userActions} from "../actions/user.actions";
import {alertActions} from "../actions/alert.actions";
import {connect} from "react-redux";
import {Table, Icon, Input, Confirm, Label} from 'semantic-ui-react';
import {associationTypeConstants} from "../constants/associationTypeConstants";
import {associationTypeActions} from "../actions/associationType.actions";
import constants from '../constants/constants'

class AssociationType extends Component{
    constructor(){
        super(...arguments);
        this.onChangeAssociationTypeName = ev => this.props.onChangeAssociationTypeName(ev.target.value, this.props.index,);
        this.onChangeAssociationTypeDescription = ev => this.props.onChangeAssociationTypeDescription(ev.target.value, this.props.index,);
        this.onChangeAssociationTypeNameRoleFirst = ev => this.props.onChangeAssociationTypeNameRoleFirst(ev.target.value, this.props.index,)
        this.onChangeAssociationTypeNameRoleSecond = ev => this.props.onChangeAssociationTypeNameRoleSecond(ev.target.value, this.props.index,)
        this.onChangeAssociationTypeDescriptionRoleFirst = ev => this.props.onChangeAssociationTypeDescriptionRoleFirst(ev.target.value, this.props.index,)
        this.onChangeAssociationTypeDescriptionRoleSecond = ev => this.props.onChangeAssociationTypeDescriptionRoleSecond(ev.target.value, this.props.index,)


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
        this.disableAssociationType();
    }

    enableAssociationType = () =>{this.setState({disabled: !this.state.disabled})};
    disableAssociationType  = () =>{this.setState({disabled: true})};

    createAssociationType(associationType, user){
        if(associationType.name === undefined || associationType.name === "" || associationType.name.length > 30){
            this.setState({errorName:true});
            this.handleOpen();
        }else{
            this.setState({errorName:false});
            this.props.associationTypeAction.createAssociationTypes(associationType, user);
        }
    }

    deleteAssociationType(associationType){
        if(!associationType.id){
            this.props.associationTypeAction.removeAssociationType();
        }else{
            this.props.associationTypeAction.openDeleteAssTypeConfirm(associationType.id);
        }
    }

    render(){
        const associationType = this.props.associationType;
        const disabled = this.state.disabled;
        const selectedSchema= this.props.selectedSchema;
        const user = this.props.user;

        if(!associationType.schemaId)
            associationType.schemaId= selectedSchema.id;

        return (



                <Table.Row >
                    {this.props.isOpenDeleteAssTypeConfirm && <Confirm content = "Are you sure you want to delete this Topic Type? " open={this.props.isOpenDeleteAssTypeConfirm} onCancel={event=>this.props.associationTypeAction.closeDeleteAssTypeConfirm()} onConfirm={event=> this.props.associationTypeAction.deleteAssociationType(this.props.associationTypeToDelete.associationTypeId, user)} />}
                    <Table.Cell textAlign="left">
                        <Input label={{ icon: 'asterisk', color: 'red'}} labelPosition='right corner' fluid type="text" disabled={disabled} error={this.state.errorName} onChange={this.onChangeAssociationTypeName} placeholder="Association Type name.." onFocus={event => this.handleClose()} value={associationType.name}/>
                        <Label basic color="red" pointing style={{display: this.state.isDisplayed}} >AssociationType name is required and it size must be less then 30 character</Label>
                    </Table.Cell>
                    <Table.Cell textAlign="left">
                        <Input fluid type="text" disabled={disabled} onChange={this.onChangeAssociationTypeDescription} placeholder="Association Type description.." value={associationType.description}/>
                    </Table.Cell>
                    <Table.Cell verticalAlign='middle' textAlign='center'>
                        <Icon name="save outline" onClick={event=>this.createAssociationType(associationType, user)}/>
                        <br/>
                        <Icon name="pencil alternate" onClick={this.enableAssociationType}/>
                        <br/>
                        <Icon name="trash alternate outline" onClick={event=> this.deleteAssociationType(associationType)}/>
                    </Table.Cell>
                    <Table.Cell>
                        <Input fluid type="text" disabled={disabled}  onChange={this.onChangeAssociationTypeNameRoleFirst} placeholder="First Role Name.." value={associationType.associationTypeRoles[0].name}/>
                        <Input fluid type="text" disabled={disabled}  onChange={this.onChangeAssociationTypeNameRoleSecond} placeholder="Second Role Name.." value={associationType.associationTypeRoles[1].name}/>
                    </Table.Cell>
                    <Table.Cell>
                        <Input fluid type="text" disabled={disabled}  onChange={this.onChangeAssociationTypeDescriptionRoleFirst} placeholder="First Role description.." value={associationType.associationTypeRoles[0].description}/>
                        <Input fluid type="text" disabled={disabled}  onChange={this.onChangeAssociationTypeDescriptionRoleSecond} placeholder="Second Role description.." value={associationType.associationTypeRoles[1].description}/>
                    </Table.Cell>
                </Table.Row>


        )
    }
}

const mapStateToProps = (state) => ({...state.user, ...state.alert, ...state.topicmap, ...state.topic, ...state.occurrenceType, ...state.associationType, ...state.schema});

const mapDispatchToProps = (dispatch) => ({
    userAction: bindActionCreators(userActions, dispatch),
    alertAction: bindActionCreators(alertActions, dispatch),
    associationTypeAction: bindActionCreators(associationTypeActions, dispatch),
    onChangeAssociationTypeName: (value, index) =>{
        dispatch({ type: associationTypeConstants.UPDATE_ASSOCIATION_TYPE_FIELD, key: 'name', value, index })},
    onChangeAssociationTypeDescription: (value, index) => {
        dispatch({type: associationTypeConstants.UPDATE_ASSOCIATION_TYPE_FIELD, key: 'description', value, index})
    },
    onChangeAssociationTypeNameRoleFirst: (value, index) =>{
        dispatch({ type: associationTypeConstants.UPDATE_ASSOCIATION_TYPE_FIELD, key: 'associationTypeRolesNameFirst', value, index })},
    onChangeAssociationTypeNameRoleSecond: (value, index) =>{
        dispatch({ type: associationTypeConstants.UPDATE_ASSOCIATION_TYPE_FIELD, key: 'associationTypeRolesNameSecond', value, index })},
    onChangeAssociationTypeDescriptionRoleFirst: (value, index) => {
        dispatch({type: associationTypeConstants.UPDATE_ASSOCIATION_TYPE_FIELD, key: 'associationTypeRolesDescriptionFirst', value, index})
    },
    onChangeAssociationTypeDescriptionRoleSecond: (value, index) => {
        dispatch({type: associationTypeConstants.UPDATE_ASSOCIATION_TYPE_FIELD, key: 'associationTypeRolesDescriptionSecond', value, index})
    },
});

const connectedAssociationType = connect(mapStateToProps, mapDispatchToProps)(AssociationType);
export {connectedAssociationType as AssociationType}
//export * from './Occurrence'