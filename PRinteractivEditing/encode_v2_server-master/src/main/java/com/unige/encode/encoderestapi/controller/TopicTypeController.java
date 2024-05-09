package com.unige.encode.encoderestapi.controller;

import com.unige.encode.encoderestapi.model.*;
import com.unige.encode.encoderestapi.service.SchemaServiceImpl;
import com.unige.encode.encoderestapi.service.TopicTypeService;
import com.unige.encode.encoderestapi.service.UserServiceImpl;
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

import javax.validation.Valid;
import java.security.Principal;
import java.util.*;

@RestController
@RequestMapping(value = "/protected/v1")
@Api(value = "Topic Type Management System")
public class TopicTypeController {

    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired private TopicTypeService topicTypeService;
    @Autowired private SchemaServiceImpl schemaService;
    @Autowired private UserServiceImpl userService;


    @ApiOperation(value = "Create a Topic Type", response = List.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, response = void.class, message = "Successfully added new Topic Type"),
            @ApiResponse(code = 400, response = void.class, message = "If schema is not given"),
            @ApiResponse(code = 403, response = void.class, message = "If the user is not the owner of the schema"),
            @ApiResponse(code = 404, response = void.class, message = "If the user do not exist \n" +
                    "If the schema referenced do not exist")
    })
    @RequestMapping(value= "/topicType", method = RequestMethod.POST, consumes = "application/json")
    public ResponseEntity<?> createTopicType(@Valid @RequestBody TopicType newTopicType, Principal principal){
        String principalName = principal.getName();
        long schemaId = newTopicType.getSchemaId();
        logger.info("Received a POST request from User {} for new Topic Type.", principalName);

        //Check if owning schema is given
        if(schemaId == 0){
            logger.error("No owning Schema given for new Topic Type.");
            return new ResponseEntity<>(Collections.singletonMap("message", "A Topic Type needs a Schema."), HttpStatus.BAD_REQUEST);
        }

        //Check user existence
        ResponseEntity<?> existsUser = checkUserExistence(principalName);
        if(existsUser != null) return existsUser;

        //Check schema existence
        if(!schemaService.existsSchemaById(schemaId)) {
            logger.error("Referenced Schema with id {} not found.", schemaId);
            return new ResponseEntity<>(Collections.singletonMap("message", "Schema of Topic Type not found."), HttpStatus.NOT_FOUND);
        }

        //Check user privileges: has to be owner of the schema
        if(!schemaService.hasUserRightsOnSchema(principalName, schemaId) && !userService.isUserAdmin(principalName)){
            logger.error("User {} does not have the right to create a Topic Type with the Schema {}.", principalName, schemaId);
            return new ResponseEntity<>(Collections.singletonMap("message", "User cannot create a Topic Type under this Schema."), HttpStatus.FORBIDDEN);
        }

        newTopicType.setTopicTypeSchema(schemaService.getSchemaById(schemaId));
        topicTypeService.saveTopicType(newTopicType);

        logger.info("New Topic Type {} added with id {}.", newTopicType.getName(), newTopicType.getId());
        return new ResponseEntity<>(newTopicType, HttpStatus.OK);
    }


    @ApiOperation(value = "Create a list of Topic Types", response = List.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, response = void.class, message = "Successfully added new Topic Types"),
            @ApiResponse(code = 400, response = void.class, message = "If a schema is not given"),
            @ApiResponse(code = 403, response = void.class, message = "If the user is not the owner of all the schema"),
            @ApiResponse(code = 404, response = void.class, message = "If the user do not exist \n" +
                    "If one of the schema referenced do not exist")
    })
    @RequestMapping(value= "/topicTypes", method = RequestMethod.POST, consumes = "application/json")
    public ResponseEntity<?> createTopicTypes(@Valid @RequestBody List<TopicType> topicTypes, Principal principal){
        String principalName = principal.getName();
        logger.info("Received a POST request from User {} for new Topic Types.", principalName);

        Set<Long> allSchemaId = new HashSet<>();
        int topicTypesWithoutIds=0;

        for (TopicType tt : topicTypes){
            long schemaId = tt.getSchemaId();
            //Check if owning schema is given
            if (schemaId == 0) {
                logger.error("No owning Schema given for new Topic Type {}.", tt.getName());
                return new ResponseEntity<>(Collections.singletonMap("message", "All Topic Types need a Schema."), HttpStatus.BAD_REQUEST);
            }

            if(!allSchemaId.add(schemaId)) {

                //Check schema existence
                if (!schemaService.existsSchemaById(schemaId)) {
                    logger.error("Referenced Schema with id {} not found for Topic Type {}.", schemaId, tt.getName());
                    return new ResponseEntity<>(Collections.singletonMap("message", "Schema of Topic Type " + tt.getName() + " not found."), HttpStatus.NOT_FOUND);
                }

                //Check user privileges: has to be owner of the schema
                if (!schemaService.hasUserRightsOnSchema(principalName, schemaId) && !userService.isUserAdmin(principalName)) {
                    logger.error("User {} does not have the right to create Topic Type {} with the Schema {}.", principalName, tt.getName(), schemaId);
                    return new ResponseEntity<>(Collections.singletonMap("message", "User cannot create Topic Type "+ tt.getName() +" under this Schema."), HttpStatus.FORBIDDEN);
                }

            }
            tt.setTopicTypeSchema(schemaService.getSchemaById(schemaId));
            if(tt.getId()==0)
                topicTypesWithoutIds++;

        }

        long newTopicTypeIds[] = new long[topicTypesWithoutIds];

        topicTypeService.saveAllTopicTypes(topicTypes);
        int y=0;
        List <TopicType> allTopicType= topicTypeService.getAllTopicType();
        for(int x= allTopicType.size()- topicTypesWithoutIds; x < allTopicType.size();x++){
            TopicType auxTt=allTopicType.get(x);
            newTopicTypeIds[y]= auxTt.getId();
            y++;
        }
        logger.info("Added {} new Topic Types.", topicTypes.size());
        return new ResponseEntity<>(newTopicTypeIds, HttpStatus.OK);
    }


    @ApiOperation(value = "Get a Topic Type", response = List.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, response = void.class, message = "Successfully retrieved Topic Type"),
            @ApiResponse(code = 403, response = void.class, message = "If the user is not the owner of the schema or editor of a Topicmap of this schema"),
            @ApiResponse(code = 404, response = void.class, message = "If the user do not exist \n" +
                    "If the Topic Type referenced do not exist")
    })
    @RequestMapping(value = "/topicType", method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<?> getTopicTypeById(@RequestParam("topic_type_id") long topicTypeId, Principal principal){
        String principalName = principal.getName();
        logger.info("Received a GET request from User {} for Topic Type with id: {}.", principalName, topicTypeId);

        //Check User existence
        ResponseEntity<?> existsUser = checkUserExistence(principalName);
        if(existsUser != null) return existsUser;

        //Check Topic Type existence
        ResponseEntity<?> existsTopicType = checkTopicTypeExistence(topicTypeId);
        if(existsTopicType != null) return existsTopicType;

        //Check User privileges == has to be Owner of the Schema OR admin OR be an Editor on a TopicMap using the Schema
        TopicType topicType = topicTypeService.getTopicTypeById(topicTypeId);
        long schemaId = topicType.getSchemaId();
        ResponseEntity<?> userPrivileges = checkUserPrivileges(principalName, schemaId, topicTypeId);
        if(userPrivileges != null){
            User user = userService.getUserByEmail(principalName);
            Set<Topicmap> userSharedTopicmap = user.getAllUserSharedTopicmap();
            if(userSharedTopicmap.stream().noneMatch(tm -> tm.getSchemaId() == schemaId)){
                return userPrivileges;
            }
            logger.info("User {} have reading right on Topic Type with id {}.", principalName, topicTypeId);
        }

        logger.info("Found Topic Type with id {}.", topicTypeId);
        return new ResponseEntity<>(topicType, HttpStatus.OK);
    }


    @ApiOperation(value = "Get all the Topic Types of the user (where he is owner of the schema or editor on a Topicmap using the schema)", response = List.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, response = void.class, message = "Successfully retrieved Topic Type"),
            @ApiResponse(code = 404, response = void.class, message = "If the user do not exist \n" +
                    "If the user have no Topic Type")
    })
    @RequestMapping(value = "/topicTypes", method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<?> getAllTopicTypes(Principal principal) {
        String principalName = principal.getName();
        logger.info("User {} have request all his Topic Types.", principalName);

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

        // Get the TopicTypes
        List<TopicType> topicTypes = topicTypeService.getBySchemaIdIsIn(allUserSchemaId);

        if(topicTypes == null || topicTypes.isEmpty()){
            logger.info("No Topic Type found.");
            return new ResponseEntity<>(Collections.singletonMap("message", "No Topic Type found."), HttpStatus.NOT_FOUND);
        }

        logger.info("Found {} Topic Types.", topicTypes.size());
        return new ResponseEntity<>(topicTypes, HttpStatus.OK);
    }


    @ApiOperation(value = "Update a Topic Type", response = List.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, response = void.class, message = "Successfully updated Topic Type"),
            @ApiResponse(code = 403, response = void.class, message = "If the user is not the owner of the schema"),
            @ApiResponse(code = 404, response = void.class, message = "If the user do not exist \n" +
                    "If the Topic Type referenced do not exist")
    })
    @RequestMapping(value = "/topicType", method = RequestMethod.PUT, produces = "application/json")
    public ResponseEntity<?> updateTopicType(@RequestBody @Valid TopicType topicTypeToUpdate, Principal principal){
        String principalName = principal.getName();
        long topicTypeId = topicTypeToUpdate.getId();
        logger.info("Received a PUT request from User {} for Topic Type with id: {}.", principalName, topicTypeId);

        //Check User existence
        ResponseEntity<?> existsUser = checkUserExistence(principalName);
        if(existsUser != null) return existsUser;

        //Check Topic Type existence
        ResponseEntity<?> existsTopicType = checkTopicTypeExistence(topicTypeId);
        if(existsTopicType != null) return existsTopicType;

        //Check if the User has the right to change the Topic Type == owner OR admin
        TopicType oldTopicType = topicTypeService.getTopicTypeById(topicTypeId);
        ResponseEntity<?> userPrivileges = checkUserPrivileges(principalName, oldTopicType.getSchemaId(), topicTypeId);
        if(userPrivileges != null) return userPrivileges;

        //Saving Topic Type
        topicTypeService.updateTopicType(topicTypeToUpdate, oldTopicType);
        logger.info("Updated Topic Type with id {}.", topicTypeId);
        return new ResponseEntity<>(Collections.singletonMap("message", "Topic Type updated."), HttpStatus.OK);
    }


    @ApiOperation(value = "Delete a Topic Type", response = List.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, response = void.class, message = "Successfully deleted Topic Type"),
            @ApiResponse(code = 403, response = void.class, message = "If the user is not the owner of the schema"),
            @ApiResponse(code = 404, response = void.class, message = "If the user do not exist \n" +
                    "If the Topic Type referenced do not exist")
    })
    @RequestMapping(value= "/topicType", method = RequestMethod.DELETE, produces = "application/json")
    public ResponseEntity<?> deleteTopicType(@RequestParam("topic_type_id") long topicTypeId, Principal principal){
        String principalName = principal.getName();
        logger.info("Received a DELETE request from User {} for Topic Type with id: {}.", principalName, topicTypeId);

        //Check User existence
        ResponseEntity<?> existsUser = checkUserExistence(principalName);
        if(existsUser != null) return existsUser;

        //Check Topic Type existence
        ResponseEntity<?> existsTopicType = checkTopicTypeExistence(topicTypeId);
        if(existsTopicType != null) return existsTopicType;

        //Check if the User has the right to delete the Topic Type == owner OR admin
        TopicType oldTopicType = topicTypeService.getTopicTypeById(topicTypeId);
        ResponseEntity<?> userPrivileges = checkUserPrivileges(principalName, oldTopicType.getSchemaId(), topicTypeId);
        if(userPrivileges != null) return userPrivileges;

        //Delete
        topicTypeService.deleteTopicType(topicTypeId);
        logger.info("Topic Type with id {} deleted.", topicTypeId);
        return new ResponseEntity<>(Collections.singletonMap("message", "Topic Type with id " + topicTypeId + " deleted."), HttpStatus.OK);
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
    private ResponseEntity<?> checkUserPrivileges(String email, long schemaId, long topicTypeId){
        if(!schemaService.hasUserRightsOnSchema(email, schemaId) && !userService.isUserAdmin(email)){
            logger.error("User {} does not have the right on Topic Type with id {}.", email, topicTypeId);
            return new ResponseEntity<>(Collections.singletonMap("message", "User cannot edit this Topic Type."), HttpStatus.FORBIDDEN);
        }
        return null;
    }

    @Nullable
    private ResponseEntity<?> checkTopicTypeExistence(long topicTypeId){
        if(!topicTypeService.existsTopicTypeById(topicTypeId)) {
            logger.error("Topic Type with id {} not found.", topicTypeId);
            return new ResponseEntity<>(Collections.singletonMap("message", "No Topic Type found for this id: " + topicTypeId), HttpStatus.NOT_FOUND);
        }
        return null;
    }
}
