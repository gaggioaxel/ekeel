import {topicConstants} from "../constants/topicConstants";
import {alertActions} from "./alert.actions";
import {topicService} from "../services/topicService";


export const topicActions = {
    createTopic,
    openModal,
    closeModal,
    clearTopic,
    deleteTopic,
    getTopic,
    deleteTopicList,
    openDeleteTopicModal,
    closeDeleteTopicModal,
    closeOperationSuccessModal,
    closeOperationFailedModal
};

function createTopic(newTopic, user){
  return dispatch => {
        dispatch(request({newTopic}));
        topicService.createTopic(newTopic, user)
            .then(
                newTopicId =>{
                    dispatch(success({newTopicId}));
                    dispatch(alertActions.success("Create topic with id :" + newTopicId));
                },
                error =>{
                    dispatch(failure({error}));
                    dispatch(alertActions.error(error));
                }
            )
    };

    function request(newTopic){return {type: topicConstants.CREATE_TOPIC_REQUEST, newTopic}}
    function success(newTopicId){return {type: topicConstants.CREATE_TOPIC_SUCCESS, newTopicId}}
    function failure(error){return {type: topicConstants.CREATE_TOPIC_FAILURE, error}}
}

function openModal() {
    return dispatch => {
        dispatch(request())
    };

    function request(){return {type: topicConstants.OPEN_TOPIC_CREATE_MODAL_REQUEST}}
}

function closeModal() {
    return dispatch => {
        dispatch(request())
    };

    function request(){return {type: topicConstants.CLOSE_TOPIC_CREATE_MODAL_REQUEST}}
}

function openDeleteTopicModal() {
    return dispatch => {
        dispatch(request())
    };

    function request(){return {type: topicConstants.OPEN_TOPIC_DELETE_MODAL_REQUEST}}
}

function closeDeleteTopicModal() {
    return dispatch => {
        dispatch(request())
    };

    function request(){return {type: topicConstants.CLOSE_TOPIC_DELETE_MODAL_REQUEST}}
}

function clearTopic(){
    return dispatch => {
     dispatch(request())
    };

    function request(){return {type: topicConstants.CLEAR_TOPIC}}
}

function deleteTopic(topicId, user){
    return dispatch => {
        dispatch(request({topicId}));
        topicService.deleteTopic(topicId, user)
            .then(
                id =>{
                    dispatch(success({id}));
                    dispatch(alertActions.success("Deleted topic with id :" + id));
                },
                error =>{
                    dispatch(failure({error}));
                    dispatch(alertActions.error(error));
                }
            )
    };

    function request(topicId){return {type: topicConstants.DELETE_TOPIC_REQUEST, topicId}}
    function success(response){return {type: topicConstants.DELETE_TOPIC_SUCCESS, response}}
    function failure(error){return {type: topicConstants.DELETE_TOPIC_FAILURE, error}}
}

function deleteTopicList(topicsToDelete, user){
    return dispatch => {
        dispatch(request({topicsToDelete}));
        topicService.deleteTopicsList(topicsToDelete, user)
            .then(
                id =>{
                    dispatch(success({id}));
                    dispatch(alertActions.success("Deleted all selected Topic."));
                },
                error =>{
                    dispatch(failure({error}));
                    dispatch(alertActions.error(error));
                }
            )
    };

    function request(topicsToDelete){return {type: topicConstants.DELETE_TOPIC_REQUEST, topicsToDelete}}
    function success(response){return {type: topicConstants.DELETE_TOPIC_SUCCESS, response}}
    function failure(error){return {type: topicConstants.DELETE_TOPIC_FAILURE, error}}
}

function closeOperationSuccessModal(){
    return dispatch => {
        dispatch (request({}));
    };

    function request() {return {type: topicConstants.CLOSE_OPERATION_SUCCESS_MODAL}}
}
function closeOperationFailedModal(){
    return dispatch => {
        dispatch (request({}));
    };

    function request() {return {type: topicConstants.CLOSE_OPERATION_FAILED_MODAL}}
}

function getTopic(topicId, user){
    return dispatch => {
        dispatch(request({topicId}));
        topicService.getTopic(topicId, user)
            .then(
                topic =>{
                    dispatch(success({topic}));
                    dispatch(alertActions.success("Correctly get topic with id :" + topic.id));
                },
                error =>{
                    dispatch(failure({error}));
                    dispatch(alertActions.error(error));
                }
            )
    };

    function request(topicId){return {type: topicConstants.GET_TOPIC_REQUEST, topicId}}
    function success(topic){return {type: topicConstants.GET_TOPIC_SUCCESS, topic}}
    function failure(error){return {type: topicConstants.GET_TOPIC_FAILURE, error}}
}


