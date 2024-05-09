import constants from "../constants/constants";

export const topicTypeService = {
    getAllTopicTypes,
    deleteTopicType,
    createTopicType,
    saveAllTopicTypes,
    updateTopicType,
    getTopicTypeById
};

function getAllTopicTypes(user) {
    return fetch(`${constants.API_URL}/protected/v1/topicTypes`,{
        method: 'GET',
        headers: {
            'X-Auth': user.token,
            'Content-Type': 'application/json'
        }
    }).then(handleResponse)
}

function createTopicType(topicType, user){
    return fetch(`${constants.API_URL}/protected/v1/topicType`,{
        method: 'POST',
        headers: {
            'X-Auth': user.token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(topicType)
    }).then(handleResponse)
}

function saveAllTopicTypes(topicTypes, user){
    return fetch(`${constants.API_URL}/protected/v1/topicTypes`,{
        method: 'POST',
        headers: {
            'X-Auth': user.token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(topicTypes)
    }).then(handleResponse)
}

function deleteTopicType(topicTypeId, user){

    return fetch(`${constants.API_URL}/protected/v1/topicType?topic_type_id=${topicTypeId}`,{
        method: 'DELETE',
        headers: {
            'X-Auth': user.token,
            'Content-Type': 'application/json'
        },
    }).then(handleResponse)
}

function updateTopicType(topicType, user){
    return fetch(`${constants.API_URL}/protected/v1/topicTypes`,{
        method:  'PUT',
        headers: {
            'X-Auth': user.token,
            'Content-Type': 'application/json'
        },
    }).then(handleResponse)
}

function getTopicTypeById(topicTypeById, user){
    return fetch(`${constants.API_URL}/protected/v1/topicTypes`,{
        method:  'PUT',
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

export * from './topicTypes.services';
