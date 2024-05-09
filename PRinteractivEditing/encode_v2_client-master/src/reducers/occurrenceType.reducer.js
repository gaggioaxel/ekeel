import {occurrenceTypeConstants} from "../constants/occurrenceTypeConstants";

const initialState = {
    searchingOccurrenceType: false,
    occurrenceTypes: [],
    newOccurrenceId: null,
    newOccurrenceTypesIds: null,
    newOccurrenceType: null,
    occurrenceTypeToUpdate: null,
    deletingOccType: false,
    deletedOccType: false,
    savingOccType: false,
    isOpenOccurrenceTypesModal: false,
    operationFailedOccType: false,
    operationSuccessOccType: false,
    isOpenDeleteOccTypeConfirm: false,
    occurrenceTypeToDelete: null
};

export function occurrenceType(state = initialState, action) {
    switch (action.type) {
        case occurrenceTypeConstants.GET_ALL_OCCURRENCE_TYPE_REQUEST:
            return{
                ...state,
                searchingOccurrenceType: true
            };
        case occurrenceTypeConstants.GET_ALL_OCCURRENCE_TYPE_SUCCESS:
            return{
                ...state,
                searchingOccurrenceType:false,
                occurrenceTypes: action.occurrenceType.occurrenceTypes
            };
        case occurrenceTypeConstants.GET_ALL_OCCURRENCE_TYPE_FAILURE:
            return{
                ...state,
                searchingOccurrenceType:false,
            };
        case occurrenceTypeConstants.CREATE_OCCURRENCE_TYPE_REQUEST:
            return{
                ...state,
                savingOccType: true
            };
        case occurrenceTypeConstants.SAVE_ALL_OCCURRENCE_TYPE_REQUEST:
            return{
                ...state,
                savingOccType: true
            };
        case occurrenceTypeConstants.CREATE_OCCURRENCE_TYPE_SUCCESS:
            return{
                ...state,
                savingOccType: false,
                operationSuccessOccType: true,
                occurrenceTypes:  state.occurrenceTypes.map((occurrenceType,i)=>(occurrenceType.id === undefined && occurrenceType.name === action.newOccurrenceType.newOccurrenceType.name && occurrenceType.description === action.newOccurrenceType.newOccurrenceType.description ? {...occurrenceType, id: action.newOccurrenceType.newOccurrenceType.id }:occurrenceType))
            }

        case occurrenceTypeConstants.SAVE_ALL_OCCURRENCE_TYPE_SUCCESS:
            let idsWithBlanks=action.newOccurrenceTypesIds.newOccurrenceTypesIds;
            return{
                ...state,
                savingOccType: false,
                operationSuccessOccType: true,
                occurrenceTypes:  state.occurrenceTypes.map((occurrenceType,i)=>(occurrenceType.id === undefined && occurrenceType.name !== '' && occurrenceType.description !== '' ? {...occurrenceType, id: idsWithBlanks.shift() }:occurrenceType))
            };
        case occurrenceTypeConstants.CREATE_OCCURRENCE_TYPE_FAILURE:
            return{
                ...state,
                savingOccType: false,
                operationFailedOccType: true
            };
        case occurrenceTypeConstants.SAVE_ALL_OCCURRENCE_TYPE_FAILURE:
            return{
                ...state,
                savingOccType: false,
                operationFailedOccType: true
            };
        case occurrenceTypeConstants.DELETE_OCCURRENCE_TYPE_REQUEST:
            return{
                ...state,
                deletingOccType: true,
            };
        case occurrenceTypeConstants.DELETE_OCCURRENCE_TYPE_SUCCESS:
            return{
                ...state,
                deletingOccType: false,
                operationSuccessOccType: true,
                isOpenDeleteOccTypeConfirm: false,
                occurrenceTypes: state.occurrenceTypes.filter((occ) => occ.id !== action.occurrenceTypeToDelete.occurrenceTypeToDelete )
            };
        case occurrenceTypeConstants.DELETE_OCCURRENCE_TYPE_FAILURE:
            return{
                ...state,
                deletingOccType: false,
                operationFailedOccType: true,
                isOpenDeleteOccTypeConfirm: false,
            };
        case occurrenceTypeConstants.UPDATE_OCCURRENCE_TYPE_FIELD:
            return{
                ...state,
                //newOccurrence: {...state.newOccurrence, [action.key]: action.value}
                occurrenceTypes: state.occurrenceTypes.map((type, i) =>( i === action.index ? {...type, [action.key]:action.value} : type))
            };
        case occurrenceTypeConstants.ADD_OCCURRENCE_TYPE_REQUEST:
            let newOccurrenceType = Object.assign({id: undefined ,name: "", description: "",schemaId: undefined});
            return{
                ...state,
                occurrenceTypes:  (state.occurrenceTypes || []).concat(newOccurrenceType),
            };
        case occurrenceTypeConstants.REMOVE_OCCURRENCE_TYPE_REQUEST:

            return{
                ...state,
                occurrenceTypes: state.occurrenceTypes.filter((occ) => occ.id !== undefined )
            };
        case occurrenceTypeConstants.OPEN_OCCURRENCE_TYPE_MODAL_REQUEST:
            return{
                ...state,
                isOpenOccurrenceTypesModal: true,
            };
        case occurrenceTypeConstants.CLOSE_OCCURRENCE_TYPE_MODAL_REQUEST:
            return{
                ...state,
                isOpenOccurrenceTypesModal: false
            };
        case occurrenceTypeConstants.CLOSE_OPERATION_SUCCESS_MODAL:
            return{
                ...state,
                operationSuccessOccType: false
            };
        case occurrenceTypeConstants.CLOSE_OPERATION_FAILED_MODAL:
            return{
                ...state,
                operationFailedOccType: false,
            };
        case occurrenceTypeConstants.OPEN_OCCURRENCE_TYPES_DELETE_CONFIRM:
            return{
                ...state,
                isOpenDeleteOccTypeConfirm: true,
                occurrenceTypeToDelete: action.occurrenceTypeId
            };
        case occurrenceTypeConstants.CLOSE_OCCURRENCE_TYPES_DELETE_CONFIRM:
            return{
                ...state,
                isOpenDeleteOccTypeConfirm: false,
                occurrenceTypeToDelete: null
            };
        default:
            return state;
    }
}