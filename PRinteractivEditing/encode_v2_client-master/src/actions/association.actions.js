import {associationConstants} from "../constants/associationConstants";
import {alertActions} from "./alert.actions";
import {associationService} from "../services/association.services"


export const associationActions ={

    createAssociation,
    deleteAssociation,
    /*updateAssociation,*/
    getAssociationById,
    openModal,
    closeModal,
    openDeleteAssociationModal,
    closeDeleteAssociationModal,
    clearAssociation,
    getAllAssociations,
    closeOperationSuccessModal,
    closeOperationFailedModal

};

function  getAssociationById(associationId,user){
    return dispatch => {
        dispatch (request({associationId,user}));
        associationService.getAssociationById(associationId,user)
            .then(
                retrievedAssociation => {
                    dispatch(success({retrievedAssociation}));
                    dispatch(alertActions.success("All user TopicMaps found."))
                },
                error => {
                    dispatch(failure({error}));
                    dispatch(alertActions.error(error));
                }
            )
    };
    function request(user) {return {type: associationConstants.GET_ASSOCIATION_BY_ID_REQUEST, user}}
    function success(retrievedAssociation){return {type: associationConstants.GET_ASSOCIATION_BY_ID_SUCCESS, retrievedAssociation}}
    function failure(error){return {type: associationConstants.GET_ASSOCIATION_BY_ID_FAILURE, error}}
}

function  getAllAssociations(user){
    return dispatch => {
        dispatch (request({user}));
        associationService.getAllAssociations(user)
            .then(
                associations => {
                    dispatch(success({associations}));
                    dispatch(alertActions.success("All user Associations found."))
                },
                error => {
                    dispatch(failure({error}));
                    dispatch(alertActions.error(error));
                }
            )
    };
    function request(user) {return {type: associationConstants.GET_ALL_ASSOCIATIONS_REQUEST, user}}
    function success(associations){return {type: associationConstants.GET_ALL_ASSOCIATIONS_SUCCESS, associations}}
    function failure(error){return {type: associationConstants.GET_ALL_ASSOCIATIONS_FAILURE, error}}
}

function createAssociation(association, user){
    return dispatch => {
        dispatch (request({association}));
        associationService.createAssociation(association, user)
            .then(
                newAssociationId => {
                    dispatch(success({newAssociationId}));
                    dispatch(alertActions.success('association created'))
                },
                error => {
                    dispatch(failure({error}));
                    dispatch(alertActions.error(error));
                }
            )
    };
    function request(association) {return {type: associationConstants.CREATE_ASSOCIATION_REQUEST, association}}
    function success(newAssociationId){return {type: associationConstants.CREATE_ASSOCIATION_SUCCESS, newAssociationId}}
    function failure(error){return {type: associationConstants.CREATE_ASSOCIATION_FAILURE, error}}
}


function deleteAssociation(associationToDelete, user){
    return dispatch => {
        dispatch (request({associationToDelete}));
        associationService.deleteAssociation(associationToDelete, user)
            .then(
                message => {
                    dispatch(success({message}, {associationToDelete}));
                    dispatch(alertActions.success(message));
                },
                error => {
                    dispatch(failure({error}));
                    dispatch(alertActions.error(error));
                }
            )
    };
    function request(associationToDelete) {return {type: associationConstants.DELETE_ASSOCIATION_REQUEST, associationToDelete}}
    function success(message, associationToDelete){return {type: associationConstants.DELETE_ASSOCIATION_SUCCESS, message, associationToDelete}}
    function failure(error){return {type: associationConstants.DELETE_ASSOCIATION_FAILURE, error}}
}


function openModal() {
    return dispatch => {
        dispatch(request())
    };

    function request(){return {type: associationConstants.OPEN_ASSOCIATION_MODAL_REQUEST}}
}

function closeModal() {
    return dispatch => {
        dispatch(request())
    };

    function request(){return {type: associationConstants.CLOSE_ASSOCIATION_MODAL_REQUEST}}
}


function clearAssociation(){
    return dispatch => {
        dispatch(request())
    };

    function request(){return {type: associationConstants.CLEAR_ASSOCIATION}}
}
function openDeleteAssociationModal(associationIdToDelete) {
    return dispatch => {
        dispatch(request({associationIdToDelete}))
    };

    function request(associationIdToDelete){return {type: associationConstants.OPEN_ASSOCIATION_DELETE_MODAL_REQUEST, associationIdToDelete}}
}

function closeDeleteAssociationModal() {
    return dispatch => {
        dispatch(request())
    };

    function request(){return {type: associationConstants.CLOSE_ASSOCIATION_DELETE_MODAL_REQUEST}}
}
function closeOperationSuccessModal(){
    return dispatch => {
        dispatch (request({}));
    };

    function request() {return {type: associationConstants.CLOSE_OPERATION_SUCCESS_MODAL}}
}
function closeOperationFailedModal(){
    return dispatch => {
        dispatch (request({}));
    };

    function request() {return {type: associationConstants.CLOSE_OPERATION_FAILED_MODAL}}
}