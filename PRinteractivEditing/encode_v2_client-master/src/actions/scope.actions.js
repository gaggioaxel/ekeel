import {scopeConstants} from "../constants/scopeConstants";
import {alertActions} from "./alert.actions";
import {scopeService} from "../services/scope.services";

export const scopeActions = {
    saveAllScopes,
    deleteScope,
    addNewScope,
    removeScope,
    closeDeleteScopeConfirm,
    openDeleteScopeConfirm,
    openModal,
    closeModal,
    getAllScopes,
    saveScope,
    closeOperationFailedModal,
    closeOperationSuccessModal,
    clearNotSavedScopes,
    updateScope
};

function saveAllScopes(scopes, user){
    return dispatch => {
        dispatch (request({scopes}));
        scopeService.saveAllScopes(scopes, user)
            .then(
                newScopesIds => {
                    dispatch(success({newScopesIds}));
                    dispatch(alertActions.success('message'))
                },
                error => {
                    dispatch(failure({error}));
                    dispatch(alertActions.error(error));
                }
            )
    };

    function request(scope) {return {type: scopeConstants.SAVE_ALL_SCOPES_REQUEST, scope}}
    function success(newScopesIds){return {type: scopeConstants.SAVE_ALL_SCOPES_SUCCESS, newScopesIds}}
    function failure(error){return {type: scopeConstants.SAVE_ALL_SCOPES_FAILURE, error}}
}

function saveScope(scope, user){
    return dispatch => {
        dispatch (request({scope}));
        scopeService.saveScope(scope, user)
            .then(
                newScope => {
                    dispatch(success({newScope}));
                    dispatch(alertActions.success('message'))
                },
                error => {
                    dispatch(failure({error}));
                    dispatch(alertActions.error(error));
                }
            )
    };
    function request(scope) {return {type: scopeConstants.SAVE_SCOPE_REQUEST, scope}}
    function success(newScope){return {type: scopeConstants.SAVE_SCOPE_SUCCESS, newScope}}
    function failure(error){return {type: scopeConstants.SAVE_SCOPE_FAILURE, error}}
}


function deleteScope(scopeToDelete, user){
    return dispatch => {
        dispatch (request({scopeToDelete}));
        scopeService.deleteScope(scopeToDelete, user)
            .then(
                message => {
                    dispatch(success({message}, {scopeToDelete}));
                    dispatch(alertActions.success(message));
                },
                error => {
                    dispatch(failure({error}));
                    dispatch(alertActions.error(error));
                }
            )
    };

    function request(scopeToDelete) {return {type: scopeConstants.DELETE_SCOPE_REQUEST, scopeToDelete}}
    function success(message, scopeToDelete){return {type: scopeConstants.DELETE_SCOPE_SUCCESS, message, scopeToDelete}}
    function failure(error){return {type: scopeConstants.DELETE_SCOPE_FAILURE, error}}
}

function addNewScope(){
    return dispatch => {
        dispatch (request({}));
    };

    function request() {return {type: scopeConstants.ADD_SCOPE_REQUEST}}
}

function removeScope(){
    return dispatch => {
        dispatch (request({}));
    };

    function request() {return {type: scopeConstants.REMOVE_SCOPE_REQUEST}}
}

function openDeleteScopeConfirm(scopeId, user){
    return dispatch => {
        dispatch (request({scopeId}));
    };

    function request(scopeId) {return {type: scopeConstants.OPEN_SCOPE_DELETE_CONFIRM, scopeId}}
}

function closeDeleteScopeConfirm(){
    return dispatch => {
        dispatch (request({}));
    };

    function request() {return {type: scopeConstants.CLOSE_SCOPE_DELETE_CONFIRM}}
}

function getAllScopes(user){
    return dispatch => {
        dispatch (request({user}));
        scopeService.getAllScopes(user)
            .then(
                scopes => {
                    dispatch(success({scopes}));
                    dispatch(alertActions.success("All scopes found."))
                },
                error => {
                    dispatch(failure({error}));
                    dispatch(alertActions.error(error));
                }
            )
    };

    function request(user) {return {type: scopeConstants.GET_ALL_SCOPES_REQUEST, user}}
    function success(scopes){return {type: scopeConstants.GET_ALL_SCOPES_SUCCESS, scopes}}
    function failure(error){return {type: scopeConstants.GET_ALL_SCOPES_FAILURE, error}}
}

function updateScope(scope, user){
    return dispatch => {
        dispatch (request({scope}));
        scopeService.updateOccurrence(scope, user)
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

    function request(scope) {return {type: scopeConstants.UPDATE_SCOPE_REQUEST, scope}}
    function success(message){return {type: scopeConstants.UPDATE_SCOPE_SUCCESS, message}}
    function failure(error){return {type: scopeConstants.UPDATE_SCOPE_FAILURE, error}}
}

function openModal() {
    return dispatch => {
        dispatch(request())
    };

    function request(){return {type: scopeConstants.OPEN_SCOPES_MODAL_REQUEST}}
}

function closeModal() {
    return dispatch => {
        dispatch(request())
    };

    function request(){return {type: scopeConstants.CLOSE_SCOPES_MODAL_REQUEST}}
}

function closeOperationSuccessModal(){
    return dispatch => {
        dispatch (request({}));
    };

    function request() {return {type: scopeConstants.CLOSE_OPERATION_SUCCESS_MODAL}}
}

function closeOperationFailedModal(){
    return dispatch => {
        dispatch (request({}));
    };

    function request() {return {type: scopeConstants.CLOSE_OPERATION_FAILED_MODAL}}
}

function clearNotSavedScopes(){
    return dispatch => {
        dispatch(request({}));
    };

    function request(){return { type: scopeConstants.CLEAR_NOT_SAVED_SCOPES}}
}
