package com.unige.encode.encoderestapi.controller;

import com.unige.encode.encoderestapi.model.*;
import com.unige.encode.encoderestapi.service.SchemaServiceImpl;
import com.unige.encode.encoderestapi.service.EffortTypeService;
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
@Api(value = "Effort Type Management System")
public class EffortTypeController {

    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired private EffortTypeService effortTypeService;
    @Autowired private SchemaServiceImpl schemaService;
    @Autowired private UserServiceImpl userService;


    @ApiOperation(value = "Create an Effort Type", response = List.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, response = void.class, message = "Successfully added new Effort Type"),
            @ApiResponse(code = 400, response = void.class, message = "If schema is not given"),
            @ApiResponse(code = 403, response = void.class, message = "If the user is not the owner of the schema"),
            @ApiResponse(code = 404, response = void.class, message = "If the user do not exist \n" +
                    "If the schema referenced do not exist")
    })
    @RequestMapping(value= "/effortType", method = RequestMethod.POST, consumes = "application/json")
    public ResponseEntity<?> createEffortType(@Valid @RequestBody EffortType newEffortType, Principal principal){
        String principalName = principal.getName();
        long schemaId = newEffortType.getSchemaId();
        logger.info("Received a POST request from User {} for new Effort Type.", principalName);
        //Check if owning schema is given
        if(schemaId == 0){
            logger.error("No owning Schema given for new Effort Type.");
            return new ResponseEntity<>(Collections.singletonMap("message", "A Effort Type needs a Schema."), HttpStatus.BAD_REQUEST);
        }

        //Check user existence
        ResponseEntity<?> existsUser = checkUserExistence(principalName);
        if(existsUser != null) return existsUser;

        //Check schema existence
        if(!schemaService.existsSchemaById(schemaId)) {
            logger.error("Referenced Schema with id {} not found.", schemaId);
            return new ResponseEntity<>(Collections.singletonMap("message", "Schema of Effort Type not found."), HttpStatus.NOT_FOUND);
        }

        //Check user privileges: has to be owner of the schema
        if(!schemaService.hasUserRightsOnSchema(principalName, schemaId) && !userService.isUserAdmin(principalName)){
            logger.error("User {} does not have the right to create a Effort Type with the Schema {}.", principalName, schemaId);
            return new ResponseEntity<>(Collections.singletonMap("message", "User cannot create a Effort Type under this Schema."), HttpStatus.FORBIDDEN);
        }

        newEffortType.setEffortTypeSchema(schemaService.getSchemaById(schemaId));
        effortTypeService.saveEffortType(newEffortType);

        logger.info("New Effort Type {} added with id {}.", newEffortType.getMetricType(), newEffortType.getId());
        return new ResponseEntity<>(newEffortType, HttpStatus.OK);
    }


    @ApiOperation(value = "Create a list of Effort Types", response = List.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, response = void.class, message = "Successfully added new Effort Types"),
            @ApiResponse(code = 400, response = void.class, message = "If a schema is not given"),
            @ApiResponse(code = 403, response = void.class, message = "If the user is not the owner of all the schema"),
            @ApiResponse(code = 404, response = void.class, message = "If the user do not exist \n" +
                    "If one of the schema referenced do not exist")
    })
    @RequestMapping(value= "/effortTypes", method = RequestMethod.POST, consumes = "application/json")
    public ResponseEntity<?> createEffortTypes(@Valid @RequestBody List<EffortType> effortTypes, Principal principal){
        String principalName = principal.getName();
        logger.info("Received a POST request from User {} for new Effort Types.", principalName);
        int effortsWithoutIds=0;
        Set<Long> allSchemaId = new HashSet<>();

        for (EffortType tt : effortTypes){
            long schemaId = tt.getSchemaId();
            //Check if owning schema is given
            if (schemaId == 0) {
                logger.error("No owning Schema given for new Effort Type {}.", tt.getMetricType());
                return new ResponseEntity<>(Collections.singletonMap("message", "All Effort Types need a Schema."), HttpStatus.BAD_REQUEST);
            }

            if(!allSchemaId.add(schemaId)) {

                //Check schema existence
                if (!schemaService.existsSchemaById(schemaId)) {
                    logger.error("Referenced Schema with id {} not found for Effort Type {}.", schemaId, tt.getMetricType());
                    return new ResponseEntity<>(Collections.singletonMap("message", "Schema of Effort Type " + tt.getMetricType() + " not found."), HttpStatus.NOT_FOUND);
                }

                //Check user privileges: has to be owner of the schema
                if (!schemaService.hasUserRightsOnSchema(principalName, schemaId) && !userService.isUserAdmin(principalName)) {
                    logger.error("User {} does not have the right to create Effort Type {} with the Schema {}.", principalName, tt.getMetricType(), schemaId);
                    return new ResponseEntity<>(Collections.singletonMap("message", "User cannot create Effort Type "+ tt.getMetricType() +" under this Schema."), HttpStatus.FORBIDDEN);
                }

            }
            tt.setEffortTypeSchema(schemaService.getSchemaById(schemaId));
            if(tt.getId()==0)
                effortsWithoutIds++;
        }
        long newEffortIds[] = new long[effortsWithoutIds];

        effortTypeService.saveAllEffortTypes(effortTypes);
        List <EffortType> allEffortType= effortTypeService.getAllEffortType();
        int y=0;
        for(int x = allEffortType.size() - effortsWithoutIds; x < allEffortType.size();x++){
            EffortType auxEt = allEffortType.get(x);
            newEffortIds[y] = auxEt.getId();
            y++;
        }
        logger.info("Added {} new Effort Types.", effortTypes.size());
        return new ResponseEntity<>(newEffortIds, HttpStatus.OK);
    }


    @ApiOperation(value = "Get an Effort Type", response = List.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, response = void.class, message = "Successfully retrieved Effort Type"),
            @ApiResponse(code = 403, response = void.class, message = "If the user is not the owner of the schema or editor of a Topicmap of this schema"),
            @ApiResponse(code = 404, response = void.class, message = "If the user do not exist \n" +
                    "If the Effort Type referenced do not exist")
    })
    @RequestMapping(value = "/effortType", method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<?> getEffortTypeById(@RequestParam("effort_type_id") long effortTypeId, Principal principal){
        String principalName = principal.getName();
        logger.info("Received a GET request from User {} for Effort Type with id: {}.", principalName, effortTypeId);

        //Check User existence
        ResponseEntity<?> existsUser = checkUserExistence(principalName);
        if(existsUser != null) return existsUser;

        //Check Effort Type existence
        ResponseEntity<?> existsEffortType = checkEffortTypeExistence(effortTypeId);
        if(existsEffortType != null) return existsEffortType;

        //Check User privileges == has to be Owner of the Schema OR admin OR be an Editor on a TopicMap using the Schema
        EffortType effortType = effortTypeService.getEffortTypeById(effortTypeId);
        long schemaId = effortType.getSchemaId();
        ResponseEntity<?> userPrivileges = checkUserPrivileges(principalName, schemaId, effortTypeId);
        if(userPrivileges != null){
            User user = userService.getUserByEmail(principalName);
            Set<Topicmap> userSharedTopicmap = user.getAllUserSharedTopicmap();
            if(userSharedTopicmap.stream().noneMatch(tm -> tm.getSchemaId() == schemaId)){
                return userPrivileges;
            }
            logger.info("User {} have reading right on Effort Type with id {}.", principalName, effortTypeId);
        }

        logger.info("Found Effort Type with id {}.", effortTypeId);
        return new ResponseEntity<>(effortType, HttpStatus.OK);
    }


    @ApiOperation(value = "Get all the Effort Types of the user (where he is owner of the schema or editor on a Topicmap using the schema)", response = List.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, response = void.class, message = "Successfully retrieved Effort Type"),
            @ApiResponse(code = 404, response = void.class, message = "If the user do not exist \n" +
                    "If the user have no Effort Type")
    })
    @RequestMapping(value = "/effortTypes", method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<?> getAllEffortTypes(Principal principal) {
        String principalName = principal.getName();
        logger.info("User {} have request all his Effort Types.", principalName);

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

        // Get the EffortTypes
        List<EffortType> effortTypes = effortTypeService.getBySchemaIdIsIn(allUserSchemaId);

        if(effortTypes == null || effortTypes.isEmpty()){
            logger.info("No Effort Type found.");
            return new ResponseEntity<>(Collections.singletonMap("message", "No Effort Type found."), HttpStatus.NOT_FOUND);
        }

        logger.info("Found {} Effort Types.", effortTypes.size());
        return new ResponseEntity<>(effortTypes, HttpStatus.OK);
    }


    @ApiOperation(value = "Update an Effort Type", response = List.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, response = void.class, message = "Successfully updated Effort Type"),
            @ApiResponse(code = 403, response = void.class, message = "If the user is not the owner of the schema"),
            @ApiResponse(code = 404, response = void.class, message = "If the user do not exist \n" +
                    "If the Effort Type referenced do not exist")
    })
    @RequestMapping(value = "/effortType", method = RequestMethod.PUT, produces = "application/json")
    public ResponseEntity<?> updateEffortType(@RequestBody @Valid EffortType effortTypeToUpdate, Principal principal){
        String principalName = principal.getName();
        long effortTypeId = effortTypeToUpdate.getId();
        logger.info("Received a PUT request from User {} for Effort Type with id: {}.", principalName, effortTypeId);

        //Check User existence
        ResponseEntity<?> existsUser = checkUserExistence(principalName);
        if(existsUser != null) return existsUser;

        //Check Effort Type existence
        ResponseEntity<?> existsEffortType = checkEffortTypeExistence(effortTypeId);
        if(existsEffortType != null) return existsEffortType;

        //Check if the User has the right to change the Effort Type == owner OR admin
        EffortType oldEffortType = effortTypeService.getEffortTypeById(effortTypeId);
        ResponseEntity<?> userPrivileges = checkUserPrivileges(principalName, oldEffortType.getSchemaId(), effortTypeId);
        if(userPrivileges != null) return userPrivileges;

        //Saving Effort Type
        effortTypeService.updateEffortType(effortTypeToUpdate, oldEffortType);
        logger.info("Updated Effort Type with id {}.", effortTypeId);
        return new ResponseEntity<>(Collections.singletonMap("message", "Effort Type updated."), HttpStatus.OK);
    }


    @ApiOperation(value = "Delete an Effort Type", response = List.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, response = void.class, message = "Successfully deleted Effort Type"),
            @ApiResponse(code = 403, response = void.class, message = "If the user is not the owner of the schema"),
            @ApiResponse(code = 404, response = void.class, message = "If the user do not exist \n" +
                    "If the Effort Type referenced do not exist")
    })
    @RequestMapping(value= "/effortType", method = RequestMethod.DELETE, produces = "application/json")
    public ResponseEntity<?> deleteEffortType(@RequestParam("effort_type_id") long effortTypeId, Principal principal){
        String principalName = principal.getName();
        logger.info("Received a DELETE request from User {} for Effort Type with id: {}.", principalName, effortTypeId);

        //Check User existence
        ResponseEntity<?> existsUser = checkUserExistence(principalName);
        if(existsUser != null) return existsUser;

        //Check Effort Type existence
        ResponseEntity<?> existsEffortType = checkEffortTypeExistence(effortTypeId);
        if(existsEffortType != null) return existsEffortType;

        //Check if the User has the right to delete the Effort Type == owner OR admin
        EffortType oldEffortType = effortTypeService.getEffortTypeById(effortTypeId);
        ResponseEntity<?> userPrivileges = checkUserPrivileges(principalName, oldEffortType.getSchemaId(), effortTypeId);
        if(userPrivileges != null) return userPrivileges;

        //Delete
        effortTypeService.deleteEffortType(effortTypeId);
        logger.info("Effort Type with id {} deleted.", effortTypeId);
        return new ResponseEntity<>(Collections.singletonMap("message", "Effort Type with id " + effortTypeId + " deleted."), HttpStatus.OK);
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
    private ResponseEntity<?> checkUserPrivileges(String email, long schemaId, long effortTypeId){
        if(!schemaService.hasUserRightsOnSchema(email, schemaId) && !userService.isUserAdmin(email)){
            logger.error("User {} does not have the right on Effort Type with id {}.", email, effortTypeId);
            return new ResponseEntity<>(Collections.singletonMap("message", "User cannot edit this Effort Type."), HttpStatus.FORBIDDEN);
        }
        return null;
    }

    @Nullable
    private ResponseEntity<?> checkEffortTypeExistence(long effortTypeId){
        if(!effortTypeService.existsEffortTypeById(effortTypeId)) {
            logger.error("Effort Type with id {} not found.", effortTypeId);
            return new ResponseEntity<>(Collections.singletonMap("message", "No Effort Type found for this id: " + effortTypeId), HttpStatus.NOT_FOUND);
        }
        return null;
    }
}
