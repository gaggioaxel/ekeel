import {topicMapService} from '../services/topicmap.services';
import {alertActions} from "./alert.actions";
import {topicMapConstants} from "../constants/topicmapConstants";

export const topicMapActions = {
    getAllUserTopicMaps,
    getTopicMapById,
    createTopicMap,
    updateTopicMap,
    deleteTopicMap,
    openModal,
    closeModal,
    openDeleteModal,
    closeDeleteModal,
    openDetailsModal,
    closeDetailsModal,
    selectTopicMap,
    updateSelectedTopicMap,
    deselectTopicMap,
    closeOperationSuccessModal,
    closeOperationFailedModal
};

function getAllUserTopicMaps(user){
    return dispatch => {
        dispatch (request({user}));
        topicMapService.getAllByUser(user)
            .then(
                topicMaps => {
                    dispatch(success({topicMaps}));
                    dispatch(alertActions.success("All user TopicMaps found."))
                },
                error => {
                    dispatch(failure({error}));
                    dispatch(alertActions.error(error));
                }
            )
    };

    function request(user) {return {type: topicMapConstants.GET_ALL_TOPIC_MAPS_REQUEST, user}}
    function success(topicMaps){return {type: topicMapConstants.GET_ALL_TOPIC_MAPS_SUCCESS, topicMaps}}
    function failure(error){return {type: topicMapConstants.GET_ALL_TOPIC_MAPS_FAILURE, error}}
}

function getTopicMapById(topicMapId, user){
    return dispatch => {
        dispatch (request({user, topicMapId}));
        topicMapService.getById(user, topicMapId)
            .then(
                topicMap => {
                    dispatch(success({topicMap, topicMapId}));
                    dispatch(alertActions.success("Topic map with id :" + topicMapId + " found."))
                },
                error => {
                    dispatch(failure({error}));
                    dispatch(alertActions.error(error));
                }
            )
    };

    function request(user, topicMapId) {return {type: topicMapConstants.GET_TOPIC_MAP_REQUEST, user, topicMapId}}
    function success(topicMap, topicMapId){return {type: topicMapConstants.GET_TOPIC_MAP_SUCCESS, topicMap, topicMapId}}
    function failure(error){return {type: topicMapConstants.GET_TOPIC_MAP_FAILURE, error}}
}

function createTopicMap(newTopicMap, user){
    return dispatch => {
        dispatch(request({newTopicMap, user}));
        topicMapService.createTopicMap(newTopicMap, user)
            .then(
                message =>{
                    dispatch(success({message}));
                    dispatch(alertActions.success(message));
                },
                error =>{
                    dispatch(failure({error}));
                    dispatch(alertActions.error(error));
                }
            )
    };

    function request(newTopicMap, user){return {type: topicMapConstants.CREATE_TOPIC_MAP_REQUEST, newTopicMap, user}}
    function success(message){return {type: topicMapConstants.CREATE_TOPIC_MAP_SUCCESS, message}}
    function failure(error){return {type: topicMapConstants.CREATE_TOPIC_MAP_FAILURE, error}}
}

function updateTopicMap(topicMapToUpdate, user){
    return dispatch => {
        dispatch(request({topicMapToUpdate, user}));
        topicMapService.updateTopicMap(topicMapToUpdate, user)
            .then(
                message =>{
                    dispatch(success({message}));
                    dispatch(alertActions.success(message));
                    dispatch(topicMapActions.getAllUserTopicMaps(user));
                },
                error =>{
                    dispatch(failure({error}));
                    dispatch(alertActions.error(error));
                }
            )
    };

    function request(topicMapToUpdate, user){return {type: topicMapConstants.UPDATE_TOPIC_MAP_REQUEST, topicMapToUpdate, user}}
    function success(message){return {type: topicMapConstants.UPDATE_TOPIC_MAP_SUCCESS, message}}
    function failure(error){return {type: topicMapConstants.UPDATE_TOPIC_MAP_FAILURE, error}}
}

