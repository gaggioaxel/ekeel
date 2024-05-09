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
@Api(value = "Association Type Management System")
public class AssociationTypeController {
    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired private AssociationTypeService associationTypeService;
    @Autowired private RoleService roleService;
    @Autowired private SchemaServiceImpl schemaService;
    @Autowired private UserServiceImpl userService;
    @Autowired private TopicTypeService topicTypeService;
    @Autowired private TopicAssociationRoleService topicAssociationRoleService;

    @ApiOperation(value = "Create an Association Type and its Roles", response = List.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, response = void.class, message = "Successfully added new Association Type and Roles"),
            @ApiResponse(code = 400, response = void.class, message = "If the Schema is not given \n" +
                    "If the number of Roles is not at least 2 \n"),
            @ApiResponse(code = 403, response = void.class, message = "If the user is not the owner of the schema"),
            @ApiResponse(code = 404, response = void.class, message = "If the user do not exist \n" +
                    "If the Schema referenced do not exist")
    })
    @RequestMapping(value = "/associationType", method = RequestMethod.POST, consumes = "application/json")
    @Transactional
    public ResponseEntity<?> createAssociationType(@Valid @RequestBody AssociationType newAssociationType, Principal principal){
        String principalName = principal.getName();
        long schemaId = newAssociationType.getSchemaId();
        logger.info("Received a POST request from User {} for new Association Type.",principalName);

        //Check if owning schema is given
        if(schemaId == 0){
            logger.error("No owning Schema given for new Association Type.");
            return new ResponseEntity<>(Collections.singletonMap("message", "An Association Type needs a Schema."), HttpStatus.BAD_REQUEST);
        }

        //Check number of roles (at least 2)
        Collection<Role> newRoles = newAssociationType.getAssociationTypeRoles();
        if(newRoles == null || newRoles.size() < 2){
            logger.error("An Association Type needs at least 2 Roles (binary relation).");
            return new ResponseEntity<>(Collections.singletonMap("message", "An Association Type needs at least 2 Roles."), HttpStatus.BAD_REQUEST);
        }

        //Check user existence
        ResponseEntity<?> existsUser = checkUserExistence(principalName);
        if(existsUser != null) return existsUser;

        //Check schema existence
        if(!schemaService.existsSchemaById(schemaId)) {
            logger.error("Referenced Schema with id {} not found.", schemaId);
            return new ResponseEntity<>(Collections.singletonMap("message", "Schema of Association Type not found."), HttpStatus.NOT_FOUND);
        }

        //Check user privileges: has to be owner of the schema
        if(!schemaService.hasUserRightsOnSchema(principalName, schemaId) && !userService.isUserAdmin(principalName)){
            logger.error("User {} does not have the right to create an Association Type with the Schema {}.", principalName, schemaId);
            return new ResponseEntity<>(Collections.singletonMap("message", "User cannot create an Association Type under this Schema."), HttpStatus.FORBIDDEN);
        }

        newAssociationType.setAssociationTypeSchema(schemaService.getSchemaById(schemaId));
        associationTypeService.saveAssociationType(newAssociationType);
        long associationTypeId = newAssociationType.getId();

        newRoles.forEach(r -> { r.setRoleAssociationType(newAssociationType); r.setAssociationTypeId(associationTypeId); });
        roleService.saveAllRole(newRoles);

        logger.info("New Association Type {} added with id {}.", newAssociationType.getName(), newAssociationType.getId());
        return new ResponseEntity<>(newAssociationType, HttpStatus.OK);
    }


    @ApiOperation(value = "Create a list of Association Type and their Roles", response = List.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, response = void.class, message = "Successfully added all Association Types and Roles"),
            @ApiResponse(code = 400, response = void.class, message = "If one of the Schema is not given \n" +
                    "If the number of Roles of every Association Type is not at least 2 \n"),
            @ApiResponse(code = 403, response = void.class, message = "If the user is not the owner of all the schema"),
            @ApiResponse(code = 404, response = void.class, message = "If the user do not exist \n" +
                    "If one of the Schema referenced do not exist")
    })
    @RequestMapping(value = "/associationTypes", method = RequestMethod.POST, consumes = "application/json")
    @Transactional
    public ResponseEntity<?> createAssociationTypes(@Valid @RequestBody List<AssociationType> associationTypes, Principal principal){
        String principalName = principal.getName();
        logger.info("Received a POST request from User {} for new Association Types.", principalName);

        Set<Long> allSchemaId = new HashSet<>();
        int associationsWithoutIds=0;

        for (AssociationType at : associationTypes){
            long schemaId = at.getSchemaId();
            //Check if owning schema is given
            if (schemaId == 0) {
                logger.error("No owning Schema given for new Association Type {}.", at.getName());
                return new ResponseEntity<>(Collections.singletonMap("message", "All Association Types need a Schema."), HttpStatus.BAD_REQUEST);
            }

            //Check number of roles (at least 2)
            Collection<Role> newRoles = at.getAssociationTypeRoles();
            if(newRoles == null || newRoles.size() < 2){
                logger.error("An Association Type needs at least 2 Roles (binary relation).");
                return new ResponseEntity<>(Collections.singletonMap("message", "An Association Type needs at least 2 Roles."), HttpStatus.BAD_REQUEST);
            }

            if(!allSchemaId.add(schemaId)) {

                //Check schema existence
                if (!schemaService.existsSchemaById(schemaId)) {
                    logger.error("Referenced Schema with id {} not found for Association Type {}.", schemaId, at.getName());
                    return new ResponseEntity<>(Collections.singletonMap("message", "Schema of Association Type " + at.getName() + " not found."), HttpStatus.NOT_FOUND);
                }

                //Check user privileges: has to be owner of the schema
                if (!schemaService.hasUserRightsOnSchema(principalName, schemaId) && !userService.isUserAdmin(principalName)) {
                    logger.error("User {} does not have the right to create Association Type {} with the Schema {}.", principalName, at.getName(), schemaId);
                    return new ResponseEntity<>(Collections.singletonMap("message", "User cannot create Association Type "+ at.getName() +" under this Schema."), HttpStatus.FORBIDDEN);
                }

            }
            at.setAssociationTypeSchema(schemaService.getSchemaById(schemaId));
            if(at.getId()==0)
                associationsWithoutIds++;
            associationTypeService.saveAssociationType(at);
            long associationTypeId = at.getId();

            newRoles.forEach(r -> { r.setRoleAssociationType(at); r.setAssociationTypeId(associationTypeId); });
            roleService.saveAllRole(newRoles);


        }

        List <AssociationType> allAssociationType= associationTypeService.getAllAssociationsTypes();
        int y=0;
        long newAssociationIds[] = new long [associationsWithoutIds];
        for(int x = allAssociationType.size() - associationsWithoutIds; x < allAssociationType.size(); x++){
            AssociationType auxAt = allAssociationType.get(x);
            newAssociationIds[y] = auxAt.getId();
            y++;
        }
        logger.info("Added {} new Association Types.", associationTypes.size());
        logger.info("\n\n\n ASSTYPEIDS: ",newAssociationIds,"\n\n\n");
        return new ResponseEntity<>(newAssociationIds, HttpStatus.OK);
    }


    @ApiOperation(value = "Create a Role for an existing Association Type", response = List.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, response = void.class, message = "Successfully added new Role for Association Type"),
            @ApiResponse(code = 400, response = void.class, message = "If the Association Type is already used by Associations"),
            @ApiResponse(code = 403, response = void.class, message = "If the user is not the owner of the schema"),
            @ApiResponse(code = 404, response = void.class, message = "If the user do not exist \n" +
                    "If the Association Type referenced do not exist")
    })
    @RequestMapping(value = "/associationType/{id}/role", method = RequestMethod.POST, consumes = "application/json")
    public ResponseEntity<?> createAssociationTypeRole(@Valid @RequestBody Role newRole, Principal principal, @PathVariable long id){
        String principalName = principal.getName();
        logger.info("Received a POST request from User {} for new Role for Association Type with id: {}.",principalName, id);

        //Check if association type exists
        if(!associationTypeService.existsAssociationTypeById(id)){
            logger.error("Referenced Association Type with id {} not found.", id);
            return new ResponseEntity<>(Collections.singletonMap("message", "Association Type not found."), HttpStatus.NOT_FOUND);
        }

        //Check user existence
        ResponseEntity<?> existsUser = checkUserExistence(principalName);
        if(existsUser != null) return existsUser;

        //Check association type usage : this method is usable only if the association type is not used anywhere
        AssociationType associationType = associationTypeService.getAssociationTypeById(id);
        if(!associationType.getAllAssociations().isEmpty()){
            logger.error("Association Type is already in use. Cannot add a new Role.");
            return new ResponseEntity<>(Collections.singletonMap("message", "Association Type is used in Associations, cannot add new Role."), HttpStatus.BAD_REQUEST);
        }

        //Check user privileges: has to be owner of the schema
        long schemaId = associationType.getSchemaId();
        if (!schemaService.hasUserRightsOnSchema(principalName, schemaId) && !userService.isUserAdmin(principalName)) {
            logger.error("User {} does not have the right to create Role {} for Association Type {}.", principalName, newRole.getName(), associationType.getName());
            return new ResponseEntity<>(Collections.singletonMap("message", "User cannot create Role "+ newRole.getName() +" under this Association Type."), HttpStatus.FORBIDDEN);
        }

        newRole.setAssociationTypeId(id);
        newRole.setRoleAssociationType(associationType);
        roleService.saveRole(newRole);

        logger.info("New Role {} for Association Type with id {}, added with id {}.", newRole.getName(), id, newRole.getId());
        return new ResponseEntity<>(Collections.singletonMap("message", "Role correctly saved with id: " + newRole.getId()), HttpStatus.OK);

    }


    @ApiOperation(value = "Get an Association Type and its Roles", response = List.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, response = void.class, message = "Successfully retrieved the Association Type"),
            @ApiResponse(code = 403, response = void.class, message = "If the user is not the owner of the schema nor an editor of a Topicmap using this schema"),
            @ApiResponse(code = 404, response = void.class, message = "If the user do not exist \n" +
                    "If the Association Type referenced do not exist")
    })
    @RequestMapping(value = "/associationType", method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<?> getAssociationTypeById(@RequestParam("association_type_id") long associationTypeId, Principal principal){
        String principalName = principal.getName();
        logger.info("Received a GET request from User {} for Association Type with id: {}.", principalName, associationTypeId);

        //Check User existence
        ResponseEntity<?> existsUser = checkUserExistence(principalName);
        if(existsUser != null) return existsUser;

        //Check Association Type existence
        ResponseEntity<?> existsAssociationType = checkAssociationTypeExistence(associationTypeId);
        if(existsAssociationType != null) return existsAssociationType;

        //Check User privileges == has to be Owner of the Schema OR admin OR be an Editor on a TopicMap using the Schema
        AssociationType associationType = associationTypeService.getAssociationTypeById(associationTypeId);
        long schemaId = associationType.getSchemaId();
        ResponseEntity<?> userPrivileges = checkUserPrivileges(principalName, schemaId, associationTypeId);
        if(userPrivileges != null){
            User user = userService.getUserByEmail(principalName);
            Set<Topicmap> userSharedTopicmap = user.getAllUserSharedTopicmap();
            if(userSharedTopicmap.stream().noneMatch(tm -> tm.getSchemaId() == schemaId)){
                return userPrivileges;
            }
            logger.info("User {} have reading right on Association Type with id {}.", principalName, associationTypeId);
        }

        logger.info("Found Association Type with id {}.", associationTypeId);
        return new ResponseEntity<>(associationType, HttpStatus.OK);
    }


    @ApiOperation(value = "Get all the Association Types and their Roles the user has access to (where he is owner of the schema or editor on a Topicmap using the schema)", response = List.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, response = void.class, message = "Successfully retrieved all the Association Type"),
            @ApiResponse(code = 404, response = void.class, message = "If the user do not exist \n" +
                    "If no Association Type is found")
    })
    @RequestMapping(value = "/associationTypes", method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<?> getAllAssociationsTypes(Principal principal){
        String principalName = principal.getName();
        logger.info("User {} have request all his Association Types.", principalName);

        //Check User existence
        ResponseEntity<?> existsUser = checkUserExistence(principalName);
        if(existsUser != null) return existsUser;

        // First fetch all the schemaId that the User has access in reading (his own and those of the TopicMaps where he is an editor)
        User user = userService.getUserByEmail(principalName);
        Set<Topicmap> userSharedTopicmap = user.getAllUserSharedTopicmap();
        Collection<Schema> userSchemas = user.getAllUserSchemas();
        Set<Long> allUserSchemaId = new HashSet<>();

        userSharedTopicmap.forEach(tm -> allUserSchemaId.add(tm.getSchemaId()));
        userSchemas.forEach(s -> allUserSchemaId.add(s.getId()));

        // Get the AssociationTypes
        List<AssociationType> associationTypes = associationTypeService.getBySchemaIdIsIn(allUserSchemaId);

        if(associationTypes == null || associationTypes.isEmpty()){
            logger.info("No Association Type found.");
            return new ResponseEntity<>(Collections.singletonMap("message", "No Association Type found."), HttpStatus.NOT_FOUND);
        }

        logger.info("Found {} Association Types.", associationTypes.size());
        return new ResponseEntity<>(associationTypes, HttpStatus.OK);
    }


    @ApiOperation(value = "Update an Association Type (only its properties)", response = List.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, response = void.class, message = "Successfully updated Association Type"),
            @ApiResponse(code = 403, response = void.class, message = "If the user is not the owner of the schema"),
            @ApiResponse(code = 404, response = void.class, message = "If the user do not exist \n" +
                    "If the Association Type referenced do not exist")
    })
    @RequestMapping(value = "/associationType", method = RequestMethod.PATCH, consumes = "application/json")
    public ResponseEntity<?> updateAssociationType(@RequestBody @Valid AssociationType associationTypeToUpdate, Principal principal){
        String principalName = principal.getName();
        long associationTypeId = associationTypeToUpdate.getId();
        logger.info("Received a PATCH request from User {} for Association Type with id: {}.", principalName, associationTypeId);

        //Check User existence
        ResponseEntity<?> existsUser = checkUserExistence(principalName);
        if(existsUser != null) return existsUser;

        //Check Association Type existence
        ResponseEntity<?> existsAssociationType = checkAssociationTypeExistence(associationTypeId);
        if(existsAssociationType != null) return existsAssociationType;

        //Check if the User has the right to change the Association Type == owner OR admin
        AssociationType oldAssociationType = associationTypeService.getAssociationTypeById(associationTypeId);
        ResponseEntity<?> userPrivileges = checkUserPrivileges(principalName, oldAssociationType.getSchemaId(), associationTypeId);
        if(userPrivileges != null) return userPrivileges;

        //Saving Association Type
        associationTypeService.updateAssociationType(associationTypeToUpdate, oldAssociationType);
        logger.info("Updated Association Type with id {}.", associationTypeId);
        return new ResponseEntity<>(Collections.singletonMap("message", "Association Type updated."), HttpStatus.OK);
    }


    @ApiOperation(value = "Update a Role of an Association Type (only its properties)", response = List.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, response = void.class, message = "Successfully updated Role"),
            @ApiResponse(code = 400, response = void.class, message = "If the Role do not belong to referenced Association Type \n"),
            @ApiResponse(code = 403, response = void.class, message = "If the user is not the owner of the schema"),
            @ApiResponse(code = 404, response = void.class, message = "If the user do not exist \n" +
                    "If the Association Type referenced do not exist \n" +
                    "If the Role referenced do not exist")
    })
    @RequestMapping(value = "/associationType/{id}/role", method = RequestMethod.PATCH, consumes = "application/json")
    public ResponseEntity<?> updateAssociationTypeRole(@RequestBody @Valid Role roleToUpdate, Principal principal, @PathVariable long id){
        String principalName = principal.getName();
        long roleId = roleToUpdate.getId();
        logger.info("Received a PATCH request from User {} for Role with id: {}, of Association Type with id: {}.", principalName, roleId, id);

        //Check User existence
        ResponseEntity<?> existsUser = checkUserExistence(principalName);
        if(existsUser != null) return existsUser;

        //Check Association Type existence
        ResponseEntity<?> existsAssociationType = checkAssociationTypeExistence(id);
        if(existsAssociationType != null) return existsAssociationType;

        //Check Role existence
        ResponseEntity<?> existsRole = checkRoleExistence(roleId);
        if(existsRole != null) return existsRole;

        //Match between ids
        Role oldRole = roleService.getRoleById(roleId);
        if(oldRole.getAssociationTypeId() != id){
            logger.error("Referenced Association Type with id: {}, does not own Role with id: {}.", id, roleId);
            return new ResponseEntity<>(Collections.singletonMap("message", "Role does not belong to this Association Type."), HttpStatus.BAD_REQUEST);
        }

        //Check if the User has the right to change the Association Type == owner OR admin
        AssociationType oldAssociationType = associationTypeService.getAssociationTypeById(id);
        ResponseEntity<?> userPrivileges = checkUserPrivileges(principalName, oldAssociationType.getSchemaId(), id);
        if(userPrivileges != null) return userPrivileges;

        //Saving Role
        roleService.updateRole(roleToUpdate, oldRole);
        return new ResponseEntity<>(Collections.singletonMap("message", "Association Type updated."), HttpStatus.OK);
    }


    @ApiOperation(value = "Update the list of Topic Types able to take the Role in an Association", response = List.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, response = void.class, message = "Successfully updated list of Topic Types"),
            @ApiResponse(code = 400, response = void.class, message = "If the Role do not belong to referenced Association Type \n" +
                    "If a referenced Topic Type do not belong to same schema \n" +
                    "If a removed Topic Type was used by a Topic in an association with this Role"),
            @ApiResponse(code = 403, response = void.class, message = "If the user is not the owner of the schema"),
            @ApiResponse(code = 404, response = void.class, message = "If the user do not exist \n" +
                    "If the Association Type or the Role referenced do not exist \n" +
                    "If one of the Topic Types in the list do not exist")
    })
    @RequestMapping(value = "/associationType/{atId}/role/{rId}/topicTypes", method = RequestMethod.PATCH, consumes = "application/json")
    public ResponseEntity<?> updateTopicTypesInAssociationTypeRole(@RequestBody @Valid Collection<Long> newTopicTypesId, Principal principal, @PathVariable long atId, @PathVariable long rId){
        String principalName = principal.getName();
        logger.info("Received a PATCH request from User {} for TopicTypes of Role with id: {}, of Association Type with id: {}.", principalName, rId, atId);

        //Check User existence
        ResponseEntity<?> existsUser = checkUserExistence(principalName);
        if(existsUser != null) return existsUser;

        //Check Association Type existence
        ResponseEntity<?> existsAssociationType = checkAssociationTypeExistence(atId);
        if(existsAssociationType != null) return existsAssociationType;

        //Check Role existence
        ResponseEntity<?> existsRole = checkRoleExistence(rId);
        if(existsRole != null) return existsRole;

        //Match between ids
        Role role = roleService.getRoleById(rId);
        if(role.getAssociationTypeId() != atId){
            logger.error("Referenced Association Type with id: {}, does not own Role with id: {}.", atId, rId);
            return new ResponseEntity<>(Collections.singletonMap("message", "Role does not belong to this Association Type."), HttpStatus.BAD_REQUEST);
        }

        //Check if the User has the right to change the Association Type == owner OR admin
        AssociationType associationType = associationTypeService.getAssociationTypeById(atId);
        ResponseEntity<?> userPrivileges = checkUserPrivileges(principalName, associationType.getSchemaId(), atId);
        if(userPrivileges != null) return userPrivileges;

        List<TopicType> oldTopicTypes = role.getRoleTopicTypes();
        List<TopicType> newTopicTypes = new ArrayList<>();
        long schemaId = associationType.getSchemaId();
        for (long topicTypeId : newTopicTypesId){
            //Check if topicType exists
            if (!topicTypeService.existsTopicTypeById(topicTypeId)) {
                logger.error("Topic Type with id: {} does not exist.", topicTypeId);
                return new ResponseEntity<>(Collections.singletonMap("message", "Topic Type with id " + topicTypeId + " does not exist."), HttpStatus.NOT_FOUND);
            }

            //Check if TopicType has the same schema as Association Type
            TopicType topicType = topicTypeService.getTopicTypeById(topicTypeId);
            if(topicType.getSchemaId() != schemaId){
                logger.error("Association Type with id {}, and Topic Type with id: {}, do not share the same Schema.", atId, topicTypeId);
                return new ResponseEntity<>(Collections.singletonMap("message", "Topic Type needs to be on the same schema as Association Type."), HttpStatus.BAD_REQUEST);
            }

            newTopicTypes.add(topicType);
            oldTopicTypes.remove(topicType);
        }

        for(TopicType oldTopicType: oldTopicTypes){
            //Check association type usage : this method is usable only if the topictype is not used by a Topic in an association of this association type
            if(topicAssociationRoleService.existsTopicAssociationRoleByRoleIdAndTopicTypeId(rId, oldTopicType.getId())){
                logger.error("Topic Type is already in use with this Role in Association. Cannot remove it from the Role.");
                return new ResponseEntity<>(Collections.singletonMap("message", "Topic Type is used in Associations with this Role, cannot remove it from the Role."), HttpStatus.BAD_REQUEST);
            }
        }

        //Saving Role
        roleService.updateRoleTopicTypes(role, newTopicTypes);
        return new ResponseEntity<>(Collections.singletonMap("message", "Association Type updated."), HttpStatus.OK);
    }


    @ApiOperation(value = "Delete an Association Type and its Roles", response = List.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, response = void.class, message = "Successfully deleted the Association Type"),
            @ApiResponse(code = 403, response = void.class, message = "If the user is not the owner of the schema"),
            @ApiResponse(code = 404, response = void.class, message = "If the user do not exist \n" +
                    "If the Association Type referenced do not exist")
    })
    @RequestMapping(value = "/associationType", method = RequestMethod.DELETE, produces = "application/json")
    public ResponseEntity<?> deleteAssociationType(@RequestParam("association_type_id") long associationTypeId, Principal principal){
        String principalName = principal.getName();
        logger.info("Received a DELETE request from User {} for Association Type with id: {}.", principalName, associationTypeId);

        //Check User existence
        ResponseEntity<?> existsUser = checkUserExistence(principalName);
        if(existsUser != null) return existsUser;

        //Check Association Type existence
        ResponseEntity<?> existsAssociationType = checkAssociationTypeExistence(associationTypeId);
        if(existsAssociationType != null) return existsAssociationType;

        //Check if the User has the right to delete the Association Type == owner OR admin
        AssociationType oldAssociationType = associationTypeService.getAssociationTypeById(associationTypeId);
        ResponseEntity<?> userPrivileges = checkUserPrivileges(principalName, oldAssociationType.getSchemaId(), associationTypeId);
        if(userPrivileges != null) return userPrivileges;

        //Delete
        associationTypeService.deleteAssociationType(associationTypeId);
        logger.info("Association Type with id {} deleted.", associationTypeId);
        return new ResponseEntity<>(Collections.singletonMap("message", "Association Type with id " + associationTypeId + " deleted."), HttpStatus.OK);
    }


    @ApiOperation(value = "Delete a Role of an Association Type", response = List.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, response = void.class, message = "Successfully deleted the Role"),
            @ApiResponse(code = 400, response = void.class, message = "If the Role do not belong to referenced Association Type \n" +
                    "If the Association Type is already used by an Association" +
                    "If after the deletion the Association Type would become less than binary"),
            @ApiResponse(code = 403, response = void.class, message = "If the user is not the owner of the schema"),
            @ApiResponse(code = 404, response = void.class, message = "If the user do not exist \n" +
                    "If the Association Type or the Role referenced do not exist")
    })
    @RequestMapping(value = "/associationType/{id}/role", method = RequestMethod.DELETE, consumes = "application/json")
    public ResponseEntity<?> deleteAssociationTypeRole(@RequestParam("role_id") long roleId, Principal principal, @PathVariable long id){
        String principalName = principal.getName();
        logger.info("Received a DELETE request from User {} for Role with id: {}, of Association Type with id: {}.",principalName, roleId, id);

        //Check Association Type existence
        ResponseEntity<?> existsAssociationType = checkAssociationTypeExistence(id);
        if(existsAssociationType != null) return existsAssociationType;

        //Check Role existence
        ResponseEntity<?> existsRole = checkRoleExistence(roleId);
        if(existsRole != null) return existsRole;

        //Check user existence
        ResponseEntity<?> existsUser = checkUserExistence(principalName);
        if(existsUser != null) return existsUser;

        //Match between ids
        Role role = roleService.getRoleById(roleId);
        if(role.getAssociationTypeId() != id){
            logger.error("Referenced Association Type with id: {}, does not own Role with id: {}.", id, roleId);
            return new ResponseEntity<>(Collections.singletonMap("message", "Role does not belong to this Association Type."), HttpStatus.BAD_REQUEST);
        }

        //Check association type usage : this method is usable only if the association type is not used anywhere
        AssociationType associationType = associationTypeService.getAssociationTypeById(id);
        if(!associationType.getAllAssociations().isEmpty()){
            logger.error("Association Type is already in use. Cannot delete a Role.");
            return new ResponseEntity<>(Collections.singletonMap("message", "Association Type is used in Associations, cannot delete a Role."), HttpStatus.BAD_REQUEST);
        }

        //Check the number of Roles (have to stay at least binary)
        if(associationType.getAssociationTypeRoles().size() < 3){
            logger.error("Association Type has to stay at least binary. Cannot delete a Role.");
            return new ResponseEntity<>(Collections.singletonMap("message", "Association Type has to stay binary, cannot delete a Role."), HttpStatus.BAD_REQUEST);
        }

        //Check user privileges: has to be owner of the schema
        long schemaId = associationType.getSchemaId();
        if (!schemaService.hasUserRightsOnSchema(principalName, schemaId) && !userService.isUserAdmin(principalName)) {
            logger.error("User {} does not have the right to delete Role with id: {}, of Association Type with id: {}.", principalName, roleId, id);
            return new ResponseEntity<>(Collections.singletonMap("message", "User cannot delete Roles of this Association Type."), HttpStatus.FORBIDDEN);
        }

        roleService.deleteRoleById(roleId);

        logger.info("Role with id: {}, of Association Type with id {} deleted.", roleId, id);
        return new ResponseEntity<>(Collections.singletonMap("message", "Role correctly deleted."), HttpStatus.OK);

    }


    @ApiOperation(value = "Delete one of the Topic Types of the list that can take the Role in an Association", response = List.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, response = void.class, message = "Successfully deleted the Topic Type from the list or if it had not this Role in the first place"),
            @ApiResponse(code = 400, response = void.class, message = "If the Role do not belong to referenced Association Type \n" +
                    "If a Topic of this Topic Type is using this Role in an Association"),
            @ApiResponse(code = 403, response = void.class, message = "If the user is not the owner of the schema"),
            @ApiResponse(code = 404, response = void.class, message = "If the user do not exist \n" +
                    "If the Association Type, Role or Topic Type referenced do not exist")
    })
    @RequestMapping(value = "/associationType/{atId}/role/{rId}/topicTypes", method = RequestMethod.DELETE, consumes = "application/json")
    public ResponseEntity<?> deleteTopicTypeInAssociationTypeRole(@RequestParam("topicType_id") long topicTypeId, Principal principal, @PathVariable long atId, @PathVariable long rId){
        String principalName = principal.getName();
        logger.info("Received a DELETE request from User {} for TopicType with id: {}, of Role with id: {}, of Association Type with id: {}.",principalName, topicTypeId, rId, atId);

        //Check Association Type existence
        ResponseEntity<?> existsAssociationType = checkAssociationTypeExistence(atId);
        if(existsAssociationType != null) return existsAssociationType;

        //Check Role existence
        ResponseEntity<?> existsRole = checkRoleExistence(rId);
        if(existsRole != null) return existsRole;

        //Check if TopicType exists
        if(!topicTypeService.existsTopicTypeById(topicTypeId)){
            logger.error("Referenced TopicType with id {} not found.", topicTypeId);
            return new ResponseEntity<>(Collections.singletonMap("message", "TopicType not found."), HttpStatus.NOT_FOUND);
        }

        //Check user existence
        ResponseEntity<?> existsUser = checkUserExistence(principalName);
        if(existsUser != null) return existsUser;

        //Match between ids
        Role role = roleService.getRoleById(rId);
        if(role.getAssociationTypeId() != atId){
            logger.error("Referenced Association Type with id: {}, does not own Role with id: {}.", atId, rId);
            return new ResponseEntity<>(Collections.singletonMap("message", "Role does not belong to this Association Type."), HttpStatus.BAD_REQUEST);
        }

        //Check association type usage : this method is usable only if the topictype is not used by a Topic in an association of this association type
        if(topicAssociationRoleService.existsTopicAssociationRoleByRoleIdAndTopicTypeId(rId, topicTypeId)){
            logger.error("Topic Type is already in use with this Role in Association. Cannot delete a Role.");
            return new ResponseEntity<>(Collections.singletonMap("message", "Topic Type is used in Associations with this Role, cannot delete the Role."), HttpStatus.BAD_REQUEST);
        }

        //Check user privileges: has to be owner of the schema
        long schemaId = role.getRoleAssociationType().getSchemaId();
        if (!schemaService.hasUserRightsOnSchema(principalName, schemaId) && !userService.isUserAdmin(principalName)) {
            logger.error("User {} does not have the right to delete TopicType with id: {}, from Role with id: {}, of Association Type with id: {}.", principalName, topicTypeId, rId, atId);
            return new ResponseEntity<>(Collections.singletonMap("message", "User cannot delete TopicTypes from Roles of this Association Type."), HttpStatus.FORBIDDEN);
        }

        //Check if TopicType has the referenced role
        TopicType topicType = topicTypeService.getTopicTypeById(topicTypeId);
        if(!role.getRoleTopicTypes().remove(topicType)){
            logger.error("Referenced TopicType with id {} does not have Role with id {}.", topicTypeId, rId);
            return new ResponseEntity<>(Collections.singletonMap("message", "TopicType does not have the referenced Role."), HttpStatus.OK);
        }

        roleService.saveRole(role);
        logger.info("TopicType with id: {} deleted from Role with id: {}, of Association Type with id: {}.", topicTypeId, rId, atId);
        return new ResponseEntity<>(Collections.singletonMap("message", "TopicType correctly deleted from Role."), HttpStatus.OK);

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
    private ResponseEntity<?> checkUserPrivileges(String email, long schemaId, long associationTypeId){
        if(!schemaService.hasUserRightsOnSchema(email, schemaId) && !userService.isUserAdmin(email)){
            logger.error("User {} does not have the right on Association Type with id {}.", email, associationTypeId);
            return new ResponseEntity<>(Collections.singletonMap("message", "User cannot edit this Association Type."), HttpStatus.FORBIDDEN);
        }
        return null;
    }

    @Nullable
    private ResponseEntity<?> checkAssociationTypeExistence(long associationTypeId){
        if(!associationTypeService.existsAssociationTypeById(associationTypeId)) {
            logger.error("Association Type with id {} not found.", associationTypeId);
            return new ResponseEntity<>(Collections.singletonMap("message", "No Association Type found for this id: " + associationTypeId), HttpStatus.NOT_FOUND);
        }
        return null;
    }

    @Nullable
    private ResponseEntity<?> checkRoleExistence(long roleId){
        if(!roleService.existsRoleById(roleId)) {
            logger.error("Role with id {} not found.", roleId);
            return new ResponseEntity<>(Collections.singletonMap("message", "No Role found for this id: " + roleId), HttpStatus.NOT_FOUND);
        }
        return null;
    }
}
