import {alertActions} from "./alert.actions";
import {userConstants} from "../constants/userConstants";
import {history} from '../config/history';
import {userService} from "../services/user.services";

export const userActions = {
    login,
    logout,
    registration,
    getAll,
    openSessionExpiredModal,
    closeSessionExpiredModal,
    reloadUserSession
};

function login(username, password){
    return dispatch => {
        dispatch(request({username}));
        userService.login(username, password)
            .then(
                user => {
                    dispatch(success(user));
                    history.push('/home');
                },
                error => {
                    dispatch(failure(error));
                    dispatch(alertActions.error(error));
                }
            );
    };

    function request(user) {return {type: userConstants.LOGIN_REQUEST, user}}
    function success(user) {return {type: userConstants.LOGIN_SUCCESS, user}}
    function failure(error){return {type: userConstants.LOGIN_FAILURE, error}}
}

function reloadUserSession(user){
    return dispatch => {
        dispatch(request({user}));
        userService.refreshToken(user)
            .then(
                user => {
                    dispatch(success(user));
                    //history.push('/home');
                },
                error => {
                    dispatch(failure(error));
                    dispatch(alertActions.error(error));
                }
            );
    };

    function request(user) {return {type: userConstants.RELOAD_USER_SESSION_REQUEST, user}}
    function success(user) {return {type: userConstants.RELOAD_USER_SESSION_SUCCESS, user}}
    function failure(error){return {type: userConstants.RELOAD_USER_SESSION_FAILURE, error}}
}

function registration (username, password, email, firstName, lastName){
    return dispatch => {
        dispatch(request({username}));
        userService.registration(username, password, email, firstName, lastName)
            .then(
                user => {
                    dispatch(success(user));
                    dispatch(alertActions.success("Correctly signed up!!"));
                    //history.push("/");
                },
                error => {
                    if(!Array.isArray(error)){
                        dispatch(failure(error));
                        dispatch(alertActions.error(error));
                    }else{
                        dispatch(failure(error));
                        error.forEach( element => {
                                dispatch(alertActions.error(element.errorMessage));
                            }
                        )
                    }

                }
            );
    };

    function request(user) {return {type: userConstants.SIGN_UP_REQUEST, user}}
    function success(user) {return {type: userConstants.SIGN_UP_SUCCESS, user}}
    function failure(error){return {type: userConstants.SIGN_UP_FAILURE, error}}
}

function logout(){
    userService.logout();
    return {type: userConstants.LOGOUT_REQUEST};
}

function getAll(){
    return dispatch => {
        dispatch(request());

        userService.getAll()
            .then(
                users => dispatch(success(users)),
                error => {
                    dispatch(failure(error));
                    dispatch(alertActions.error(error));
                }

            );
    };

    function request(){return {type: userConstants.GET_ALL_REQUEST}}
    function success(users){return {type: userConstants.GET_ALL_SUCCESS, users}}
    function failure(error){return {type: userConstants.GET_ALL_FAILURE, error}}
}

function openSessionExpiredModal(){
    return dispatch => {
        dispatch(request());
    };
    function request(){return {type: userConstants.OPEN_SESSION_EXPIRED_MODAL}}
}

function closeSessionExpiredModal(){
    return dispatch => {
        dispatch(request());
    };
    function request(){return {type: userConstants.CLOSE_SESSION_EXPIRED_MODAL}}
}

export * from './user.actions';