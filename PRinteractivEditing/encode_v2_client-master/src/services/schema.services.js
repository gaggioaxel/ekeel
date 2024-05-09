import constants from "../constants/constants";

export const schemaService = {
    getAllByUser,
    getById,
    createSchema,
    deleteSchema,
    updateSchema
};

function getAllByUser(user) {
    return fetch(`${constants.API_URL}/protected/v1/schemas`,{
        method: 'GET',
        headers: {
            'X-Auth': user.token,
            'Content-Type': 'application/json'
        }
    }).then(handleResponse)
}

function getById(user, schemaId) {
    return fetch(`${constants.API_URL}/protected/v1/schema?schema_id=${schemaId}`,{
        method: 'GET',
        headers: {
            'X-Auth': user.token,
            'Content-Type': 'application/json'
        }
    }).then(handleResponse)
}

function createSchema(newSchema, user) {
    return fetch(`${constants.API_URL}/protected/v1/schema`, {
        method: 'POST',
        headers: {
            'X-Auth': user.token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: newSchema.name,
            description: newSchema.description
        })
    }).then(handleResponse);
}

function updateSchema(schemaToUpdate, user) {
    return fetch(`${constants.API_URL}/protected/v1/schema`, {
        method: 'PUT',
        headers: {
            'X-Auth': user.token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: schemaToUpdate.id,
            name: schemaToUpdate.name,
            description: schemaToUpdate.description
        })
    }).then(handleResponse);
}

function deleteSchema(schemaId, user){
    return fetch(`${constants.API_URL}/protected/v1/schema?schema_id=${schemaId}`, {
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

export * from './schema.services';

