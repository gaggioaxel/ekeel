import constants from "../constants/constants";


export const topicMapService = {
    getAllByUser,
    getById,
    createTopicMap,
    deleteTopicMap,
    updateTopicMap
};

function getAllByUser(user) {
    return fetch(`${constants.API_URL}/protected/v1/topicmaps`,{
        method: 'GET',
        headers: {
            'X-Auth': user.token,
            'Content-Type': 'application/json'
        }
    }).then(handleResponse)
}

function getById(user, topicMapId) {
    return fetch(`${constants.API_URL}/protected/v1/topicmap?topic_map_id=${topicMapId}`,{
        method: 'GET',
        headers: {
            'X-Auth': user.token,
            'Content-Type': 'application/json'
        }
    }).then(handleResponse)
}

function createTopicMap(newTopicMap, user) {
    return fetch(`${constants.API_URL}/protected/v1/topicmap`, {
        method: 'POST',
        headers: {
            'X-Auth': user.token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newTopicMap)
    }).then(handleResponse);
}

function updateTopicMap(topicMapToUpdate, user) {
    return fetch(`${constants.API_URL}/protected/v1/topicmap`, {
        method: 'PUT',
        headers: {
            'X-Auth': user.token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: topicMapToUpdate.id,
            title: topicMapToUpdate.title,
            description: topicMapToUpdate.description,
            version: topicMapToUpdate.version
        })
    }).then(handleResponse);
}

function deleteTopicMap(topicMapId, user){
    return fetch(`${constants.API_URL}/protected/v1/topicmap?topic_map_id=${topicMapId}`, {
        method: 'DELETE',
        headers: {
            'X-Auth': user.token,
            'Content-Type': 'application/json'
        },
    }).then(handleResponse);
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

export * from './topicmap.services';