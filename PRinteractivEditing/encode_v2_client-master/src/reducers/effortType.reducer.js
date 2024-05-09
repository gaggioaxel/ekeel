import {effortTypeConstants} from "../constants/effortTypeConstants";

const initialState = {
    searchingEffortType: false,
    effortTypes: [],
    newEffortTypeId: null,
    newEffortTypesIds: null,
    newEffortType: null,
    effortTypesToUpdate: null,
    deletingEffType: false,
    deletedEffType: false,
    savingEffType: false,
    isOpenEffortTypesModal: false,
    operationFailedEffType: false,
    operationSuccessEffType: false,
    isOpenDeleteEffTypeConfirm: false,
    effortTypesToDelete: null
};

export  function effortType (state = initialState, action) {
    switch (action.type) {

        case effortTypeConstants.UPDATE_EFFORT_TYPE_MODAL_FIELDS:
            return{
                ...state,
                effortTypes: state.effortTypes.map((type, i) =>( i === action.index ? {...type, [action.key]:action.value} : type))
            };

        case effortTypeConstants.GET_ALL_EFFORT_TYPES_REQUEST:
            return{
                ...state,
                searchingEffortType: true,
            };
        case effortTypeConstants.GET_ALL_EFFORT_TYPES_SUCCESS:
            return{
                ...state,
                searchingEffortType: false,
                effortTypes: action.effortTypes.effortTypes
            };
        case effortTypeConstants.GET_ALL_EFFORT_TYPES_FAILURE:
            return{
                ...state,
                searchingEffortType: false,
            };

        case effortTypeConstants.CREATE_EFFORT_TYPE_REQUEST:
            return {
                ...state,
                savingEffType: true
            }
        case effortTypeConstants.CREATE_EFFORT_TYPE_SUCCESS:
            return {
                ...state,
                savingEffType: false,
                operationSuccessEffType: true,
                effortTypes: state.effortTypes.map((effortType)=>(effortType.id === undefined && effortType.metricType === action.newEffortType.newEffortType.metricType && effortType.description ===  action.newEffortType.newEffortType.description ? {...effortType, id:  action.newEffortType.newEffortType.id} : effortType))
            }
        case effortTypeConstants.CREATE_EFFORT_TYPE_FAILURE:
            return {
                ...state,
                savingEffType: false,
                operationFailedEffType: true,
            }

        case effortTypeConstants.SAVE_ALL_EFFORT_TYPE_REQUEST:
            return{
                ...state,
                savingEffType: true,
            };
        case effortTypeConstants.SAVE_ALL_EFFORT_TYPE_SUCCESS:
            let idsWithBlanks = action.newEffortTypesIds.newEffortTypesIds
            return{
                ...state,
                savingEffType: true,
                operationSuccessEffType: true,
                effortTypes: state.effortTypes.map((effortType)=>effortType.id === undefined && effortType.metricType !== '' && effortType.description !== '' ? {...effortType, id: idsWithBlanks.shift()} : effortType)
            };
        case effortTypeConstants.SAVE_ALL_EFFORT_TYPE_FAILURE:
            return{
                ...state,
                savingEffType: true,
                operationFailedOccType: true
            };

        case effortTypeConstants.DELETE_EFFORT_TYPE_REQUEST:
            return{
                ...state,
                deletingEffType: true,
            };
        case effortTypeConstants.DELETE_EFFORT_TYPE_SUCCESS:
            return{
                ...state,
                deletingEffType: false,
                operationSuccessEffType: true,
                isOpenDeleteEffTypeConfirm: false,
                effortTypes: state.effortTypes.filter((eff) => eff.id !== action.effortTypeToDelete.effortTypeToDelete )
            };
        case effortTypeConstants.DELETE_EFFORT_TYPE_FAILURE:
            return{
                ...state,
                deletingEffType: false,
                operationFailedEffType: true,
                isOpenDeleteEffTypeConfirm: false,
            };

        case effortTypeConstants.UPDATE_EFFORT_TYPE_REQUEST:
        case effortTypeConstants.UPDATE_EFFORT_TYPE_SUCCESS:
        case effortTypeConstants.UPDATE_EFFORT_TYPE_FAILURE:

        case effortTypeConstants.ADD_EFFORT_TYPE_REQUEST:
            let newEffortType = Object.assign({id:undefined, metricType:'', description:''})
            return{
                ...state,
                effortTypes:  (state.effortTypes || []).concat(newEffortType),
            };
        case effortTypeConstants.REMOVE_EFFORT_TYPE_REQUEST:
            return{
                ...state,
                effortTypes: state.effortTypes.filter((topicType) => topicType.id !== undefined)
            };

        case effortTypeConstants.OPEN_EFFORT_TYPE_MODAL_REQUEST:
            return{
                ...state,
                isOpenEffortTypesModal: true
            };
        case effortTypeConstants.CLOSE_EFFORT_TYPE_MODAL_REQUEST:
            return{
                ...state,
                isOpenEffortTypesModal: false
            };

        case effortTypeConstants.GET_EFFORT_TYPE_BY_ID_REQUEST:
        case effortTypeConstants.GET_EFFORT_TYPE_BY_ID_SUCCESS:
        case effortTypeConstants.GET_EFFORT_TYPE_BY_ID_FAILURE:

        case effortTypeConstants.CLOSE_OPERATION_SUCCESS_MODAL:
            return{
                ...state,
                operationSuccessEffType: false
            };
        case effortTypeConstants.CLOSE_OPERATION_FAILED_MODAL:
            return{
                ...state,
                operationFailedEffType: false,
            };

        case effortTypeConstants.OPEN_EFFORT_TYPES_DELETE_CONFIRM:
            return{
                ...state,
                isOpenDeleteEffTypeConfirm: true,
                effortTypeToDelete: action.effortTypeId
            };
        case effortTypeConstants.CLOSE_EFFORT_TYPES_DELETE_CONFIRM:
            return{
                ...state,
                isOpenDeleteEffTypeConfirm: false,
                effortTypeToDelete: null
            };

        case effortTypeConstants.CLEAR_EFFORT_TYPE:

        default:
            return state;

    }
}