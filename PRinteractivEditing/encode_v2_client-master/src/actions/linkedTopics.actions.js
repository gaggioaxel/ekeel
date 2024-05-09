import {linkedTopicConstants} from "../constants/linkedTopicsConstants";
import {alertActions} from "./alert.actions";
import {linkedTopicsService} from "../services/linkedTopics.services";

export const linkedTopicsActions = {
    saveLinkedTopics,
    saveAllLinkedTopics
};

function saveLinkedTopics(link, user){
    return dispatch => {
        dispatch (request({user}));
        linkedTopicsService.saveLink(link, user)
            .then(
                message => {
                    dispatch(success({message}));
                    dispatch(alertActions.success(message))
                },
                error => {
                    dispatch(failure({error}));
                    dispatch(alertActions.error(error));
                }
            )
    };

    function request(link, user) {return {type: linkedTopicConstants.SAVE_LINKED_TOPICS_REQUEST, link, user}}
    function success(message){return {type: linkedTopicConstants.SAVE_LINKED_TOPICS_SUCCESS, message}}
    function failure(error){return {type: linkedTopicConstants.SAVE_LINKED_TOPICS_FAILURE, error}}
}

function saveAllLinkedTopics(links, user){
    return dispatch => {
        dispatch (request({user}));
        linkedTopicsService.saveAllLinks(links, user)
            .then(
                topicMap => {
                    dispatch(success({topicMap}));
                    dispatch(alertActions.success("LinkedTopics saved"))
                },
                error => {
                    dispatch(failure({error}));
                    dispatch(alertActions.error(error));
                }
            )
    };

    function request(links, user) {return {type: linkedTopicConstants.SAVE_LINKED_TOPICS_REQUEST, links, user}}
    function success(topicMap){return {type: linkedTopicConstants.SAVE_LINKED_TOPICS_SUCCESS, topicMap}}
    function failure(error){return {type: linkedTopicConstants.SAVE_LINKED_TOPICS_FAILURE, error}}
}