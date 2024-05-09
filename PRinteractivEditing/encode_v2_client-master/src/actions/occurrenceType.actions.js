import {occurrenceTypeConstants} from "../constants/occurrenceTypeConstants";
import {occurrenceTypeService} from "../services/occurrenceType.services";
import {alertActions} from "./alert.actions";

export const occurrenceTypeActions = {
    getAllOccurrenceType,
    createOccurrenceType,
    deleteOccurrenceType,
    addNewOccurrenceType,
    removeOccurrenceType,
    openModal,
    closeModal,
    saveAllOccurrenceTypes,
    closeOperationFailedModal,
    closeOperationSuccessModal,
    openDeleteOccTypeConfirm,
    closeDeleteOccTypeConfirm
};

function getAllOccurrenceType(user){
    return dispatch => {
        dispatch (request({user}));
        occurrenceTypeService.getAllOccurrenceTypes(user)
            .then(
                occurrenceTypes => {
                    dispatch(success({occurrenceTypes}));
                    dispatch(alertActions.success("Correctly get all occurrence types"))
                },
                error => {
                    dispatch(failure({error}));
                    dispatch(alertActions.error(error));
                }
            )
    };

    function request(occurrenceType) {return {type: occurrenceTypeConstants.GET_ALL_OCCURRENCE_TYPE_REQUEST, occurrenceType}}
    function success(occurrenceType){return {type: occurrenceTypeConstants.GET_ALL_OCCURRENCE_TYPE_SUCCESS, occurrenceType}}
    function failure(error){return {type: occurrenceTypeConstants.GET_ALL_OCCURRENCE_TYPE_FAILURE, error}}
}

function createOccurrenceType(newOccurrenceType, user){
    return dispatch => {
        dispatch (request({newOccurrenceType}));
        occurrenceTypeService.createOccurrenceType(newOccurrenceType, user)
            .then(
                newOccurrenceType => {
                    dispatch(success({newOccurrenceType}));
                    dispatch(alertActions.success("new occurrenceType created"))
                },
                error => {
                    dispatch(failure({error}));
                    dispatch(alertActions.error(error));
                }
            )
    };

    function request(newOccurrenceType) {return {type: occurrenceTypeConstants.CREATE_OCCURRENCE_TYPE_REQUEST, newOccurrenceType}}
    function success(newOccurrenceType){return {type: occurrenceTypeConstants.CREATE_OCCURRENCE_TYPE_SUCCESS, newOccurrenceType}}
    function failure(error){return {type: occurrenceTypeConstants.CREATE_OCCURRENCE_TYPE_FAILURE, error}}
}

function saveAllOccurrenceTypes(newOccurrenceType, user){
    return dispatch => {
        dispatch (request({newOccurrenceType}));
        occurrenceTypeService.saveAllOccurrenceTypes(newOccurrenceType, user)
            .then(
                newOccurrenceTypesIds => {
                    dispatch(success({newOccurrenceTypesIds}));
                    dispatch(alertActions.success("new occurrenceTypes created"))
                },
                error => {
                    dispatch(failure({error}));
                    dispatch(alertActions.error(error));
                }
            )
    };

    function request(newOccurrenceType) {return {type: occurrenceTypeConstants.SAVE_ALL_OCCURRENCE_TYPE_REQUEST, newOccurrenceType}}
    function success(newOccurrenceTypesIds){return {type: occurrenceTypeConstants.SAVE_ALL_OCCURRENCE_TYPE_SUCCESS, newOccurrenceTypesIds}}
    function failure(error){return {type: occurrenceTypeConstants.SAVE_ALL_OCCURRENCE_TYPE_FAILURE, error}}
}

/*
function updateOccurrenceType(occurrenceType, user){
    return dispatch => {
        dispatch (request({occurrenceType}));
        occurrenceTypeService.updateOccurrenceType(occurrenceType, user)
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

    function request(occurrenceType) {return {type: occurrenceTypeConstants.UPDATE_OCCURRENCE_TYPE_REQUEST, occurrenceType}}
    function success(message){return {type: occurrenceTypeConstants.UPDATE_OCCURRENCE_TYPE_SUCCESS, message}}
    function failure(error){return {type: occurrenceTypeConstants.UPDATE_OCCURRENCE_TYPE_FAILURE, error}}
}
*/

function deleteOccurrenceType(occurrenceTypeToDelete, user){
    return dispatch => {
        dispatch (request({occurrenceTypeToDelete}));
        occurrenceTypeService.deleteOccurrenceType(occurrenceTypeToDelete, user)
            .then(
                message => {
                    dispatch(success({message}, {occurrenceTypeToDelete}));
                    dispatch(alertActions.success(message))
                },
                error => {
                    dispatch(failure({error}));
                    dispatch(alertActions.error(error));
                }
            )
    };

    function request(occurrenceTypeToDelete) {return {type: occurrenceTypeConstants.DELETE_OCCURRENCE_TYPE_REQUEST, occurrenceTypeToDelete}}
    function success(message, occurrenceTypeToDelete){return {type: occurrenceTypeConstants.DELETE_OCCURRENCE_TYPE_SUCCESS, message, occurrenceTypeToDelete}}
    function failure(error){return {type: occurrenceTypeConstants.DELETE_OCCURRENCE_TYPE_FAILURE, error}}
}

function openModal() {
    return dispatch => {
        dispatch(request())
    };

    function request(){return {type: occurrenceTypeConstants.OPEN_OCCURRENCE_TYPE_MODAL_REQUEST}}
}

function closeModal() {
    return dispatch => {
        dispatch(request())
    };

    function request(){return {type: occurrenceTypeConstants.CLOSE_OCCURRENCE_TYPE_MODAL_REQUEST}}
}

function addNewOccurrenceType(){
    return dispatch => {
        dispatch (request({}));
    };

    function request() {return {type: occurrenceTypeConstants.ADD_OCCURRENCE_TYPE_REQUEST}}
}

function removeOccurrenceType(){
    return dispatch => {
        dispatch (request({}));
    };

    function request() {return {type: occurrenceTypeConstants.REMOVE_OCCURRENCE_TYPE_REQUEST}}
}

function closeOperationSuccessModal(){
    return dispatch => {
        dispatch (request({}));
    };

    function request() {return {type: occurrenceTypeConstants.CLOSE_OPERATION_SUCCESS_MODAL}}
}

function closeOperationFailedModal(){
    return dispatch => {
        dispatch (request({}));
    };

    function request() {return {type: occurrenceTypeConstants.CLOSE_OPERATION_FAILED_MODAL}}
}

function openDeleteOccTypeConfirm(occurrenceTypeId){
    return dispatch => {
        dispatch (request({occurrenceTypeId}));
    };

    function request(occurrenceTypeId) {return {type: occurrenceTypeConstants.OPEN_OCCURRENCE_TYPES_DELETE_CONFIRM, occurrenceTypeId}}
}

function closeDeleteOccTypeConfirm(){
    return dispatch => {
        dispatch (request({}));
    };

    function request() {return {type: occurrenceTypeConstants.CLOSE_OCCURRENCE_TYPES_DELETE_CONFIRM}}
}