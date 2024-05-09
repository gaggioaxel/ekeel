import React, {Component} from 'react';
import {connect} from 'react-redux';
import {topicMapActions} from "../../actions/topicmap.actions";
import {userActions} from "../../actions/user.actions";
import {bindActionCreators} from "redux";
import TopMenu from '../menu/TopMenu';
import {TopicMapModal} from '../modals/TopicMapModal';
import {DeleteTopicMapModal} from "../modals/DeleteTopicMapModal";
import {TopicMapDetailsModal} from "../modals/TopicMapDetailsModal";
import {SchemaDetailsModal} from "../modals/SchemaDetailsModal";
import {CreateTopicModal} from "../modals/CreateTopicModal";
import {DeleteTopicModal} from "../modals/DeleteTopicModal";
import {ScopesModal} from "../modals/ScopesModal";
import {OccurrenceTypesModal} from "../modals/OccurrenceTypesModal";
import {graphConfig} from'../../config/graphConfig';
import Graph from '../graph/Graph';
import PropTypes from 'prop-types';
import '../../css/App.css';
import '../../css/HomePage.Style.css';
import {alertActions} from "../../actions/alert.actions";
import {topicActions} from "../../actions/topic.actions";
import {Redirect} from "react-router-dom";
import SessionExpiredModal from '../modals/SessionExpiredModal';
import {history} from "../../config/history";
import {occurrenceTypeActions} from "../../actions/occurrenceType.actions";
import {scopeActions} from "../../actions/scope.actions";
import {AssociationTypesModal} from "../modals/AssociationTypesModal";
import {associationTypeActions} from "../../actions/associationType.actions";
import {TopicTypesModal} from "../modals/TopicTypesModal";
import {topicTypeActions} from "../../actions/topicType.actions";
import {effortTypeActions} from "../../actions/effortType.actions";
import {schemaActions} from "../../actions/schema.actions";
import SchemaList from "../SchemaList";
import {SchemaModal} from "../modals/SchemaModal";
import {DeleteSchemaModal} from "../modals/DeleteSchemaModal";
import {associationActions} from "../../actions/association.actions"
import {CreateAssociationModal} from "../modals/CreateAssociationModal"
import {AssociationTypesRolesModal} from "../modals/AssociationTypesRolesModal"
import {DeleteAssociationModal} from "../modals/DeleteAssociationModal";
import {Icon} from "semantic-ui-react";
import {EffortTypesModal} from "../modals/EffortTypesModal";

/*TODO: ATTENTION: following commented functions are only a definition, implements them with desire behavior
*  kepp attention to the name, it should be self-explanatory.
*  Alessio De Fabio.
*   */

/*
const onMouseOverNode = function(nodeId) {
    window.alert(`Mouse over node ${nodeId}`);
};

const onMouseOutNode = function(nodeId) {
    window.alert(`Mouse out node ${nodeId}`);
};

const _onDragStart = function(source, target) {
    window.alert(`Node starte drag`);
};
*/
const onMouseOutLink = function(source, target) {
    console.log(`Mouse out link between ${source} and ${target}`);
};



