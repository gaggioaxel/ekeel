import {alertConstants} from "../constants/alertConstants";

const initialState = {
    messages:null,
    alertType: "",
};

export function alert(state = initialState, action){
    switch(action.type){
        case alertConstants.SUCCESS:
            return{
                ...state,
                alertType: 'alert-success',
                messages: (state.message || [].concat(action.message)),
            };
        case alertConstants.ERROR:
            return{
                ...state,
                alertType: 'alert-error',
                messages: (state.messages || []).concat(action.message.error || action.message)
            };
        case alertConstants.CLEAR:
            return{};
        default:
            return state;
    }
}