 import {topicConstants} from "../constants/topicConstants";

const initialState = {
    searchingTopic: false,
    creatingTopic: false,
    deletingTopic: false,
    newTopic: null,
    topicToUpdate: null,
    topics: [],
    foundTopic: null,
    isOpenTopicModal: false,
    isOpenDeleteTopicModal: false,
    allLinks: [],
    operationSuccessTopic: false,
    operationFailedTopic: false
};

export function topic(state = initialState, action){
    switch(action.type){
        case topicConstants.GET_TOPIC_REQUEST:
            return{
                ...state,
                searchingTopic:true
            };
        case topicConstants.GET_TOPIC_SUCCESS:
            return{
                ...state,
                searchingTopic:false,
                foundTopic: action.topic.topic
            };
        case topicConstants.GET_TOPIC_FAILURE:
            return{
                ...state,
                foundTopic: null,
                searchingTopic:false
            };
        case topicConstants.CREATE_TOPIC_REQUEST:
            const newTopicToInsert = Object.assign(action.newTopic.newTopic);
            return{
                creatingTopic: true,
                newTopic: newTopicToInsert,
                ...state
            };
        case topicConstants.CREATE_TOPIC_SUCCESS:
            const newTopicId = {id: action.newTopicId.newTopicId};
            const newTopicInserted = Object.assign(state.newTopic, newTopicId);
            return{

                newTopic: newTopicInserted,
                ...state,
                creatingTopic: false,
                topics: (state.topics || []).concat(newTopicInserted),
                operationSuccessTopic: true,

            };
        case topicConstants.CREATE_TOPIC_FAILURE:
            return{
                ...state,
                creatingTopic:false,
                operationFailedTopic: true
            };
        case topicConstants.UPDATE_TOPIC_MODAL_FIELDS:
            if(action.key==='topicTopicScopes'){
                return {
                ...state,
                newTopic: {...state.newTopic,topicTopicScopes:[{...state.newTopic.topicTopicScopes[0],id:{...state.newTopic.topicTopicScopes[0].id, topicId:"" ,scopeId:action.value}}]}
                };
            };
            return{
                ...state,
                newTopic: {...state.newTopic, [action.key]: action.value},
                topicToUpdate: {...state.topicToUpdate, [action.key]: action.value}
            };
        case topicConstants.UPDATE_TOPIC_LINKS_IN_FIELDS:
            return{
                ...state,
                newTopic: {
                    ...state.newTopic,
                    allLinksOnIn: action.value
                }
            };
        case topicConstants.UPDATE_TOPIC_LINKS_OUT_FIELDS:
            return{
                ...state,
                newTopic: {
                    ...state.newTopic,
                    allLinksOnOut: action.value
                }
            };
        case topicConstants.UPDATE_TOPICS_TO_DELETE_LIST:
            //const topicsToDelete = Object.assign(state.topicsToDelete, action.value);
            return{
                ...state,
                topicsToDelete: action.value,
            };
        case topicConstants.OPEN_TOPIC_DELETE_MODAL_REQUEST:
            return {
                ...state,
                isOpenDeleteTopicModal: true
            };
        case topicConstants.CLOSE_TOPIC_DELETE_MODAL_REQUEST:
            return{
                ...state,
                isOpenDeleteTopicModal: false
            };
        case topicConstants.OPEN_TOPIC_CREATE_MODAL_REQUEST:
            let newBlankTopic= Object.assign({id:undefined, name:'', subjectLocator:'', subjectIdentifier:'', topicmapId:undefined, topicTypeId: undefined,topicTopicScopes: [{id: {topicId: undefined, scopeId: undefined}, content: ""}]})
            return{
                ...state,
                isOpenTopicModal: true,
                newTopic: newBlankTopic
            };
        case topicConstants.CLOSE_TOPIC_CREATE_MODAL_REQUEST:
            return{
                ...state,
                isOpenTopicModal: false
            };
        case topicConstants.CLEAR_TOPIC:
            return{
                ...state,
                searchingTopic: false,
                newTopic: null,
                topicToUpdate: null

            };
        case topicConstants.DELETE_TOPIC_REQUEST:
            return{
                ...state,
                deletingTopic: true,
            };
        case topicConstants.DELETE_TOPIC_SUCCESS:
            return{
                ...state,
                deletingTopic: true,
                operationSuccessTopic: true,

            };
        case topicConstants.DELETE_TOPIC_FAILURE:
            return{
                ...state,
                deletingTopic:  false,
                operationFailedTopic: true,

            };
        case topicConstants.CLOSE_OPERATION_FAILED_MODAL:
            return{
                ...state,
                operationFailedTopic: false,

            };
        case topicConstants.CLOSE_OPERATION_SUCCESS_MODAL:
            return{
                ...state,
                operationSuccessTopic: false,

            };
        default:
            return state;
    }
}