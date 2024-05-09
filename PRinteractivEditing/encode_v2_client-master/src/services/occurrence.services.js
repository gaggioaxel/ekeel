import constants from "../constants/constants";

export const occurrenceService = {
    getAllOccurrenceOfTopic,
    createOccurrence,
    updateOccurrence,
    deleteOccurrence,
    saveAllOccurrences,
    deleteAllOccurrences
};

function getAllOccurrenceOfTopic(topicId, user){
    return fetch(`${constants.API_URL}/protected/v1/occurrences?topic_id=${topicId}`,{
        method: 'GET',
        headers: {
            'X-Auth': user.token,
            'Content-Type': 'application/json'
        },
    }).then(handleResponse)
}

/*function createOccurrence(newOccurrence, user){
    return fetch(`${constants.API_URL}/protected/v1/occurrence`,{
        method: 'POST',
        headers: {
            'X-Auth': user.token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            dataValue: newOccurrence.dataValue,
            dataReference: newOccurrence.dataReference,
            occurrenceTypeName: newOccurrence.occurrenceTypeName,
            topicId: newOccurrence.topicId,
            scopeOfOccurrence: newOccurrence.scopeOfOccurrence
        })
    }).then(handleResponse)
}*/

function createOccurrence(newOccurrence, user){
    let data = new FormData();
    data.append('occurrence', new Blob([JSON.stringify({
        dataValue: newOccurrence.dataValue,
        dataReference: newOccurrence.dataReference,
        occurrenceTypeId: newOccurrence.occurrenceTypeId,
        topicId: newOccurrence.topicId,
        scopeOfOccurrence: newOccurrence.scopeOfOccurrence
    })], { type: "application/json" }));
    if(newOccurrence.occurrenceFiles) Array.from( newOccurrence.occurrenceFiles).forEach((file)=>data.append('files', file));
    //data.append('files', newOccurrence.files );
    return fetch(`${constants.API_URL}/protected/v1/occurrence`,{
        method: 'POST',
        headers: {
            'X-Auth': user.token,
        },
        body: data
    }).then(handleResponse)
}

function saveAllOccurrences(occurrences, user){
    return fetch(`${constants.API_URL}/protected/v1/occurrences`,{
        method: 'POST',
        headers: {
            'X-Auth': user.token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(occurrences)
    }).then(handleResponse)
}

function updateOccurrence(occurrenceToUpdate, user){
    return fetch(`${constants.API_URL}/protected/v1/occurrence`,{
        method: 'PUT',
        headers: {
            'X-Auth': user.token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: occurrenceToUpdate.id,
            dataValue: occurrenceToUpdate.dataValue,
            dataReference: occurrenceToUpdate.dataReference,
            occurrenceType: occurrenceToUpdate.occurrenceType,
            topicId: occurrenceToUpdate.topicId,
            scopeOfOccurrence: occurrenceToUpdate.scopeOfOccurrence
        })
    }).then(handleResponse)
}

function deleteOccurrence(occurrenceId, user){
    return fetch(`${constants.API_URL}/protected/v1/occurrences?topic_id=${occurrenceId}`,{
        method: 'DELETE',
        headers: {
            'X-Auth': user.token,
            'Content-Type': 'application/json'
        },
    }).then(handleResponse)
}

function deleteAllOccurrences(occurrences, user){
    return fetch(`${constants.API_URL}/protected/v1/occurrences`,{
        method: 'POST',
        headers: {
            'X-Auth': user.token,
            'Content-Type': 'application/json'
        },
        body:JSON.stringify(occurrences)
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