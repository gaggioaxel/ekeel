import React, {Component} from 'react';
import {bindActionCreators} from "redux";
import {topicMapActions} from "../actions/topicmap.actions";
import {userActions} from "../actions/user.actions";
import {alertActions} from "../actions/alert.actions";
import {topicActions} from "../actions/topic.actions";
import {connect} from "react-redux";
import {Table, Icon, Form, TextArea, Header, Dropdown, Input, Button, Embed, Label} from 'semantic-ui-react';
import {occurrenceActions} from "../actions/occurrence.actions";
import {occurrenceConstants} from "../constants/occurrenceConstants";
import {ScopedObject} from "./ScopedObject";
import {scopeActions} from "../actions/scope.actions";
import saveAs from 'file-saver'

class Occurrence extends Component{
    constructor(){
        super(...arguments);

        this.onChangeOccDataValue = (ev) => this.props.onChangeOccDataValue(ev.target.value, this.props.occurrence.id, this.props.index);
        this.onChangeOccurrenceType = (ev, {value}) => this.props.onChangeOccurrenceType(value, this.props.occurrence.id, this.props.index);
        this.onChangeOccurrenceFiles = (ev) => this.props.onChangeOccurrenceFiles(ev.target.files, this.props.occurrence.id, this.props.index);
        //this.onChangeOccurrenceType = (ev, index) => this.props.onChangeOccurrenceType(ev.target.value, index);
        this.onChangeOccDataReference = (ev) => this.props.onChangeOccDataReference(ev.target.value, this.props.occurrence.id, this.props.index);
        this.removeFileFromOccurrence = (fileName, occurrenceId, index) => this.props.removeFileFromOccurrence(fileName, occurrenceId, index);
        this.closeScopesModal = this.closeScopesModal.bind(this);
        this.openScopesModal = this.openScopesModal.bind(this);
        this.state = ({
            disabled:true,
            videoDisabled: true,
            attachmentsDisabled: true,
            disabledInput: true
        });
    }

    openScopesModal = () =>{this.props.scopeAction.openModal()};
    closeScopesModal= () =>{this.props.scopeAction.closeModal()};

    deleteOccurrence(occurrenceId){
        if(occurrenceId === undefined){
            this.props.occurrenceAction.removeOccurrence();
        }else{
            this.props.occurrenceAction.openDeleteOccConfirm(occurrenceId);

        }
    }

    saveOccurrence(occurrence, user){
        if(occurrence.id === undefined){
            this.props.occurrenceAction.createOccurrence(occurrence, user);
        }else{
            this.props.occurrenceAction.saveOccurrence(occurrence, user);
        }
    }

    componentWillUnmount() {
        this.disableOccurrenceObject();
    }

    removeFileFromOccurrence(name){

    }

    openFile(file){
        let blob = new Blob([this.base64ToArrayBuffer(file.data)], );
        //const fileToDownload = new File([blob], file.fileName);
        //let fd = new FormData();
        //fd.set('a', file.data, file.fileName);
        saveAs( blob, file.fileName);
    }

    base64ToArrayBuffer(base64) {
        let binaryString = window.atob(base64);
        let binaryLen = binaryString.length;
        let bytes = new Uint8Array(binaryLen);
        for (let i = 0; i < binaryLen; i++) {
            let ascii = binaryString.charCodeAt(i);
            bytes[i] = ascii;
        }
        return bytes;
    }

    enableOccurrenceObject = () =>{this.setState({disabled: !this.state.disabled})};
    disableOccurrenceObject  = () =>{this.setState({disabled: true})};
    enableAttachments = () => {this.setState({ videoDisabled: true, attachmentsDisabled: !this.state.attachmentsDisabled })};
    enableVideo = () => {this.setState({ videoDisabled: !this.state.videoDisabled, attachmentsDisabled: true, })};

