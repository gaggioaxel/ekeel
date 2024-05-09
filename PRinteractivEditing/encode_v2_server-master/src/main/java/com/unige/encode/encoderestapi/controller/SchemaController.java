package com.unige.encode.encoderestapi.controller;

import com.unige.encode.encoderestapi.model.Schema;
import com.unige.encode.encoderestapi.model.User;
import com.unige.encode.encoderestapi.service.SchemaServiceImpl;
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
@Api(value = "Schema Management System")
public class SchemaController {

    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired private SchemaServiceImpl schemaService;
    @Autowired private UserServiceImpl userService;
    @Autowired private XtmManager xtmManager;


    @ApiOperation(value = "Create an schema", response = List.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, response = void.class, message = "Successfully added new schema"),
            @ApiResponse(code = 404, response = void.class, message = "If the user do not exist"),
    })
    @RequestMapping(value = "/schema", method = RequestMethod.POST, produces = "application/json")
    public ResponseEntity<?> createSchema(@RequestBody @Valid Schema newSchema, Principal principal){
        String principalName = principal.getName();
        String newSchemaName = newSchema.getName();
        logger.info("Received a post request from User {} for new Schema {}", principalName, newSchemaName);

        //Check user existence
        if(!userService.existsUserByEmail(principalName)) {
            logger.error("Problem during authentication");
            return new ResponseEntity<>(Collections.singletonMap("message","No user found with this email: " + principalName), HttpStatus.NOT_FOUND);
        }
        User currentUser = userService.getUserByEmail(principalName);

        //Adding User as Owner
        newSchema.setSchemaOwner(currentUser);
        schemaService.saveSchema(newSchema);

        long newSchemaId = newSchema.getId();
        logger.info("New Schema {} added with id {}.", newSchemaName, newSchemaId);
        return new ResponseEntity<>(newSchema, HttpStatus.CREATED);
    }


    @ApiOperation(value = "Get a schema", response = List.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, response = void.class, message = "Successfully retrieved schema"),
            @ApiResponse(code = 403, response = void.class, message = "If the user is not the owner of the schema"),
            @ApiResponse(code = 404, response = void.class, message = "If the user or the schema do not exist"),
    })
    //DO NOT ALLOW A USER THAT IS NOT THE OWNER TO GET IT.
    //THIS BEHAVIOUR CAN BE MODIFIED BY THE NEED OF THE CLIENT
    @RequestMapping(value = "/schema", method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<?> getSchemaById(@RequestParam("schema_id")Long schemaId, Principal principal){
        String principalName = principal.getName();
        logger.info("Received a GET request from User {} for Schema with id {}.", principalName, schemaId);

        //Check user existence
        if(!userService.existsUserByEmail(principalName)) {
            logger.error("Problem during authentication");
            return new ResponseEntity<>(Collections.singletonMap("message","No user found with this email: " + principalName), HttpStatus.NOT_FOUND);
        }

        //Check schema existence
        if(!schemaService.existsSchemaById(schemaId)) {
            logger.error("Schema with id {} not found.", schemaId);
            return new ResponseEntity<>(Collections.singletonMap("message", "You are trying to delete a Schema that does not exist!"), HttpStatus.NOT_FOUND);
        }

        //Check if the user has the right to change the schema == owner OR admin
        if(!schemaService.hasUserRightsOnSchema(principalName, schemaId) && !userService.isUserAdmin(principalName)) {
            logger.error("User {} is not allowed to get schema with id: {}.",principalName, schemaId);
            return new ResponseEntity<>(Collections.singletonMap("message","User " + principalName + " is not allowed to get this schema"), HttpStatus.FORBIDDEN);
        }

        Schema foundSchema = schemaService.getSchemaById(schemaId);
        logger.info("Found Schema with id {}.", schemaId);
        return new ResponseEntity<>(foundSchema, HttpStatus.OK);
    }


    @ApiOperation(value = "Get all user schema", response = List.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, response = void.class, message = "Successfully retrieved all user schema"),
            @ApiResponse(code = 404, response = void.class, message = "If the user do not exist")
    })
    @RequestMapping(value = "/schemas", method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<?> getAllUserSchema(Principal principal){
        String principalName = principal.getName();
        logger.info("User {} have request all own Schema.", principalName);

        //Check user existence
        if(!userService.existsUserByEmail(principalName)) {
            logger.error("Problem during authentication");
            return new ResponseEntity<>(Collections.singletonMap("message","No user found with this email: " + principalName), HttpStatus.NOT_FOUND);
        }

        //Get his owned schemas
        List<Schema> allUserSchema = schemaService.getAllSchemasBySchemaOwner_Email(principalName);
        if(allUserSchema.isEmpty()) {
            logger.info("No Schema found");
            //return new ResponseEntity<>(Collections.singletonMap("message","No TopicMap found for this user: " + principalName), HttpStatus.OK);
            return new ResponseEntity<>(allUserSchema, HttpStatus.OK);
        }
        logger.info("Found Schema: {}.", allUserSchema.size());
        return new ResponseEntity<>(allUserSchema, HttpStatus.OK);
    }


    @ApiOperation(value = "Update a schema", response = List.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, response = void.class, message = "Successfully updated schema"),
            @ApiResponse(code = 403, response = void.class, message = "If the user is not the owner of the schema"),
            @ApiResponse(code = 404, response = void.class, message = "If the user or the schema do not exist")
    })
    @RequestMapping(value = "/schema", method = RequestMethod.PUT, produces = "application/json")
    public ResponseEntity<?> updateSchema(@RequestBody @Valid Schema schemaUpdated, Principal principal){
        String principalName = principal.getName();
        long schemaId = schemaUpdated.getId();
        logger.info("Received a put request from User {} for Schema with id: {}", principalName, schemaId);

        //Check user existence
        if(!userService.existsUserByEmail(principalName)) {
            logger.error("Problem during authentication");
            return new ResponseEntity<>(Collections.singletonMap("message","No user found with this email: " + principalName), HttpStatus.NOT_FOUND);
        }

        //Check schema existence
        if(!schemaService.existsSchemaById(schemaId)) {
            logger.error("Schema with id {} not found.", schemaUpdated.getId());
            return new ResponseEntity<>(Collections.singletonMap("message", "You are trying to update a Schema that does not exist!"), HttpStatus.NOT_FOUND);
        }

        //Check if the user has the right to change the schema == owner OR admin
        if(!schemaService.hasUserRightsOnSchema(principalName, schemaId) && !userService.isUserAdmin(principalName)) {
            logger.error("User {} is not allowed to change schema with id: {}.",principalName, schemaId);
            return new ResponseEntity<>(Collections.singletonMap("message","User " + principalName + " is not allowed to modify this schema"), HttpStatus.FORBIDDEN);
        }

        // Modify the old schema with new values of the fields
        Schema schemaToUpdate = schemaService.getSchemaById(schemaId);
        schemaService.updateSchema(schemaToUpdate, schemaUpdated);
        logger.info("Schema with id {} updated by User {}.", schemaId, principalName);
        return new ResponseEntity<>(Collections.singletonMap("message","Schema correctly updated"), HttpStatus.OK);
    }


    @ApiOperation(value = "Delete a schema", response = List.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, response = void.class, message = "Successfully deleted schema"),
            @ApiResponse(code = 403, response = void.class, message = "If the user is not the owner of the schema"),
            @ApiResponse(code = 404, response = void.class, message = "If the user or the schema do not exist")
    })
    @RequestMapping(value = "/schema", method = RequestMethod.DELETE, produces = "application/json")
    public ResponseEntity<?> deleteSchema(@RequestParam("schema_id")Long schemaId, Principal principal){
        String principalName = principal.getName();
        logger.info("Received a delete request from User {} for Schema with id {}", principalName, schemaId);

        //Check user existence
        if(!userService.existsUserByEmail(principalName)) {
            logger.error("Problem during authentication");
            return new ResponseEntity<>(Collections.singletonMap("message","No user found with this email: " + principalName), HttpStatus.NOT_FOUND);
        }

        //Check schema existence
        if(!schemaService.existsSchemaById(schemaId)) {
            logger.error("Schema with id {} not found.", schemaId);
            return new ResponseEntity<>(Collections.singletonMap("message", "You are trying to delete a Schema that does not exist!"), HttpStatus.NOT_FOUND);
        }

        //Check if the user has the right to change the schema == owner OR admin
        if(!schemaService.hasUserRightsOnSchema(principalName, schemaId) && !userService.isUserAdmin(principalName)) {
            logger.error("User {} is not allowed to delete schema with id: {}.",principalName, schemaId);
            return new ResponseEntity<>(Collections.singletonMap("message","User " + principalName + " is not allowed to modify this schema"), HttpStatus.FORBIDDEN);
        }

        //Delete
        schemaService.deleteSchemaById(schemaId);
        logger.info("Schema with id {} deleted.", schemaId);
        return new ResponseEntity<>(Collections.singletonMap("message","Deleted Schema with id: " + schemaId),  HttpStatus.OK);
    }


    @ApiIgnore
    //TODO : implement the fetch of everything under the schema (types and instances)
    @RequestMapping(value = "/schema/export", method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<?> exportSchemaInXtmFormat(@RequestParam("schema_id") long id){
        logger.info("Received a Schema export request for Schema with id: {}", id);
        if(!schemaService.existsSchemaById(id)) {
            logger.error("Schema with id {} not found.", id);
            return new ResponseEntity<>(Collections.singletonMap("message", "You are trying to export a Schema that does not exist!"), HttpStatus.NOT_FOUND);
        }
        Schema schema = schemaService.getSchemaById(id);
        //String xtm = xtmManager.generateXtmFromSchema(schema);
        String xtm= "";
        return new ResponseEntity<>(xtm, HttpStatus.OK);
    }
}
