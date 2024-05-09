import {topicTypeConstants} from "../constants/topicTypeConstants";
import {alertActions} from "./alert.actions";
import {topicTypeService} from "../services/topicTypes.services";

export const topicTypeActions = {
    getAllTopicTypes,
    openModal,
    closeModal,
    deleteTopicType,
    createTopicType,
    saveAllTopicTypes,
    addNewTopicType,
    removeTopicType,
    closeOperationFailedModal,
    closeOperationSuccessModal,
    closeDeleteTopicTypeConfirm,
    openDeleteTopicTypeConfirm,
    getTopicTypeById
};

function getAllTopicTypes(user){
    return dispatch => {
        dispatch (request({user}));
        topicTypeService.getAllTopicTypes(user)
            .then(
                topicTypes => {
                    dispatch(success({topicTypes}));
                    //dispatch(alertActions.success("All Topic Types."))
                },
                error => {
                    dispatch(failure({error}));
                    dispatch(alertActions.error(error));
                }
            )
    };

    function request(user) {return {type: topicTypeConstants.GET_ALL_TOPIC_TYPES_REQUEST, user}}
    function success(topicTypes){return {type: topicTypeConstants.GET_ALL_TOPIC_TYPES_SUCCESS, topicTypes}}
    function failure(error){return {type: topicTypeConstants.GET_ALL_TOPIC_TYPES_FAILURE, error}}
}

function saveAllTopicTypes(topicTypes, user){
    return dispatch => {
        dispatch (request({topicTypes}));
        topicTypeService.saveAllTopicTypes(topicTypes, user)
            .then(
                newTopicTypesIds => {
                    dispatch(success({newTopicTypesIds}));
                    dispatch(alertActions.success('topicTypes created'))
                },
                error => {
                    dispatch(failure({error}));
                    dispatch(alertActions.error(error));
                }
            )
    };

    function request(topicTypes) {return {type: topicTypeConstants.SAVE_ALL_TOPIC_TYPE_REQUEST, topicTypes}}
    function success(newTopicTypesIds){return {type: topicTypeConstants.SAVE_ALL_TOPIC_TYPE_SUCCESS, newTopicTypesIds}}
    function failure(error){return {type: topicTypeConstants.SAVE_ALL_TOPIC_TYPE_FAILURE, error}}
}

function createTopicType(topicType, user){
    return dispatch => {
        dispatch (request({topicType}));
        topicTypeService.createTopicType(topicType, user)
            .then(
                newTopicType => {
                    dispatch(success({newTopicType}));
                    dispatch(alertActions.success('New TopicType created'))
                },
                error => {
                    dispatch(failure({error}));
                    dispatch(alertActions.error(error));
                }
            )
    };
    function request(topicType) {return {type: topicTypeConstants.CREATE_TOPIC_TYPES_REQUEST, topicType}}
    function success(newTopicType){return {type: topicTypeConstants.CREATE_TOPIC_TYPES_SUCCESS, newTopicType}}
    function failure(error){return {type: topicTypeConstants.CREATE_TOPIC_TYPES_FAILURE, error}}
}


function deleteTopicType(topicTypeToDelete,user) {
    return dispatch => {
        dispatch(request({topicTypeToDelete}));
        topicTypeService.deleteTopicType(topicTypeToDelete, user)
            .then(
                message => {
                    dispatch(success({message}, {topicTypeToDelete}));
                    dispatch(alertActions.success(message));
                },
                error => {
                    dispatch(failure({error}));
                    dispatch(alertActions.error(error));
                }
            )
    };
    function request(topicTypeToDelete) {return {type: topicTypeConstants.DELETE_TOPIC_TYPES_REQUEST, topicTypeToDelete}}
    function success(message, topicTypeToDelete){return {type: topicTypeConstants.DELETE_TOPIC_TYPES_SUCCESS, message, topicTypeToDelete}}
    function failure(error){return {type: topicTypeConstants.DELETE_TOPIC_TYPES_FAILURE, error}}
}


function getTopicTypeById(topicTypeId,user){
    return dispatch => {
        dispatch (request({topicTypeId}));
        topicTypeService.getAllTopicTypes(topicTypeId,user)
            .then(
                topicType => {
                    dispatch(success({topicType}));
                    dispatch(alertActions.success('success'));
                },
                error => {
                    dispatch(failure({error}));
                    dispatch(alertActions.error(error));
                }
            )
    };

    function request(user) {return {type: topicTypeConstants.GET_TOPIC_TYPE_BY_ID_REQUEST, user}}
    function success(topicType){return {type: topicTypeConstants.GET_TOPIC_TYPE_BY_ID_SUCCESS, topicType}}
    function failure(error){return {type: topicTypeConstants.GET_TOPIC_TYPE_BY_ID_FAILURE, error}}
}





function openModal() {
    return dispatch => {
        dispatch(request())
    };

    function request(){return {type: topicTypeConstants.OPEN_TOPIC_TYPES_MODAL_REQUEST}}
}

function closeModal() {
    return dispatch => {
        dispatch(request())
    };

    function request(){return {type: topicTypeConstants.CLOSE_TOPIC_TYPES_MODAL_REQUEST}}
}

function addNewTopicType(){
    return dispatch => {
        dispatch (request({}));
    };

    function request() {return {type: topicTypeConstants.ADD_TOPIC_TYPES_REQUEST}}
}

function removeTopicType(){
    return dispatch => {
        dispatch (request({}));
    };

    function request() {return {type: topicTypeConstants.REMOVE_TOPIC_TYPES_REQUEST}}
}

function closeOperationSuccessModal(){
    return dispatch => {
        dispatch (request({}));
    };

    function request() {return {type: topicTypeConstants.CLOSE_OPERATION_SUCCESS_MODAL}}
}

function closeOperationFailedModal(){
    return dispatch => {
        dispatch (request({}));
    };

    function request() {return {type: topicTypeConstants.CLOSE_OPERATION_FAILED_MODAL}}
}

function openDeleteTopicTypeConfirm(topicTypeId){
    return dispatch => {
        dispatch (request({topicTypeId}));
    };

    function request(topicTypeId) {return {type: topicTypeConstants.OPEN_TOPIC_TYPES_DELETE_CONFIRM, topicTypeId}}
}

function closeDeleteTopicTypeConfirm(){
    return dispatch => {
        dispatch (request({}));
    };

    function request() {return {type: topicTypeConstants.CLOSE_TOPIC_TYPES_DELETE_CONFIRM}}
}
