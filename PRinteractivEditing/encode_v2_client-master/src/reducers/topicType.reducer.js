import {topicTypeConstants} from '../constants/topicTypeConstants';

const initialState={
    topicTypes:[],
    searching: false,
    isOpenTopicTypesModal: false,
    operationFailedTopicType: false,
    operationSuccessTopicType: false,
    savingTopicType: false,
    isOpenDeleteTopicTypeConfirm: false,
    deletingTopicType: false,
    prevTopicTypes: null,
    topicTypeById: null,
    topicTypeToUpdate: null
};

export function topicType(state = initialState, action){
    switch(action.type){
        case topicTypeConstants.GET_ALL_TOPIC_TYPES_REQUEST:
            return{
                ...state,
                searching:true
            };
        case topicTypeConstants.GET_ALL_TOPIC_TYPES_SUCCESS:
            return{
                ...state,
                searching: false,
                topicTypes: action.topicTypes.topicTypes
            };
        case  topicTypeConstants.GET_ALL_TOPIC_TYPES_FAILURE:
            return{
                ...state,
                searching: false,
            };
        case topicTypeConstants.UPDATE_TOPIC_TYPE_FIELD:
            return{
                ...state,
                topicTypes: state.topicTypes.map((topicType, i) =>( i === action.index ? {...topicType, [action.key]:action.value} : topicType))
            };
        case topicTypeConstants.OPEN_TOPIC_TYPES_MODAL_REQUEST:
            return{
                ...state,
                isOpenTopicTypesModal: true,
                prevTopicTypes: state.topicTypes
            };
        case topicTypeConstants.CLOSE_TOPIC_TYPES_MODAL_REQUEST:
            return{
                ...state,
                isOpenTopicTypesModal: false
            };
        case topicTypeConstants.ADD_TOPIC_TYPES_REQUEST:
            let newTopicType = Object.assign({id: undefined, name: "", description: "",schemaId: undefined,topicTypeRoles: []});
            return{
                ...state,
                topicTypes:  (state.topicTypes || []).concat(newTopicType),
            };
        case topicTypeConstants.REMOVE_TOPIC_TYPES_REQUEST:

            return{
                ...state,
                topicTypes: state.topicTypes.filter((topicType) => topicType.id !== undefined)
            };
        case topicTypeConstants.CLOSE_OPERATION_SUCCESS_MODAL:
            return{
                ...state,
                operationSuccessTopicType: false
            };
        case topicTypeConstants.CLOSE_OPERATION_FAILED_MODAL:
            return{
                ...state,
                operationFailedTopicType: false,
            };
        case topicTypeConstants.CREATE_TOPIC_TYPES_REQUEST:
            return{
                ...state,
                savingTopicType: true
            };

        case topicTypeConstants.SAVE_ALL_TOPIC_TYPE_REQUEST:
            return{
                ...state,
                savingTopicType: true
            };
        case topicTypeConstants.CREATE_TOPIC_TYPES_SUCCESS:

            return{
                ...state,
                savingTopicType: false,
                operationSuccessTopicType: true,
                topicTypes:  state.topicTypes.map((topicType,i)=>(topicType.id === undefined && topicType.name === action.newTopicType.newTopicType.name && topicType.description === action.newTopicType.newTopicType.description ? {...topicType, id: action.newTopicType.newTopicType.id }:topicType))

            }

        case topicTypeConstants.SAVE_ALL_TOPIC_TYPE_SUCCESS:
            let idsWithBlanks= action.newTopicTypesIds.newTopicTypesIds;
            return{
                ...state,
                savingTopicType: false,
                operationSuccessTopicType: true,
                topicTypes:  state.topicTypes.map((topicType,i)=>(topicType.id === undefined && topicType.name !== '' && topicType.description !== '' ? {...topicType, id: idsWithBlanks.shift() }:topicType))

            };
        case topicTypeConstants.CREATE_TOPIC_TYPES_FAILURE:
            return{
                ...state,
                savingTopicType: false,
                operationFailedTopicType: true,
            }
        case topicTypeConstants.SAVE_ALL_TOPIC_TYPE_FAILURE:
            return{
                ...state,
                savingTopicType: false,
                operationFailedTopicType: true
            };
        case topicTypeConstants.DELETE_TOPIC_TYPES_REQUEST:
            return{
                ...state,
                deletingTopicType: true,
            };
        case topicTypeConstants.DELETE_TOPIC_TYPES_SUCCESS:
            return{
                ...state,
                deletingTopicType: false,
                operationSuccessTopicType: true,
                isOpenDeleteTopicTypeConfirm: false,
                topicTypes: state.topicTypes.filter((topicType) => topicType.id !== action.topicTypeToDelete.topicTypeToDelete )
            };
        case topicTypeConstants.DELETE_TOPIC_TYPES_FAILURE:
            return{
                ...state,
                deletingTopicType: false,
                operationFailedTopicType: true,
                isOpenDeleteTopicTypeConfirm:false
            };
        case topicTypeConstants.OPEN_TOPIC_TYPES_DELETE_CONFIRM:
            return{
                ...state,
                isOpenDeleteTopicTypeConfirm: true,
                topicTypeToDelete: action.topicTypeId
            };
        case topicTypeConstants.CLOSE_TOPIC_TYPES_DELETE_CONFIRM:
            return{
                ...state,
                isOpenDeleteTopicTypeConfirm: false,
                topicTypeToDelete: null
            };
        case topicTypeConstants.CLEAR_NOT_SAVED_TOPIC_TYPES:
            return{
                ...state,
                topicTypes: state.topicTypes.filter( (topicType) => (topicType.scopedLinkedTopics !== undefined)),
            };
        case topicTypeConstants.GET_TOPIC_TYPE_BY_ID_REQUEST:
            return{
                ...state,
                searching:true
            };
        case topicTypeConstants.GET_TOPIC_TYPE_BY_ID_SUCCESS:
            return{
                ...state,
                searching: false,
                topicTypeById: action.topicType.topicType
            };
        case topicTypeConstants.GET_TOPIC_TYPE_BY_ID_FAILURE:
            return{
                ...state,
                searching: false
            };

        default:
            return state;
    }
}