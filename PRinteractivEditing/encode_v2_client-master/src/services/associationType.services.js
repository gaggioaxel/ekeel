import constants from "../constants/constants";

export const associationTypeService = {
    getAllAssociationTypes,
    getAssociationTypeById,
    saveAllAssociationTypes,
    createAssociationType,
    deleteAssociationType,
    createAssociationTypeRole,
    updateAssociationType,
    updateAssociationTypeRole,
    updateAssociationTypeRoleTopicType,
    deleteAssociationTypeRole,
    deleteAssociationTypeRoleTopicType
};

function createAssociationType(associationType, user){
    return fetch(`${constants.API_URL}/protected/v1/associationType`,{
        method: 'POST',
        headers: {
            'X-Auth': user.token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(associationType)
    }).then(handleResponse)
}

function createAssociationTypeRole(associationTypeRole, associationType, user){
    return fetch(`${constants.API_URL}/protected/v1/associationType/${associationType}/role`,{
        method:'POST',
        headers:{
            'X-Auth': user.token,
            'Content-Type': 'application/json'
        },
        body:JSON.stringify(associationTypeRole)
        }).then(handleResponse)
}


function saveAllAssociationTypes(associationTypes, user){
    return fetch(`${constants.API_URL}/protected/v1/associationTypes`,{
        method: 'POST',
        headers: {
            'X-Auth': user.token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(associationTypes)
    }).then(handleResponse)
}

function getAllAssociationTypes(user) {
    return fetch(`${constants.API_URL}/protected/v1/associationTypes`,{
        method: 'GET',
        headers: {
            'X-Auth': user.token,
            'Content-Type': 'application/json'
        }
    }).then(handleResponse)
}

function getAssociationTypeById(associationTypeId,user) {
    return fetch(`${constants.API_URL}/protected/v1/associationType?association_type_id=${associationTypeId}`,{
        method: 'GET',
        headers: {
            'X-Auth': user.token,
            'Content-Type': 'application/json'
        }
    }).then(handleResponse)
}

function deleteAssociationType(associationType, user){
    return fetch(`${constants.API_URL}/protected/v1/associationType?association_type_id=${associationType}`,{
        method: 'DELETE',
        headers: {
            'X-Auth': user.token,
            'Content-Type': 'application/json'
        },
    }).then(handleResponse)
}

function deleteAssociationTypeRole (associationTypeRole,associationType, user){
    return fetch(`${constants.API_URL}/protected/v1/associationType/${associationType}/role/?role_id=${associationTypeRole}`,{
        method: 'DELETE',
        headers: {
            'X-Auth': user.token,
            'Content-Type': 'application/json'
        },
    }).then(handleResponse)
}


function deleteAssociationTypeRoleTopicType (associationTypeRoleTopicType,associationTypeRole,associationType, user){
    return fetch(`${constants.API_URL}/protected/v1/associationType/${associationType}/role/${associationTypeRole}/topicTypes/?topicTypes_id=${associationTypeRoleTopicType}`,{
        method: 'DELETE',
        headers: {
            'X-Auth': user.token,
            'Content-Type': 'application/json'
        },
    }).then(handleResponse)
}

function updateAssociationType(associationType, user){
    return fetch(`${constants.API_URL}/protected/v1/associationType`,{
        method: 'PATCH',
        headers: {
            'X-Auth': user.token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(associationType)
    }).then(handleResponse)
}

function updateAssociationTypeRole(associationTypeRole,associationType,user){
    return fetch(`${constants.API_URL}/protected/v1/associationType/${associationType}/role`,{
        method:'PATCH',
        headers:{
            'X-Auth': user.token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(associationTypeRole)
    }).then(handleResponse)
}

function updateAssociationTypeRoleTopicType(associationTypeRoleTopicType,user){
    return fetch(`${constants.API_URL}/protected/v1/associationType/${associationTypeRoleTopicType.associationTypeId}/role/${associationTypeRoleTopicType.roleId}/topicTypes`,{
    method: 'PATCH',
        headers:{
            'X-Auth': user.token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(associationTypeRoleTopicType.topicTypesIds)
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