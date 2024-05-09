import constants from "../constants/constants";

export const occurrenceTypeService = {
    getAllOccurrenceTypes,
    createOccurrenceType,
    updateOccurrenceType,
    deleteOccurrenceType,
    saveAllOccurrenceTypes,
};

function getAllOccurrenceTypes(user){
    return fetch(`${constants.API_URL}/protected/v1/occurrenceTypes`,{
        method: 'GET',
        headers: {
            'X-Auth': user.token,
            'Content-Type': 'application/json'
        },
    }).then(handleResponse)
}

function createOccurrenceType(newOccurrenceType, user){
    return fetch(`${constants.API_URL}/protected/v1/occurrenceType`,{
        method: 'POST',
        headers: {
            'X-Auth': user.token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: newOccurrenceType.name,
            description: newOccurrenceType.description,
            schemaId: newOccurrenceType.schemaId
        })
    }).then(handleResponse)
}

function saveAllOccurrenceTypes(occurrenceTypes, user){
    return fetch(`${constants.API_URL}/protected/v1/occurrenceTypes`,{
        method: 'POST',
        headers: {
            'X-Auth': user.token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(occurrenceTypes)
    }).then(handleResponse)
}

function updateOccurrenceType(occurrenceTypeToUpdate, user){
    return fetch(`${constants.API_URL}/protected/v1/occurrenceTypes`,{
        method: 'PUT',
        headers: {
            'X-Auth': user.token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            occurrenceTypeName: occurrenceTypeToUpdate.occurrenceTypeName,
            description: occurrenceTypeToUpdate.description
        })
    }).then(handleResponse)
}

function deleteOccurrenceType(occurrenceId, user){
    return fetch(`${constants.API_URL}/protected/v1/occurrenceType?occurrence_type_id=${occurrenceId}`,{
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
           /* if(response.status === 401){
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