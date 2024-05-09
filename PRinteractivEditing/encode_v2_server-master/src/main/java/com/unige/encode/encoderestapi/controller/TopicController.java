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

import javax.validation.Valid;
import java.security.Principal;
import java.util.*;

@RestController
@RequestMapping(value = "/protected/v1")
@Api(value = "Topic Management System")
public class TopicController {

    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired private UserService userService;
    @Autowired private TopicService topicService;
    @Autowired private TopicmapService topicmapService;
    @Autowired private TopicTypeService topicTypeService;
    @Autowired private ScopeService scopeService;

    @ApiOperation(value = "Create a Topic", response = List.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, response = void.class, message = "Successfully added new Topic"),
            @ApiResponse(code = 400, response = void.class, message = "If Topic Type and Topicmap are not given or do not belong to the same schema \n" +
                    "If one of the given Scopes do not belong to the same schema, is referenced more than once or not at all"),
            @ApiResponse(code = 403, response = void.class, message = "If the user do not have the right to modify the Topicmap"),
            @ApiResponse(code = 404, response = void.class, message = "If the user do not exist \n" +
                    "If the Topic Type, the Topicmap or one of the Scopes referenced do not exist"),
    })
    @RequestMapping(value = "/topic", method = RequestMethod.POST, produces = "application/json")
    public ResponseEntity<?> createTopic(@RequestBody @Valid Topic newTopic, Principal principal){
        String principalName = principal.getName();
        logger.info("Received a POST request from {} User for new Topic.", principal.getName());

        //Check User existence
        ResponseEntity<?> existsUser = checkUserExistence(principalName);
        if(existsUser != null) return existsUser;

        //Check TopicType is given
        long topicTypeId = newTopic.getTopicTypeId();
        if(topicTypeId == 0){
            logger.error("Topic needs a TopicType.");
            return new ResponseEntity<>(Collections.singletonMap("message", "A Topic needs a TopicType."), HttpStatus.BAD_REQUEST);
        }

        //Check Topicmap is given
        long topicmapId = newTopic.getTopicmapId();
        if(topicmapId == 0){
            logger.error("Topic needs a Topicmap.");
            return new ResponseEntity<>(Collections.singletonMap("message", "A Topic needs a Topicmap."), HttpStatus.BAD_REQUEST);
        }

        //Check TopicType existence
        if(!topicTypeService.existsTopicTypeById(topicTypeId)) {
            logger.error("Referenced TopicType with id {} not found.", topicTypeId);
            return new ResponseEntity<>(Collections.singletonMap("message", "TopicType of Topic not found."), HttpStatus.NOT_FOUND);
        }

        //Check Topicmap existence
        if(!topicmapService.existsTopicmapById(topicmapId)) {
            logger.error("Referenced Topicmap with id {} not found.", topicmapId);
            return new ResponseEntity<>(Collections.singletonMap("message", "Topicmap of Topic not found."), HttpStatus.NOT_FOUND);
        }

        //Check that the TopicMap and the TopicType belongs to the same schema
        Topicmap topicmap = topicmapService.getTopicmapById(topicmapId);
        TopicType topicType = topicTypeService.getTopicTypeById(topicTypeId);
        if(topicmap.getSchemaId() != topicType.getSchemaId()){
            logger.error("The TopicType and the TopicMap do not belong to the same Schema.");
            return new ResponseEntity<>(Collections.singletonMap("message", "The referenced TopicMap and TopicType do not belong to the same schema."), HttpStatus.BAD_REQUEST);
        }

        //Check if the User has the right to create the Topic == owner/editor of the Topicmap OR admin
        ResponseEntity<?> userPrivileges = checkUserPrivileges(userService.getUserByEmail(principalName), topicmapId);
        if(userPrivileges != null) return userPrivileges;

        //Check if Scopes are valid
        List<TopicScope> topicScopes = newTopic.getTopicTopicScopes();
        if(topicScopes != null && !topicScopes.isEmpty()){
            Set<Long> scopesToBind = new HashSet<>();
            for(TopicScope ts: topicScopes){
                long tsScopeId = ts.getId().getScopeId();

                //Check Scope is given
                if(tsScopeId == 0){
                    logger.error("TopicScope needs a Scope.");
                    return new ResponseEntity<>(Collections.singletonMap("message", "A TopicScope needs a Scope."), HttpStatus.BAD_REQUEST);
                }

                //Check Scope is unique
                if(!scopesToBind.add(tsScopeId)){
                    logger.error("A Topic cannot have several times the same Scope.");
                    return new ResponseEntity<>(Collections.singletonMap("message", "Topic cannot have several times the same Scope."), HttpStatus.BAD_REQUEST);
                }

                //Check Scope existence
                if(!scopeService.existsScopeById(tsScopeId)) {
                    logger.error("Referenced Scope with id {} not found.", tsScopeId);
                    return new ResponseEntity<>(Collections.singletonMap("message", "Scope for TopicScope not found."), HttpStatus.NOT_FOUND);
                }

                //Check Scope and Topic belongs to same schema
                Scope scope = scopeService.getScopeById(tsScopeId);
                if(topicmap.getSchemaId() != scope.getSchemaId()){
                    logger.error("The Scope and the TopicMap of Topic do not belong to the same Schema.");
                    return new ResponseEntity<>(Collections.singletonMap("message", "The referenced Scope and Topic do not belong to the same schema."), HttpStatus.BAD_REQUEST);
                }
            }
        }

        //Create the Topic
        newTopic.setTopicTopicmap(topicmap);
        newTopic.setTopicTopicType(topicType);
        topicService.saveTopic(newTopic);

        long newTopicId = newTopic.getId();
        logger.info("New Topic added with id {}.", newTopicId);
        return new ResponseEntity<>(newTopicId, HttpStatus.OK);
    }


    @ApiOperation(value = "Get a Topic", response = List.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, response = void.class, message = "Successfully retrieved Topic"),
            @ApiResponse(code = 403, response = void.class, message = "If the user do not have the right to access the Topicmap"),
            @ApiResponse(code = 404, response = void.class, message = "If the user or the Topic do not exist"),
    })
    @RequestMapping(value = "/topic", method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<?> getTopicById(@RequestParam("topic_id") long topicId, Principal principal){
        String principalName = principal.getName();
        logger.info("Received a GET request from User {} for Topic with id: {}", principalName, topicId);

        //Check User existence
        ResponseEntity<?> existsUser = checkUserExistence(principalName);
        if(existsUser != null) return existsUser;

        //Check Topic existence
        ResponseEntity<?> existsTopic = checkTopicExistence(topicId);
        if(existsTopic != null) return existsTopic;

        //Check if the User has the right to retrieve the Topic == owner/editor of the Topicmap OR admin
        Topic topic = topicService.getTopicById(topicId);
        ResponseEntity<?> userPrivileges = checkUserPrivileges(userService.getUserByEmail(principalName), topic.getTopicmapId());
        if(userPrivileges != null) return userPrivileges;

        //Return the Topic
        logger.info("Found Topic with id {}.", topicId);
        return new ResponseEntity<>(topic, HttpStatus.OK);
    }


    @ApiOperation(value = "Update a Topic", response = List.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, response = void.class, message = "Successfully updated Topic"),
            @ApiResponse(code = 400, response = void.class, message = "If the wrong Topic is given in a Scope \n" +
                    "If one of the given Scopes do not belong to the same schema, is referenced more than once or not at all"),
            @ApiResponse(code = 403, response = void.class, message = "If the user do not have the right to modify the Topicmap"),
            @ApiResponse(code = 404, response = void.class, message = "If the user do not exist \n" +
                    "If the Topic or one of the Scopes referenced do not exist"),
    })
    @RequestMapping(value = "/topic", method = RequestMethod.PUT, produces = "application/json")
    public ResponseEntity<?> updateTopic(@RequestBody @Valid Topic topicToUpdate, Principal principal){
        String principalName = principal.getName();
        long topicId = topicToUpdate.getId();
        logger.info("Received a PUT request from User {} for Topic with id: {}.", principalName, topicId);

        //Check User existence
        ResponseEntity<?> existsUser = checkUserExistence(principalName);
        if(existsUser != null) return existsUser;

        //Check Topic existence
        ResponseEntity<?> existsTopic = checkTopicExistence(topicId);
        if(existsTopic != null) return existsTopic;
        Topic oldTopic = topicService.getTopicById(topicId);

        //Check if Scopes are valid
        List<TopicScope> topicScopesToUpdate = topicToUpdate.getTopicTopicScopes();
        if(topicScopesToUpdate != null && !topicScopesToUpdate.isEmpty()){
            Set<Long> scopesToBind = new HashSet<>();
            Topicmap topicmap = topicmapService.getTopicmapById(oldTopic.getTopicmapId());
            for(TopicScope ts: topicScopesToUpdate){
                long tsTopicId = ts.getId().getTopicId();
                long tsScopeId = ts.getId().getScopeId();

                //Check Topic given == topicId to update
                if(tsTopicId != topicId){
                    logger.error("Topic in TopicScope needs to be the same as Topic.");
                    return new ResponseEntity<>(Collections.singletonMap("message", "Referenced Topic in TopicScope needs to be the same as Topic."), HttpStatus.BAD_REQUEST);
                }

                //Check Scope is given
                if(tsScopeId == 0){
                    logger.error("TopicScope needs a Scope.");
                    return new ResponseEntity<>(Collections.singletonMap("message", "A TopicScope needs a Scope."), HttpStatus.BAD_REQUEST);
                }

                //Check Scope is unique
                if(!scopesToBind.add(tsScopeId)){
                    logger.error("A Topic cannot have several times the same Scope.");
                    return new ResponseEntity<>(Collections.singletonMap("message", "Topic cannot have several times the same Scope."), HttpStatus.BAD_REQUEST);
                }

                //Check Scope existence
                if(!scopeService.existsScopeById(tsScopeId)) {
                    logger.error("Referenced Scope with id {} not found.", tsScopeId);
                    return new ResponseEntity<>(Collections.singletonMap("message", "Scope for TopicScope not found."), HttpStatus.NOT_FOUND);
                }

                //Check Scope and Topic belongs to same schema
                Scope scope = scopeService.getScopeById(tsScopeId);
                if(topicmap.getSchemaId() != scope.getSchemaId()){
                    logger.error("The Scope and the TopicMap of Topic do not belong to the same Schema.");
                    return new ResponseEntity<>(Collections.singletonMap("message", "The referenced Scope and Topic do not belong to the same schema."), HttpStatus.BAD_REQUEST);
                }
            }
        }

        //Check if the User has the right to update the Topic == owner/editor of the Topicmap OR admin
        ResponseEntity<?> userPrivileges = checkUserPrivileges(userService.getUserByEmail(principalName), oldTopic.getTopicmapId());
        if(userPrivileges != null) return userPrivileges;

        //Saving Topic Type
        topicService.updateTopic(topicToUpdate, oldTopic);
        logger.info("Updated Topic with id {}.", topicId);
        return new ResponseEntity<>(Collections.singletonMap("message", "Topic updated."), HttpStatus.OK);
    }


    @ApiOperation(value = "Delete a list of Topic", response = List.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, response = void.class, message = "Successfully deleted Topics"),
            @ApiResponse(code = 403, response = void.class, message = "If the user do not have the right to modify the Topicmaps of the Topics"),
            @ApiResponse(code = 404, response = void.class, message = "If the user or one of the Topic do not exist")
    })
    @RequestMapping(value = "/topics", method = RequestMethod.DELETE, produces = "application/json")
    public ResponseEntity<?> deleteTopicList(@RequestBody List<Long> topicIds, Principal principal){
        String principalName = principal.getName();
        logger.info("Received a DELETE request from {} user for a Topic List.", principalName);

        //Check User existence
        ResponseEntity<?> existsUser = checkUserExistence(principalName);
        if(existsUser != null) return existsUser;

        Set<Long> topicmapIds = new HashSet<>();
        for(long topicId : topicIds){
            //Check Topic existence
            ResponseEntity<?> existsTopic = checkTopicExistence(topicId);
            if(existsTopic != null) return existsTopic;

            //Check if the User has the right to delete the Topic == owner/editor of the Topicmap OR admin
            long topicTopicmapId = topicService.getTopicById(topicId).getTopicmapId();
            if (topicmapIds.add(topicTopicmapId)) {
                ResponseEntity<?> userPrivileges = checkUserPrivileges(userService.getUserByEmail(principalName), topicTopicmapId);
                if(userPrivileges != null) return userPrivileges;
            }
        }

        //Delete the topics
        topicService.deleteTopicList(topicIds);
        logger.info("Topic list deleted.");
        return new ResponseEntity<>(Collections.singletonMap("message","List of Topics deleted."),  HttpStatus.OK);
    }


    @ApiOperation(value = "Delete a Topic", response = List.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, response = void.class, message = "Successfully deleted Topic"),
            @ApiResponse(code = 403, response = void.class, message = "If the user do not have the right to modify the Topicmap"),
            @ApiResponse(code = 404, response = void.class, message = "If the user or the Topic do not exist")
    })
    @RequestMapping(value = "/topic", method = RequestMethod.DELETE, produces = "application/json")
    public ResponseEntity<?> deleteTopic(@RequestParam("topic_id") long topicId, Principal principal){
        String principalName = principal.getName();
        logger.info("Received a DELETE request from User {} for Topic with id {}.", principalName, topicId);

        //Check User existence
        ResponseEntity<?> existsUser = checkUserExistence(principalName);
        if(existsUser != null) return existsUser;

        //Check Topic existence
        ResponseEntity<?> existsTopic = checkTopicExistence(topicId);
        if(existsTopic != null) return existsTopic;

        //Check if the User has the right to delete the Topic == owner/editor of the Topicmap OR admin
        Topic oldTopic = topicService.getTopicById(topicId);
        ResponseEntity<?> userPrivileges = checkUserPrivileges(userService.getUserByEmail(principalName), oldTopic.getTopicmapId());
        if(userPrivileges != null) return userPrivileges;

        //Delete
        topicService.deleteTopic(topicId);
        logger.info("Topic with id {} deleted.", topicId);
        return new ResponseEntity<>(Collections.singletonMap("message", "Topic with id " + topicId + " deleted."), HttpStatus.OK);
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
    private ResponseEntity<?> checkTopicExistence(long topicId){
        if(!topicService.existsTopicById(topicId)) {
            logger.error("Topic with id {} not found.", topicId);
            return new ResponseEntity<>(Collections.singletonMap("message", "No Topic found for this id: " + topicId), HttpStatus.NOT_FOUND);
        }
        return null;
    }
}
