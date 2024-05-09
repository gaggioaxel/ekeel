import {occurrenceConstants} from "../constants/occurrenceConstants";
import {occurrenceService} from "../services/occurrence.services";
import {alertActions} from "./alert.actions";

export const occurrenceActions = {
    getAllOccurrences,
    createOccurrence,
    updateOccurrence,
    saveAllOccurrences,
    deleteOccurrence,
    addOccurrence,
    removeOccurrence,
    closeDeleteOccConfirm,
    openDeleteOccConfirm,
    addNewScopedContent,
    saveOccurrence,
    closeDeleteAllOccConfirm,
    openDeleteAllOccConfirm,
    closeOperationSuccessModal,
    closeOperationFailedModal
};

function getAllOccurrences(topicId, user){
    return dispatch => {
        dispatch (request({topicId}));
        occurrenceService.getAllOccurrenceOfTopic(topicId, user)
            .then(
                occurrence => {
                    dispatch(success({occurrence}));
                    dispatch(alertActions.success("Correctly get all occurrence of topic: " + topicId))
                },
                error => {
                    dispatch(failure({error}));
                    dispatch(alertActions.error(error));
                }
            )
    };

    function request(topicId) {return {type: occurrenceConstants.GET_ALL_OCCURRENCES_REQUEST, topicId}}
    function success(occurrence){return {type: occurrenceConstants.GET_ALL_OCCURRENCES_SUCCESS, occurrence}}
    function failure(error){return {type: occurrenceConstants.GET_ALL_OCCURRENCES_FAILURE, error}}
}

function createOccurrence(newOccurrence, user){
    return dispatch => {
        dispatch (request({newOccurrence}));
        occurrenceService.createOccurrence(newOccurrence, user)
            .then(
                occurrenceId => {
                    dispatch(success({occurrenceId}));
                    dispatch(alertActions.success("New Occurrence created."))
                },
                error => {
                    dispatch(failure({error}));
                    dispatch(alertActions.error(error));
                }
            )
    };

    function request(occurrence) {return {type: occurrenceConstants.CREATE_OCCURRENCE_REQUEST, occurrence}}
    function success(occurrenceId){return {type: occurrenceConstants.CREATE_OCCURRENCE_SUCCESS, occurrenceId}}
    function failure(error){return {type: occurrenceConstants.CREATE_OCCURRENCE_FAILURE, error}}
}

function saveAllOccurrences(occurrences, user){
    return dispatch => {
        dispatch (request({occurrences}));
        occurrenceService.saveAllOccurrences(occurrences, user)
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

    function request(occurrences) {return {type: occurrenceConstants.SAVE_ALL_OCCURRENCES_REQUEST, occurrences}}
    function success(message){return {type: occurrenceConstants.SAVE_ALL_OCCURRENCES_SUCCESS, message}}
    function failure(error){return {type: occurrenceConstants.SAVE_ALL_OCCURRENCES_FAILURE, error}}
}

function saveOccurrence(occurrence, user){
    return dispatch => {
        dispatch (request({occurrence}));
        occurrenceService.updateOccurrence(occurrence, user)
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

    function request(occurrence) {return {type: occurrenceConstants.SAVE_OCCURRENCE_REQUEST, occurrence}}
    function success(message){return {type: occurrenceConstants.SAVE_OCCURRENCE_SUCCESS, message}}
    function failure(error){return {type: occurrenceConstants.SAVE_OCCURRENCE_FAILURE, error}}
}

function updateOccurrence(occurrence, user){
    return dispatch => {
        dispatch (request({occurrence}));
        occurrenceService.updateOccurrence(occurrence, user)
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

    function request(occurrence) {return {type: occurrenceConstants.UPDATE_OCCURRENCE_REQUEST, occurrence}}
    function success(message){return {type: occurrenceConstants.UPDATE_OCCURRENCE_SUCCESS, message}}
    function failure(error){return {type: occurrenceConstants.UPDATE_OCCURRENCE_FAILURE, error}}
}

function deleteOccurrence(occurrenceId, user){
    return dispatch => {
        dispatch (request({occurrenceId}));
        occurrenceService.deleteOccurrence(occurrenceId, user)
            .then(
                message => {
                    dispatch(success({message},{occurrenceId}));
                    dispatch(alertActions.success(message));
                },
                error => {
                    dispatch(failure({error}));
                    dispatch(alertActions.error(error));
                }
            )
    };

    function request(occurrence) {return {type: occurrenceConstants.DELETE_OCCURRENCE_REQUEST, occurrence}}
    function success(message, occurrenceId){return {type: occurrenceConstants.DELETE_OCCURRENCE_SUCCESS, message, occurrenceId}}
    function failure(error){return {type: occurrenceConstants.DELETE_OCCURRENCE_FAILURE, error}}
}

function addOccurrence(topicId){
    return dispatch => {
        dispatch (request({topicId}));
    };

    function request(topicId) {return {type: occurrenceConstants.ADD_OCCURRENCE_REQUEST, topicId}}
}

function removeOccurrence(){
    return dispatch => {
        dispatch (request({}));
    };

    function request() {return {type: occurrenceConstants.REMOVE_OCCURRENCE_REQUEST}}
}

function openDeleteOccConfirm(occurrenceId, user){
    return dispatch => {
        dispatch (request({occurrenceId}));
    };

    function request(occurrenceId) {return {type: occurrenceConstants.OPEN_OCCURRENCE_DELETE_CONFIRM, occurrenceId}}
}

function closeDeleteOccConfirm(){
    return dispatch => {
        dispatch (request({}));
    };

    function request() {return {type: occurrenceConstants.CLOSE_OCCURRENCE_DELETE_CONFIRM}}
}

function openDeleteAllOccConfirm(){
    return dispatch => {
        dispatch (request({}));
    };

    function request() {return {type: occurrenceConstants.OPEN_ALL_OCCURRENCE_DELETE_CONFIRM}}
}

function closeDeleteAllOccConfirm(){
    return dispatch => {
        dispatch (request({}));
    };

    function request() {return {type: occurrenceConstants.CLOSE_ALL_OCCURRENCE_DELETE_CONFIRM}}
}

function addNewScopedContent(occurrenceId){
    return dispatch => {
        dispatch (request({occurrenceId}));
    };

    function request(occurrenceId) {return {type: occurrenceConstants.ADD_SCOPED_CONTENT, occurrenceId}}
}

function closeOperationSuccessModal(){
    return dispatch => {
        dispatch (request({}));
    };

    function request() {return {type: occurrenceConstants.CLOSE_OPERATION_SUCCESS_MODAL}}
}

function closeOperationFailedModal(){
    return dispatch => {
        dispatch (request({}));
    };

    function request() {return {type: occurrenceConstants.CLOSE_OPERATION_FAILED_MODAL}}
}

