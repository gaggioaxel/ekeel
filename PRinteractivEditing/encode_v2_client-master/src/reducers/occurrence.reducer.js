import {occurrenceConstants} from "../constants/occurrenceConstants";

const initialState = {
    searchingOccurrence: false,
    occurrences: [],
    newOccurrence: null,
    occurrenceToUpdate: null,
    deleting: false,
    deleted: false,
    saving: false,
    isOpenDeleteOccConfirm: false,
    isOpenDeleteAllOccConfirm: false,
    operationSuccess: false,
    operationFailed: false,
};

export function occurrence(state = initialState, action) {
    switch (action.type) {
        case occurrenceConstants.GET_ALL_OCCURRENCES_REQUEST:
            return{
                ...state,
                searchingOccurrence: true
            };
        case occurrenceConstants.GET_ALL_OCCURRENCES_SUCCESS:
            return{
                ...state,
                searchingOccurrence:false,
                occurrences: action.occurrence.occurrence
            };
        case occurrenceConstants.GET_ALL_OCCURRENCES_FAILURE:
            return{
                ...state,
                searchingOccurrence:false,
            };
        case occurrenceConstants.ADD_OCCURRENCE_REQUEST:
            let newOccurrence = Object.assign({id: undefined, name: "", dataReference: "", dataValue:"", topicId: action.topicId.topicId, occurrenceTypeId:undefined});
            return{
              ...state,
                occurrences:  (state.occurrences || []).concat(newOccurrence),
            };
        case occurrenceConstants.REMOVE_OCCURRENCE_REQUEST:
            let occurrences = [].concat(state.occurrences);
            occurrences.pop();
            return{
                ...state,
                occurrences: occurrences
            };
        case occurrenceConstants.REMOVE_FILE:
            return{
                ...state,
                occurrences: state.occurrences.map((occ, i) => (i === action.index ? { ...occ, occurrenceFiles: Array.from(occ.occurrenceFiles).filter((file) =>file.name !== action.fileName )} : occ))
            };
        case occurrenceConstants.SAVE_OCCURRENCE_REQUEST:
        case occurrenceConstants.CREATE_OCCURRENCE_REQUEST:
            return{
                ...state,
                saving: true
            };
        case occurrenceConstants.SAVE_OCCURRENCE_SUCCESS:
        case occurrenceConstants.CREATE_OCCURRENCE_SUCCESS:
            return{
                ...state,
                saving:false,
                operationSuccess: true,
                occurrences: state.occurrences.map((occ) =>(occ.id === undefined ? {...occ, id:action.occurrenceId.occurrenceId} : occ))
            };
        case occurrenceConstants.SAVE_OCCURRENCE_FAILURE:
        case occurrenceConstants.CREATE_OCCURRENCE_FAILURE:
            return{
                ...state,
                saving: false,
                operationFailed: true
            };
        case occurrenceConstants.CLOSE_OPERATION_SUCCESS_MODAL:
            return{
                ...state,
                operationSuccess: false
            };
        case occurrenceConstants.CLOSE_OPERATION_FAILED_MODAL:
            return{
                ...state,
                operationFailed: false,
            };
        case occurrenceConstants.UPDATE_OCCURRENCE_REQUEST:
            return{

            };
        case occurrenceConstants.UPDATE_OCCURRENCE_SUCCESS:
            return{

            };
        case occurrenceConstants.UPDATE_OCCURRENCE_FAILURE:
            return{

            };
        case occurrenceConstants.DELETE_OCCURRENCE_REQUEST:
            return{
                ...state,
                deleting: true
            };
        case occurrenceConstants.DELETE_OCCURRENCE_SUCCESS:
            return{
                ...state,
                deleting: false,
                isOpenDeleteOccConfirm: false,
                operationSuccess: true,
                occurrences: state.occurrences.filter((occ) =>(occ.id !== action.occurrenceId.occurrenceId))
            };
        case occurrenceConstants.DELETE_OCCURRENCE_FAILURE:
            return{
                ...state,
                deleting: false,
                isOpenDeleteOccConfirm: false,
                operationFailed: true
            };
        case occurrenceConstants.OPEN_OCCURRENCE_DELETE_CONFIRM:
            return{
                ...state,
                isOpenDeleteOccConfirm: true,
                occurrenceToDelete: action.occurrenceId.occurrenceId
            };
        case occurrenceConstants.OPEN_ALL_OCCURRENCE_DELETE_CONFIRM:
            return{
                ...state,
                isOpenDeleteAllOccConfirm: true,
            };
        case occurrenceConstants.SAVE_ALL_OCCURRENCES_REQUEST:
            return{
                ...state,
                saving: true
            };
        case occurrenceConstants.SAVE_ALL_OCCURRENCES_SUCCESS:
        case occurrenceConstants.SAVE_ALL_OCCURRENCES_FAILURE:
            return{
                ...state,
                saving:false
            };
        case occurrenceConstants.CLOSE_OCCURRENCE_DELETE_CONFIRM:
            return{
                ...state,
                isOpenDeleteOccConfirm: false,
                occurrenceToDelete: null
            };
        case occurrenceConstants.CLOSE_ALL_OCCURRENCE_DELETE_CONFIRM:
            return{
                ...state,
                isOpenDeleteAllOccConfirm: false,
            };
        case occurrenceConstants.UPDATE_OCCURRENCE_FIELD:
            return{
                ...state,
                //newOccurrence: {...state.newOccurrence, [action.key]: action.value}
                occurrences: state.occurrences.map((occ, i) =>(i === action.index ? {...occ, [action.key]:action.value} : occ))
            };
        case occurrenceConstants.UPDATE_SCOPED_OCCURRENCE:
            return{
                ...state,
               occurrences: state.occurrences.map((occ) => (occ.id === action.occurrenceId ? { ...occ, scopeOfOccurrence: occ.scopeOfOccurrence.map((scope, i) =>(i === action.index ? {...scope, [action.key]:action.value }: scope) ) } : occ))
            };
        case occurrenceConstants.DELETE_SCOPED_OCCURRENCE:
            return{
                ...state,
                occurrences: state.occurrences.map((occ) => (occ.id === action.occurrenceId ? { ...occ, ...occ.scopeOfOccurrence.splice(action.index, 1)} : occ))
            };
        case occurrenceConstants.UPDATE_ID_OF_SCOPED_OCCURRENCE:
        return {
          ...state,
            occurrences: state.occurrences.map((occ) => (occ.id === action.occurrenceId ? { ...occ, scopeOfOccurrence: occ.scopeOfOccurrence.map((scope, i) =>(i === action.index ? {...scope, id:{...scope.id, [action.key]:action.value }}: scope) ) } : occ))
        };
        case occurrenceConstants.ADD_SCOPED_CONTENT:
            let scopeOfOccurrence = Object.assign({
                id: {
                    occurrenceId: action.occurrenceId.occurrenceId,
                    scopeName: ""
                } ,
                content:""
            });
            return{
                ...state,
                occurrences: state.occurrences.map((occ, i) => (occ.id === action.occurrenceId.occurrenceId ? {...occ, scopeOfOccurrence: (occ.scopeOfOccurrence || []).concat(scopeOfOccurrence)} : occ ))
            };
        default:
            return state;
    }
}