package com.unige.encode.encoderestapi.controller;

import com.unige.encode.encoderestapi.model.Schema;
import com.unige.encode.encoderestapi.model.Scope;
import com.unige.encode.encoderestapi.model.Topicmap;
import com.unige.encode.encoderestapi.model.User;
import com.unige.encode.encoderestapi.service.SchemaService;
import com.unige.encode.encoderestapi.service.ScopeService;
import com.unige.encode.encoderestapi.service.UserService;
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
@Api(value = "Scope Management System")
public class ScopeController {

    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired ScopeService scopeService;
    @Autowired UserService userService;
    @Autowired SchemaService schemaService;


    @ApiOperation(value = "Create a Scope", response = List.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, response = void.class, message = "Successfully added new Scope"),
            @ApiResponse(code = 400, response = void.class, message = "If schema is not given"),
            @ApiResponse(code = 403, response = void.class, message = "If the user is not the owner of the schema"),
            @ApiResponse(code = 404, response = void.class, message = "If the user do not exist \n" +
                    "If the schema referenced do not exist")
    })
    @RequestMapping(value = "/scope", method = RequestMethod.POST, produces = "application/json")
    public ResponseEntity<?> createScope(@RequestBody @Valid Scope newScope, Principal principal) {
        String principalName = principal.getName();
        long schemaId = newScope.getSchemaId();
        logger.info("Received a POST request from User {} for new Scope.", principalName);

        //Check if owning schema is given
        if(schemaId == 0){
            logger.error("No owning Schema given for new Scope.");
            return new ResponseEntity<>(Collections.singletonMap("message", "A Scope needs a Schema."), HttpStatus.BAD_REQUEST);
        }

        //Check user existence
        ResponseEntity<?> existsUser = checkUserExistence(principalName);
        if(existsUser != null) return existsUser;

        //Check schema existence
        if(!schemaService.existsSchemaById(schemaId)) {
            logger.error("Referenced Schema with id {} not found.", schemaId);
            return new ResponseEntity<>(Collections.singletonMap("message", "Schema of Scope not found."), HttpStatus.NOT_FOUND);
        }

        //Check user privileges: has to be owner of the schema
        if(!schemaService.hasUserRightsOnSchema(principalName, schemaId) && !userService.isUserAdmin(principalName)){
            logger.error("User {} does not have the right to create a Scope with the Schema {}.", principalName, schemaId);
            return new ResponseEntity<>(Collections.singletonMap("message", "User cannot create a Scope under this Schema."), HttpStatus.FORBIDDEN);
        }

        newScope.setScopeSchema(schemaService.getSchemaById(schemaId));
        scopeService.saveScope(newScope);

        logger.info("New Scope {} added with id {}.", newScope.getName(), newScope.getId());
        return new ResponseEntity<>(newScope, HttpStatus.OK);
    }


    @ApiOperation(value = "Create a list of Scopes", response = List.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, response = void.class, message = "Successfully added new Scopes"),
            @ApiResponse(code = 400, response = void.class, message = "If a schema is not given"),
            @ApiResponse(code = 403, response = void.class, message = "If the user is not the owner of all the schema"),
            @ApiResponse(code = 404, response = void.class, message = "If the user do not exist \n" +
                    "If one of the schema referenced do not exist")
    })
    @RequestMapping(value = "/scopes", method = RequestMethod.POST, produces = "application/json")
    public ResponseEntity<?> createScopes(@RequestBody  @Valid List<Scope> scopes, Principal principal) {
        String principalName = principal.getName();
        logger.info("Received a POST request from User {} for new Scopes.", principalName);

        Set<Long> allSchemaId = new HashSet<>();
        int scopeWithoutIds=0;

        for (Scope sc : scopes){
            long schemaId = sc.getSchemaId();
            //Check if owning schema is given
            if (schemaId == 0) {
                logger.error("No owning Schema given for new Scope {}.", sc.getName());
                return new ResponseEntity<>(Collections.singletonMap("message", "All Scopes need a Schema."), HttpStatus.BAD_REQUEST);
            }

            if(!allSchemaId.add(schemaId)) {

                //Check schema existence
                if (!schemaService.existsSchemaById(schemaId)) {
                    logger.error("Referenced Schema with id {} not found for Scope {}.", schemaId, sc.getName());
                    return new ResponseEntity<>(Collections.singletonMap("message", "Schema of Scope " + sc.getName() + " not found."), HttpStatus.NOT_FOUND);
                }

                //Check user privileges: has to be owner of the schema
                if (!schemaService.hasUserRightsOnSchema(principalName, schemaId) && !userService.isUserAdmin(principalName)) {
                    logger.error("User {} does not have the right to create Scope {} with the Schema {}.", principalName, sc.getName(), schemaId);
                    return new ResponseEntity<>(Collections.singletonMap("message", "User cannot create Scope "+ sc.getName() +" under this Schema."), HttpStatus.FORBIDDEN);
                }

            }
            sc.setScopeSchema(schemaService.getSchemaById(schemaId));
            if(sc.getId()==0)
                scopeWithoutIds++;
        }


        scopeService.saveAllScopes(scopes);
        List<Scope> allScopes=scopeService.getAllScopes();
        long newScopesIds[]= new long[scopeWithoutIds];
        int y=0;
        for(int x = allScopes.size()- scopeWithoutIds;x<allScopes.size(); x++){
            Scope auxS= allScopes.get(x);
            newScopesIds[y]= auxS.getId();
            y++;
        }
        logger.info("Added {} new Scopes.", scopes.size());
        logger.info("\n\n\n SCOPESIDS: ",newScopesIds,"\n\n\n");
        return new ResponseEntity<>(newScopesIds, HttpStatus.OK);
    }


    @ApiOperation(value = "Get a Scope", response = List.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, response = void.class, message = "Successfully retrieved Scope"),
            @ApiResponse(code = 403, response = void.class, message = "If the user is not the owner of the schema or editor of a Topicmap of this schema"),
            @ApiResponse(code = 404, response = void.class, message = "If the user do not exist \n" +
                    "If the Scope referenced do not exist")
    })
    @RequestMapping(value = "/scope", method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<?> getScope(@RequestParam("scope_id") long scopeId, Principal principal) {
        String principalName = principal.getName();
        logger.info("Received a GET request from User {} for Scope with id: {}.", principalName, scopeId);

        //Check User existence
        ResponseEntity<?> existsUser = checkUserExistence(principalName);
        if(existsUser != null) return existsUser;

        //Check Scope existence
        ResponseEntity<?> existsScope = checkScopeExistence(scopeId);
        if(existsScope != null) return existsScope;

        //Check User privileges == has to be Owner of the Schema OR admin OR be an Editor on a TopicMap using the Schema
        Scope scope = scopeService.getScopeById(scopeId);
        long schemaId = scope.getSchemaId();
        ResponseEntity<?> userPrivileges = checkUserPrivileges(principalName, schemaId, scopeId);
        if(userPrivileges != null){
            User user = userService.getUserByEmail(principalName);
            Set<Topicmap> userSharedTopicmap = user.getAllUserSharedTopicmap();
            if(userSharedTopicmap.stream().noneMatch(tm -> tm.getSchemaId() == schemaId)){
                return userPrivileges;
            }
            logger.info("User {} have reading right on Scope with id {}.", principalName, scopeId);
        }

        logger.info("Found Scope with id {}.", scopeId);
        return new ResponseEntity<>(scope, HttpStatus.OK);
    }


    @ApiOperation(value = "Get all the Scopes of the user (where he is owner of the schema or editor on a Topicmap using the schema)", response = List.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, response = void.class, message = "Successfully retrieved Scope"),
            @ApiResponse(code = 404, response = void.class, message = "If the user do not exist \n" +
                    "If the user have no Scope")
    })
    @RequestMapping(value = "/scopes", method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<?> getAllScopes(Principal principal) {
        String principalName = principal.getName();
        logger.info("User {} have request all his Scopes.", principalName);

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

        // Get the Scopes
        List<Scope> scopes = scopeService.getBySchemaIdIsIn(allUserSchemaId);

        if(scopes.isEmpty()){
            logger.info("No Scope found.");
            return new ResponseEntity<>(Collections.singletonMap("message", "No Scope found."), HttpStatus.NOT_FOUND);
        }

        logger.info("Found {} Scopes.", scopes.size());
        return new ResponseEntity<>(scopes, HttpStatus.OK);
    }


    @ApiOperation(value = "Update a Scope", response = List.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, response = void.class, message = "Successfully updated Scope"),
            @ApiResponse(code = 403, response = void.class, message = "If the user is not the owner of the schema"),
            @ApiResponse(code = 404, response = void.class, message = "If the user do not exist \n" +
                    "If the Scope referenced do not exist")
    })
    @RequestMapping(value = "/scope", method = RequestMethod.PUT, produces = "application/json")
    public ResponseEntity<?> updateScope(@RequestBody @Valid Scope scopeToUpdate, Principal principal){
        String principalName = principal.getName();
        long scopeId = scopeToUpdate.getId();
        logger.info("Received a PUT request from User {} for Scope with id: {}.", principalName, scopeId);

        //Check User existence
        ResponseEntity<?> existsUser = checkUserExistence(principalName);
        if(existsUser != null) return existsUser;

        //Check Scope existence
        ResponseEntity<?> existsScope = checkScopeExistence(scopeId);
        if(existsScope != null) return existsScope;

        //Check if the User has the right to change the Scope == owner OR admin
        Scope oldScope = scopeService.getScopeById(scopeId);
        ResponseEntity<?> userPrivileges = checkUserPrivileges(principalName, oldScope.getSchemaId(), scopeId);
        if(userPrivileges != null) return userPrivileges;

        //Saving Scope
        scopeService.updateScope(scopeToUpdate, oldScope);
        logger.info("Updated Scope with id {}.", scopeId);
        return new ResponseEntity<>(Collections.singletonMap("message", "Scope updated."), HttpStatus.OK);
    }


    @ApiOperation(value = "Delete a Scope", response = List.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, response = void.class, message = "Successfully deleted Scope"),
            @ApiResponse(code = 403, response = void.class, message = "If the user is not the owner of the schema"),
            @ApiResponse(code = 404, response = void.class, message = "If the user do not exist \n" +
                    "If the Scope referenced do not exist")
    })
    @RequestMapping(value = "/scope", method = RequestMethod.DELETE, produces = "application/json")
    public ResponseEntity<?> deleteScope(@RequestParam("scope_id") long scopeId, Principal principal){
        String principalName = principal.getName();
        logger.info("Received a DELETE request from User {} for Scope with id: {}.", principalName, scopeId);

        //Check User existence
        ResponseEntity<?> existsUser = checkUserExistence(principalName);
        if(existsUser != null) return existsUser;

        //Check Scope existence
        ResponseEntity<?> existsScope = checkScopeExistence(scopeId);
        if(existsScope != null) return existsScope;

        //Check if the User has the right to delete the Scope == owner OR admin
        Scope oldScope = scopeService.getScopeById(scopeId);
        ResponseEntity<?> userPrivileges = checkUserPrivileges(principalName, oldScope.getSchemaId(), scopeId);
        if(userPrivileges != null) return userPrivileges;

        //Delete
        scopeService.deleteScope(scopeId);
        logger.info("Scope with id {} deleted.", scopeId);
        return new ResponseEntity<>(Collections.singletonMap("message", "Scope with id " + scopeId + " deleted."), HttpStatus.OK);
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
            logger.error("User {} does not have the right on Scope with id {}.", email, topicTypeId);
            return new ResponseEntity<>(Collections.singletonMap("message", "User cannot edit this Scope."), HttpStatus.FORBIDDEN);
        }
        return null;
    }

    @Nullable
    private ResponseEntity<?> checkScopeExistence(long scopeId){
        if(!scopeService.existsScopeById(scopeId)) {
            logger.error("Scope with id {} not found.", scopeId);
            return new ResponseEntity<>(Collections.singletonMap("message", "No Scope found for this id: " + scopeId), HttpStatus.NOT_FOUND);
        }
        return null;
    }

}
