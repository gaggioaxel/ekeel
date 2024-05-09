import {scopeConstants} from "../constants/scopeConstants";

const initialState = {
    scopes: [],
    newScope: null,
    scopeToUpdate: null,
    deletingScope: false,
    updatingScope: false,
    savingScope: false,
    isOpenDeleteScopeConfirm: false,
    isOpenScopesModal: false,
    operationFailedScope: false,
    operationSuccessScope: false
};

export function scope(state = initialState, action) {
    switch (action.type) {
        case scopeConstants.GET_ALL_SCOPES_REQUEST:
            return{
                ...state,
                searchingScope: true
            };
        case scopeConstants.GET_ALL_SCOPES_SUCCESS:
            return{
                ...state,
                searchingScope:false,
                scopes: action.scopes.scopes
            };
        case scopeConstants.GET_ALL_SCOPES_FAILURE:
            return{
                ...state,
                searchingScope:false,
            };
        case scopeConstants.ADD_SCOPE_REQUEST:
            let newScope = Object.assign({id:undefined,name: "", description: "",schemaId:undefined});
            return{
                ...state,
                scopes:  (state.scopes || []).concat(newScope),
            };
        case scopeConstants.REMOVE_SCOPE_REQUEST:
            let scopes = [].concat(state.scopes);
            scopes.pop();
            return{
                ...state,
                scopes: scopes
            };

        case scopeConstants.UPDATE_SCOPE_REQUEST:
            return{
                updatingScope: true,
                ...state
            };
        case scopeConstants.UPDATE_SCOPE_SUCCESS:
            return{
                ...state,
                updatingScope: false
            };
        case scopeConstants.UPDATE_SCOPE_FAILURE:
            return{
                ...state,
                updatingScope: false
            };
        case scopeConstants.DELETE_SCOPE_REQUEST:
            return{
                ...state,
                deletingScope: true,
                scopeToDelete: action.scopeToDelete.scopeToDelete
            };
        case scopeConstants.DELETE_SCOPE_SUCCESS:
            return {
                ...state,
                deletingScope:false,
                operationSuccessScope: true,
                isOpenDeleteScopeConfirm: false,
                scopes: state.scopes.filter((scope) => scope.id !== action.scopeToDelete.scopeToDelete )
        };
        case scopeConstants.DELETE_SCOPE_FAILURE:
            return{
                ...state,
                deletingScope:false,
                operationFailedScope: true,
                isOpenDeleteScopeConfirm: false
            };
        case scopeConstants.OPEN_SCOPE_DELETE_CONFIRM:
            return{
                ...state,
                isOpenDeleteScopeConfirm: true,
                scopeToDelete: action.scopeId.scopeId
            };
        case scopeConstants.SAVE_SCOPE_REQUEST:
            return{
                ...state,
                savingScope: true
            };
        case scopeConstants.SAVE_ALL_SCOPES_REQUEST:
            return{
                ...state,
                savingScope: true
            };
        case scopeConstants.SAVE_SCOPE_SUCCESS:
            return{
                ...state,
                savingScope: false,
                operationSuccessScope: true,
                scopes: state.scopes.map((scope, i)=>(scope.id === undefined && scope.name === action.newScope.newScope.name && scope.description === action.newScope.newScope.description ? {...scope, id: action.newScope.newScope.id }:scope))
            }
        case scopeConstants.SAVE_ALL_SCOPES_SUCCESS:
            let idsWithBlanks=action.newScopesIds.newScopesIds;

            return{
                ...state,
                savingScope:false,
                operationSuccessScope: true,
                scopes:   state.scopes.map((scope,i)=>(scope.id === undefined && scope.name !== '' && scope.description !== '' ? {...scope, id: idsWithBlanks.shift() }:scope))

            };
        case scopeConstants.SAVE_SCOPE_FAILURE:
            return{
                ...state,
                savingScope: false,
                operationFailedScope: true,
            }
        case scopeConstants.SAVE_ALL_SCOPES_FAILURE:
            return{
                ...state,
                savingScope:false,
                operationFailedScope: true
            };
        case scopeConstants.CLOSE_SCOPE_DELETE_CONFIRM:
            return{
                ...state,
                isOpenDeleteScopeConfirm: false,
                scopeToDelete: null
            };
        case scopeConstants.UPDATE_SCOPE_FIELD:
            return{
                ...state,
                //newOccurrence: {...state.newOccurrence, [action.key]: action.value}
                scopes: state.scopes.map((scope, i) =>( i === action.index ? {...scope, [action.key]:action.value} : scope))
            };
        case scopeConstants.OPEN_SCOPES_MODAL_REQUEST:
            return{
                ...state,
                isOpenScopesModal: true,
            };
        case scopeConstants.CLOSE_SCOPES_MODAL_REQUEST:
            return{
                ...state,
                isOpenScopesModal: false
            };
        case scopeConstants.CLOSE_OPERATION_SUCCESS_MODAL:
            return{
                ...state,
                operationSuccessScope: false
            };
        case scopeConstants.CLOSE_OPERATION_FAILED_MODAL:
            return{
                ...state,
                operationFailedScope: false,
            };
        case scopeConstants.CLEAR_NOT_SAVED_SCOPES:
            return{
                ...state,

            };
        default:
            return state;
    }
}