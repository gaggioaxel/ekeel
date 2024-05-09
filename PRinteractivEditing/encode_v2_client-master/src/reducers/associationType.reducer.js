import {associationTypeConstants} from "../constants/associationTypeConstants";

const initialState = {
    searching: false,
    foundAssociationType: null,
    associationTypes: [],
    isOpenAssociationTypesModal: false,
    isOpenDeleteAssTypeConfirm: false,
    isOpenAssociationTypesRolesModal:false,
    operationFailedAssType: false,
    operationSuccessAssType: false,
    deletingAssType: false,
    savingAssType: false,
    associationTypeToDelete: null,
    updatingAssTypeRoleTopicType:false,
    newAssociationTypesRolesTopicType: null,
};

export function associationType(state = initialState, action){
    switch(action.type){
        case associationTypeConstants.GET_ALL_ASSOCIATION_TYPES_REQUEST:
            return{
                ...state,
                searching: true
            };
        case associationTypeConstants.GET_ALL_ASSOCIATION_TYPES_SUCCESS:
            return{
                ...state,
                searching: false,
                associationTypes: action.associationType.associationType
            };
        case associationTypeConstants.GET_ALL_ASSOCIATION_TYPES_FAILURE:
            return{
                ...state,
                searching: false
            };
        case associationTypeConstants.UPDATE_ASSOCIATION_TYPE_FIELD:
            if(action.key==='associationTypeRolesNameFirst') {
                return{
                    ...state,
                    associationTypes: state.associationTypes.map((assType, i) =>( i === action.index ? {...assType, associationTypeRoles:[{...assType.associationTypeRoles[0], name: action.value}, ...assType.associationTypeRoles.slice(1, assType.associationTypeRoles.length)]}: assType)),
                };
            }
            if(action.key==='associationTypeRolesNameSecond') {
                return{
                    ...state,
                    associationTypes: state.associationTypes.map((assType, i) =>( i === action.index ? {...assType, associationTypeRoles:[...assType.associationTypeRoles.slice(0,1),{...assType.associationTypeRoles[1], name: action.value}]}: assType)),
                };
            }
            if(action.key==='associationTypeRolesDescriptionFirst') {
                return{
                    ...state,
                    associationTypes: state.associationTypes.map((assType, i) =>( i === action.index ? {...assType, associationTypeRoles:[{...assType.associationTypeRoles[0], description: action.value}, ...assType.associationTypeRoles.slice(1, assType.associationTypeRoles.length)]}: assType)),
                };
            }
            if(action.key==='associationTypeRolesDescriptionSecond') {
                return{
                    ...state,
                    associationTypes: state.associationTypes.map((assType, i) =>( i === action.index ? {...assType, associationTypeRoles:[...assType.associationTypeRoles.slice(0,1),{...assType.associationTypeRoles[1], description: action.value}]}: assType)),
                };
            }
            return{
                ...state,
                associationTypes: state.associationTypes.map((assType, i) =>( i === action.index ? {...assType, [action.key]:action.value} : assType)),

            };

        case associationTypeConstants.UPDATE_ASSOCIATION_TYPE_ROLE_TOPIC_TYPE_FIELD:
            if(action.key==='topicTypeId')
                return{
                    ...state,
                    newAssociationTypesRolesTopicType: {...state.newAssociationTypesRolesTopicType, topicTypesIds: action.value} ,
                };

            return{
                ...state,
                newAssociationTypesRolesTopicType: {...state.newAssociationTypesRolesTopicType, [action.key]:action.value} ,

            };

        case associationTypeConstants.OPEN_ASSOCIATION_TYPES_MODAL_REQUEST:
            return{
                ...state,
                isOpenAssociationTypesModal: true,
            };
        case associationTypeConstants.CLOSE_ASSOCIATION_TYPES_MODAL_REQUEST:
            return{
                ...state,
                isOpenAssociationTypesModal: false
            };
        case associationTypeConstants.ADD_ASSOCIATION_TYPES_REQUEST:
            let newAssociationType = Object.assign({id: undefined ,name: "", description: "",schemaId:undefined ,associationTypeRoles: [{name:'', description: ''},{name:'', description: ''}]});
            return{
                ...state,
                associationTypes:  (state.associationTypes || []).concat(newAssociationType),
            };
        case associationTypeConstants.REMOVE_ASSOCIATION_TYPES_REQUEST:

            return{
                ...state,
                associationTypes: state.associationTypes.filter((ass,i)=>ass.id !== undefined)
            };
        case associationTypeConstants.CLOSE_OPERATION_SUCCESS_MODAL:
            return{
                ...state,
                operationSuccessAssType: false
            };
        case associationTypeConstants.CLOSE_OPERATION_FAILED_MODAL:
            return{
                ...state,
                operationFailedAssType: false,
            };
        case associationTypeConstants.DELETE_ASSOCIATION_TYPES_REQUEST:
            return{
                ...state,
                deletingAssType: true
            };
        case associationTypeConstants.DELETE_ASSOCIATION_TYPES_SUCCESS:
            return {
                ...state,
                deletingAssType:false,
                operationSuccessAssType: true,
                isOpenDeleteAssTypeConfirm: false,
                associationTypes: state.associationTypes.filter((ass) => ass.id !== action.associationTypeToDelete.associationTypeToDelete )
            };
        case associationTypeConstants.DELETE_ASSOCIATION_TYPES_FAILURE:
            return{
                ...state,
                deletingAssType:false,
                operationFailedAssType: true,
                isOpenDeleteAssTypeConfirm: false
            };
        case associationTypeConstants.OPEN_ASSOCIATION_TYPES_DELETE_CONFIRM:
            return{
                ...state,
                isOpenDeleteAssTypeConfirm: true,
                associationTypeToDelete: action.associationTypeId
            };

        case associationTypeConstants.OPEN_ASSOCIATION_TYPES_ROLES_MODAL_REQUEST:
            let newAssociationTypeRolesTopicTypesBlank= Object.assign({associationTypeId: undefined,roleId: undefined,topicTypesIds: []})
            return{
                ...state,
                isOpenAssociationTypesRolesModal: true,
                newAssociationTypesRolesTopicType: newAssociationTypeRolesTopicTypesBlank
            };
        case associationTypeConstants.CLOSE_ASSOCIATION_TYPES_ROLES_MODAL_REQUEST:
            return{
                ...state,
                isOpenAssociationTypesRolesModal: false,
            };
        case associationTypeConstants.SAVE_ASSOCIATION_TYPES_REQUEST:
            return {
                ...state,
                savingAssType: true,
            }
        case associationTypeConstants.SAVE_ALL_ASSOCIATION_TYPES_REQUEST:
            return{
                ...state,
                savingAssType: true
            };
        case associationTypeConstants.SAVE_ASSOCIATION_TYPES_SUCCESS:
            return{
                ...state,
                savingAssType: false,
                operationSuccessAssType: true,
                associationTypes:  state.associationTypes.map((associationType,i)=>(associationType.id === undefined && associationType.name === action.newAssociationType.newAssociationType.name && associationType.description === action.newAssociationType.newAssociationType.description ? {...associationType, id: action.newAssociationType.newAssociationType.id }:associationType))

            }
        case associationTypeConstants.SAVE_ALL_ASSOCIATION_TYPES_SUCCESS:
            let idsWithBlanks=action.newAssociationTypesIds.newAssociationTypesIds;
            return{
                ...state,
                savingAssType:false,
                operationSuccessAssType: true,
                associationTypes:   state.associationTypes.map((associationType,i)=>(associationType.id === undefined && associationType.name !== '' && associationType.description !== '' ? {...associationType, id: idsWithBlanks.shift() }:associationType))

            };
        case associationTypeConstants.SAVE_ASSOCIATION_TYPES_FAILURE:
            return{
                ...state,
                operationFailedAssType: true,
            }
        case associationTypeConstants.SAVE_ALL_ASSOCIATION_TYPES_FAILURE:
            return{
                ...state,
                savingAssType:false,
                operationFailedAssType: true
            };
        case associationTypeConstants.UPDATE_ASSOCIATION_TYPE_ROLE_TOPIC_TYPE_REQUEST:
            return{
                ...state,
                updatingAssTypeRoleTopicType:true
            }
        case associationTypeConstants.UPDATE_ASSOCIATION_TYPE_ROLE_TOPIC_TYPE_SUCCESS:
            return{
                ...state,
                updatingAssTypeRoleTopicType:false
            }
        case associationTypeConstants.UPDATE_ASSOCIATION_TYPE_ROLE_TOPIC_TYPE_FAILURE:
            return{
                ...state,
                updatingAssTypeRoleTopicType:false
            }

        case associationTypeConstants.CLOSE_ASSOCIATION_TYPES_DELETE_CONFIRM:
            return{
                ...state,
                isOpenDeleteAssTypeConfirm: false,
                assTypeToDelete: null
            };
        case associationTypeConstants.GET_ASSOCIATION_TYPE_BY_ID_REQUEST:
            return{
                ...state,
                searching: true

            };
        case associationTypeConstants.GET_ASSOCIATION_TYPE_BY_ID_SUCCESS:
            return{
                ...state,
                searching: false,
                foundAssociationType: action.foundAssociationType.foundAssociationType

            };
        case associationTypeConstants.GET_ASSOCIATION_TYPE_BY_ID_FAILURE:
            return{
                ...state,
                searching: false

            };

        case associationTypeConstants.CLEAR_ASSOCIATION_TYPE:
            return{
                ...state,
                foundAssociationType: null,
                associationTypeToDelete: null,

            };
        default:
            return state;
    }
}