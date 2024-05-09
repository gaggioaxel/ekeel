import {associationTypeConstants} from "../constants/associationTypeConstants";
import {alertActions} from "./alert.actions";
import {associationTypeService} from "../services/associationType.services";

export const associationTypeActions = {
    getAllAssociationType,
    getAssociationTypeById,
    openModal,
    closeModal,
    addNewAssociationType,
    removeAssociationType,
    createAssociationTypes,
    saveAllAssociationTypes,
    closeOperationFailedModal,
    closeOperationSuccessModal,
    deleteAssociationType,
    closeDeleteAssTypeConfirm,
    openDeleteAssTypeConfirm,
    updateAssociationTypeRoleTopicType,
    openRoleModal,
    closeRoleModal,
    clearAssociationType
};

function saveAllAssociationTypes(associationTypes, user){
    return dispatch => {
        dispatch (request({associationTypes}));
        associationTypeService.saveAllAssociationTypes(associationTypes, user)
            .then(
                newAssociationTypesIds => {
                    dispatch(success({newAssociationTypesIds}));
                    dispatch(alertActions.success('associationTypes created'))
                },
                error => {
                    dispatch(failure({error}));
                    dispatch(alertActions.error(error));
                }
            )
    };

    function request(associationTypes) {return {type: associationTypeConstants.SAVE_ALL_ASSOCIATION_TYPES_REQUEST, associationTypes}}
    function success(newAssociationTypesIds){return {type: associationTypeConstants.SAVE_ALL_ASSOCIATION_TYPES_SUCCESS, newAssociationTypesIds}}
    function failure(error){return {type: associationTypeConstants.SAVE_ALL_ASSOCIATION_TYPES_FAILURE, error}}
}

function createAssociationTypes(associationType, user){
    return dispatch => {
        dispatch (request({associationType}));
        associationTypeService.createAssociationType(associationType, user)
            .then(
                newAssociationType => {
                    dispatch(success({newAssociationType}));
                    dispatch(alertActions.success('associationType created'))
                },
                error => {
                    dispatch(failure({error}));
                    dispatch(alertActions.error(error));
                }
            )
    };
    function request(associationType) {return {type: associationTypeConstants.SAVE_ASSOCIATION_TYPES_REQUEST, associationType}}
    function success(newAssociationType){return {type: associationTypeConstants.SAVE_ASSOCIATION_TYPES_SUCCESS, newAssociationType}}
    function failure(error){return {type: associationTypeConstants.SAVE_ASSOCIATION_TYPES_FAILURE, error}}
}

function getAllAssociationType (user){
    return dispatch => {
        dispatch (request({user}));
        associationTypeService.getAllAssociationTypes(user)
            .then(
                associationType => {
                    dispatch(success({associationType}));
                    //dispatch(alertActions.success("All associationType found."))
                },
                error => {
                    dispatch(failure({error}));
                    dispatch(alertActions.error(error));
                }
            )
    };

    function request(user) {return {type: associationTypeConstants.GET_ALL_ASSOCIATION_TYPES_REQUEST, user}}
    function success(associationType){return {type: associationTypeConstants.GET_ALL_ASSOCIATION_TYPES_SUCCESS, associationType}}
    function failure(error){return {type: associationTypeConstants.GET_ALL_ASSOCIATION_TYPES_FAILURE, error}}
}

function getAssociationTypeById (associationTypeId,user){
    return dispatch => {
        dispatch (request({associationTypeId,user}));
        associationTypeService.getAssociationTypeById(associationTypeId,user)
            .then(
                foundAssociationType => {
                    dispatch(success({foundAssociationType}));
                    //dispatch(alertActions.success("All associationType found."))
                },
                error => {
                    dispatch(failure({error}));
                    dispatch(alertActions.error(error));
                }
            )
    };

    function request(user) {return {type: associationTypeConstants.GET_ASSOCIATION_TYPE_BY_ID_REQUEST, user}}
    function success(foundAssociationType){return {type: associationTypeConstants.GET_ASSOCIATION_TYPE_BY_ID_SUCCESS, foundAssociationType}}
    function failure(error){return {type: associationTypeConstants.GET_ASSOCIATION_TYPE_BY_ID_FAILURE, error}}
}