class HomePage extends Component{
    constructor() {
        super(...arguments);

        this.props.schemaAction.getAllUserSchemas(this.props.user);
        this.openSchemaModal = this.openSchemaModal.bind(this);
        this.closeSchemaModal = this.closeSchemaModal.bind(this);
        this.selectSchema=this.selectSchema.bind(this);
        this.deleteSchema = this.deleteSchema.bind(this);

        this.openAssociationModal = this.openAssociationModal.bind(this);
        this.closeAssociationModal = this.closeAssociationModal.bind(this);

        this.openAssociationTypesRolesModal= this.openAssociationTypesRolesModal.bind(this)
        this.openDeleteAssociationModal= this.openDeleteAssociationModal.bind(this)
        this.closeDeleteAssociationModal= this.closeDeleteAssociationModal.bind(this)


        this.props.topicTypeAction.getAllTopicTypes(this.props.user);
        this.props.associationTypeAction.getAllAssociationType(this.props.user);

        this.props.effortTypeAction.getAllEffortType(this.props.user);
        this.props.topicMapAction.getAllUserTopicMaps(this.props.user);
        this.props.occurrenceTypeAction.getAllOccurrenceType(this.props.user); /*this*/
        this.props.scopeAction.getAllScopes(this.props.user);
        this.props.associationTypeAction.getAllAssociationType(this.props.user);
        this.props.topicTypeAction.getAllTopicTypes(this.props.user);
        this.props.associationAction.getAllAssociations(this.props.user);
        this.openEffortTypesModal= this.openEffortTypesModal.bind(this);
        this.closeEffortTypesModal= this.closeEffortTypesModal.bind(this);
        this.openSchemaDetailsModal=this.openSchemaDetailsModal.bind(this);
        this.openTopicMapDetailsModal = this.openTopicMapDetailsModal.bind(this);
        this.closeTopicMapDetailsModal = this.closeTopicMapDetailsModal.bind(this);
        this.closeSchemaDetailsModal=this.closeSchemaDetailsModal.bind(this);
        this.openTopicMapModal = this.openTopicMapModal.bind(this);
        this.closeTopicMapModal = this.closeTopicMapModal.bind(this);
        this.closeTopicMapDeleteModal = this.closeTopicMapDeleteModal.bind(this);
        this.deleteTopicMap = this.deleteTopicMap.bind(this);
        this.logoutUser = this.logoutUser.bind(this);
        this.selectTopicMap = this.selectTopicMap.bind(this);
        this.deselectTopicMap = this.deselectTopicMap.bind(this);
        this.openTopicModal = this.openTopicModal.bind(this);
        this.closeTopicModal = this.closeTopicModal.bind(this);
        this.openDeleteTopicModal = this.openDeleteTopicModal.bind(this);
        this.closeDeleteTopicModal = this.closeDeleteTopicModal.bind(this);
        this.reloadUserSession = this.reloadUserSession.bind(this);
        this.openScopesModal = this.openScopesModal.bind(this);
        this.closeScopesModal = this.closeScopesModal.bind(this);
        this.openOccurrenceTypesModal = this.openOccurrenceTypesModal.bind(this);
        this.closeOccurrenceTypesModal = this.closeOccurrenceTypesModal.bind(this);
        this.openAssociationTypesModal = this.openAssociationTypesModal.bind(this);
        this.closeAssociationTypesModal = this.closeAssociationTypesModal.bind(this);
        this.openTopicTypesModal = this.openTopicTypesModal.bind(this);
        this.closeTopicTypesModal = this.closeTopicTypesModal.bind(this);
        this.state = {go:false, go2:false, selectedTopicId:"",showing:true};

    }

    componentWillUpdate(nextProps, nextState, nextContext) {
        if(nextProps.alertType === "alert-error"){
            nextProps.messages.forEach(function(mess){
                if(mess === "Unauthorized"){
                    nextProps.userAction.openSessionExpiredModal();
                }
            })

        }
    }

    onClickNode = (identifier) => {
       this.setState({go2:true, selectedTopicId:identifier});
       history.push("/home")
    };

    onClickLink = (source, target, associationType) => {
        let completeAssociationType= this.props.foundAssociationType;
        window.alert(`Mouse over in link between ${source} and ${target} with associationType: ${completeAssociationType.name} with Id :${associationType} `)
    };

    onMouseOverLink = (source, target, associationType) => {
        this.props.associationTypeAction.getAssociationTypeById(associationType,this.props.user)

    };

    reloadUserSession = (user) => {this.props.userAction.reloadUserSession(user)};

    openSchemaModal= () =>{this.props.schemaAction.openModal()};
    closeSchemaModal= () =>{this.props.schemaAction.closeModal()};

    openAssociationTypesRolesModal= ()=>{this.props.associationTypeAction.openRoleModal()};
    closeAssociationTypesRolesModal= ()=>{this.props.associationTypeAction.closeRoleModal()};

    openDeleteAssociationModal= () => {this.props.associationAction.openDeleteAssociationModal()};
    closeDeleteAssociationModal= ()=> {
        this.props.associationAction.closeDeleteAssociationModal();
        this.props.topicMapAction.getAllUserTopicMaps(this.props.user);

    };


