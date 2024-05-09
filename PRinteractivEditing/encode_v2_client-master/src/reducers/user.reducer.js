import {userConstants} from "../constants/userConstants";

let loggedUser = JSON.parse(localStorage.getItem('user'));
const initialState = loggedUser ? {
    loggedIn: true,
    registering: false,
    user:loggedUser,
    isOpenSessionExpiredModal: false
} : { 
    loggedIn: false,
    registering: false,
    user: null,
    isOpenSessionExpiredModal: false
};

export function user(state = initialState, action) {
    switch (action.type) {
        case userConstants.UPDATE_SIGN_UP_FIELD:
        case userConstants.UPDATE_LOGIN_FIELD:
            return {
                ...state,
                [action.key]:action.value
            };
        case userConstants.SIGN_UP_REQUEST:
            return {
                ...state,
                registering: true,
            };
        case userConstants.SIGN_UP_SUCCESS:
            return{
                registering:false
            };
        case userConstants.SIGN_UP_FAILURE:
            return{
                ...state,
                registering:false,
            };
        case userConstants.LOGIN_REQUEST:
            return{
                ...state,
            };
        case userConstants.LOGIN_SUCCESS:
            return{
                loggedIn:true,
                user: action.user
            };
        case userConstants.LOGOUT_REQUEST:
            return{
                loggedIn: false,
            };
        case userConstants.OPEN_SESSION_EXPIRED_MODAL:
            return{
                ...state,
                isOpenSessionExpiredModal: true
            };
        case userConstants.CLOSE_SESSION_EXPIRED_MODAL:
            return{
                ...state,
                isOpenSessionExpiredModal: false
            };
        default:
            return state
    }
}