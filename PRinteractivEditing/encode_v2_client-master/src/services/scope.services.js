import constants from "../constants/constants";

export const scopeService = {
    getAllScopes,
    createScope,
    saveAllScopes,
    updateScope,
    deleteScope,
    saveScope
};

function getAllScopes(user){
    return fetch(`${constants.API_URL}/protected/v1/scopes`,{
        method: 'GET',
        headers: {
            'X-Auth': user.token,
            'Content-Type': 'application/json'
        },
    }).then(handleResponse)
}

function createScope(newScope, user){
    return fetch(`${constants.API_URL}/protected/v1/scope`,{
        method: 'POST',
        headers: {
            'X-Auth': user.token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newScope)
    }).then(handleResponse)
}

function saveAllScopes(scopeToSave, user){
    return fetch(`${constants.API_URL}/protected/v1/scopes`,{
        method: 'POST',
        headers: {
            'X-Auth': user.token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(scopeToSave)
    }).then(handleResponse)
}

function saveScope(scope, user){
    return fetch(`${constants.API_URL}/protected/v1/scope`,{
        method: 'POST',
        headers: {
            'X-Auth': user.token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(scope)
    }).then(handleResponse)
}

function updateScope(scopeToUpdate, user){
    return fetch(`${constants.API_URL}/protected/v1/scope`,{
        method: 'PUT',
        headers: {
            'X-Auth': user.token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(scopeToUpdate)
    }).then(handleResponse)
}

function deleteScope(scopeIdToDelete, user){
    return fetch(`${constants.API_URL}/protected/v1/scope?scope_id=${scopeIdToDelete}`,{
        method: 'DELETE',
        headers: {
            'X-Auth': user.token,
            'Content-Type': 'application/json'
        },
    }).then(handleResponse)
}

function handleResponse(response) {
    return response.text().then(text => {
        const data = text && JSON.parse(text);
        if (response.status > 300 && response.status < 600) {
            /*if(response.status === 401){
                refreshToken().catch((error)=>{
                    error = (data && data.message) || response.statusText;
                    return Promise.reject(error);
                });
                return data;
            }*/
            const error = (data && data.message) || response.statusText;
            return Promise.reject(error)
        }
        return data;
    });
}