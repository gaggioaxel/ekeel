import {topicMapConstants} from "../constants/topicmapConstants";

const initialState ={
    searching: false,
    topicMaps: null,
    topicMap: null,
    deleting: false,
    updating: false,
    creating: false,
    isOpenTopicMapModal: false,
    isOpenDeleteTopicMapModal: false,
    isOpenTopicMapDetailsModal: false,
    topicMapIdToDelete: "",
    newTopicMap: null,
    topicMapToUpdate: null,
    selectedTopicMap: undefined,
    updatingTopicMap: false,
    operationSuccessTopicMap: false,
    operationFailedTopicMap: false,
};

export function topicmap(state = initialState, action) {
    switch(action.type){
        case topicMapConstants.UPDATE_TOPIC_MAP_MODAL_FIELDS:
            return{
                ...state,
                newTopicMap: {...state.newTopicMap, [action.key]: action.value},
                topicMapToUpdate: {...state.topicMapToUpdate, [action.key]: action.value}
            };
        case topicMapConstants.GET_ALL_TOPIC_MAPS_REQUEST:
            return{
                ...state,
                searching: true,
            };
        case topicMapConstants.GET_ALL_TOPIC_MAPS_SUCCESS:
            return{
                ...state,
                searching:false,
                topicMaps: action.topicMaps.topicMaps,
            };
        case topicMapConstants.GET_ALL_TOPIC_MAPS_FAILURE:
            return{
                ...state,
                searching:false,
            };
        case topicMapConstants.CREATE_TOPIC_MAP_REQUEST:
            return{
                ...state,
                creating:true,
            };
        case topicMapConstants.CREATE_TOPIC_MAP_FAILURE:
            return{
                ...state,
                creating:false,
                operationFailedTopicMap: true,
            };
        case topicMapConstants.CREATE_TOPIC_MAP_SUCCESS:
            return{
                ...state,
                creating:false,
                operationSuccessTopicMap: true,
            };
        case topicMapConstants.DELETE_TOPIC_MAP_REQUEST:
            return{
                ...state,
                deleting:true,
            };
        case topicMapConstants.DELETE_TOPIC_MAP_FAILURE:
            return{
                ...state,
                deleting:false,
                operationFailedTopicMap: true,
            };
        case topicMapConstants.DELETE_TOPIC_MAP_SUCCESS:
            return{
                ...state,
                deleting:false,
                operationSuccessTopicMap: true,
            };
        case topicMapConstants.OPEN_TOPIC_MAP_CREATE_MODAL_REQUEST:
            let newBlankTopicMap= Object.assign({id: undefined, title:'', description: '',version: '',  creationDate: '', schemaId: undefined})
            return{
                ...state,
                isOpenTopicMapModal: true,
                newTopicMap: newBlankTopicMap
            };
        case topicMapConstants.CLOSE_TOPIC_MAP_CREATE_MODAL_REQUEST:
            return{
                ...state,
                isOpenTopicMapModal: false
            };
        case topicMapConstants.OPEN_TOPIC_MAP_DELETE_MODAL_REQUEST:
            return{
                ...state,
                isOpenDeleteTopicMapModal: true,
                topicMapIdToDelete: action.topicMapIdToDelete.topicMapIdToDelete
            };
        case topicMapConstants.CLOSE_TOPIC_MAP_DELETE_MODAL_REQUEST:
            return{
                ...state,
                isOpenDeleteTopicMapModal: false
            };
        case topicMapConstants.OPEN_TOPIC_MAP_DETAILS_MODAL_REQUEST:
            return{
                ...state,
                isOpenTopicMapDetailsModal: true,
                topicMapToUpdate: action.topicMapToUpdate.topicMapToUpdate
            };
        case topicMapConstants.CLOSE_TOPIC_MAP_DETAILS_MODAL_REQUEST:
            return{
                ...state,
                isOpenTopicMapDetailsModal: false
            };
        case topicMapConstants.UPDATE_TOPIC_MAP_REQUEST:
            return{
                ...state,
                updating: true,
                topicMapToUpdate: action.topicMapToUpdate.topicMapToUpdate
            };
        case topicMapConstants.UPDATE_TOPIC_MAP_SUCCESS:
            return{
                ...state,
                updating:false,
                operationSuccessTopicMap: true,
            };
        case topicMapConstants.UPDATE_TOPIC_MAP_FAILURE:
            return{
                ...state,
                updating:false,
                operationFailedTopicMap: true
            };
        case topicMapConstants.SELECT_TOPIC_MAP:
        return{
            ...state,
            selectedTopicMap: action.selectedTopicMap
        };
        case topicMapConstants.DESELECT_TOPIC_MAP:
            return{
                ...state,
                selectedTopicMap: undefined
            };
        case topicMapConstants.UPDATE_SELECTED_TOPIC_MAP_REQUEST:
        return{
            ...state,
            updatingTopicMap: true
        };
        case topicMapConstants.UPDATE_SELECTED_TOPIC_MAP_SUCCESS:
            return {
                ...state,
                updatingTopicMap: false,
                selectedTopicMap: action.topicMap.topicMap
            };
        case topicMapConstants.UPDATE_SELECTED_TOPIC_MAP_FAILURE:
        return{
            ...state,
            updatingTopicMap: false
        };
        case topicMapConstants.GET_TOPIC_MAP_REQUEST:
            return{
                ...state
            };
        case topicMapConstants.GET_TOPIC_MAP_SUCCESS:
            return{
                //topicMap: action.topicMap.topicMap,
                ...state,
                selectedTopicMap: action.topicMap.topicMap,
            };
        case topicMapConstants.CLOSE_OPERATION_SUCCESS_MODAL:
            return{
                ...state,
                operationSuccessTopicMap: false
            };

        case topicMapConstants.CLOSE_OPERATION_FAILED_MODAL:
            return{
                ...state,
                operationFailedTopicMap: false
            };
        default:
            return state;
    }
}