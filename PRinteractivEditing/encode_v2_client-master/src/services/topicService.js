import constants from "../constants/constants";

export const topicService = {
    createTopic,
    deleteTopic,
    deleteTopicsList,
    getTopic
};

function createTopic(newTopic, user) {
    return fetch(`${constants.API_URL}/protected/v1/topic`,{
        method: 'POST',
        headers: {
            'X-Auth': user.token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: newTopic.name,
            subjectLocator: newTopic.subjectLocator,
            subjectIdentifier: newTopic.subjectIdentifier,
            topicTypeId: newTopic.topicTypeId,
            topicmapId: newTopic.topicmapId,
            topicTopicScopes: newTopic.topicTopicScopes
        })
    }).then(handleResponse)
}

function deleteTopic(topicId, user) {
    return fetch(`${constants.API_URL}/protected/v1/topic?topic_id=${topicId}`,{
        method: 'DELETE',
        headers: {
            'X-Auth': user.token,
            'Content-Type': 'application/json'
        }
    }).then(handleResponse)
}

function deleteTopicsList(topicsToDelete, user) {
    return fetch(`${constants.API_URL}/protected/v1/topics`,{
        method: 'DELETE',
        headers: {
            'X-Auth': user.token,
            'Content-Type': 'application/json'
        },
        body:JSON.stringify(topicsToDelete)
    }).then(handleResponse)
}

function getTopic(topicId, user) {
    return fetch(`${constants.API_URL}/protected/v1/topic?topic_id=${topicId}`,{
        method: 'GET',
        headers: {
            'X-Auth': user.token,
            'Content-Type': 'application/json'
        }
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