    getAllTopicTypes= ()=>{this.props.topicTypesAction.getAllTopicTypes()};
    getAllAssociations=()=>{this.prop.associationAction.getAllAssociations()}
    openAssociationModal = () =>{this.props.associationAction.openModal()};
    openTopicMapDetailsModal(topicMapToUpdate){ this.props.topicMapAction.openDetailsModal(topicMapToUpdate)};
    openSchemaDetailsModal(schemaToUpdate){ this.props.schemaAction.openDetailsModal(schemaToUpdate)};
    closeTopicMapDetailsModal = () => {this.props.topicMapAction.closeDetailsModal()};
    closeSchemaDetailsModal = () => {this.props.schemaAction.closeDetailsModal()};

    openTopicMapModal = () =>{this.props.topicMapAction.openModal()};
    closeTopicMapModal= () =>{this.props.topicMapAction.closeModal()};
    openDeleteTopicModal = () =>{this.props.topicAction.openDeleteTopicModal()};
    closeDeleteTopicModal= () =>{this.props.topicAction.closeDeleteTopicModal()};
    openScopesModal = () => {this.props.scopeAction.openModal()};
    closeScopesModal = () => {this.props.scopeAction.closeModal()};
    openOccurrenceTypesModal = () => {this.props.occurrenceTypeAction.openModal()};
    closeOccurrenceTypesModal = () =>{this.props.occurrenceTypeAction.closeModal()};
    openAssociationTypesModal =()=> {this.props.associationTypeAction.openModal()};
    closeAssociationTypesModal = () =>{this.props.associationTypeAction.closeModal()};
    openTopicTypesModal =()=> {this.props.topicTypeAction.openModal()};
    closeTopicTypesModal = () =>{this.props.topicTypeAction.closeModal()};
    openEffortTypesModal=()=>{this.props.effortTypeAction.openModal()}
    closeEffortTypesModal=()=>{this.props.effortTypeAction.closeModal()}
    openTopicModal = () =>{this.props.topicAction.openModal()};
    closeTopicModal= () =>{
        this.props.topicAction.closeModal();
        this.props.topicMapAction.getAllUserTopicMaps(this.props.user);
    };
    closeTopicMapDeleteModal= () =>{this.props.topicMapAction.closeDeleteModal()};
    logoutUser = () => {
        this.props.userAction.logout();
        this.props.alertAction.clear();
        this.props.history.replace("/");
    };

    closeAssociationModal= () =>{
        this.props.associationAction.closeModal();
        this.props.topicMapAction.getAllUserTopicMaps(this.props.user);
    };
    deleteTopicMap(topicMapId){
        this.props.topicMapAction.openDeleteModal(topicMapId);
    };
    selectTopicMap(topicMapSelected){
        this.props.topicMapAction.selectTopicMap(topicMapSelected);
    }
    deselectTopicMap(){
        this.props.topicMapAction.deselectTopicMap();

    }

    selectSchema(schemaSelected){
        this.props.schemaAction.selectSchema(schemaSelected);
    }
    deleteSchema(schemaId){
        this.props.schemaAction.openDeleteModal(schemaId);
    };
    closeSchemaDeleteModal= () =>{this.props.schemaAction.closeDeleteModal()};

    hideSchemaList=()=>{this.setState({showing:false})}


