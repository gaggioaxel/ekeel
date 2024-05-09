import {schemaService} from '../services/schema.services';
import {alertActions} from "./alert.actions";
import {schemaConstants} from "../constants/schemaConstants";


export const schemaActions = {
    getAllUserSchemas,
    getSchemaById,
    createSchema,
    updateSchema,
    deleteSchema,
    openModal,
    closeModal,
    openDeleteModal,
    closeDeleteModal,
    openDetailsModal,
    closeDetailsModal,
    selectSchema,
    updateSelectedSchema,
    closeOperationSuccessModal,
    closeOperationFailedModal
};

function getAllUserSchemas(user){
    return dispatch => {
        dispatch (request({user}));
        schemaService.getAllByUser(user)
            .then(
                schemas => {
                    dispatch(success({schemas}));
                    dispatch(alertActions.success("All user Schemas found."))
                },
                error => {
                    dispatch(failure({error}));
                    dispatch(alertActions.error(error));
                }
            )
    };
    function request(user) {return {type: schemaConstants.GET_ALL_SCHEMAS_REQUEST, user}}
    function success(schemas){return {type: schemaConstants.GET_ALL_SCHEMAS_SUCCESS, schemas}}
    function failure(error){return {type: schemaConstants.GET_ALL_SCHEMAS_FAILURE, error}}
}

function getSchemaById(schemaId, user){
    return dispatch => {
        dispatch (request({user, schemaId}));
        schemaService.getById(user, schemaId)
            .then(
                schema => {
                    dispatch(success({schema, schemaId}));
                    dispatch(alertActions.success("Schema with id :" + schemaId + " found."))
                },
                error => {
                    dispatch(failure({error}));
                    dispatch(alertActions.error(error));
                }
            )
    };

    function request(user, schemaId) {return {type: schemaConstants.GET_SCHEMA_REQUEST, user, schemaId}}
    function success(schema, schemaId){return {type: schemaConstants.GET_SCHEMA_SUCCESS, schema, schemaId}}
    function failure(error){return {type: schemaConstants.GET_SCHEMA_FAILURE, error}}
}

function createSchema(newSchema, user){
    return dispatch => {
        dispatch(request({newSchema, user}));
        schemaService.createSchema(newSchema, user)
            .then(
                newSchema =>{
                    dispatch(success({newSchema}));
                    dispatch(alertActions.success('message'));
                },
                error =>{
                    dispatch(failure({error}));
                    dispatch(alertActions.error(error));
                }
            )
    };

    function request(newSchema, user){return {type: schemaConstants.CREATE_SCHEMA_REQUEST, newSchema, user}}
    function success(newSchema){return {type: schemaConstants.CREATE_SCHEMA_SUCCESS, newSchema}}
    function failure(error){return {type: schemaConstants.CREATE_SCHEMA_FAILURE, error}}
}

function updateSchema(schemaToUpdate, user){
    return dispatch => {
        dispatch(request({schemaToUpdate, user}));
        schemaService.updateSchema(schemaToUpdate, user)
            .then(
                message =>{
                    dispatch(success({message}));
                    dispatch(alertActions.success(message));
                    dispatch(schemaActions.getAllUserSchemas(user));
                },
                error =>{
                    dispatch(failure({error}));
                    dispatch(alertActions.error(error));
                }
            )
    };

    function request(schemaToUpdate, user){return {type: schemaConstants.UPDATE_SCHEMA_REQUEST, schemaToUpdate, user}}
    function success(message){return {type: schemaConstants.UPDATE_SCHEMA_SUCCESS, message}}
    function failure(error){return {type: schemaConstants.UPDATE_SCHEMA_FAILURE, error}}
}

function deleteSchema(schemaId, user){
    return dispatch => {
        dispatch(request({schemaId, user}));
        schemaService.deleteSchema(schemaId, user)
            .then(
                message =>{
                    dispatch(success({message}));
                    dispatch(alertActions.success(message));
                    dispatch(schemaActions.getAllUserSchemas(user))
                },
                error =>{
                    dispatch(failure({error}));
                    dispatch(alertActions.error(error));
                }
            )
    };

    function request(schemaId, user){return {type: schemaConstants.DELETE_SCHEMA_REQUEST, schemaId, user}}
    function success(message){return {type: schemaConstants.DELETE_SCHEMA_SUCCESS, message}}
    function failure(error){return {type: schemaConstants.DELETE_SCHEMA_FAILURE, error}}
}

function openModal() {
    return dispatch => {
        dispatch(request())
    };

    function request(){return {type: schemaConstants.OPEN_SCHEMA_CREATE_MODAL_REQUEST}}
}

function closeModal() {
    return dispatch => {
        dispatch(request())
    };

    function request(){return {type: schemaConstants.CLOSE_SCHEMA_CREATE_MODAL_REQUEST}}
}

function openDeleteModal(schemaIdToDelete) {
    return dispatch => {
        dispatch(request({schemaIdToDelete}))
    };

    function request(schemaIdToDelete){return {type: schemaConstants.OPEN_SCHEMA_DELETE_MODAL_REQUEST, schemaIdToDelete}}
}

function closeDeleteModal() {
    return dispatch => {
        dispatch(request())
    };

    function request(){return {type: schemaConstants.CLOSE_SCHEMA_DELETE_MODAL_REQUEST}}
}

function openDetailsModal(schemaToUpdate) {
    return dispatch => {
        dispatch(request({schemaToUpdate}))
    };

    function request(schemaToUpdate){return {type: schemaConstants.OPEN_SCHEMA_DETAILS_MODAL_REQUEST, schemaToUpdate}}
}

function closeDetailsModal() {
    return dispatch => {
        dispatch(request())
    };

    function request(){return {type: schemaConstants.CLOSE_SCHEMA_DETAILS_MODAL_REQUEST}}
}

function selectSchema(selectedSchema){
    return dispatch => {
        dispatch(request(selectedSchema))
    };

    function request(selectedSchema){return {type: schemaConstants.SELECT_SCHEMA,selectedSchema}}
}

function closeOperationSuccessModal(){
    return dispatch => {
        dispatch (request({}));
    };

    function request() {return {type: schemaConstants.CLOSE_OPERATION_SUCCESS_MODAL}}
}
function closeOperationFailedModal(){
    return dispatch => {
        dispatch (request({}));
    };

    function request() {return {type: schemaConstants.CLOSE_OPERATION_FAILED_MODAL}}
}

function updateSelectedSchema(user, newSchema){
    return dispatch => {
        const schemaId = newSchema.schemaId;
        dispatch (request({user, schemaId}));
        schemaService.getById(user, schemaId)
            .then(
                schema => {
                    dispatch(success({schema, schemaId}));
                    dispatch(alertActions.success("Schema with id :" + schemaId + " found."))
                },
                error => {

                    dispatch(failure({error}));
                    dispatch(alertActions.error(error));
                }
            )
    };

    function request(user, schemaId) {return {type: schemaConstants.UPDATE_SELECTED_SCHEMA_REQUEST, user, schemaId}}
    function success(schema, schemaId){return {type: schemaConstants.UPDATE_SELECTED_SCHEMA_SUCCESS, schema, schemaId}}
    function failure(error){return {type: schemaConstants.UPDATE_SELECTED_SCHEMA_FAILURE, error}}
}