    render(){
        const occurrence = this.props.occurrence;
        const selectedTopicMap=this.props.selectedTopicMap;
        const scopeOfOccurrence = this.props.occurrence.scopeOfOccurrence;
        const scopes = this.props.scopes;
        const occurrenceTypes = this.props.occurrenceTypes;
        const user = this.props.user;
        const disabled = this.state.disabled;
        const videoDisabled = this.state.videoDisabled;
        const attachmentsDisabled = this.state.attachmentsDisabled;
        const files = occurrence.occurrenceFiles;
        let scopeOptions = [];
        let cont = 0;

        if(scopes !== undefined){
            scopes.forEach(function(scope){
                scopeOptions.push({
                    id: cont++,
                    value: scope.name,
                    text: scope.name
                })
            })
        }

        let occurrenceTypesOptions = [];
        cont = 0;
        if(occurrenceTypes !== undefined ){
            occurrenceTypes.forEach(function(type){
                if(type.schemaId===selectedTopicMap.schemaId)
                    occurrenceTypesOptions.push({
                        id: cont++,
                        value: type.id,
                        text: type.name
                  })
            })
        }

        let scopeOfOccurrenceToRender = [];
        if(scopeOfOccurrence !== undefined && scopeOfOccurrence.length > 0){
            scopeOfOccurrenceToRender = scopeOfOccurrence.map((scopedObject, index) =>(
                <ScopedObject key={index} index={index} occurrence={occurrence} scope={scopeOptions} scopedObject={scopedObject} callBacks={{saveOccurrence: this.saveOccurrence}}/>
            ));
        }

        let filesToRender = [];
        if(files && files.length > 0){
            filesToRender = Array.from(files).map((file, index) => (
                <Icon.Group key={index} size = "big">
                    <Icon name= "file text" title={file.name} alt={file.name} onClick={event=> this.openFile(file)}/>
                    <Icon corner='top right' name='delete' color="red" onClick={event=> this.removeFileFromOccurrence(file.name, occurrence.id, this.props.index)}/>
                </Icon.Group>
            ))
        }

        return (
            <Table color="blue" unstackable collapsing celled>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell width={2} textAlign='left'> <Header as='h3'>{occurrence.occurrenceTypeName}</Header></Table.HeaderCell>
                        <Table.HeaderCell width={9} textAlign='center'>Content</Table.HeaderCell>
                        <Table.HeaderCell width={5} textAlign='center'>Reference</Table.HeaderCell>
                        <Table.HeaderCell width={1} textAlign='center'/>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    <Table.Row>
                        <Table.Cell>
                            <Dropdown placeholder="Choose an Occurrence type.." disabled={disabled} selection options={occurrenceTypesOptions} value={occurrence.occurrenceTypeName} onChange={this.onChangeOccurrenceType}/>
                        </Table.Cell>
                        <Table.Cell>
                            <Form>
                                <TextArea placeholder='Content..' disabled={disabled} onChange={this.onChangeOccDataValue} value={occurrence.dataValue}/>
                            </Form>
                        </Table.Cell>
                        <Table.Cell >
                            {!videoDisabled &&
                            <Input fluid type="text" disabled={disabled} placeholder="Reference" onChange={this.onChangeOccDataReference} value={occurrence.dataReference}/>
                            }
                            {!videoDisabled && occurrence.dataReference &&
                                <Embed id={occurrence.dataReference} disabled={disabled} source='youtube' />
                            }
                            {!videoDisabled && !occurrence.dataReference &&
                                <Label as='a' basic color='red' pointing>
                                    Please insert a video reference !
                                </Label>
                            }
                            {!attachmentsDisabled && filesToRender}
                            {!attachmentsDisabled &&
                                <Input fluid type="file" disabled={disabled} onChange={event => this.onChangeOccurrenceFiles(event)} multiple />
                            }

                        </Table.Cell>
                        <Table.Cell verticalAlign='middle' textAlign='center'>
                            <Icon name="video play" onClick={this.enableVideo}/>
                            <Icon name="paperclip" onClick={this.enableAttachments}/>
                            <Icon name="save outline" onClick={event=> this.saveOccurrence(occurrence, user)}/>
                            <br/>
                            <Icon name="pencil alternate" onClick={this.enableOccurrenceObject}/>
                            <br/>
                            <Icon name="trash alternate outline" onClick={event=> this.deleteOccurrence(occurrence.id)}/>
                        </Table.Cell>
                    </Table.Row>
                    <Table.Row style={{"backgroundColor":"#f9fafb"}}>
                        <Table.Cell textAlign='left'><Header as="h5">Scope</Header></Table.Cell>
                        <Table.Cell textAlign='center'><Header as="h5">Content Scoped</Header></Table.Cell>
                        <Table.Cell textAlign='center'/>
                        <Table.Cell textAlign='center'><Icon name="plus" onClick={event => this.props.occurrenceAction.addNewScopedContent(occurrence.id)}/></Table.Cell>
                    </Table.Row>
                    {scopeOfOccurrenceToRender.length > 0 ? scopeOfOccurrenceToRender : (
                        <Table.Row>
                            <Table.Cell/>
                            <Table.Cell>This occurrence does not have a scoped content, to add a new scope click on the "plus" button above!</Table.Cell>
                            <Table.Cell/>
                            <Table.Cell/>
                        </Table.Row>)
                    }
                    {scopeOfOccurrenceToRender.length > 0 ? (
                        <Table.Row>
                            <Table.Cell>
                                <Button color="blue" fluid animated='vertical' onClick={event => this.saveOccurrence(occurrence, user)}>
                                    <Button.Content hidden>Save Occurrence</Button.Content>
                                    <Button.Content visible>
                                        Save
                                    </Button.Content>
                                </Button>
                            </Table.Cell>
                            <Table.Cell/>
                            <Table.Cell/>
                            <Table.Cell/>
                        </Table.Row>): undefined}
                </Table.Body>
            </Table>
        )
    }
}