function deleteAssociationType(associationTypeToDelete, user){
    return dispatch => {
        dispatch (request({associationTypeToDelete}));
        associationTypeService.deleteAssociationType(associationTypeToDelete, user)
            .then(
                message => {
                    dispatch(success({message}, {associationTypeToDelete}));
                    dispatch(alertActions.success(message));
                },
                error => {
                    dispatch(failure({error}));
                    dispatch(alertActions.error(error));
                }
            )
    };

    function request(associationTypeToDelete) {return {type: associationTypeConstants.DELETE_ASSOCIATION_TYPES_REQUEST, associationTypeToDelete}}
    function success(message, associationTypeToDelete){return {type: associationTypeConstants.DELETE_ASSOCIATION_TYPES_SUCCESS, message, associationTypeToDelete}}
    function failure(error){return {type: associationTypeConstants.DELETE_ASSOCIATION_TYPES_REQUEST, error}}
}

function updateAssociationTypeRoleTopicType(associationTypeRoleTopicType,user){
    return dispatch => {
        dispatch (request({associationTypeRoleTopicType,user}));
        associationTypeService.updateAssociationTypeRoleTopicType(associationTypeRoleTopicType, user)
            .then(
                message => {
                    dispatch(success({message}));
                    dispatch(alertActions.success(message));
                },
                error => {
                    dispatch(failure({error}));
                    dispatch(alertActions.error(error));
                }
            )
    };

    function request(associationTypeRoleTopicType,user) {return {type: associationTypeConstants.UPDATE_ASSOCIATION_TYPE_ROLE_TOPIC_TYPE_REQUEST,associationTypeRoleTopicType,user}}
    function success(message){return {type: associationTypeConstants.UPDATE_ASSOCIATION_TYPE_ROLE_TOPIC_TYPE_SUCCESS, message}}
    function failure(error){return {type: associationTypeConstants.UPDATE_ASSOCIATION_TYPE_ROLE_TOPIC_TYPE_FAILURE, error}}
}

function openModal() {
    return dispatch => {
        dispatch(request())
    };

    function request(){return {type: associationTypeConstants.OPEN_ASSOCIATION_TYPES_MODAL_REQUEST}}
}

function closeModal() {
    return dispatch => {
        dispatch(request())
    };

    function request(){return {type: associationTypeConstants.CLOSE_ASSOCIATION_TYPES_MODAL_REQUEST}}
}

function clearAssociationType(){
    return dispatch => {
        dispatch(request())
    };

    function request(){return {type: associationTypeConstants.CLEAR_ASSOCIATION_TYPE}}
}
function openRoleModal() {
    return dispatch => {
        dispatch(request({}))
    };

    function request(){return {type: associationTypeConstants.OPEN_ASSOCIATION_TYPES_ROLES_MODAL_REQUEST}}
}

function closeRoleModal() {
    return dispatch => {
        dispatch(request())
    };

    function request(){return {type: associationTypeConstants.CLOSE_ASSOCIATION_TYPES_ROLES_MODAL_REQUEST}}
}

function addNewAssociationType(){
    return dispatch => {
        dispatch (request({}));
    };

    function request() {return {type: associationTypeConstants.ADD_ASSOCIATION_TYPES_REQUEST}}
}

function removeAssociationType(){
    return dispatch => {
        dispatch (request({}));
    };

    function request() {return {type: associationTypeConstants.REMOVE_ASSOCIATION_TYPES_REQUEST}}
}

function closeOperationSuccessModal(){
    return dispatch => {
        dispatch (request({}));
    };

    function request() {return {type: associationTypeConstants.CLOSE_OPERATION_SUCCESS_MODAL}}
}

function closeOperationFailedModal(){
    return dispatch => {
        dispatch (request({}));
    };

    function request() {return {type: associationTypeConstants.CLOSE_OPERATION_FAILED_MODAL}}
}

function openDeleteAssTypeConfirm(associationTypeId){
    return dispatch => {
        dispatch (request({associationTypeId}));
    };

    function request(associationTypeId) {return {type: associationTypeConstants.OPEN_ASSOCIATION_TYPES_DELETE_CONFIRM, associationTypeId}}
}

function closeDeleteAssTypeConfirm(){
    return dispatch => {
        dispatch (request({}));
    };

    function request() {return {type: associationTypeConstants.CLOSE_ASSOCIATION_TYPES_DELETE_CONFIRM}}
}