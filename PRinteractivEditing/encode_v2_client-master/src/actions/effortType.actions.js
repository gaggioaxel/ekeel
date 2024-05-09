import {effortTypeConstants} from "../constants/effortTypeConstants";
import {effortTypeService} from "../services/effortType.services";
import {alertActions} from "./alert.actions";


export const effortTypeActions = {
    getAllEffortType,
    createEffortType,
    deleteEffortType,
    addNewEffortType,
    removeEffortType,
    openModal,
    closeModal,
    saveAllEffortTypes,
    closeOperationFailedModal,
    closeOperationSuccessModal,
    openDeleteEffTypeConfirm,
    closeDeleteEffTypeConfirm
};

function getAllEffortType(user){
    return dispatch => {
        dispatch (request({user}));
        effortTypeService.getAllEffortTypes(user)
            .then(
                effortTypes => {
                    dispatch(success({effortTypes}));
                    dispatch(alertActions.success("Correctly get all effort types"))
                },
                error => {
                    dispatch(failure({error}));
                    dispatch(alertActions.error(error));
                }
            )
    };
    function request(effortType) {return {type: effortTypeConstants.GET_ALL_EFFORT_TYPES_REQUEST, effortType}}
    function success(effortTypes){return {type: effortTypeConstants.GET_ALL_EFFORT_TYPES_SUCCESS, effortTypes}}
    function failure(error){return {type: effortTypeConstants.GET_ALL_EFFORT_TYPES_FAILURE, error}}
}

function createEffortType(newEffortType, user){
    return dispatch => {
        dispatch (request({newEffortType}));
        effortTypeService.createEffortType(newEffortType, user)
            .then(
                newEffortType => {
                    dispatch(success({newEffortType}));
                    dispatch(alertActions.success("new occurrenceType created"))
                },
                error => {
                    dispatch(failure({error}));
                    dispatch(alertActions.error(error));
                }
            )
    };

    function request(newEffortType) {return {type: effortTypeConstants.CREATE_EFFORT_TYPE_REQUEST, newEffortType}}
    function success(newEffortType){return {type: effortTypeConstants.CREATE_EFFORT_TYPE_SUCCESS, newEffortType}}
    function failure(error){return {type: effortTypeConstants.CREATE_EFFORT_TYPE_FAILURE, error}}
}

function saveAllEffortTypes(newEffortType, user){
    return dispatch => {
        dispatch (request({newEffortType}));
        effortTypeService.saveAllEffortTypes(newEffortType, user)
            .then(
                newEffortTypesIds => {
                    dispatch(success({newEffortTypesIds}));
                    dispatch(alertActions.success("new Effort Types created"))
                },
                error => {
                    dispatch(failure({error}));
                    dispatch(alertActions.error(error));
                }
            )
    };

    function request(newEffortType) {return {type: effortTypeConstants.SAVE_ALL_EFFORT_TYPE_REQUEST, newEffortType}}
    function success(newEffortTypesIds){return {type: effortTypeConstants.SAVE_ALL_EFFORT_TYPE_SUCCESS, newEffortTypesIds}}
    function failure(error){return {type: effortTypeConstants.SAVE_ALL_EFFORT_TYPE_FAILURE, error}}
}

function deleteEffortType(effortTypeToDelete, user){
    return dispatch => {
        dispatch (request({effortTypeToDelete}));
        effortTypeService.deleteEffortType(effortTypeToDelete, user)
            .then(
                message => {
                    dispatch(success({message}, {effortTypeToDelete}));
                    dispatch(alertActions.success(message))
                },
                error => {
                    dispatch(failure({error}));
                    dispatch(alertActions.error(error));
                }
            )
    };

    function request(effortTypeToDelete) {return {type: effortTypeConstants.DELETE_EFFORT_TYPE_REQUEST, effortTypeToDelete}}
    function success(message, effortTypeToDelete){return {type: effortTypeConstants.DELETE_EFFORT_TYPE_SUCCESS, message, effortTypeToDelete}}
    function failure(error){return {type: effortTypeConstants.DELETE_EFFORT_TYPE_FAILURE, error}}
}

function openModal() {
    return dispatch => {
        dispatch(request())
    };

    function request(){return {type: effortTypeConstants.OPEN_EFFORT_TYPE_MODAL_REQUEST}}
}

function closeModal() {
    return dispatch => {
        dispatch(request())
    };

    function request(){return {type: effortTypeConstants.CLOSE_EFFORT_TYPE_MODAL_REQUEST}}
}

function addNewEffortType(){
    return dispatch => {
        dispatch (request({}));
    };

    function request() {return {type: effortTypeConstants.ADD_EFFORT_TYPE_REQUEST}}
}

function removeEffortType(){
    return dispatch => {
        dispatch (request({}));
    };

    function request() {return {type: effortTypeConstants.REMOVE_EFFORT_TYPE_REQUEST}}
}

function closeOperationSuccessModal(){
    return dispatch => {
        dispatch (request({}));
    };

    function request() {return {type: effortTypeConstants.CLOSE_OPERATION_SUCCESS_MODAL}}
}

function closeOperationFailedModal(){
    return dispatch => {
        dispatch (request({}));
    };

    function request() {return {type: effortTypeConstants.CLOSE_OPERATION_FAILED_MODAL}}
}

function openDeleteEffTypeConfirm(effortTypeId){
    return dispatch => {
        dispatch (request({effortTypeId}));
    };

    function request(effortTypeId) {return {type: effortTypeConstants.OPEN_EFFORT_TYPES_DELETE_CONFIRM, effortTypeId}}
}

function closeDeleteEffTypeConfirm(){
    return dispatch => {
        dispatch (request({}));
    };

    function request() {return {type: effortTypeConstants.CLOSE_EFFORT_TYPES_DELETE_CONFIRM}}
}