const mapStateToProps = (state) => ({...state.user, ...state.alert, ...state.topicmap, ...state.topic, ...state.scope});

const mapDispatchToProps = (dispatch) => ({
    topicMapAction: bindActionCreators(topicMapActions, dispatch),
    userAction: bindActionCreators(userActions, dispatch),
    alertAction: bindActionCreators(alertActions, dispatch),
    topicAction: bindActionCreators(topicActions, dispatch),
    occurrenceAction: bindActionCreators(occurrenceActions, dispatch),
    scopeAction: bindActionCreators(scopeActions, dispatch),
    onChangeOccDataValue: (value, occurrenceId, index) =>{
        dispatch({ type: occurrenceConstants.UPDATE_OCCURRENCE_FIELD, key: 'dataValue', value, occurrenceId, index })},
    onChangeOccDataReference: (value, occurrenceId, index) => {
        dispatch({type: occurrenceConstants.UPDATE_OCCURRENCE_FIELD, key: 'dataReference', value, occurrenceId, index})},
    onChangeOccurrenceType: (value, occurrenceId, index) => {
        dispatch({type: occurrenceConstants.UPDATE_OCCURRENCE_FIELD, key: 'occurrenceTypeId', value, occurrenceId, index})},
    onChangeOccurrenceFiles: (value, occurrenceId, index) => {
        dispatch({type: occurrenceConstants.UPDATE_OCCURRENCE_FIELD, key: 'occurrenceFiles', value, occurrenceId, index})},
    removeFileFromOccurrence: (fileName, occurrenceId, index) => {
        dispatch({type: occurrenceConstants.REMOVE_FILE, fileName, occurrenceId, index})},
});

const connectedOccurrence = connect(mapStateToProps, mapDispatchToProps)(Occurrence);
export {connectedOccurrence as Occurrence}
//export * from './Occurrence'