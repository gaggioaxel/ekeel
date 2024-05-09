package com.unige.encode.encoderestapi.controller;

import com.unige.encode.encoderestapi.model.Topicmap;
import com.unige.encode.encoderestapi.model.User;
import com.unige.encode.encoderestapi.service.SchemaServiceImpl;
import com.unige.encode.encoderestapi.service.TopicmapServiceImpl;
import com.unige.encode.encoderestapi.service.UserServiceImpl;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.jetbrains.annotations.Nullable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import java.security.Principal;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping(value = "/protected/v1")
@Api(value = "Editors Management System")
public class EditorController {

    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired private TopicmapServiceImpl topicmapService;
    @Autowired private UserServiceImpl userService;
    @Autowired private SchemaServiceImpl schemaService;


    @ApiOperation(value = "Add an editor to a Topicmap", response = List.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, response = void.class, message = "If successfully added editor to Topicmap, editor was already editor of this Topicmap or the owner was tried to be added"),
            @ApiResponse(code = 403, response = void.class, message = "If the user is not owner of the schema of the Topicmap"),
            @ApiResponse(code = 404, response = void.class, message = "If the user or the editor do not exist \n" +
                    "If the Topicmap referenced do not exist")
    })
    @RequestMapping(value = "/editor", method = RequestMethod.POST, produces = "application/json")
    public ResponseEntity<?> addEditorToTopicMap(@RequestParam("topic_map_id")Long topicMapId, @RequestParam("editor_email")String editorName, Principal principal){
        String principalName = principal.getName();
        logger.info("Received a post request from User {} to add User {} as editor for TopicMap {}.",principalName, editorName, topicMapId);

        //Check user existence
        ResponseEntity<?> existsUser = checkUserExistence(principalName);
        if(existsUser != null) return existsUser;

        //Check editor existence
        ResponseEntity<?> existsEditor = checkEditorExistence(editorName);
        if(existsEditor != null) return existsEditor;

        //Check topicmap existence
        ResponseEntity<?> existsTopicmap = checkTopicmapExistence(topicMapId);
        if(existsTopicmap != null) return existsTopicmap;

        //Check user privileges: has to be owner of the schema
        Topicmap topicMap = topicmapService.getTopicmapById(topicMapId);
        ResponseEntity<?> userPrivileges = checkUserPrivileges(principalName, topicMap.getSchemaId(), topicMapId,"add");
        if(userPrivileges != null) return userPrivileges;

        //Check that the owner is not added as an editor
        if(editorName.equals(topicMap.getTopicmapSchema().getOwner())) {
            logger.error("Cannot add User {} as an Editor because he is the Owner of the Schema of the Topicmap {}.", editorName, topicMapId);
            return new ResponseEntity<>(Collections.singletonMap("message", "Editor already has access to this Topicmap."), HttpStatus.OK);
        }

        //Adding Topicmap in editor SharedTopicmaps
        User editor = userService.getUserByEmail(editorName);
        if(!editor.getAllUserSharedTopicmap().add(topicMap)){
            logger.info("Editor {} already is editor of Topicmap with id {}.", editorName, topicMapId);
            return new ResponseEntity<>(Collections.singletonMap("message", "Editor was already editor on this Topicmap."), HttpStatus.OK);
        }

        userService.saveUser(editor);
        logger.info("Editor {} added to Topicmap with id {}.", editorName, topicMapId);
        return new ResponseEntity<>(Collections.singletonMap("message", "Editor correctly added to Topicmap."), HttpStatus.OK);
    }


    @ApiOperation(value = "Get the editors of a Topicmap", response = List.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, response = void.class, message = "Successfully retrieved editors of Topicmap"),
            @ApiResponse(code = 403, response = void.class, message = "If the user is not owner or editor of the Topicmap"),
            @ApiResponse(code = 404, response = void.class, message = "If the user do not exist \n" +
                    "If the Topicmap referenced do not exist")
    })
    @RequestMapping(value = "/editors", method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<?> getEditorsOfTopicMap(@RequestParam("topic_map_id")Long topicMapId, Principal principal){
        String principalName = principal.getName();
        logger.info("User {} have request all editors of TopicMap {}.",principalName, topicMapId);

        //Check user existence
        ResponseEntity<?> existsUser = checkUserExistence(principalName);
        if(existsUser != null) return existsUser;

        //Check topicmap existence
        ResponseEntity<?> existsTopicmap = checkTopicmapExistence(topicMapId);
        if(existsTopicmap != null) return existsTopicmap;

        //Check user privileges: has to be owner of the schema OR editor of the Topicmap
        User user = userService.getUserByEmail(principalName);
        Topicmap topicMap = topicmapService.getTopicmapById(topicMapId);
        Set<User> editors = topicMap.getEditors();

        if(!schemaService.hasUserRightsOnSchema(principalName, topicMap.getSchemaId())
                && !userService.isUserAdmin(principalName)
                && !editors.contains(user)){
            logger.error("User {} does not have the right to see the Editors of Topicmap with id {}.", principalName, topicMapId);
            return new ResponseEntity<>(Collections.singletonMap("message", "User cannot see Editors of this Topicmap."), HttpStatus.FORBIDDEN);
        }

        Set<String> editorsEmail = new HashSet<>();
        editors.forEach(u -> editorsEmail.add(u.getEmail()));
        logger.info("Found {} editors for Topicmap with id {}.", editorsEmail.size(), topicMapId);
        return new ResponseEntity<>(editorsEmail, HttpStatus.OK);
    }


    @ApiOperation(value = "Update the editor list of a Topicmap", response = List.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, response = void.class, message = "Successfully added editors to Topicmap (except the owner if it was in the list)"),
            @ApiResponse(code = 400, response = void.class, message = "If the list of editors is empty"),
            @ApiResponse(code = 403, response = void.class, message = "If the user is not owner of the schema of the Topicmap"),
            @ApiResponse(code = 404, response = void.class, message = "If the user or one of the editor do not exist \n" +
                    "If the Topicmap referenced do not exist")
    })
    @RequestMapping(value = "/editors", method = RequestMethod.PUT, produces = "application/json")
    @Transactional
    public ResponseEntity<?> updateEditorsOfTopicMap(@RequestParam("topic_map_id")Long topicMapId, @RequestBody List<String> editorNames, Principal principal){
        String principalName = principal.getName();
        logger.info("Received a put request from User {} for editors of TopicMap {}.",principalName, topicMapId);

        //Check user existence
        ResponseEntity<?> existsUser = checkUserExistence(principalName);
        if(existsUser != null) return existsUser;

        //Check if the list of editors is given
        if(editorNames.isEmpty()){
            logger.error("No editors to add.");
            return new ResponseEntity<>(Collections.singletonMap("message", "List of editors is empty."), HttpStatus.BAD_REQUEST);
        }

        //Check topicmap existence
        ResponseEntity<?> existsTopicmap = checkTopicmapExistence(topicMapId);
        if(existsTopicmap != null) return existsTopicmap;

        //Check user privileges: has to be owner of the schema
        Topicmap topicMap = topicmapService.getTopicmapById(topicMapId);
        ResponseEntity<?> userPrivileges = checkUserPrivileges(principalName, topicMap.getSchemaId(), topicMapId,"update");
        if(userPrivileges != null) return userPrivileges;

        //Check editors existence
        for (String editorName : editorNames) {
            ResponseEntity<?> existsEditor = checkEditorExistence(editorName);
            if(existsEditor != null) return existsEditor;
        }

        //Check that the owner is not added as an editor
        String owner = topicMap.getTopicmapSchema().getOwner();
        if(editorNames.remove(owner)) {
            logger.error("Cannot add User {} as an Editor because he is the Owner of the Schema of the Topicmap {}.", owner, topicMapId);
        }

        //Get all new Editors
        Set<User> newEditors = userService.getAllUsersByEmailInList(editorNames);
        Set<User> oldEditors = topicMap.getEditors();
        //OldEditors now contains Editors to remove the access
        oldEditors.removeAll(newEditors);

        //Changing Editors
        newEditors.forEach(editor -> editor.getAllUserSharedTopicmap().add(topicMap));
        oldEditors.forEach(editor -> editor.getAllUserSharedTopicmap().remove(topicMap));

        //NewEditors contains now all the updated Users
        newEditors.addAll(oldEditors);

        //Save users
        userService.saveUserSet(newEditors);
        logger.info("Editors of Topicmap {} updated.", topicMapId);
        return new ResponseEntity<>(Collections.singletonMap("message", "Editors of the Topicmap correctly updated."), HttpStatus.OK);
    }


    @ApiOperation(value = "Remove an editor of a Topicmap", response = List.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, response = void.class, message = "Successfully removed editor or the editor was not editor of this Topicmap in the first place"),
            @ApiResponse(code = 403, response = void.class, message = "If the user is not owner of the schema of the Topicmap"),
            @ApiResponse(code = 404, response = void.class, message = "If the user or the editor do not exist \n" +
                    "If the Topicmap referenced do not exist")
    })
    @RequestMapping(value = "/editor", method = RequestMethod.DELETE, produces = "application/json")
    public ResponseEntity<?> removeEditorFromTopicMap(@RequestParam("topic_map_id")Long topicMapId, @RequestParam("editor_email")String editorName, Principal principal){
        String principalName = principal.getName();
        logger.info("Received a delete request from User {} to remove User {} from editors of TopicMap {}.",principalName, editorName, topicMapId);

        //Check user existence
        ResponseEntity<?> existsUser = checkUserExistence(principalName);
        if(existsUser != null) return existsUser;

        //Check editor existence
        ResponseEntity<?> existsEditor = checkEditorExistence(editorName);
        if(existsEditor != null) return existsEditor;

        //Check topicmap existence
        ResponseEntity<?> existsTopicmap = checkTopicmapExistence(topicMapId);
        if(existsTopicmap != null) return existsTopicmap;

        //Check user privileges: has to be owner of the schema
        Topicmap topicMap = topicmapService.getTopicmapById(topicMapId);
        ResponseEntity<?> userPrivileges = checkUserPrivileges(principalName, topicMap.getSchemaId(), topicMapId,"delete");
        if(userPrivileges != null) return userPrivileges;

        //Adding Topicmap with in editor SharedTopicmaps
        User editor = userService.getUserByEmail(editorName);
        if(!editor.getAllUserSharedTopicmap().remove(topicMap)){
            logger.info("Editor {} is not an editor of Topicmap with id {}.", editorName, topicMapId);
            return new ResponseEntity<>(Collections.singletonMap("message", "Specified editor was not editor of the Topicmap."), HttpStatus.OK);
        }

        userService.saveUser(editor);
        logger.info("Editor {} removed from Topicmap with id {}.", editorName, topicMapId);
        return new ResponseEntity<>(Collections.singletonMap("message", "Editor correctly removed from Topicmap."), HttpStatus.OK);
    }

    @Nullable
    private ResponseEntity<?> checkUserExistence(String email){
        if(!userService.existsUserByEmail(email)) {
            logger.error("Problem during authentication.");
            return new ResponseEntity<>(Collections.singletonMap("message","No user found with this email: " + email), HttpStatus.NOT_FOUND);
        }
        return null;
    }

    @Nullable
    private ResponseEntity<?> checkEditorExistence(String email){
        if(!userService.existsUserByEmail(email)) {
            logger.error("Editor with email {} not found.", email);
            return new ResponseEntity<>(Collections.singletonMap("message","Editor not found with this email: " + email), HttpStatus.NOT_FOUND);
        }
        return null;
    }

    @Nullable
    private ResponseEntity<?> checkTopicmapExistence(long topicMapId){
        if(!topicmapService.existsTopicmapById(topicMapId)) {
            logger.error("TopicMap with id {} not found.", topicMapId);
            return new ResponseEntity<>(Collections.singletonMap("message", "No TopicMap found for this id: " + topicMapId), HttpStatus.NOT_FOUND);
        }
        return null;
    }

    @Nullable
    private ResponseEntity<?> checkUserPrivileges(String email, long schemaId, long topicMapId, String httpAction){
        if(!schemaService.hasUserRightsOnSchema(email, schemaId) && !userService.isUserAdmin(email)){
            logger.error("User {} does not have the right on Topicmap with id {} to {} an Editor .", email, topicMapId ,httpAction);
            return new ResponseEntity<>(Collections.singletonMap("message", "User cannot " + httpAction + " Editors for this Topicmap."), HttpStatus.FORBIDDEN);
        }
        return null;
    }
}