function deleteTopicMap(topicMapId, user){
    return dispatch => {
        dispatch(request({topicMapId, user}));
        topicMapService.deleteTopicMap(topicMapId, user)
            .then(
                message =>{
                    dispatch(success({message}));
                    dispatch(alertActions.success(message));
                    dispatch(topicMapActions.getAllUserTopicMaps(user))
                },
                error =>{
                    dispatch(failure({error}));
                    dispatch(alertActions.error(error));
                }
            )
    };

    function request(topicMapId, user){return {type: topicMapConstants.DELETE_TOPIC_MAP_REQUEST, topicMapId, user}}
    function success(message){return {type: topicMapConstants.DELETE_TOPIC_MAP_SUCCESS, message}}
    function failure(error){return {type: topicMapConstants.DELETE_TOPIC_MAP_FAILURE, error}}
}

function openModal() {
    return dispatch => {
        dispatch(request())
    };

    function request(){return {type: topicMapConstants.OPEN_TOPIC_MAP_CREATE_MODAL_REQUEST}}
}

function closeModal() {
    return dispatch => {
        dispatch(request())
    };

    function request(){return {type: topicMapConstants.CLOSE_TOPIC_MAP_CREATE_MODAL_REQUEST}}
}

function openDeleteModal(topicMapIdToDelete) {
    return dispatch => {
        dispatch(request({topicMapIdToDelete}))
    };

    function request(topicMapIdToDelete){return {type: topicMapConstants.OPEN_TOPIC_MAP_DELETE_MODAL_REQUEST, topicMapIdToDelete}}
}

function closeDeleteModal() {
    return dispatch => {
        dispatch(request())
    };

    function request(){return {type: topicMapConstants.CLOSE_TOPIC_MAP_DELETE_MODAL_REQUEST}}
}

function openDetailsModal(topicMapToUpdate) {
    return dispatch => {
        dispatch(request({topicMapToUpdate}))
    };

    function request(topicMapToUpdate){return {type: topicMapConstants.OPEN_TOPIC_MAP_DETAILS_MODAL_REQUEST, topicMapToUpdate}}
}

function closeDetailsModal() {
    return dispatch => {
        dispatch(request())
    };

    function request(){return {type: topicMapConstants.CLOSE_TOPIC_MAP_DETAILS_MODAL_REQUEST}}
}

function selectTopicMap(selectedTopicMap){
    return dispatch => {
        dispatch(request(selectedTopicMap))
    };

    function request(selectedTopicMap){return {type: topicMapConstants.SELECT_TOPIC_MAP,selectedTopicMap}}
}
function deselectTopicMap(){
    return dispatch => {
        dispatch(request())
    };

    function request(){return {type: topicMapConstants.DESELECT_TOPIC_MAP}}
}

function closeOperationSuccessModal(){
    return dispatch => {
        dispatch (request({}));
    };

    function request() {return {type: topicMapConstants.CLOSE_OPERATION_SUCCESS_MODAL}}
}
function closeOperationFailedModal(){
    return dispatch => {
        dispatch (request({}));
    };

    function request() {return {type: topicMapConstants.CLOSE_OPERATION_FAILED_MODAL}}
}

/*function updateSelectedTopicMap(newTopic){
    return dispatch => {
        dispatch(request(newTopic));
        topicMapService.getById(user, newTopic.topicMapId)
    };

    function request(newTopic){return{type: topicMapConstants.UPDATE_SELECTED_TOPIC_MAP, newTopic}}
}*/

function updateSelectedTopicMap(user, newTopic){
    return dispatch => {
        const topicMapId = newTopic.topicMapId;
        dispatch (request({user, topicMapId}));
        topicMapService.getById(user, topicMapId)
            .then(
                topicMap => {
                    dispatch(success({topicMap, topicMapId}));
                    dispatch(alertActions.success("Topic map with id :" + topicMapId + " found."))
                },
                error => {

                    dispatch(failure({error}));
                    dispatch(alertActions.error(error));
                }
            )
    };

    function request(user, topicMapId) {return {type: topicMapConstants.UPDATE_SELECTED_TOPIC_MAP_REQUEST, user, topicMapId}}
    function success(topicMap, topicMapId){return {type: topicMapConstants.UPDATE_SELECTED_TOPIC_MAP_SUCCESS, topicMap, topicMapId}}
    function failure(error){return {type: topicMapConstants.UPDATE_SELECTED_TOPIC_MAP_FAILURE, error}}
}