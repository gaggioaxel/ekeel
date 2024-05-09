import {linkedTopicConstants} from "../constants/linkedTopicsConstants";

const initialState = {
    saving: false,
};

export function linkedTopics(state = initialState, action){
    switch(action.type){
        case linkedTopicConstants.SAVE_ALL_LINKED_TOPICS_REQUEST:
        case linkedTopicConstants.SAVE_LINKED_TOPICS_REQUEST:
            return{
                ...state,
                saving: true
            };
        case linkedTopicConstants.SAVE_ALL_LINKED_TOPICS_SUCCESS:
        case linkedTopicConstants.SAVE_LINKED_TOPICS_SUCCESS:
            return{
                ...state,
                saving: false,
                selectedTopicMap: action.topicMap.topicMap
            };
        case  linkedTopicConstants.SAVE_ALL_LINKED_TOPICS_FAILURE:
        case linkedTopicConstants.SAVE_LINKED_TOPICS_FAILURE:
            return{
                ...state,
                saving:false
            };
        default:
            return state;
    }
}