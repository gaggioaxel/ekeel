import {associationConstants} from "../constants/associationConstants";

const initialState = {
    searchingAssociation: false,
    associations: [],
    isOpenAssociationModal: false,
    searchingAssociations: false,
    isOpenDeleteAssociationModal: false,
    operationFailedAss: false,
    operationSuccessAss: false,
    deletingAss: false,
    creatingAss: false,
    associationToUpdate:null,
    associationsToDelete: null,
    newAssociation: null,
    retrievedAssociation:null,

};

export function association (state = initialState, action) {
    switch(action.type){

        case associationConstants.UPDATE_DELETE_ASSOCIATION_MODAL_FIELDS:
            return {
                ...state,
                associationsToDelete: action.value
            }
        case associationConstants.UPDATE_ASSOCIATION_MODAL_FIELDS:

            if(action.key==='topicToConnectIn')
                return {
                    ...state,
                    newAssociation: {...state.newAssociation, associationTopicAssociationRoles:[{...state.newAssociation.associationTopicAssociationRoles[0], topicId: action.value},...state.newAssociation.associationTopicAssociationRoles.slice(1,state.newAssociation.associationTopicAssociationRoles.length)]}

                }
            if(action.key==='topicRoleToConnectIn')
                return {
                    ...state,
                    newAssociation: {...state.newAssociation, associationTopicAssociationRoles:[{...state.newAssociation.associationTopicAssociationRoles[0], roleId: action.value},...state.newAssociation.associationTopicAssociationRoles.slice(1,state.newAssociation.associationTopicAssociationRoles.length)]}

                }
            if(action.key==='topicToConnectOut')
                return {
                    ...state,
                    newAssociation: {...state.newAssociation, associationTopicAssociationRoles:[...state.newAssociation.associationTopicAssociationRoles.slice(0,1),{...state.newAssociation.associationTopicAssociationRoles[1], topicId: action.value}]}

                }
            if(action.key==='topicRoleToConnectOut')
                return {
                    ...state,
                    newAssociation: {...state.newAssociation, associationTopicAssociationRoles:[...state.newAssociation.associationTopicAssociationRoles.slice(0,1),{...state.newAssociation.associationTopicAssociationRoles[1], roleId: action.value}]}

                }
            if(action.key==='associationAssociationScopes')
                return {
                    ...state,
                    newAssociation: {...state.newAssociation,associationAssociationScopes:[{...state.newAssociation.associationAssociationScopes[0], id: {...state.newAssociation.associationAssociationScopes[0].id, scopeId: action.value, associationId: 0}}]}

                }
            return{
                ...state,
                newAssociation: {...state.newAssociation, [action.key]:action.value}
            }

        case associationConstants.CREATE_ASSOCIATION_REQUEST:
            return{
                ...state,
                creatingAss: true
            }
        case associationConstants.CREATE_ASSOCIATION_FAILURE:
            return{
                ...state,
                creatingAss: false,
                operationFailedAss: true
            }
        case associationConstants.CREATE_ASSOCIATION_SUCCESS:
            const newAssociationId={id: action.newAssociationId.newAssociationId}
            const newAssociationInserted =Object.assign(state.newAssociation, newAssociationId)
            return{
                ...state,
                creatingAss: false,
                operationSuccessAss: true,
                associations: (state.associations || []).concat(newAssociationInserted)
            }
        /*
        case associationConstants.UPDATE_ASSOCIATION_REQUEST:

        case associationConstants.UPDATE_ASSOCIATION_SUCCESS:

        case associationConstants.UPDATE_ASSOCIATION_FAILURE:

         */

        case associationConstants.CLEAR_ASSOCIATION:
            return{
                ...state,
                searchingAssociation: false,
                newAssociation: null,
                AssociationToUpdate: null
            }



        case associationConstants.GET_ASSOCIATION_BY_ID_REQUEST:
            return{
                ...state,
                searchingAssociation: true
            }
        case associationConstants.GET_ASSOCIATION_BY_ID_SUCCESS:
            return{
                ...state,
                searchingAssociation: false,
                retrievedAssociation: action.retrievedAssociation.retrievedAssociation
            }
        case associationConstants.GET_ASSOCIATION_BY_ID_FAILURE:
            return{
                ...state,
                searchingAssociation: false
            }

        case associationConstants.DELETE_ASSOCIATION_REQUEST:
            return{
                ...state,
                deletingAss: true
            }
        case associationConstants.DELETE_ASSOCIATION_FAILURE:
            return{
                ...state,
                deletingAss: false,
                operationFailedAss: true,
            }
        case associationConstants.DELETE_ASSOCIATION_SUCCESS:
            return{
                ...state,
                deletingAss: false,
                operationSuccessAss: true
            }

        case associationConstants.OPEN_ASSOCIATION_MODAL_REQUEST:
            let newBlankAssociation= Object.assign({topicmapId: undefined, associationTypeId: undefined, associationTopicAssociationRoles:[{roleId:undefined,topicId:undefined},{roleId:undefined,topicId:undefined}],associationAssociationScopes:[{id:{scopeId: undefined, associationId:undefined},content:''}] });
            return{
                ...state,
                isOpenAssociationModal: true,
                newAssociation: newBlankAssociation
            }
        case associationConstants.CLOSE_ASSOCIATION_MODAL_REQUEST:
            return{
                ...state,
                isOpenAssociationModal: false
            }

        case associationConstants.OPEN_ASSOCIATION_DELETE_MODAL_REQUEST:
            return{
                ...state,
                isOpenDeleteAssociationModal: true
            }
        case associationConstants.CLOSE_ASSOCIATION_DELETE_MODAL_REQUEST:
            return{
                ...state,
                isOpenDeleteAssociationModal: false
            }
        case associationConstants.GET_ALL_ASSOCIATIONS_REQUEST:
            return{
                ...state,
                searchingAssociations: true
            }

        case associationConstants.GET_ALL_ASSOCIATIONS_SUCCESS:
            return{
                ...state,
                searchingAssociations: false,
                associations: action.associations.associations

            }
        case associationConstants.GET_ALL_ASSOCIATIONS_FAILURE:
            return{
                ...state,
                searchingAssociations: false
            }
        case associationConstants.CLOSE_OPERATION_FAILED_MODAL:
            return{
                ...state,
                operationFailedAss: false
            }
        case associationConstants.CLOSE_OPERATION_SUCCESS_MODAL:
            return{
                ...state,
                operationSuccessAss: false
            }
        default:
            return state;
    }
}