    render() {
        if(this.state.go) return(<Redirect to={{pathname:"/home/node-info", search: `selectedTopicId=${this.state.selectedTopicId}`, state: { selectedTopicId: this.state.selectedTopicId }}}/>);
        if(this.state.go2) return(<Redirect key={this.state.selectedTopicId} to={`/topic-details/${this.state.selectedTopicId}`}/>);
        const isOpenDeleteAssociationModal= this.props.isOpenDeleteAssociationModal;
        const isOpenAssociationModal=this.props.isOpenAssociationModal;
        const isOpenSchemaModal= this.props.isOpenSchemaModal;
        const isOpenDeleteSchemaModal = this.props.isOpenDeleteSchemaModal;
        const isOpenScopesModal = this.props.isOpenScopesModal;
        const isOpenTopicMapModal = this.props.isOpenTopicMapModal;
        const isOpenDeleteTopicMapModal = this.props.isOpenDeleteTopicMapModal;
        const isOpenTopicMapDetailsModal = this.props.isOpenTopicMapDetailsModal;
        const isOpenSchemaDetailsModal=this.props.isOpenSchemaDetailsModal;
        const selectedTopicMap = this.props.selectedTopicMap;
        const selectedSchema = this.props.selectedSchema;
        const isOpenTopicModal = this.props.isOpenTopicModal;
        const isOpenDeleteTopicModal = this.props.isOpenDeleteTopicModal;
        const isOpenOccurrenceTypesModal = this.props.isOpenOccurrenceTypesModal;
        const isOpenAssociationTypesModal = this.props.isOpenAssociationTypesModal;
        const isOpenTopicTypesModal = this.props.isOpenTopicTypesModal;
        const isOpenSessionExpiredModal = this.props.isOpenSessionExpiredModal;
        const isOpenAssociationTypesRolesModal = this.props.isOpenAssociationTypesRolesModal;
        const isOpenEffortTypesModal= this.props.isOpenEffortTypesModal;
        const topicTypes= this.props.topicTypes;
        const associationTypes=this.props.associationTypes;
        const associations=this.props.associations;
        const user = this.props.user;
        const data = {
            nodes: [],
            links:[]
        };


        if(selectedTopicMap) {
            if (selectedTopicMap.allTopics) {
                selectedTopicMap.allTopics.forEach(function (topic) {
                    let color;
                    let nodeId;
                    topicTypes.forEach(function(topicType){
                        if(topic.topicTypeId===topicType.id)
                            if(topicType.name==='primary_notion')
                                color='green';
                            else if (topicType.name !=='primary_notion')
                                color='lightblue'
                    });
                    nodeId = topic.name;
                    data.nodes.push({id: nodeId, color: color, identifier:topic.id});

                });
            }

            if(selectedTopicMap.allAssociations){
                let sourceName;
                let targetName;
                let assTypeId;
                let assType

                selectedTopicMap.allAssociations.forEach(function(TMassociation){
                    associations.forEach(function(association){
                        selectedTopicMap.allTopics.forEach(function(topic){
                            if(TMassociation.id===association.id) {
                                if (topic.id === association.associationTopicAssociationRoles[0].topicId)
                                    sourceName = topic.name
                                else if (topic.id === association.associationTopicAssociationRoles[1].topicId)
                                    targetName = topic.name
                                assTypeId=association.associationTypeId
                            };
                        });
                    });

                    associationTypes.forEach(function(associationType){
                        if(assTypeId===associationType.id)
                           assType=associationType ;
                    });

                    let linkColor;
                    switch(assType.name){/*assType*/
                        case "is_item":
                            linkColor= "pink";
                            break;
                        case "is_related":
                            linkColor = "yellow";
                            break;
                        case "is_suggested":
                            linkColor = "red";/*green*/
                            break;
                        case "is_requirement":
                            linkColor = "green";/*red*/
                            break;
                        default:
                            linkColor = "lightblue";
                    }
                    data.links.push({
                        source: sourceName,
                        target: targetName,
                        associationType: assType.id,
                        color: linkColor
                    })
                });
            }

        }

        return(
            <div id="home" className="all-screen-page">
                {isOpenSchemaModal && <SchemaModal isOpenModal={isOpenSchemaModal} callBacks={{closeModal:this.closeSchemaModal}}/>}
                {isOpenDeleteSchemaModal && <DeleteSchemaModal isOpenModal={isOpenDeleteSchemaModal} callBacks={{closeModal: this.closeSchemaDeleteModal}}/>}
                {isOpenAssociationModal && <CreateAssociationModal isOpenModal={isOpenAssociationModal} callBacks={{closeModal:this.closeAssociationModal}}/>}
                {isOpenAssociationTypesRolesModal && <AssociationTypesRolesModal isOpenModal={isOpenAssociationTypesRolesModal}  callBacks={{closeModal: this.closeAssociationTypesRolesModal}}/> }
                {isOpenDeleteAssociationModal && <DeleteAssociationModal isOpenModal={isOpenDeleteAssociationModal} callBacks={{closeModal:this.closeDeleteAssociationModal}}/> }
                {isOpenSchemaDetailsModal && <SchemaDetailsModal isOpenModal={isOpenSchemaDetailsModal} callBacks={{closeModal: this.closeSchemaDetailsModal}}/>}
                {isOpenEffortTypesModal && <EffortTypesModal isOpenModal={isOpenEffortTypesModal} callBacks={{closeModal: this.closeEffortTypesModal}}/>}
                {isOpenTopicMapModal && <TopicMapModal isOpenModal={isOpenTopicMapModal} callBacks={{closeModal: this.closeTopicMapModal}}/>}
                {isOpenDeleteTopicMapModal && <DeleteTopicMapModal isOpenModal={isOpenDeleteTopicMapModal} callBacks={{closeModal: this.closeTopicMapDeleteModal}}/>}
                {isOpenTopicMapDetailsModal && <TopicMapDetailsModal isOpenModal={isOpenTopicMapDetailsModal} callBacks={{closeModal: this.closeTopicMapDetailsModal}}/>}
                {isOpenTopicModal && <CreateTopicModal isOpenModal= {isOpenTopicModal} selectedTopicMap={selectedTopicMap} callBacks={{closeModal: this.closeTopicModal, selectTopicMap: this.selectTopicMap}}/>}
                {isOpenDeleteTopicModal && <DeleteTopicModal isOpenModal = {isOpenDeleteTopicModal} selectedTopicMap={selectedTopicMap} callBacks={{closeModal: this.closeDeleteTopicModal}}/>}
                {isOpenScopesModal && <ScopesModal isOpenModal={isOpenScopesModal} callBacks={{closeModal: this.closeScopesModal}}/>}
                {isOpenOccurrenceTypesModal && <OccurrenceTypesModal isOpenModal={isOpenOccurrenceTypesModal} callBacks={{closeModal: this.closeOccurrenceTypesModal}}/>}
                {isOpenAssociationTypesModal && <AssociationTypesModal isOpenModal={isOpenAssociationTypesModal}  callBacks={{closeModal: this.closeAssociationTypesModal}}/> }
                {isOpenTopicTypesModal && <TopicTypesModal isOpenModal={isOpenTopicTypesModal} callBacks={{closeModal: this.closeTopicTypesModal}}/> }
                {isOpenSessionExpiredModal && <SessionExpiredModal isOpenModal={isOpenSessionExpiredModal} user={user} callBacks={{reloadUserSession: this.reloadUserSession}}/>}
                <div id="div-top">
                    <TopMenu selectedTopicMap={selectedTopicMap? selectedTopicMap : undefined}  selectedSchema={selectedSchema? selectedSchema : undefined}  callBacks={{
                        openDeleteAssociationModal:this.openDeleteAssociationModal,
                        openAssociationTypesRolesModal: this.openAssociationTypesRolesModal,
                        openSchemaModal: this.openSchemaModal,
                        openTopicMapModal: this.openTopicMapModal,
                        openTopicModal: this.openTopicModal,
                        openDeleteTopicModal: this.openDeleteTopicModal,
                        logoutUser: this.logoutUser,
                        deleteTopicMap: this.deleteTopicMap,
                        openScopesModal: this.openScopesModal,
                        openOccurrenceTypesModal: this.openOccurrenceTypesModal,
                        openAssociationTypesModal: this.openAssociationTypesModal,
                        openTopicTypesModal: this.openTopicTypesModal,
                        deleteSchema: this.deleteSchema,
                        openAssociationModal: this.openAssociationModal,
                        openEffortTypesModal: this.openEffortTypesModal,

                    }}/>

                </div>
                <div id="div-schema-list" className="column div-home-element" style={{ display: (this.state.showing ? 'block' : 'none') }} >
                    <div>
                        <SchemaList selectedTopicMap={selectedTopicMap? selectedTopicMap: undefined} selectedSchema={selectedSchema? selectedSchema : undefined} showing={this.state.showing} scopes={this.props.scopes ? this.props.scopes : undefined} effortTypes={this.props.effortTypes ? this.props.effortTypes: undefined} occurrenceTypes={this.props.occurrenceTypes ? this.props.occurrenceTypes : undefined} associationTypes={this.props.associationTypes ? this.props.associationTypes : undefined} topicTypes={this.props.topicTypes ? this.props.topicTypes : undefined} topicMaps={this.props.topicMaps ? this.props.topicMaps : undefined}  schemas={this.props.schemas ? this.props.schemas : undefined}
                                     callBacks={{
                                         openTMDetailsModal:this.openTopicMapDetailsModal,
                                         openSDetailsModal:this.openSchemaDetailsModal,
                                         deleteSchema: this.deleteSchema,
                                         selectSchema: this.selectSchema,
                                         deleteTopicMap: this.deleteTopicMap,
                                         selectTopicMap: this.selectTopicMap,
                                         deselectTopicMap: this.deselectTopicMap,
                                         hideSchemaList: this.hideSchemaList,

                                     }}/>
                    </div>

                </div>
                <div id="div-graph" className="column div-home-element" style={{width: (this.state.showing ? '80%' : '100%')}}>
                    <button id="show-schema-list-button" className="ui button" onClick={() => this.setState({ showing: !this.state.showing })} style={{ display: (!this.state.showing ? 'block' : 'none') }}>Schemas<Icon id="show-schema-list-button-icon" className="description-icon" name="arrow down" /></button>

                    { selectedTopicMap && selectedTopicMap.allTopics.length > 0 && <Graph
                        id="graph-id"
                        config={graphConfig}
                        data={data}
                        onClickNode={this.onClickNode}
                        onClickLink={this.onClickLink}
                        onMouseOverLink = {this.onMouseOverLink}
                        //onMouseOverNode={onMouseOverNode}
                        //onMouseOutNode={onMouseOutNode}
                        //onMouseOverLink={onMouseOverLink}
                        onMouseOutLink={onMouseOutLink}
                    />}
                </div>


            </div>
        )
    }

}

