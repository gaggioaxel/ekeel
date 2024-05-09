import constants from "../constants/constants";

export const associationService = {

    createAssociation,
    deleteAssociation,
    updateAssociation,
    getAssociationById,
    getAllAssociations,
};

function createAssociation(association, user){
    return fetch(`${constants.API_URL}/protected/v1/association`,{
        method: 'POST',
        headers: {
            'X-Auth': user.token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(association)
    }).then(handleResponse)
}

function deleteAssociation(association, user){
    return fetch(`${constants.API_URL}/protected/v1/association?association_id=${association}`,{
        method: 'DELETE',
        headers: {
            'X-Auth': user.token,
            'Content-Type': 'application/json'
        },
    }).then(handleResponse)
}

function updateAssociation(association, user){
    return fetch(`${constants.API_URL}/protected/v1/association`,{
        method: 'PUT',
        headers: {
            'X-Auth': user.token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(association)
    }).then(handleResponse)
}

function getAssociationById(associationId,user) {
    return fetch(`${constants.API_URL}/protected/v1/association?association_id=${associationId}`,{
        method: 'GET',
        headers: {
            'X-Auth': user.token,
            'Content-Type': 'application/json'
        }
    }).then(handleResponse)
}

function getAllAssociations(user) {
    return fetch(`${constants.API_URL}/protected/v1/associations`,{
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

