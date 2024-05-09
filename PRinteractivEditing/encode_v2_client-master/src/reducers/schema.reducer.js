import {schemaConstants} from "../constants/schemaConstants";


const initialState= {
    searching: false,
    schemas: null,
    schema: null,
    deleting: false,
    updating: false,
    creating: false,
    isOpenSchemaModal: false,
    isOpenDeleteSchemaModal: false,
    isOpenSchemaDetailsModal: false,
    schemaIdToDelete: "",
    newSchema: null,
    schemaToUpdate: null,
    selectedSchema: undefined,
    updatingSchema: false,
    operationSuccessSchema: false,
    operationFailedSchema: false,
};

export function schema(state = initialState, action) {
    switch(action.type){
        case schemaConstants.UPDATE_SCHEMA_MODAL_FIELDS:
            return{
                ...state,
                newSchema: {...state.newSchema, [action.key]: action.value},
                schemaToUpdate: {...state.schemaToUpdate, [action.key]: action.value}
            };
        case schemaConstants.GET_ALL_SCHEMAS_REQUEST:
            return{
                ...state,
                searching: true,
            };
        case schemaConstants.GET_ALL_SCHEMAS_SUCCESS:
            return{
                ...state,
                searching:false,
                schemas: action.schemas.schemas,
            };
        case schemaConstants.GET_ALL_SCHEMAS_FAILURE:
            return{
                ...state,
                searching:false,
            };
        case schemaConstants.CREATE_SCHEMA_REQUEST:
            return{
                ...state,
                creating:true,
            };
        case schemaConstants.CREATE_SCHEMA_FAILURE:
            return{
                ...state,
                creating:false,
                operationFailedSchema: true,
            };
        case schemaConstants.CREATE_SCHEMA_SUCCESS:
            return{
                ...state,
                creating:false,
                schemas: (state.schemas || []).concat(action.newSchema.newSchema),
                operationSuccessSchema: true
            };
        case schemaConstants.DELETE_SCHEMA_REQUEST:
            return{
                ...state,
                deleting:true,
            };
        case schemaConstants.DELETE_SCHEMA_FAILURE:
            return{
                ...state,
                deleting:false,
                operationFailedSchema: true,
            };
        case schemaConstants.DELETE_SCHEMA_SUCCESS:
            return{
                ...state,
                deleting:false,
                operationSuccessSchema: true
            };
        case schemaConstants.OPEN_SCHEMA_CREATE_MODAL_REQUEST:
            let newBlankSchema= Object.assign({id: undefined, name:'', description: ''})

            return{
                ...state,
                isOpenSchemaModal: true,
                newSchema: newBlankSchema
            };
        case schemaConstants.CLOSE_SCHEMA_CREATE_MODAL_REQUEST:
            return{
                ...state,
                isOpenSchemaModal: false
            };
        case schemaConstants.OPEN_SCHEMA_DELETE_MODAL_REQUEST:
            return{
                ...state,
                isOpenDeleteSchemaModal: true,
                schemaIdToDelete: action.schemaIdToDelete.schemaIdToDelete
            };
        case schemaConstants.CLOSE_SCHEMA_DELETE_MODAL_REQUEST:
            return{
                ...state,
                isOpenDeleteSchemaModal: false
            };
        case schemaConstants.OPEN_SCHEMA_DETAILS_MODAL_REQUEST:
            return{
                ...state,
                isOpenSchemaDetailsModal: true,
                schemaToUpdate: action.schemaToUpdate.schemaToUpdate
            };
        case schemaConstants.CLOSE_SCHEMA_DETAILS_MODAL_REQUEST:
            return{
                ...state,
                isOpenSchemaDetailsModal: false
            };
        case schemaConstants.UPDATE_SCHEMA_REQUEST:
            return{
                ...state,
                updating: true,
                schemaToUpdate: action.schemaToUpdate.schemaToUpdate
            };
        case schemaConstants.UPDATE_SCHEMA_SUCCESS:
            return{
                ...state,
                updating: false,
                operationSuccessSchema: true
            };
        case schemaConstants.UPDATE_SCHEMA_FAILURE:
            return{
                ...state,
                updating:false,
                operationFailedSchema: true,
            };
        case schemaConstants.SELECT_SCHEMA:
            return{
                ...state,
                selectedSchema: action.selectedSchema
            };
        case schemaConstants.UPDATE_SELECTED_SCHEMA_REQUEST:
            return{
                ...state,
                updatingSchema: true
            };
        case schemaConstants.UPDATE_SELECTED_SCHEMA_SUCCESS:
            return {
                ...state,
                updatingSchema: false,
                selectedSchema: action.schema.schema,

            };
        case schemaConstants.UPDATE_SELECTED_SCHEMA_FAILURE:
            return{
                ...state,
                updatingSchema: false,

            };
        case schemaConstants.GET_SCHEMA_REQUEST:
            return{
                ...state
            };
        case schemaConstants.GET_SCHEMA_SUCCESS:
            return{
                //schema: action.schema.schema,
                ...state,
                selectedSchema: action.schema.schema,
            };
        case schemaConstants.CLOSE_OPERATION_SUCCESS_MODAL:
            return{
                ...state,
                operationSuccessSchema: false
            };

        case schemaConstants.CLOSE_OPERATION_FAILED_MODAL:
            return{
                ...state,
                operationFailedSchema: false
            };

        default:
            return state;
    }
}