package com.unige.encode.encoderestapi.controller;

import com.unige.encode.encoderestapi.model.*;
import com.unige.encode.encoderestapi.service.OccurrenceService;
import com.unige.encode.encoderestapi.service.OccurrenceTypeService;
import com.unige.encode.encoderestapi.service.SchemaServiceImpl;
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
@Api(value = "Occurrence Type Management System")
public class OccurrenceTypeController {
    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Autowired private OccurrenceTypeService occurrenceTypeService;
    @Autowired private SchemaServiceImpl schemaService;
    @Autowired private UserServiceImpl userService;


    @ApiOperation(value = "Create an Occurrence Type", response = List.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, response = void.class, message = "Successfully added new Occurrence Type"),
            @ApiResponse(code = 400, response = void.class, message = "If schema is not given"),
            @ApiResponse(code = 403, response = void.class, message = "If the user is not the owner of the schema"),
            @ApiResponse(code = 404, response = void.class, message = "If the user do not exist \n" +
                    "If the schema referenced do not exist")
    })
    @RequestMapping(value = "/occurrenceType", method = RequestMethod.POST, consumes = "application/json")
    public ResponseEntity<?> createOccurrenceType(@RequestBody @Valid OccurrenceType newOccurrenceType, Principal principal){
        String principalName = principal.getName();
        long schemaId = newOccurrenceType.getSchemaId();
        logger.info("Received a POST request from User {} for new Occurrence Type.",principalName);

        //Check if owning schema is given
        if(schemaId == 0){
            logger.error("No owning Schema given for new Occurrence Type.");
            return new ResponseEntity<>(Collections.singletonMap("message", "An Occurrence Type needs a Schema."), HttpStatus.BAD_REQUEST);
        }

        //Check user existence
        ResponseEntity<?> existsUser = checkUserExistence(principalName);
        if(existsUser != null) return existsUser;

        //Check schema existence
        if(!schemaService.existsSchemaById(schemaId)) {
            logger.error("Referenced Schema with id {} not found.", schemaId);
            return new ResponseEntity<>(Collections.singletonMap("message", "Schema of Occurrence Type not found."), HttpStatus.NOT_FOUND);
        }

        //Check user privileges: has to be owner of the schema
        if(!schemaService.hasUserRightsOnSchema(principalName, schemaId) && !userService.isUserAdmin(principalName)){
            logger.error("User {} does not have the right to create an Occurrence Type with the Schema {}.", principalName, schemaId);
            return new ResponseEntity<>(Collections.singletonMap("message", "User cannot create an OccurrenceType under this Schema."), HttpStatus.FORBIDDEN);
        }

        newOccurrenceType.setOccurrenceTypeSchema(schemaService.getSchemaById(schemaId));
        occurrenceTypeService.saveOccurrenceType(newOccurrenceType);

        logger.info("New Occurrence Type {} added with id {}.", newOccurrenceType.getName(), newOccurrenceType.getId());
        return new ResponseEntity<>( newOccurrenceType, HttpStatus.OK);

    }


    @ApiOperation(value = "Create a list of Occurrence Types", response = List.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, response = void.class, message = "Successfully added new Occurrence Types"),
            @ApiResponse(code = 400, response = void.class, message = "If a schema is not given"),
            @ApiResponse(code = 403, response = void.class, message = "If the user is not the owner of all the schema"),
            @ApiResponse(code = 404, response = void.class, message = "If the user do not exist \n" +
                    "If one of the schema referenced do not exist")
    })
    @RequestMapping(value = "/occurrenceTypes", method = RequestMethod.POST, consumes = "application/json")
    public ResponseEntity<?> createOccurrenceTypes(@RequestBody @Valid List<OccurrenceType> occurrenceTypes, Principal principal){
        String principalName = principal.getName();
        logger.info("Received a POST request from User {} for new Occurrence Types.", principalName);
        Set<Long> allSchemaId = new HashSet<>();
        int occurrencesWithoutIds=0;
        for (OccurrenceType ot : occurrenceTypes){
            long schemaId = ot.getSchemaId();
            //Check if owning schema is given
            if (schemaId == 0) {
                logger.error("No owning Schema given for new Occurrence Type {}.", ot.getName());
                return new ResponseEntity<>(Collections.singletonMap("message", "All Occurrence Types need a Schema."), HttpStatus.BAD_REQUEST);
            }

            if(!allSchemaId.add(schemaId)) {

                //Check schema existence
                if (!schemaService.existsSchemaById(schemaId)) {
                    logger.error("Referenced Schema with id {} not found for Occurrence Type {}.", schemaId, ot.getName());
                    return new ResponseEntity<>(Collections.singletonMap("message", "Schema of Occurrence Type " + ot.getName() + " not found."), HttpStatus.NOT_FOUND);
                }

                //Check user privileges: has to be owner of the schema
                if (!schemaService.hasUserRightsOnSchema(principalName, schemaId) && !userService.isUserAdmin(principalName)) {
                    logger.error("User {} does not have the right to create Occurrence Type {} with the Schema {}.", principalName, ot.getName(), schemaId);
                    return new ResponseEntity<>(Collections.singletonMap("message", "User cannot create OccurrenceType "+ ot.getName() +" under this Schema."), HttpStatus.FORBIDDEN);
                }

            }
            ot.setOccurrenceTypeSchema(schemaService.getSchemaById(schemaId));
            if(ot.getId()==0)
                occurrencesWithoutIds++;

        }
        long newOccurrenceIds[] = new long[occurrencesWithoutIds];

        occurrenceTypeService.saveAllOccurrenceType(occurrenceTypes);
        int y=0;
        List <OccurrenceType> allOccurenceType= occurrenceTypeService.getAllOccurrenceType();
        for(int x = allOccurenceType.size() - occurrencesWithoutIds; x < allOccurenceType.size();x++){
            OccurrenceType auxOt = allOccurenceType.get(x);
            newOccurrenceIds[y] = auxOt.getId();
            y++;
        }
        logger.info("Added {} new Occurrence Types.", occurrenceTypes.size());
        return new ResponseEntity<>(newOccurrenceIds , HttpStatus.OK);
    }


    @ApiOperation(value = "Get an Occurrence Type", response = List.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, response = void.class, message = "Successfully retrieved Occurrence Type"),
            @ApiResponse(code = 403, response = void.class, message = "If the user is not the owner of the schema or editor of a Topicmap of this schema"),
            @ApiResponse(code = 404, response = void.class, message = "If the user do not exist \n" +
                    "If the Occurrence Type referenced do not exist")
    })
    @RequestMapping(value = "/occurrenceType", method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<?> getOccurrenceType(@RequestParam ("occurrence_type_id") long occurrenceTypeId, Principal principal){
        String principalName = principal.getName();
        logger.info("Received a GET request from User {} for Occurrence Type with id: {}.", principalName, occurrenceTypeId);

        //Check User existence
        ResponseEntity<?> existsUser = checkUserExistence(principalName);
        if(existsUser != null) return existsUser;

        //Check OccurrenceType existence
        ResponseEntity<?> existsOccurrenceType = checkOccurrenceTypeExistence(occurrenceTypeId);
        if(existsOccurrenceType != null) return existsOccurrenceType;

        //Check User privileges == has to be Owner of the Schema OR admin OR be an Editor on a TopicMap using the Schema
        OccurrenceType occurrenceType = occurrenceTypeService.getOccurrenceTypeById(occurrenceTypeId);
        long schemaId = occurrenceType.getSchemaId();
        ResponseEntity<?> userPrivileges = checkUserPrivileges(principalName, schemaId, occurrenceTypeId);
        if(userPrivileges != null){
            User user = userService.getUserByEmail(principalName);
            Set<Topicmap> userSharedTopicmap = user.getAllUserSharedTopicmap();
            if(userSharedTopicmap.stream().noneMatch(tm -> tm.getSchemaId() == schemaId)){
                return userPrivileges;
            }
            logger.info("User {} have reading right on Occurrence Type with id {}.", principalName, occurrenceTypeId);
        }

        logger.info("Found Occurrence Type with id {}.", occurrenceTypeId);
        return new ResponseEntity<>(occurrenceType, HttpStatus.OK);

    }


    @ApiOperation(value = "Get all the Occurrence Types of the user (where he is owner of the schema or editor on a Topicmap using the schema)", response = List.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, response = void.class, message = "Successfully retrieved Occurrence Type"),
            @ApiResponse(code = 404, response = void.class, message = "If the user do not exist \n" +
                    "If the user have no Occurrence Type")
    })
    @RequestMapping(value = "/occurrenceTypes", method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<?> getAllOccurrenceTypes(Principal principal){
        String principalName = principal.getName();
        logger.info("User {} have request all his Occurrence Types.", principalName);

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

        // Get the OccurrenceTypes
        List<OccurrenceType> occurrenceTypes = occurrenceTypeService.getBySchemaIdIsIn(allUserSchemaId);

        if(occurrenceTypes == null || occurrenceTypes.isEmpty()){
            logger.info("No Occurrence Type found.");
            return new ResponseEntity<>(Collections.singletonMap("message", "No Occurrence Type found."), HttpStatus.NOT_FOUND);
        }

        logger.info("Found {} Occurrence Types.", occurrenceTypes.size());
        return new ResponseEntity<>(occurrenceTypes, HttpStatus.OK);
    }


    @ApiOperation(value = "Update an Occurrence Type", response = List.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, response = void.class, message = "Successfully updated Occurrence Type"),
            @ApiResponse(code = 403, response = void.class, message = "If the user is not the owner of the schema"),
            @ApiResponse(code = 404, response = void.class, message = "If the user do not exist \n" +
                    "If the Occurrence Type referenced do not exist")
    })
    @RequestMapping(value = "/occurrenceType", method = RequestMethod.PUT, consumes = "application/json")
    public ResponseEntity<?> updateOccurrenceType(@RequestBody @Valid OccurrenceType occurrenceTypeToUpdate, Principal principal){
        String principalName = principal.getName();
        long occurrenceTypeId = occurrenceTypeToUpdate.getId();
        logger.info("Received a PUT request from User {} for OccurrenceType with id: {}.", principalName, occurrenceTypeId);

        //Check User existence
        ResponseEntity<?> existsUser = checkUserExistence(principalName);
        if(existsUser != null) return existsUser;

        //Check OccurrenceType existence
        ResponseEntity<?> existsOccurrenceType = checkOccurrenceTypeExistence(occurrenceTypeId);
        if(existsOccurrenceType != null) return existsOccurrenceType;

        //Check if the User has the right to change the OccurrenceType == owner OR admin
        OccurrenceType oldOccurrenceType = occurrenceTypeService.getOccurrenceTypeById(occurrenceTypeId);
        ResponseEntity<?> userPrivileges = checkUserPrivileges(principalName, oldOccurrenceType.getSchemaId(), occurrenceTypeId);
        if(userPrivileges != null) return userPrivileges;

        //Saving Occurrence Type
        occurrenceTypeService.updateOccurrenceType(occurrenceTypeToUpdate, oldOccurrenceType);
        logger.info("Updated Occurrence Type with id {}.", occurrenceTypeId);
        return new ResponseEntity<>(Collections.singletonMap("message", "Occurrence Type updated."), HttpStatus.OK);
    }


    @ApiOperation(value = "Delete an Occurrence Type", response = List.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, response = void.class, message = "Successfully deleted Occurrence Type"),
            @ApiResponse(code = 403, response = void.class, message = "If the user is not the owner of the schema"),
            @ApiResponse(code = 404, response = void.class, message = "If the user do not exist \n" +
                    "If the Occurrence Type referenced do not exist")
    })
    @RequestMapping(value = "/occurrenceType", method = RequestMethod.DELETE, consumes = "application/json")
    public ResponseEntity<?> deleteOccurrenceType(@RequestParam ("occurrence_type_id") long occurrenceTypeId, Principal principal){
        String principalName = principal.getName();
        logger.info("Received a DELETE request from User {} for Occurrence Type with id: {}.", principalName, occurrenceTypeId);

        //Check User existence
        ResponseEntity<?> existsUser = checkUserExistence(principalName);
        if(existsUser != null) return existsUser;

        //Check OccurrenceType existence
        ResponseEntity<?> existsOccurrenceType = checkOccurrenceTypeExistence(occurrenceTypeId);
        if(existsOccurrenceType != null) return existsOccurrenceType;

        //Check if the User has the right to delete the OccurrenceType == owner OR admin
        OccurrenceType oldOccurrenceType = occurrenceTypeService.getOccurrenceTypeById(occurrenceTypeId);
        ResponseEntity<?> userPrivileges = checkUserPrivileges(principalName, oldOccurrenceType.getSchemaId(), occurrenceTypeId);
        if(userPrivileges != null) return userPrivileges;

        //Delete
        occurrenceTypeService.deleteOccurrenceTypeById(occurrenceTypeId);
        logger.info("Occurrence Type with id {} deleted.", occurrenceTypeId);
        return new ResponseEntity<>(Collections.singletonMap("message", "Occurrence Type with id " + occurrenceTypeId + " deleted."), HttpStatus.OK);
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
    private ResponseEntity<?> checkUserPrivileges(String email, long schemaId, long occurrenceTypeId){
        if(!schemaService.hasUserRightsOnSchema(email, schemaId) && !userService.isUserAdmin(email)){
            logger.error("User {} does not have the right on Occurrence Type with id {}.", email, occurrenceTypeId);
            return new ResponseEntity<>(Collections.singletonMap("message", "User cannot edit this Occurrence Type."), HttpStatus.FORBIDDEN);
        }
        return null;
    }

    @Nullable
    private ResponseEntity<?> checkOccurrenceTypeExistence(long occurrenceTypeId){
        if(!occurrenceTypeService.existsOccurrenceTypeById(occurrenceTypeId)) {
            logger.error("Occurrence Type with id {} not found.", occurrenceTypeId);
            return new ResponseEntity<>(Collections.singletonMap("message", "No Occurrence Type found for this id: " + occurrenceTypeId), HttpStatus.NOT_FOUND);
        }
        return null;
    }
}
