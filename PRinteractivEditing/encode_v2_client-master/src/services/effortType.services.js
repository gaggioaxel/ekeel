import constants from "../constants/constants";

export const effortTypeService = {

    createEffortType,
    deleteEffortType,
    updateEffortType,
    getEffortTypeById,
    getAllEffortTypes,
    saveAllEffortTypes,
};

function createEffortType(effortType, user){
    return fetch(`${constants.API_URL}/protected/v1/effortType`,{
        method: 'POST',
        headers: {
            'X-Auth': user.token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(effortType)
    }).then(handleResponse)
}

function deleteEffortType(effortType, user){
    return fetch(`${constants.API_URL}/protected/v1/effortType?effort_type_id=${effortType}`,{
        method: 'DELETE',
        headers: {
            'X-Auth': user.token,
            'Content-Type': 'application/json'
        },
    }).then(handleResponse)
}

function updateEffortType(effortType, user){
    return fetch(`${constants.API_URL}/protected/v1/effortType`,{
        method: 'PUT',
        headers: {
            'X-Auth': user.token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(effortType)
    }).then(handleResponse)
}

function getEffortTypeById(effortTypeId,user) {
    return fetch(`${constants.API_URL}/protected/v1/effortType?effort_type_id=${effortTypeId}`,{
        method: 'GET',
        headers: {
            'X-Auth': user.token,
            'Content-Type': 'application/json'
        }
    }).then(handleResponse)
}

function getAllEffortTypes(user) {
    return fetch(`${constants.API_URL}/protected/v1/effortTypes`,{
        method: 'GET',
        headers: {
            'X-Auth': user.token,
            'Content-Type': 'application/json'
        }
    }).then(handleResponse)
}

function saveAllEffortTypes(effortTypes, user){
    return fetch(`${constants.API_URL}/protected/v1/effortTypes`,{
        method: 'POST',
        headers: {
            'X-Auth': user.token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(effortTypes)
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

