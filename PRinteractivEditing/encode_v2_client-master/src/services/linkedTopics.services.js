import constants from "../constants/constants";

export const linkedTopicsService = {
    saveLink,
    saveAllLinks
};

function saveLink(link, user){
    return fetch(`${constants.API_URL}/protected/v1/linkedTopics`,{
        method: 'POST',
        headers: {
            'X-Auth': user.token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            topicIdIn: link.topicIdIn,
            topicIdOut: link.topicIdOut,
            associationType: link.associationType,
            topicMapId: link.topicMapId,
            scopeOfLinkedTopics: link.scopeOfLinkedTopics
        })
    }).then(handleResponse)
}

function saveAllLinks(links, user){
    return fetch(`${constants.API_URL}/protected/v1/linkedTopics/saveAll`,{
        method: 'POST',
        headers: {
            'X-Auth': user.token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(links)
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
