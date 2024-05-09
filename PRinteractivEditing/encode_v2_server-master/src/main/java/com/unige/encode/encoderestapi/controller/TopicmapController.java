package com.unige.encode.encoderestapi.controller;

import com.unige.encode.encoderestapi.model.Topicmap;
import com.unige.encode.encoderestapi.service.SchemaServiceImpl;
import com.unige.encode.encoderestapi.service.TopicmapServiceImpl;
import com.unige.encode.encoderestapi.service.UserServiceImpl;
import com.unige.encode.encoderestapi.utility.XtmManager;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import springfox.documentation.annotations.ApiIgnore;

import javax.validation.Valid;
import java.security.Principal;
import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping(value = "/protected/v1")
public class TopicmapController {

    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired private TopicmapServiceImpl topicmapService;
    @Autowired private UserServiceImpl userService;
    @Autowired private SchemaServiceImpl schemaService;
    @Autowired private XtmManager xtmManager;


    @ApiOperation(value = "Create a Topicmap", response = List.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, response = void.class, message = "Successfully added new Topicmap"),
            @ApiResponse(code = 400, response = void.class, message = "If schema is not given"),
            @ApiResponse(code = 403, response = void.class, message = "If the user is not the owner of the schema"),
            @ApiResponse(code = 404, response = void.class, message = "If the user do not exist \n" +
                    "If the schema referenced do not exist")
    })
    @RequestMapping(value = "/topicmap", method = RequestMethod.POST, produces = "application/json")
    public ResponseEntity<?> createTopicMap(@RequestBody @Valid Topicmap newTopicMap, Principal principal){
        String principalName = principal.getName();
        long schemaId = newTopicMap.getSchemaId();
        logger.info("Received a post request from User {} for new TopicMap.",principalName);

        //Check user existence
        if(!userService.existsUserByEmail(principalName)) {
            logger.error("Problem during authentication");
            return new ResponseEntity<>(Collections.singletonMap("message","No user found with this email: " + principalName), HttpStatus.NOT_FOUND);
        }

        //Check if owning schema is given
        if(schemaId == 0){
            logger.error("No owning Schema given for new TopicMap.");
            return new ResponseEntity<>(Collections.singletonMap("message", "A TopicMap needs a Schema."), HttpStatus.BAD_REQUEST);
        }

        //Check schema existence
        if(!schemaService.existsSchemaById(schemaId)) {
            logger.error("Referenced Schema with id {} not found.", schemaId);
            return new ResponseEntity<>(Collections.singletonMap("message", "Schema of TopicMap not found."), HttpStatus.NOT_FOUND);
        }

        //Check user privileges: has to be owner of the schema
        if(!schemaService.hasUserRightsOnSchema(principalName, schemaId) && !userService.isUserAdmin(principalName)){
            logger.error("User {} does not have the right to create a Topicmap with the Schema {}.", principalName, schemaId);
            return new ResponseEntity<>(Collections.singletonMap("message", "User cannot create a Topicmap under this Schema."), HttpStatus.FORBIDDEN);
        }

        newTopicMap.setTopicmapSchema(schemaService.getSchemaById(schemaId));
        topicmapService.saveTopicmap(newTopicMap);

        logger.info("New TopicMap {} added with id {}.", newTopicMap.getTitle(), newTopicMap.getId());
        return new ResponseEntity<>(Collections.singletonMap("message", "TopicMap correctly saved with id: " + newTopicMap.getId()), HttpStatus.OK);
    }


    @ApiOperation(value = "Get a Topicmap", response = List.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, response = void.class, message = "Successfully retrieved Topicmap"),
            @ApiResponse(code = 403, response = void.class, message = "If the user is not the owner of the schema or editor of the Topicmap"),
            @ApiResponse(code = 404, response = void.class, message = "If the user do not exist \n" +
                    "If the Topicmap referenced do not exist")
    })
    @RequestMapping(value = "/topicmap", method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<?> getTopicMapById(@RequestParam("topic_map_id") long topicMapId, Principal principal){
        String principalName = principal.getName();
        logger.info("Received a GET request from User {} for TopicMap with id {}.", principalName, topicMapId);

        //Check user existence
        if(!userService.existsUserByEmail(principalName)) {
            logger.error("Problem during authentication");
            return new ResponseEntity<>(Collections.singletonMap("message","No user found with this email: " + principalName), HttpStatus.NOT_FOUND);
        }

        //Check topicmap existence
        if(!topicmapService.existsTopicmapById(topicMapId)) {
            logger.error("TopicMap with id {} not found.", topicMapId);
            return new ResponseEntity<>(Collections.singletonMap("message", "You are trying to update a TopicMap that not exist!"), HttpStatus.NOT_FOUND);
        }

        //Check user privileges: has to be owner of the schema or editor of the topicmap
        if(!topicmapService.hasUserRightsOnTopicmap(userService.getUserByEmail(principalName), topicMapId) && !userService.isUserAdmin(principalName)) {
            logger.error("User {} is not allowed to change Topicmap with id: {}.",principalName, topicMapId);
            return new ResponseEntity<>(Collections.singletonMap("message","User " + principalName + " is not allowed to modify this Topicmap"), HttpStatus.FORBIDDEN);
        }

        Topicmap foundTopicmap = topicmapService.getTopicmapById(topicMapId);
        logger.info("TopicMap with id {} found.", topicMapId);
        return new ResponseEntity<>(foundTopicmap, HttpStatus.OK);
    }


    @ApiOperation(value = "Get all the Topicmaps of the user (where he is owner of the schema or editor on it)", response = List.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, response = void.class, message = "Successfully retrieved Topicmaps"),
            @ApiResponse(code = 404, response = void.class, message = "If the user do not exist")
    })
    @RequestMapping(value = "/topicmaps", method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<?> getAllUserTopicMap(Principal principal){
        String principalName = principal.getName();
        logger.info("User {} have request all own Topicmap.", principalName);

        //Check if user exists
        if(!userService.existsUserByEmail(principalName)) {
            logger.error("Problem during authentication");
            return new ResponseEntity<>(Collections.singletonMap("message","No user found with this email: " + principalName), HttpStatus.NOT_FOUND);
        }

        // Get user topicmap
        List<Topicmap> allUserTopicmap = topicmapService.getAllTopicmapsByTopicmapSchema_Owner(principalName);
        allUserTopicmap.addAll(userService.getUserByEmail(principalName).getAllUserSharedTopicmap());

        if(allUserTopicmap.isEmpty()) {
            logger.info("No Topicmap found");
            //return new ResponseEntity<>(Collections.singletonMap("message","No TopicMap found for this user: " + principalName), HttpStatus.OK);
            return new ResponseEntity<>(allUserTopicmap, HttpStatus.OK);
        }
        logger.info("Found Topicmap: {}.", allUserTopicmap.size());
        return new ResponseEntity<>(allUserTopicmap, HttpStatus.OK);
    }


    @ApiOperation(value = "Update a Topicmap", response = List.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, response = void.class, message = "Successfully updated Topicmap"),
            @ApiResponse(code = 403, response = void.class, message = "If the user is not the owner of the schema or editor of the Topicmap"),
            @ApiResponse(code = 404, response = void.class, message = "If the user do not exist \n" +
                    "If the Topicmap referenced do not exist")
    })
    @RequestMapping(value = "/topicmap", method = RequestMethod.PUT, produces = "application/json")
    public ResponseEntity<?> updateTopicMap(@RequestBody @Valid Topicmap topicMapUpdated, Principal principal){
        String principalName = principal.getName();
        long topicMapId = topicMapUpdated.getId();
        logger.info("Received a put request from User {} for the TopicMap: {}",principalName, topicMapUpdated);

        //Check user existence
        if(!userService.existsUserByEmail(principalName)) {
            logger.error("Problem during authentication");
            return new ResponseEntity<>(Collections.singletonMap("message","No user found with this email: " + principalName), HttpStatus.NOT_FOUND);
        }

        //Check topicmap existence
        if(!topicmapService.existsTopicmapById(topicMapId)) {
            logger.error("TopicMap with id {} not found.", topicMapUpdated.getId());
            return new ResponseEntity<>(Collections.singletonMap("message", "You are trying to update a TopicMap that not exist!"), HttpStatus.NOT_FOUND);
        }

        //Check user privileges: has to be owner of the schema or editor of the topicmap
        if(!topicmapService.hasUserRightsOnTopicmap(userService.getUserByEmail(principalName), topicMapId) && !userService.isUserAdmin(principalName)) {
            logger.error("User {} is not allowed to change Topicmap with id: {}.",principalName, topicMapId);
            return new ResponseEntity<>(Collections.singletonMap("message","User " + principalName + " is not allowed to modify this Topicmap"), HttpStatus.FORBIDDEN);
        }

        //Save new topicmap
        Topicmap topicmapToUpdate = topicmapService.getTopicmapById(topicMapId);
        topicmapService.updateTopicmap(topicMapUpdated, topicmapToUpdate);

        logger.info("TopicMap updated.");
        return new ResponseEntity<>(Collections.singletonMap("message","Topic map correctly updated"), HttpStatus.OK);
    }


    @ApiOperation(value = "Delete a Topicmap", response = List.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, response = void.class, message = "Successfully deleted Topicmap"),
            @ApiResponse(code = 403, response = void.class, message = "If the user is not the owner of the schema"),
            @ApiResponse(code = 404, response = void.class, message = "If the user do not exist \n" +
                    "If the Topicmap referenced do not exist")
    })
    @RequestMapping(value = "/topicmap", method = RequestMethod.DELETE, produces = "application/json")
    public ResponseEntity<?> deleteTopicMap(@RequestParam("topic_map_id")Long id, Principal principal){
        String principalName = principal.getName();
        logger.info("Received a delete request from User {} for TopicMap with id {}", principalName, id);

        //Check user existence
        if(!userService.existsUserByEmail(principalName)) {
            logger.error("Problem during authentication");
            return new ResponseEntity<>(Collections.singletonMap("message","No user found with this email: " + principalName), HttpStatus.NOT_FOUND);
        }

        //Check topicmap existence
        if(!topicmapService.existsTopicmapById(id)) {
            logger.error("TopicMap with id {} not found.", id);
            return new ResponseEntity<>(Collections.singletonMap("message", "No TopicMap found for this id: " + id), HttpStatus.NOT_FOUND);
        }

        //Check user privileges (only owner of the schema can delete the topicmap)
        String schemaOwner = topicmapService.getTopicmapById(id).getTopicmapSchema().getOwner();
        if(!principalName.equals(schemaOwner) && !userService.isUserAdmin(principalName)){
            logger.error("User {} does not have the right to delete Topicmap with id {}.", principalName, id);
            return new ResponseEntity<>(Collections.singletonMap("message", "User cannot delete this Topicmap."), HttpStatus.FORBIDDEN);
        }

        topicmapService.deleteTopicmapById(id);
        logger.info("TopicMap with id {} deleted.", id);
        return new ResponseEntity<>(Collections.singletonMap("message","Deleted TopicMap with id: " + id),  HttpStatus.OK);
    }


    @ApiIgnore
    //TODO: to be implemented
    @RequestMapping(value = "/topicmap/export", method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<?> exportTopicMapInXtmFormat(@RequestParam("topic_map_id") long id){
        logger.info("Received a TopicMap export request for TopicMap with id: {}", id);
        if(!topicmapService.existsTopicmapById(id)) {
            logger.error("TopicMap with id {} not found.", id);
            return new ResponseEntity<>(Collections.singletonMap("message", "You are trying to update a TopicMap that not exist!"), HttpStatus.NOT_FOUND);
        }
        Topicmap tm = topicmapService.getTopicmapById(id);
        //String xtm = xtmManager.generateXtmFromTopicMap(tm);
        String xtm= "";
        return new ResponseEntity<>(xtm, HttpStatus.OK);
    }
}