HomePage.propTypes = {
    user: PropTypes.object,
    alertType: PropTypes.string,
    messages: PropTypes.array,
    association: PropTypes.object,
    schemas: PropTypes.array,
    schema: PropTypes.object,
    topicMaps: PropTypes.array,
    topicMap: PropTypes.object,
    searching: PropTypes.bool,
    deleting: PropTypes.bool,
    updating: PropTypes.bool,
    creating: PropTypes.bool,
    isOpenAssociationModal: PropTypes.bool,
    isOpenTopicMapModal: PropTypes.bool,
    isOpenDeleteTopicMapModal: PropTypes.bool,
    isOpenTopicMapDetailsModal: PropTypes.bool,
    isOpenTopicModal: PropTypes.bool,
    newTopic: PropTypes.object,
    topicToUpdate: PropTypes.object,
    topics: PropTypes.array,
    isOpenSchemaModal: PropTypes.bool,
    isOpenDeleteSchemaModal: PropTypes.bool,
    isOpenSchemaDetailsModal: PropTypes.bool,



};

const mapStateToProps = (state) => ({...state.user, ...state.alert, ...state.topicmap, ...state.topic, ...state.scope, ...state.occurrenceType, ...state.associationType, ...state.topicType, ...state.schema, ...state.association, ...state.effortType});

const mapDispatchToProps = (dispatch) => ({

    schemaAction: bindActionCreators(schemaActions, dispatch),
    topicMapAction: bindActionCreators(topicMapActions, dispatch),
    userAction: bindActionCreators(userActions, dispatch),
    alertAction: bindActionCreators(alertActions, dispatch),
    topicAction: bindActionCreators(topicActions, dispatch),
    occurrenceTypeAction: bindActionCreators(occurrenceTypeActions, dispatch),
    scopeAction: bindActionCreators(scopeActions, dispatch),
    associationTypeAction: bindActionCreators(associationTypeActions, dispatch),
    topicTypeAction: bindActionCreators(topicTypeActions, dispatch),
    associationAction: bindActionCreators(associationActions, dispatch),
    effortTypeAction: bindActionCreators(effortTypeActions, dispatch)
});

const connectedHomePage = connect(mapStateToProps, mapDispatchToProps)(HomePage);
export {connectedHomePage as HomePage}
export * from './HomePage'