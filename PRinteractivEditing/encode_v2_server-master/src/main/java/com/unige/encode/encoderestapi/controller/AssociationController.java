package com.unige.encode.encoderestapi.controller;

import com.unige.encode.encoderestapi.model.*;
import com.unige.encode.encoderestapi.service.*;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import org.jetbrains.annotations.Nullable;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import javax.validation.Valid;
import java.security.Principal;
import java.util.*;

@RestController
@RequestMapping(value = "/protected/v1")
@Api(value = "Association Management System")
public class AssociationController {
    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired private UserService userService;
    @Autowired private AssociationService associationService;
    @Autowired private TopicAssociationRoleService topicAssociationRoleService;
    @Autowired private AssociationTypeService associationTypeService;
    @Autowired private TopicService topicService;
    @Autowired private TopicmapService topicmapService;
    @Autowired private RoleService roleService;
    @Autowired private ScopeService scopeService;


    @ApiOperation(value = "Create an Association and the bindings between Topics and Roles", response = List.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, response = void.class, message = "Successfully added new Association"),
            @ApiResponse(code = 400, response = void.class, message = "If Topicmap and Association Type are not given or do not belong to the same schema \n" +
                    "If the Roles are not given or not compliant with the Association Type requirements \n" +
                    "If every Role of the Association Type is not fulfilled or a Topic appears more than once or a Topic do not have the right to have his Role \n" +
                    "If the Association is strictly equal to an existing one \n" +
                    "If the given Scopes do not belong to the same schema or is referenced more than once"),
            @ApiResponse(code = 403, response = void.class, message = "If the user do not have the right to modify the Topicmap"),
            @ApiResponse(code = 404, response = void.class, message = "If the user do not exist \n" +
                    "If the Topicmap, the Association Type or one of the Scopes referenced do not exist")
    })
    @RequestMapping(value = "/association", method = RequestMethod.POST, consumes = "application/json")
    @Transactional
    public ResponseEntity<?> createAssociation(@Valid @RequestBody Association newAssociation, Principal principal){
        String principalName = principal.getName();
        long topicmapId = newAssociation.getTopicmapId();
        long associationTypeId = newAssociation.getAssociationTypeId();
        logger.info("Received a POST request from User {} for new Association.",principalName);

        //Check User existence
        ResponseEntity<?> existsUser = checkUserExistence(principalName);
        if(existsUser != null) return existsUser;

        //Check if owning topicmap is given
        if(topicmapId == 0){
            logger.error("No owning TopicMap given for new Association.");
            return new ResponseEntity<>(Collections.singletonMap("message", "An Association needs a TopicMap."), HttpStatus.BAD_REQUEST);
        }

        //Check if association type is given
        if(associationTypeId == 0){
            logger.error("No Association Type given for new Association.");
            return new ResponseEntity<>(Collections.singletonMap("message", "An Association needs an Association Type."), HttpStatus.BAD_REQUEST);
        }

        //Check if bindings are given
        Collection<TopicAssociationRole> newTopicAssociationRole = newAssociation.getAssociationTopicAssociationRoles();
        if(newTopicAssociationRole == null){
            logger.error("An Association needs bindings.");
            return new ResponseEntity<>(Collections.singletonMap("message", "An Association needs bindings."), HttpStatus.BAD_REQUEST);
        }

        //Check topicmap existence
        if(!topicmapService.existsTopicmapById(topicmapId)) {
            logger.error("Referenced TopicMap with id {} not found.", topicmapId);
            return new ResponseEntity<>(Collections.singletonMap("message", "TopicMap of Association not found."), HttpStatus.NOT_FOUND);
        }

        //Check user privileges (has to be an editor/owner/admin of the topicmap)
        User user = userService.getUserByEmail(principalName);
        ResponseEntity<?> userPrivileges = checkUserPrivileges(user, topicmapId);
        if(userPrivileges != null) return userPrivileges;


        //Check AssociationType existence
        if(!associationTypeService.existsAssociationTypeById(associationTypeId)) {
            logger.error("Referenced Association Type with id {} not found.", associationTypeId);
            return new ResponseEntity<>(Collections.singletonMap("message", "Association Type of Association not found."), HttpStatus.NOT_FOUND);
        }

        //Check that the TopicMap and the AssociationType belongs to the same schema
        AssociationType associationType = associationTypeService.getAssociationTypeById(associationTypeId);
        Topicmap topicmap = topicmapService.getTopicmapById(topicmapId);
        if(associationType.getSchemaId() != topicmap.getSchemaId()){
            logger.error("The Association Type and the TopicMap do not belong to the same Schema.");
            return new ResponseEntity<>(Collections.singletonMap("message", "The referenced TopicMap and Association Type do not belong to the same schema."), HttpStatus.BAD_REQUEST);
        }

        //Check number of binding in the association
        long rolesNumber = associationType.getAssociationTypeRoles().size();
        if(newTopicAssociationRole.size() != rolesNumber){
            logger.error("The Association Type of this Association needs {} bindings, {} given.", rolesNumber, newTopicAssociationRole.size());
            return new ResponseEntity<>(Collections.singletonMap("message", "This Association needs "+ rolesNumber + " bindings."), HttpStatus.BAD_REQUEST);
        }

        //Check that every Role is fulfilled AND Topic are uniques AND Topic have the right to have this Role
        Set<Role> newAssociationRoles = new HashSet<>();
        Set<Topic> newAssociationTopics = new HashSet<>();

        for (TopicAssociationRole tar : newTopicAssociationRole) {
            long topicId = tar.getTopicId();
            long roleId = tar.getRoleId();

            //Check if topic exists
            if (!topicService.existsTopicById(topicId)) {
                logger.error("Topic with id: {} does not exist.", topicId);
                return new ResponseEntity<>(Collections.singletonMap("message", "Topic with id " + topicId + " does not exist."), HttpStatus.BAD_REQUEST);
            }
            Topic topic = topicService.getTopicById(topicId);

            //Check that topic is not already used in association
            if (!newAssociationTopics.add(topic)) {
                logger.error("Topic with id: {} cannot have multiple roles in Association.", topicId);
                return new ResponseEntity<>(Collections.singletonMap("message", "Topic with id " + topicId + " cannot have multiple roles in Association."), HttpStatus.BAD_REQUEST);
            }

            //Check that topic belong to same topicmap
            if(topic.getTopicmapId() != topicmapId){
                logger.error("Topic with id {}, do not belong to the same Topicmap.", topicId);
                return new ResponseEntity<>(Collections.singletonMap("message", "Topic with id " + topicId + " do not belong to the same Topicmap."), HttpStatus.BAD_REQUEST);
            }


            //Check if role exists
            if (!roleService.existsRoleById(roleId)) {
                logger.error("Role with id: {} does not exist.", roleId);
                return new ResponseEntity<>(Collections.singletonMap("message", "Role with id " + roleId + " does not exist."), HttpStatus.BAD_REQUEST);
            }
            Role role = roleService.getRoleById(roleId);

            //Check that role is not already used in association
            if (!newAssociationRoles.add(role)) {
                logger.error("Role with id: {} cannot have multiple instances in Association.", roleId);
                return new ResponseEntity<>(Collections.singletonMap("message", "Role with id " + roleId + " cannot have multiple instances in Association."), HttpStatus.BAD_REQUEST);
            }

            //Check that role belong to associationType
            if(role.getAssociationTypeId() != associationTypeId){
                logger.error("Role with id {}, do not belong to AssociationType.", roleId);
                return new ResponseEntity<>(Collections.singletonMap("message", "Role with id " + roleId + " do not belong to the same AssociationType."), HttpStatus.BAD_REQUEST);
            }

            //Check that topic can take its associated role
            if(!role.getRoleTopicTypes().contains(topic.getTopicTopicType())){
                logger.error("Topic with id {}, cannot take Role with id {}.", topicId, roleId);
                return new ResponseEntity<>(Collections.singletonMap("message", "Topic with id " + topicId + " cannot be of associated Role."), HttpStatus.BAD_REQUEST);
            }

            tar.setTarRole(role);
            tar.setTarTopic(topic);
        }

        //Check to avoid EXACT same Association to exist (same association Type, same topics in it and same roles)
        //We check with the first TopicAssociationRole in the new ones (everything has to be the same so start with one)
        TopicAssociationRole newTar = newTopicAssociationRole.iterator().next();
        long tId = newTar.getTopicId();
        long rId = newTar.getRoleId();
        if(topicAssociationRoleService.existsTopicAssociationRoleByRoleIdAndTopicId(rId, tId)){
            for(TopicAssociationRole topicTar: topicAssociationRoleService.getTopicAssociationRolesByRoleIdAndTopicId(rId,tId)){
                Association tarAssociation = topicTar.getTarAssociation();
                if(tarAssociation.getAssociationTypeId() == associationTypeId){
                    boolean isEqual = false;
                    Collection<TopicAssociationRole> existingTar = tarAssociation.getAssociationTopicAssociationRoles();
                    int i = 0;
                    int tarSize = existingTar.size();
                    for(TopicAssociationRole aTar: existingTar){
                        for(TopicAssociationRole nTar: newTopicAssociationRole){
                            if(nTar.getRoleId() == aTar.getRoleId() && nTar.getTopicId() == aTar.getTopicId()){
                                isEqual = true;
                                i++;
                                break;
                            }
                        }
                        if (!isEqual) break;
                        isEqual = false;
                    }
                    if(i == tarSize){
                        logger.error("Identical Association already exists.");
                        return new ResponseEntity<>(Collections.singletonMap("message", "An Identical Association already exists."), HttpStatus.BAD_REQUEST);
                    }
                }
            }
        }



        //Check if Scopes are valid
        List<AssociationScope> associationScopes = newAssociation.getAssociationAssociationScopes();
        if(associationScopes != null && !associationScopes.isEmpty()){
            Set<Long> scopesToBind = new HashSet<>();
            for(AssociationScope as: associationScopes){
                long asScopeId = as.getId().getScopeId();

                //Check Scope is given
                if(asScopeId == 0){
                    logger.error("AssociationScope needs a Scope.");
                    return new ResponseEntity<>(Collections.singletonMap("message", "An AssociationScope needs a Scope."), HttpStatus.BAD_REQUEST);
                }

                //Check Scope is unique
                if(!scopesToBind.add(asScopeId)){
                    logger.error("An Association cannot have several times the same Scope.");
                    return new ResponseEntity<>(Collections.singletonMap("message", "Association cannot have several times the same Scope."), HttpStatus.BAD_REQUEST);
                }

                //Check Scope existence
                if(!scopeService.existsScopeById(asScopeId)) {
                    logger.error("Referenced Scope with id {} not found.", asScopeId);
                    return new ResponseEntity<>(Collections.singletonMap("message", "Scope for AssociationScope not found."), HttpStatus.NOT_FOUND);
                }

                //Check Scope and Association belongs to same schema
                Scope scope = scopeService.getScopeById(asScopeId);
                if(topicmap.getSchemaId() != scope.getSchemaId()){
                    logger.error("The Scope and the TopicMap of Association do not belong to the same Schema.");
                    return new ResponseEntity<>(Collections.singletonMap("message", "The referenced Scope and Association do not belong to the same schema."), HttpStatus.BAD_REQUEST);
                }
            }
        }

        //All the roles of AssociationType are fulfilled by authorized Topics which are uniques
        //We can save
        newAssociation.setAssociationTopicAssociationRoles(null);
        newAssociation.setAssociationAssociationType(associationType);
        newAssociation.setAssociationTopicmap(topicmap);
        associationService.saveAssociation(newAssociation);
        long newAssociationId = newAssociation.getId();
        newTopicAssociationRole.forEach(tar -> {tar.setAssociationId(newAssociationId); tar.setTarAssociation(newAssociation);});
        topicAssociationRoleService.saveAllTopicAssociationRole(newTopicAssociationRole);

        logger.info("New Association added with id {}.", newAssociationId);
        return new ResponseEntity<>(newAssociationId, HttpStatus.OK);
    }


    @ApiOperation(value = "Get an Association and its bindings between Topics and Roles", response = List.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, response = void.class, message = "Successfully retrieved the Association"),
            @ApiResponse(code = 403, response = void.class, message = "If the user is not an editor or owner of the Topicmap"),
            @ApiResponse(code = 404, response = void.class, message = "If the user do not exist \n" +
                    "If the Association referenced do not exist")
    })
    @RequestMapping(value = "/association", method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<?> getAssociationTypeById(@RequestParam("association_id") long associationId, Principal principal){
        String principalName = principal.getName();
        logger.info("Received a GET request from User {} for Association with id: {}.", principalName, associationId);

        //Check User existence
        ResponseEntity<?> existsUser = checkUserExistence(principalName);
        if(existsUser != null) return existsUser;

        //Check Association existence
        ResponseEntity<?> existsAssociation = checkAssociationExistence(associationId);
        if(existsAssociation != null) return existsAssociation;

        //Check user privileges (has to be an editor/owner/admin of the topicmap)
        Association association = associationService.getAssociationById(associationId);
        User user = userService.getUserByEmail(principalName);
        ResponseEntity<?> userPrivileges = checkUserPrivileges(user, association.getTopicmapId());
        if(userPrivileges != null) return userPrivileges;

        logger.info("Found Association with id {}.", associationId);
        return new ResponseEntity<>(association, HttpStatus.OK);
    }

    @ApiOperation(value = "Get all the Associations of the user (where he is owner of the schema or editor on a Topicmap using the schema)", response = List.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, response = void.class, message = "Successfully retrieved Association"),
            @ApiResponse(code = 404, response = void.class, message = "If the user do not exist \n" +
                    "If the user have no Association")
    })
    @RequestMapping(value = "/associations", method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<?> getAllAssociations(Principal principal){
        String principalName = principal.getName();
        logger.info("User {} have request all his Associations.", principalName);

        //Check User existence
        ResponseEntity<?> existsUser = checkUserExistence(principalName);
        if(existsUser != null) return existsUser;

        // First fetch all the schemaId that the User has access in reading (his own and those of the TopicMaps where he is an editor)
        User user = userService.getUserByEmail(principalName);
        Set<Topicmap> userSharedTopicmap = user.getAllUserSharedTopicmap();
        Set<Collection<Topicmap>> schemasTopicmap = new HashSet<>();
        Collection<Schema> userSchemas = user.getAllUserSchemas();
        Set<Long> allUserSchemaId = new HashSet<>();
        Set<Long> allUserTopicmapId = new HashSet<>();



        userSchemas.forEach(sc-> schemasTopicmap.add(sc.getSchemaTopicMaps()));
        schemasTopicmap.forEach(col-> col.forEach(tm-> allUserTopicmapId.add(tm.getId())));

        // Get the Associations
        List<Association> associations = associationService.getByTopicmapIdIsIn(allUserTopicmapId);

        if(associations == null || associations.isEmpty()){
            logger.info("No Association found.");
            return new ResponseEntity<>(Collections.singletonMap("message", "No Association found."), HttpStatus.NOT_FOUND);
        }

        logger.info("Found {} Associations.", associations.size());
        return new ResponseEntity<>(associations, HttpStatus.OK);
    }


    @ApiOperation(value = "Update the bindings between Topics and Roles and the Scopes of the Association", response = List.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, response = void.class, message = "Successfully updated the Association"),
            @ApiResponse(code = 400, response = void.class, message = "If the Roles are not given or not compliant with the Association Type requirements \n" +
                    "If every Role of the Association Type is not fulfilled or a Topic appears more than once or a Topic do not have the right to have his Role \n" +
                    "If the new version of the Association is strictly equal to an existing one \n" +
                    "If the given Scopes do not belong to the same schema or is referenced more than once"),
            @ApiResponse(code = 403, response = void.class, message = "If the user is not an editor or owner of the Topicmap"),
            @ApiResponse(code = 404, response = void.class, message = "If the user do not exist \n" +
                    "If the Association or Scope referenced or one of the Topic or Role in the bindings do not exist")
    })
    @RequestMapping(value = "/association", method = RequestMethod.PUT, produces = "application/json")
    @Transactional
    public ResponseEntity<?> updateAssociation(@RequestBody @Valid Association associationToUpdate, Principal principal){
        String principalName = principal.getName();
        long associationId = associationToUpdate.getId();
        logger.info("Received a PUT request from User {} for Association with id: {}.", principalName, associationId);

        //Check User existence
        ResponseEntity<?> existsUser = checkUserExistence(principalName);
        if(existsUser != null) return existsUser;

        //Check Association existence
        ResponseEntity<?> existsAssociation = checkAssociationExistence(associationId);
        if(existsAssociation != null) return existsAssociation;

        //Check user privileges (has to be an editor/owner/admin of the topicmap)
        Association oldAssociation = associationService.getAssociationById(associationId);
        User user = userService.getUserByEmail(principalName);
        ResponseEntity<?> userPrivileges = checkUserPrivileges(user, oldAssociation.getTopicmapId());
        if(userPrivileges != null) return userPrivileges;

        //Check if bindings are given
        Collection<TopicAssociationRole> associationTopicAssociationRoles = associationToUpdate.getAssociationTopicAssociationRoles();
        if(associationTopicAssociationRoles == null){
            logger.error("An Association needs bindings.");
            return new ResponseEntity<>(Collections.singletonMap("message", "An Association needs bindings."), HttpStatus.BAD_REQUEST);
        }

        //Check number of binding in the association
        long rolesNumber = oldAssociation.getAssociationAssociationType().getAssociationTypeRoles().size();
        if(associationTopicAssociationRoles.size() != rolesNumber){
            logger.error("The Association Type of this Association needs {} bindings, {} given.", rolesNumber, associationTopicAssociationRoles.size());
            return new ResponseEntity<>(Collections.singletonMap("message", "This Association needs "+ rolesNumber + " bindings."), HttpStatus.BAD_REQUEST);
        }

        //Check if Scopes are valid
        List<AssociationScope> associationScopesToUpdate = associationToUpdate.getAssociationAssociationScopes();
        if(associationScopesToUpdate != null && !associationScopesToUpdate.isEmpty()){
            Set<Long> scopesToBind = new HashSet<>();
            Topicmap topicmap = topicmapService.getTopicmapById(oldAssociation.getTopicmapId());
            for(AssociationScope as: associationScopesToUpdate){
                long asAssociationId = as.getId().getAssociationId();
                long asScopeId = as.getId().getScopeId();

                //Check Topic given == topicId to update
                if(asAssociationId != associationId){
                    logger.error("Association in AssociationScope needs to be the same as Association.");
                    return new ResponseEntity<>(Collections.singletonMap("message", "Referenced Association in AssociationScope needs to be the same as Association."), HttpStatus.BAD_REQUEST);
                }

                //Check Scope is given
                if(asScopeId == 0){
                    logger.error("AssociationScope needs a Scope.");
                    return new ResponseEntity<>(Collections.singletonMap("message", "An AssociationScope needs a Scope."), HttpStatus.BAD_REQUEST);
                }

                //Check Scope is unique
                if(!scopesToBind.add(asScopeId)){
                    logger.error("An Association cannot have several times the same Scope.");
                    return new ResponseEntity<>(Collections.singletonMap("message", "Association cannot have several times the same Scope."), HttpStatus.BAD_REQUEST);
                }

                //Check Scope existence
                if(!scopeService.existsScopeById(asScopeId)) {
                    logger.error("Referenced Scope with id {} not found.", asScopeId);
                    return new ResponseEntity<>(Collections.singletonMap("message", "Scope for AssociationScope not found."), HttpStatus.NOT_FOUND);
                }

                //Check Scope and Topic belongs to same schema
                Scope scope = scopeService.getScopeById(asScopeId);
                if(topicmap.getSchemaId() != scope.getSchemaId()){
                    logger.error("The Scope and the TopicMap of Association do not belong to the same Schema.");
                    return new ResponseEntity<>(Collections.singletonMap("message", "The referenced Scope and Association do not belong to the same schema."), HttpStatus.BAD_REQUEST);
                }
            }
        }

        //Check that every Role is fulfilled AND Topic are uniques AND Topic have the right to have this Role
        Set<Role> associationRoles = new HashSet<>();
        Set<Topic> associationTopics = new HashSet<>();
        HashMap<Long,Long> topicsInOldAssociation = new HashMap<>();
        Set<Long> updatedTarIds = new HashSet<>();
        Set<Long> baseTarIds = new HashSet<>();
        Collection<TopicAssociationRole> updatedTopicAssociationRoles = new HashSet<>();
        oldAssociation.getAssociationTopicAssociationRoles().forEach(tar -> {updatedTarIds.add(tar.getId()); baseTarIds.add(tar.getId()); topicsInOldAssociation.put(tar.getTopicId(), tar.getId());});
        long topicmapId = oldAssociation.getTopicmapId();
        long associationTypeId = oldAssociation.getAssociationTypeId();

        for(TopicAssociationRole tar: new HashSet<>(associationTopicAssociationRoles)){
            long tarId = tar.getId();
            long topicId = tar.getTopicId();
            long roleId = tar.getRoleId();

            //Check if tar belongs to this association
            if (!baseTarIds.remove(tarId)) {
                logger.error("Binding with id: {} does not belong to this Association.", tarId);
                return new ResponseEntity<>(Collections.singletonMap("message", "Binding with id " + tarId + " does not belong to Association."), HttpStatus.BAD_REQUEST);
            }

            //Check if topic exists
            if (!topicService.existsTopicById(topicId)) {
                logger.error("Topic with id: {} does not exist.", topicId);
                return new ResponseEntity<>(Collections.singletonMap("message", "Topic with id " + topicId + " does not exist."), HttpStatus.BAD_REQUEST);
            }
            Topic topic = topicService.getTopicById(topicId);

            //Check that topic is not already used in association
            if (!associationTopics.add(topic)) {
                logger.error("Topic with id: {} cannot have multiple roles in Association.", topicId);
                return new ResponseEntity<>(Collections.singletonMap("message", "Topic with id " + topicId + " cannot have multiple roles in Association."), HttpStatus.BAD_REQUEST);
            }

            //Check that topic belong to same topicmap
            if(topic.getTopicmapId() != topicmapId){
                logger.error("Topic with id {}, do not belong to the same Topicmap.", topicId);
                return new ResponseEntity<>(Collections.singletonMap("message", "Topic with id " + topicId + " do not belong to the same Topicmap."), HttpStatus.BAD_REQUEST);
            }


            //Check if role exists
            if (!roleService.existsRoleById(roleId)) {
                logger.error("Role with id: {} does not exist.", roleId);
                return new ResponseEntity<>(Collections.singletonMap("message", "Role with id " + roleId + " does not exist."), HttpStatus.BAD_REQUEST);
            }
            Role role = roleService.getRoleById(roleId);

            //Check that role is not already used in association
            if (!associationRoles.add(role)) {
                logger.error("Role with id: {} cannot have multiple instances in Association.", roleId);
                return new ResponseEntity<>(Collections.singletonMap("message", "Role with id " + roleId + " cannot have multiple instances in Association."), HttpStatus.BAD_REQUEST);
            }

            //Check that role belong to associationType
            if(role.getAssociationTypeId() != associationTypeId){
                logger.error("Role with id {}, do not belong to AssociationType.", roleId);
                return new ResponseEntity<>(Collections.singletonMap("message", "Role with id " + roleId + " do not belong to the same AssociationType."), HttpStatus.BAD_REQUEST);
            }

            //Check that topic can take its associated role
            if(!role.getRoleTopicTypes().contains(topic.getTopicTopicType())){
                logger.error("Topic with id {}, cannot take Role with id {}.", topicId, roleId);
                return new ResponseEntity<>(Collections.singletonMap("message", "Topic with id " + topicId + " cannot be of associated Role."), HttpStatus.BAD_REQUEST);
            }

            //Check that Topic was already used in the previous version of the association
            if(topicsInOldAssociation.containsKey(topicId)){
                associationTopicAssociationRoles.remove(tar);
                long newId = topicsInOldAssociation.get(topicId);
                tar.setId(newId);
                updatedTarIds.remove(newId);
                topicsInOldAssociation.remove(topicId);
                tar.setAssociationId(associationId);
                tar.setTarAssociation(oldAssociation);
                tar.setTarRole(role);
                tar.setTarTopic(topic);
                updatedTopicAssociationRoles.add(tar);
            }

        }

        //The remaining one are with Topics that weren't already used
        if(!associationTopicAssociationRoles.isEmpty()) {
            for (TopicAssociationRole tar : associationTopicAssociationRoles) {
                tar.setId(updatedTarIds.iterator().next());
                tar.setAssociationId(associationId);
                tar.setTarAssociation(oldAssociation);
                tar.setTarRole(roleService.getRoleById(tar.getRoleId()));
                tar.setTarTopic(topicService.getTopicById(tar.getTopicId()));
                updatedTopicAssociationRoles.add(tar);
            }
        }

        //Check to avoid EXACT same Association to exist (same association Type, same topics in it and same roles)
        //We check with the first TopicAssociationRole in the updated ones (everything has to be the same so start with one)
        TopicAssociationRole newTar = updatedTopicAssociationRoles.iterator().next();
        long tId = newTar.getTopicId();
        long rId = newTar.getRoleId();
        if(topicAssociationRoleService.existsTopicAssociationRoleByRoleIdAndTopicId(rId, tId)){
            for(TopicAssociationRole topicTar: topicAssociationRoleService.getTopicAssociationRolesByRoleIdAndTopicId(rId,tId)){
                Association tarAssociation = topicTar.getTarAssociation();
                if(tarAssociation.getId() == newTar.getAssociationId()) continue;
                if(tarAssociation.getAssociationTypeId() == associationTypeId){
                    boolean isEqual = false;
                    Collection<TopicAssociationRole> existingTar = tarAssociation.getAssociationTopicAssociationRoles();
                    int i = 0;
                    int tarSize = existingTar.size();
                    for(TopicAssociationRole aTar: existingTar){
                        for(TopicAssociationRole nTar: updatedTopicAssociationRoles){
                            if(nTar.getRoleId() == aTar.getRoleId() && nTar.getTopicId() == aTar.getTopicId()){
                                isEqual = true;
                                i++;
                                break;
                            }
                        }
                        if (!isEqual) break;
                        isEqual = false;
                    }
                    if(i == tarSize){
                        logger.error("Identical Association already exists.");
                        return new ResponseEntity<>(Collections.singletonMap("message", "An Identical Association already exists."), HttpStatus.BAD_REQUEST);
                    }
                }
            }
        }

        //Saving association
        associationService.updateAssociation(associationToUpdate, oldAssociation);
        topicAssociationRoleService.saveAllTopicAssociationRole(updatedTopicAssociationRoles);
        logger.info("Updated Association with id {}.", associationId);
        return new ResponseEntity<>(Collections.singletonMap("message", "Association updated."), HttpStatus.OK);
    }

    @ApiOperation(value = "Delete an Association and its bindings between Topics and Roles", response = List.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, response = void.class, message = "Successfully deleted the Association"),
            @ApiResponse(code = 403, response = void.class, message = "If the user is not an editor or owner of the Topicmap"),
            @ApiResponse(code = 404, response = void.class, message = "If the user do not exist \n" +
                    "If the Association referenced do not exist")
    })
    @RequestMapping(value= "/association", method = RequestMethod.DELETE, produces = "application/json")
    public ResponseEntity<?> deleteAssociation(@RequestParam("association_id") long associationId, Principal principal){
        String principalName = principal.getName();
        logger.info("Received a DELETE request from User {} for Association with id: {}.", principalName, associationId);

        //Check User existence
        ResponseEntity<?> existsUser = checkUserExistence(principalName);
        if(existsUser != null) return existsUser;

        //Check Association existence
        ResponseEntity<?> existsAssociation = checkAssociationExistence(associationId);
        if(existsAssociation != null) return existsAssociation;

        //Check user privileges (has to be an editor/owner/admin of the topicmap)
        long associationTopicmap = associationService.getAssociationById(associationId).getTopicmapId();
        User user = userService.getUserByEmail(principalName);
        ResponseEntity<?> userPrivileges = checkUserPrivileges(user, associationTopicmap);
        if(userPrivileges != null) return userPrivileges;

        //Delete
        associationService.deleteAssociation(associationId);
        logger.info("Association with id {} deleted.", associationId);
        return new ResponseEntity<>(Collections.singletonMap("message", "Association with id " + associationId + " deleted."), HttpStatus.OK);
    }


    @Nullable
    private ResponseEntity<?> checkUserExistence(String email){
        if(!userService.existsUserByEmail(email)) {
            logger.error("Problem during authentication.");
            return new ResponseEntity<>(Collections.singletonMap("message","No User found with this email: " + email), HttpStatus.NOT_FOUND);
        }
        return null;
    }

    @Nullable
    private ResponseEntity<?> checkUserPrivileges(User user, long topicmapId){
        if(!topicmapService.hasUserRightsOnTopicmap(user, topicmapId) && !userService.isUserAdmin(user.getEmail())){
            logger.error("User {} does not have the right on this TopicMap with id {}.", user.getEmail(), topicmapId);
            return new ResponseEntity<>(Collections.singletonMap("message", "User cannot edit this TopicMap."), HttpStatus.FORBIDDEN);
        }
        return null;
    }

    @Nullable
    private ResponseEntity<?> checkAssociationExistence(long associationId){
        if(!associationService.existsAssociationById(associationId)) {
            logger.error("Association with id {} not found.", associationId);
            return new ResponseEntity<>(Collections.singletonMap("message", "No Association found for this id: " + associationId), HttpStatus.NOT_FOUND);
        }
        return null;
    }
}