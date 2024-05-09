package com.unige.encode.encoderestapi.controller;

import com.unige.encode.encoderestapi.model.*;
import com.unige.encode.encoderestapi.repository.OccurrenceFileRepository;
import com.unige.encode.encoderestapi.service.*;
import org.jetbrains.annotations.Nullable;
import com.unige.encode.encoderestapi.service.OccurrenceService;
import com.unige.encode.encoderestapi.service.OccurrenceTypeService;
import com.unige.encode.encoderestapi.service.TopicService;
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
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import org.springframework.web.multipart.MultipartFile;

import javax.transaction.Transactional;
import javax.validation.Valid;
import java.nio.file.Files;
import java.security.Principal;
import java.util.*;

@RestController
@RequestMapping(value = "/protected/v1")
@Api(value = "Occurrence Management System")
public class OccurrenceController {

    private final Logger logger = LoggerFactory.getLogger(this.getClass());
    private static final String path = "C:\\Users\\colos\\Documents"+File.separator+"encode"+File.separator;

    @Autowired UserService userService;
    @Autowired TopicmapService topicmapService;
    @Autowired TopicService topicService;
    @Autowired OccurrenceService occurrenceService;
    @Autowired OccurrenceTypeService occurrenceTypeService;
    @Autowired OccurrenceFileService occurrenceFileService;
    @Autowired OccurrenceFileRepository occurrenceFileRepository;
    @Autowired EffortTypeService effortTypeService;
    @Autowired ScopeService scopeService;


    @ApiOperation(value = "Create an Occurrence", response = List.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, response = void.class, message = "Successfully added new Occurrence"),
            @ApiResponse(code = 400, response = void.class, message = "If Topic and Occurrence Type are not given or do not belong to the same schema \n" +
                    "If one of the given Effort Types do not belong to the same schema, is referenced more than once or not at all \n"+
                    "If one of the given Scopes do not belong to the same schema, is referenced more than once or not at all"),
            @ApiResponse(code = 403, response = void.class, message = "If the user do not have the right to modify the Topicmap"),
            @ApiResponse(code = 404, response = void.class, message = "If the user do not exist \n" +
                    "If the Topic, the Occurrence Type or one of the Scopes or Effort Types referenced do not exist"),
            @ApiResponse(code = 500, response = void.class, message = "If the server could not create a file")
    })
    @RequestMapping(value = "/occurrence", method = RequestMethod.POST)
    @Transactional
    public ResponseEntity<?> createOccurrence(@RequestPart("occurrence") @Valid Occurrence newOccurrence, @RequestPart("files") MultipartFile[] files , Principal principal){
        String principalName = principal.getName();
        logger.info("Received a POST request from User {} for a new Occurrence.", principalName);

        //Check User existence
        ResponseEntity<?> existsUser = checkUserExistence(principalName);
        if(existsUser != null) return existsUser;

        //Check owning Topic is given
        long topicId = newOccurrence.getTopicId();
        if(topicId == 0){
            logger.error("Occurrence needs a Topic.");
            return new ResponseEntity<>(Collections.singletonMap("message", "An Occurrence needs a Topic."), HttpStatus.BAD_REQUEST);
        }

        //Check OccurrenceType is given
        long occurrenceTypeId = newOccurrence.getOccurrenceTypeId();
        if(occurrenceTypeId == 0){
            logger.error("Occurrence needs an OccurrenceType.");
            return new ResponseEntity<>(Collections.singletonMap("message", "An Occurrence needs an OccurrenceType."), HttpStatus.BAD_REQUEST);
        }

        //Check Topic existence
        ResponseEntity<?> existsTopic = checkTopicExistence(topicId);
        if(existsTopic != null) return existsTopic;

        //Check OccurrenceType existence
        if(!occurrenceTypeService.existsOccurrenceTypeById(occurrenceTypeId)) {
            logger.error("Referenced OccurrenceType with id {} not found.", occurrenceTypeId);
            return new ResponseEntity<>(Collections.singletonMap("message", "OccurrenceType of Occurrence not found."), HttpStatus.NOT_FOUND);
        }

        //Check OccurrenceType and Topic belongs to same schema
        OccurrenceType occurrenceType = occurrenceTypeService.getOccurrenceTypeById(occurrenceTypeId);
        Topic topic = topicService.getTopicById(topicId);
        Topicmap topicmap = topicmapService.getTopicmapById(topic.getTopicmapId());
        if(occurrenceType.getSchemaId() != topicmap.getSchemaId()){
            logger.error("OccurrenceType and the Topic do not belong to the same Schema.");
            return new ResponseEntity<>(Collections.singletonMap("message", "The referenced Topic and OccurrenceType do not belong to the same Schema."), HttpStatus.BAD_REQUEST);
        }

        //Check if the User has the right to create the Occurrence == owner/editor of the Topicmap OR admin
        ResponseEntity<?> userPrivileges = checkUserPrivileges(userService.getUserByEmail(principalName), topicmap.getId());
        if(userPrivileges != null) return userPrivileges;

        //Check if Scopes are valid
        List<OccurrenceScope> occurrenceScopes = newOccurrence.getOccurrenceOccurrenceScope();
        if(occurrenceScopes != null && !occurrenceScopes.isEmpty()){
            Set<Long> scopesToBind = new HashSet<>();
            for(OccurrenceScope os: occurrenceScopes){
                long osScopeId = os.getId().getScopeId();

                //Check Scope is given
                if(osScopeId == 0){
                    logger.error("OccurrenceScope needs a Scope.");
                    return new ResponseEntity<>(Collections.singletonMap("message", "An OccurrenceScope needs a Scope."), HttpStatus.BAD_REQUEST);
                }

                //Check Scope is unique
                if(!scopesToBind.add(osScopeId)){
                    logger.error("An Occurrence cannot have several times the same Scope.");
                    return new ResponseEntity<>(Collections.singletonMap("message", "Occurrence cannot have several times the same Scope."), HttpStatus.BAD_REQUEST);
                }

                //Check Scope existence
                if(!scopeService.existsScopeById(osScopeId)) {
                    logger.error("Referenced Scope with id {} not found.", osScopeId);
                    return new ResponseEntity<>(Collections.singletonMap("message", "Scope for OccurrenceScope not found."), HttpStatus.NOT_FOUND);
                }

                //Check Scope and Occurrence belongs to same schema
                Scope scope = scopeService.getScopeById(osScopeId);
                if(topicmap.getSchemaId() != scope.getSchemaId()){
                    logger.error("The Scope and the TopicMap of Occurrence do not belong to the same Schema.");
                    return new ResponseEntity<>(Collections.singletonMap("message", "The referenced Scope and Occurrence do not belong to the same schema."), HttpStatus.BAD_REQUEST);
                }
            }
        }

        //Check if EffortTypes are valid
        List<EffortTypeOccurrence> effortTypeOccurrences = newOccurrence.getOccurrenceEffortType();
        if(effortTypeOccurrences != null && !effortTypeOccurrences.isEmpty()){
            Set<Long> effortTypesToBind = new HashSet<>();
            for(EffortTypeOccurrence eto: effortTypeOccurrences){
                long etoEffortTypeId = eto.getId().getEffortId();

                //Check EffortType is given
                if(etoEffortTypeId == 0){
                    logger.error("EffortTypeOccurrence needs an EffortType.");
                    return new ResponseEntity<>(Collections.singletonMap("message", "An EffortTypeOccurrence needs an EffortType."), HttpStatus.BAD_REQUEST);
                }

                //Check EffortType is unique
                if(!effortTypesToBind.add(etoEffortTypeId)){
                    logger.error("An Occurrence cannot have several times the same EffortType.");
                    return new ResponseEntity<>(Collections.singletonMap("message", "Occurrence cannot have several times the same EffortType."), HttpStatus.BAD_REQUEST);
                }

                //Check EffortType existence
                if(!effortTypeService.existsEffortTypeById(etoEffortTypeId)) {
                    logger.error("Referenced EffortType with id {} not found.", etoEffortTypeId);
                    return new ResponseEntity<>(Collections.singletonMap("message", "EffortType for EffortTypeOccurrence not found."), HttpStatus.NOT_FOUND);
                }

                //Check EffortType and Occurrence belongs to same schema
                EffortType effortType = effortTypeService.getEffortTypeById(etoEffortTypeId);
                if(topicmap.getSchemaId() != effortType.getSchemaId()){
                    logger.error("The EffortType and the TopicMap of Occurrence do not belong to the same Schema.");
                    return new ResponseEntity<>(Collections.singletonMap("message", "The referenced EffortType and Occurrence do not belong to the same schema."), HttpStatus.BAD_REQUEST);
                }
            }
        }

        //Occurrence Saving
        newOccurrence.setOccurrenceTopic(topic);
        newOccurrence.setOccurrenceOccurrenceType(occurrenceType);
        occurrenceService.saveOccurrence(newOccurrence);
        long newOccurrenceId = newOccurrence.getId();
        long topicmapId = topicmap.getId();

        //File saving
        for(MultipartFile file : files){
            String filePath = generateFile(file, topicmapId, topicId, newOccurrenceId);
            if(filePath == null){
                logger.error("Could not create Occurrence File.");
                File dir = new File(path + topicmapId + File.separator + topicId + File.separator + newOccurrenceId);
                File trash = new File(path+ "trash"+ File.separator+ topicmapId + File.separator + topicId + File.separator + newOccurrenceId);
                dir.renameTo(trash);
                return new ResponseEntity<>(Collections.singletonMap("message", "Could not create file."), HttpStatus.INTERNAL_SERVER_ERROR);
            }
            String fileName = filePath.substring(filePath.lastIndexOf(File.separator)+1);
            OccurrenceFile occurrenceFile = new OccurrenceFile(fileName, filePath, newOccurrenceId, newOccurrence);
            occurrenceFileService.saveOccurrenceFile(occurrenceFile);
        }

        logger.info("New Occurrence added with id {}.", newOccurrenceId);
        return new ResponseEntity<>(newOccurrenceId, HttpStatus.OK);
    }

    //NOT USED ON CLIENT SIDE SO STAYED UNTOUCHED
    /*
    @RequestMapping(value ="/occurrences", method = RequestMethod.POST, consumes = "application/json")
    public ResponseEntity<?> createOccurrences(@RequestBody @Valid List<Occurrence> newOccurrences, Principal principal){
        String principalName = principal.getName();
        for(Occurrence o: newOccurrences){
            o.setOccurrenceOccurrenceType(occurrenceTypeService.getOccurrenceTypeById(o.getOccurrenceTypeId()));
            o.setOccurrenceTopic(topicService.getTopicById(o.getTopicId()));
        }
        logger.info("Received a POST request from user {} for a new Occurrence object.", principalName);
        occurrenceService.saveAllOccurrences(newOccurrences);
        return new ResponseEntity<>(Collections.singletonMap("message", "Occurrence created."), HttpStatus.OK);
    }
    */


    @ApiOperation(value = "Get all the Occurrence of the Topic", response = List.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, response = void.class, message = "Successfully retrieved Occurrence"),
            @ApiResponse(code = 403, response = void.class, message = "If the user do not have the right to modify the Topicmap"),
            @ApiResponse(code = 404, response = void.class, message = "If the user or the Topic do not exist \n" +
                    "If the Topic have no Occurrence")
    })
    @RequestMapping(value = "/occurrences", method = RequestMethod.GET)
    public ResponseEntity<?> getAllOccurrencesOfTopic(@RequestParam("topic_id") long topicId, Principal principal){
        String principalName = principal.getName();
        logger.info("Received a GET request from User {} for all Occurrences of Topic {}.", principalName, topicId);

        //Check User existence
        ResponseEntity<?> existsUser = checkUserExistence(principalName);
        if(existsUser != null) return existsUser;

        //Check Topic existence
        ResponseEntity<?> existsTopic = checkTopicExistence(topicId);
        if(existsTopic != null) return existsTopic;

        //Check if the User has the right to get the Occurrence == owner/editor of the Topicmap OR admin
        ResponseEntity<?> userPrivileges = checkUserPrivileges(userService.getUserByEmail(principalName), topicService.getTopicById(topicId).getTopicmapId());
        if(userPrivileges != null) return userPrivileges;

        List<Occurrence> occurrences = occurrenceService.getAllOccurrencesByTopicId(topicId);
        if(occurrences == null || occurrences.isEmpty()){
            logger.info("No Occurrences found for Topic with id: {}.", topicId);
            return new ResponseEntity<>(Collections.singletonMap("message", "No Occurrences found."), HttpStatus.NOT_FOUND);
        }

        logger.info("Found {} Occurrences for topic: {}", occurrences.size(), topicId);
        return new ResponseEntity<>(occurrences, HttpStatus.OK);
    }


    @ApiOperation(value = "Get the file of Occurrence", response = List.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, response = void.class, message = "Successfully retrieved file"),
            @ApiResponse(code = 400, response = void.class, message = "If the file do not belong to Occurrence"),
            @ApiResponse(code = 403, response = void.class, message = "If the user do not have the right to access the Topicmap"),
            @ApiResponse(code = 404, response = void.class, message = "If the user, the Occurrence or the file do not exist"),
            @ApiResponse(code = 500, response = void.class, message = "If the server could not open the file")
    })
    @RequestMapping(value = "/occurrence/{id}/file", method = RequestMethod.GET, consumes = "application/json")
    public ResponseEntity<?> getFileOfOccurrence(@RequestParam("file_id") long fileId, @PathVariable long id, Principal principal){
        String principalName = principal.getName();
        logger.info("Received a PATCH request from User {} for file with id {} of Occurrence with id {}.", principalName, fileId, id);

        //Check User existence
        ResponseEntity<?> existsUser = checkUserExistence(principalName);
        if(existsUser != null) return existsUser;

        //Check Occurrence existence
        ResponseEntity<?> existsOccurrence = checkOccurrenceExistence(id);
        if(existsOccurrence != null) return existsOccurrence;

        //Check File existence
        if(!occurrenceFileService.existsOccurrenceFileById(fileId)) {
            logger.error("File with id {} not found.", fileId);
            return new ResponseEntity<>(Collections.singletonMap("message", "No File found for this id: " + fileId), HttpStatus.NOT_FOUND);
        }

        //Check if the User has the right to get the Occurrence == owner/editor of the Topicmap OR admin
        Occurrence occurrence = occurrenceService.getOccurrenceById(id);
        ResponseEntity<?> userPrivileges = checkUserPrivileges(userService.getUserByEmail(principalName), occurrence.getOccurrenceTopic().getTopicmapId());
        if(userPrivileges != null) return userPrivileges;

        //Check if File belong to Occurrence
        OccurrenceFile occurrenceFile = occurrenceFileService.getOccurrenceFileById(fileId);
        if(occurrenceFile.getOccurrenceId() != id){
            logger.error("The File and do not belong to the Occurrence.");
            return new ResponseEntity<>(Collections.singletonMap("message", "The File do not belong to the Occurrence."), HttpStatus.BAD_REQUEST);
        }

        //Retrieve the file
        File file = new File(occurrenceFile.getPath());
        byte[] data;
        try{
            data = Files.readAllBytes(file.toPath());
        } catch (Exception e){
            logger.error("Could not open file.");
            return new ResponseEntity<>(Collections.singletonMap("message", "Could not create file."), HttpStatus.INTERNAL_SERVER_ERROR);
        }

        logger.info("Found Occurrence file");
        return new ResponseEntity<>(data, HttpStatus.OK);
    }


    @ApiOperation(value = "Update an Occurrence", response = List.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, response = void.class, message = "Successfully updated Occurrence"),
            @ApiResponse(code = 400, response = void.class, message = "If the wrong Occurrence is given in a Scope or an Effort \n" +
                    "If one of the given Effort Types do not belong to the same schema, is referenced more than once or not at all \n"+
                    "If one of the given Scopes do not belong to the same schema, is referenced more than once or not at all"),
            @ApiResponse(code = 403, response = void.class, message = "If the user do not have the right to modify the Topicmap"),
            @ApiResponse(code = 404, response = void.class, message = "If the user do not exist \n" +
                    "If the Occurrence Type or one of the Scopes or Effort Types referenced do not exist")
    })
    @RequestMapping(value = "/occurrence", method = RequestMethod.PUT, consumes = "application/json")
    public ResponseEntity<?> updateOccurrence(@RequestBody @Valid Occurrence occurrenceToUpdate, Principal principal){
        String principalName = principal.getName();
        long occurrenceId = occurrenceToUpdate.getId();
        logger.info("Received a PUT request from User {} for Occurrence with id: {}.", principalName, occurrenceId);

        //Check User existence
        ResponseEntity<?> existsUser = checkUserExistence(principalName);
        if(existsUser != null) return existsUser;

        //Check Occurrence existence
        ResponseEntity<?> existsOccurrence = checkOccurrenceExistence(occurrenceId);
        if(existsOccurrence != null) return existsOccurrence;

        //Check if the User has the right to update the Occurrence == owner/editor of the Topicmap OR admin
        Topic topic = topicService.getTopicById(occurrenceService.getOccurrenceById(occurrenceId).getTopicId());
        ResponseEntity<?> userPrivileges = checkUserPrivileges(userService.getUserByEmail(principalName), topic.getTopicmapId());
        if(userPrivileges != null) return userPrivileges;

        //Check if Scopes are valid
        List<OccurrenceScope> occurrenceScopesToUpdate = occurrenceToUpdate.getOccurrenceOccurrenceScope();
        if(occurrenceScopesToUpdate != null && !occurrenceScopesToUpdate.isEmpty()){
            Set<Long> scopesToBind = new HashSet<>();
            Topicmap topicmap = topicmapService.getTopicmapById(topic.getTopicmapId());
            for(OccurrenceScope os: occurrenceScopesToUpdate){
                long osOccurrenceId = os.getId().getOccurrenceId();
                long osScopeId = os.getId().getScopeId();

                //Check Occurrence given == occurrenceId to update
                if(osOccurrenceId != occurrenceId){
                    logger.error("Occurrence in OccurrenceScope needs to be the same as Occurrence.");
                    return new ResponseEntity<>(Collections.singletonMap("message", "Referenced Occurrence in OccurrenceScope needs to be the same as Occurrence."), HttpStatus.BAD_REQUEST);
                }

                //Check Scope is given
                if(osScopeId == 0){
                    logger.error("OccurrenceScope needs a Scope.");
                    return new ResponseEntity<>(Collections.singletonMap("message", "A OccurrenceScope needs a Scope."), HttpStatus.BAD_REQUEST);
                }

                //Check Scope is unique
                if(!scopesToBind.add(osScopeId)){
                    logger.error("An Occurrence cannot have several times the same Scope.");
                    return new ResponseEntity<>(Collections.singletonMap("message", "Occurrence cannot have several times the same Scope."), HttpStatus.BAD_REQUEST);
                }

                //Check Scope existence
                if(!scopeService.existsScopeById(osScopeId)) {
                    logger.error("Referenced Scope with id {} not found.", osScopeId);
                    return new ResponseEntity<>(Collections.singletonMap("message", "Scope for OccurrenceScope not found."), HttpStatus.NOT_FOUND);
                }

                //Check Scope and Topic belongs to same schema
                Scope scope = scopeService.getScopeById(osScopeId);
                if(topicmap.getSchemaId() != scope.getSchemaId()){
                    logger.error("The Scope and the TopicMap of Occurrence do not belong to the same Schema.");
                    return new ResponseEntity<>(Collections.singletonMap("message", "The referenced Scope and Occurrence do not belong to the same schema."), HttpStatus.BAD_REQUEST);
                }
            }
        }

        //Check if EffortTypes are valid
        List<EffortTypeOccurrence> effortTypeOccurrencesToUpdate = occurrenceToUpdate.getOccurrenceEffortType();
        if(effortTypeOccurrencesToUpdate != null && !effortTypeOccurrencesToUpdate.isEmpty()){
            Set<Long> effortTypesToBind = new HashSet<>();
            Topicmap topicmap = topicmapService.getTopicmapById(topic.getTopicmapId());
            for(EffortTypeOccurrence eto: effortTypeOccurrencesToUpdate){
                long etoOccurrenceId = eto.getId().getOccurrenceId();
                long etoEffortTypeId = eto.getId().getEffortId();

                //Check Occurrence given == occurrenceId to update
                if(etoOccurrenceId != occurrenceId){
                    logger.error("Occurrence in EffortTypeOccurrence needs to be the same as Occurrence.");
                    return new ResponseEntity<>(Collections.singletonMap("message", "Referenced Occurrence in EffortTypeOccurrence needs to be the same as Occurrence."), HttpStatus.BAD_REQUEST);
                }

                //Check EffortType is given
                if(etoEffortTypeId == 0){
                    logger.error("EffortTypeOccurrence needs an EffortType.");
                    return new ResponseEntity<>(Collections.singletonMap("message", "An EffortTypeOccurrence needs an EffortType."), HttpStatus.BAD_REQUEST);
                }

                //Check EffortType is unique
                if(!effortTypesToBind.add(etoEffortTypeId)){
                    logger.error("An Occurrence cannot have several times the same EffortType.");
                    return new ResponseEntity<>(Collections.singletonMap("message", "Occurrence cannot have several times the same EffortType."), HttpStatus.BAD_REQUEST);
                }

                //Check EffortType existence
                if(!effortTypeService.existsEffortTypeById(etoEffortTypeId)) {
                    logger.error("Referenced EffortType with id {} not found.", etoEffortTypeId);
                    return new ResponseEntity<>(Collections.singletonMap("message", "EffortType for EffortTypeOccurrence not found."), HttpStatus.NOT_FOUND);
                }

                //Check EffortType and Occurrence belongs to same schema
                EffortType effortType = effortTypeService.getEffortTypeById(etoEffortTypeId);
                if(topicmap.getSchemaId() != effortType.getSchemaId()){
                    logger.error("The EffortType and the TopicMap of Occurrence do not belong to the same Schema.");
                    return new ResponseEntity<>(Collections.singletonMap("message", "The referenced EffortType and Occurrence do not belong to the same schema."), HttpStatus.BAD_REQUEST);
                }
            }
        }

        //Update Occurrence
        Occurrence oldOccurrence = occurrenceService.getOccurrenceById(occurrenceId);
        occurrenceService.updateOccurrence(occurrenceToUpdate, oldOccurrence);
        return new ResponseEntity<>(Collections.singletonMap("message", "Occurrence updated."), HttpStatus.OK);

    }


    @ApiOperation(value = "Add a file to an Occurrence", response = List.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, response = void.class, message = "Successfully added new file"),
            @ApiResponse(code = 403, response = void.class, message = "If the user do not have the right to modify the Topicmap"),
            @ApiResponse(code = 404, response = void.class, message = "If the user or the Occurrence do not exist"),
            @ApiResponse(code = 500, response = void.class, message = "If the server could not create a file")
    })
    @RequestMapping(value = "/occurrence/{id}/file", method = RequestMethod.PATCH)
    @Transactional
    public ResponseEntity<?> addOccurrenceFile(@RequestPart("files") MultipartFile[] files, @PathVariable long id, Principal principal){
        String principalName = principal.getName();
        logger.info("Received a PATCH request from User {} for adding new file to Occurrence with id: {}.", principalName, id);

        //Check User existence
        ResponseEntity<?> existsUser = checkUserExistence(principalName);
        if(existsUser != null) return existsUser;

        //Check Occurrence existence
        ResponseEntity<?> existsOccurrence = checkOccurrenceExistence(id);
        if(existsOccurrence != null) return existsOccurrence;

        //Check if the User has the right to modify the Occurrence == owner/editor of the Topicmap OR admin
        Occurrence occurrence = occurrenceService.getOccurrenceById(id);
        Topic topic = topicService.getTopicById(occurrence.getTopicId());
        ResponseEntity<?> userPrivileges = checkUserPrivileges(userService.getUserByEmail(principalName), topic.getTopicmapId());
        if(userPrivileges != null) return userPrivileges;

        //File saving
        long topicId = topic.getId();
        long topicmapId = topic.getTopicmapId();
        for(MultipartFile file : files){
            String filePath = generateFile(file, topicmapId, topicId, id);
            if(filePath == null){
                logger.error("Could not create Occurrence File.");
                File dir = new File(path + topicmapId + File.separator + topicId + File.separator + id);
                File trash = new File(path+ "trash"+ File.separator+ topicmapId + File.separator + topicId + File.separator + id);
                dir.renameTo(trash);
                return new ResponseEntity<>(Collections.singletonMap("message", "Could not create file."), HttpStatus.INTERNAL_SERVER_ERROR);
            }
            String fileName = filePath.substring(filePath.lastIndexOf(File.separator)+1);
            OccurrenceFile occurrenceFile = new OccurrenceFile(fileName, filePath, id, occurrence);
            occurrenceFileService.saveOccurrenceFile(occurrenceFile);
        }

        logger.info("Added file to Occurrence with id {}.", id);
        return new ResponseEntity<>(Collections.singletonMap("message","Added file to Occurrence."), HttpStatus.OK);

    }


    @ApiOperation(value = "Delete a file from an Occurrence", response = List.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, response = void.class, message = "Successfully deleted file"),
            @ApiResponse(code = 400, response = void.class, message = "If file do not belong to the Occurrence"),
            @ApiResponse(code = 403, response = void.class, message = "If the user do not have the right to modify the Topicmap"),
            @ApiResponse(code = 404, response = void.class, message = "If the user, the Occurrence or the file do not exist")
    })
    @RequestMapping(value = "/occurrence/{occurrenceId}/file/{fileId}", method = RequestMethod.PATCH, consumes = "application/json")
    public ResponseEntity<?> deleteFileOfOccurrence(@PathVariable long occurrenceId, @PathVariable long fileId, Principal principal){
        String principalName = principal.getName();
        logger.info("Received a PATCH request from User {} for deleting file with id {} of Occurrence with id {}.", principalName, fileId, occurrenceId);

        //Check User existence
        ResponseEntity<?> existsUser = checkUserExistence(principalName);
        if(existsUser != null) return existsUser;

        //Check Occurrence existence
        ResponseEntity<?> existsOccurrence = checkOccurrenceExistence(occurrenceId);
        if(existsOccurrence != null) return existsOccurrence;

        //Check File existence
        if(!occurrenceFileService.existsOccurrenceFileById(fileId)) {
            logger.error("File with id {} not found.", fileId);
            return new ResponseEntity<>(Collections.singletonMap("message", "No File found for this id: " + fileId), HttpStatus.NOT_FOUND);
        }

        //Check if the User has the right to get the Occurrence == owner/editor of the Topicmap OR admin
        Occurrence occurrence = occurrenceService.getOccurrenceById(occurrenceId);
        ResponseEntity<?> userPrivileges = checkUserPrivileges(userService.getUserByEmail(principalName), occurrence.getOccurrenceTopic().getTopicmapId());
        if(userPrivileges != null) return userPrivileges;

        //Check if File belong to Occurrence
        OccurrenceFile occurrenceFile = occurrenceFileService.getOccurrenceFileById(fileId);
        if(occurrenceFile.getOccurrenceId() != occurrenceId){
            logger.error("The File and do not belong to the Occurrence.");
            return new ResponseEntity<>(Collections.singletonMap("message", "The File do not belong to the Occurrence."), HttpStatus.BAD_REQUEST);
        }

        //Delete the file
        Topic topic = occurrence.getOccurrenceTopic();
        File file = new File(occurrenceFile.getPath());
        if(!file.delete()){
            logger.error("Could not delete Occurrence File.");
            File dir = new File(path + topic.getTopicmapId() + File.separator + topic.getId() + File.separator + occurrenceId);
            File trash = new File(path + "trash"+ topic.getTopicmapId() + File.separator + topic.getId() + File.separator + occurrenceId);
            dir.renameTo(trash);
        }
        occurrenceFileService.deleteOccurrenceFileById(fileId);
        logger.info("OccurrenceFile with id {} deleted.", fileId);
        return new ResponseEntity<>(Collections.singletonMap("message", "OccurrenceFile with id " + fileId + " deleted."), HttpStatus.OK);
    }


    @ApiOperation(value = "Delete an Occurrence", response = List.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, response = void.class, message = "Successfully deleted Occurrence"),
            @ApiResponse(code = 403, response = void.class, message = "If the user do not have the right to modify the Topicmap"),
            @ApiResponse(code = 404, response = void.class, message = "If the user or the Occurrence do not exist")
    })
    @RequestMapping(value = "/occurrence", method = RequestMethod.DELETE, consumes = "application/json")
    public ResponseEntity<?> deleteOccurrence(@RequestParam("occurrence_id") long occurrenceId, Principal principal){
        String principalName = principal.getName();
        logger.info("Received a DELETE request from User {} for Occurrence with id: {}.", principalName, occurrenceId);

        //Check User existence
        ResponseEntity<?> existsUser = checkUserExistence(principalName);
        if(existsUser != null) return existsUser;

        //Check Occurrence existence
        ResponseEntity<?> existsOccurrence = checkOccurrenceExistence(occurrenceId);
        if(existsOccurrence != null) return existsOccurrence;

        //Check if the User has the right to delete the Occurrence == owner/editor of the Topicmap OR admin
        Topic topic = topicService.getTopicById(occurrenceService.getOccurrenceById(occurrenceId).getTopicId());
        ResponseEntity<?> userPrivileges = checkUserPrivileges(userService.getUserByEmail(principalName), topic.getTopicmapId());
        if(userPrivileges != null) return userPrivileges;

        //Delete
        List<OccurrenceFile> occurrenceFiles = occurrenceFileService.getAllOccurrenceFilesByOccurrenceId(occurrenceId);
        for(OccurrenceFile of : occurrenceFiles){
            File file = new File(of.getPath());
            if(!file.delete()){
                logger.error("Could not delete Occurrence File.");
                File dir = new File(path + topic.getTopicmapId() + File.separator + topic.getId() + File.separator + occurrenceId);
                File trash = new File(path + "trash"+ topic.getTopicmapId() + File.separator + topic.getId() + File.separator + occurrenceId);
                dir.renameTo(trash);
                break;
            }
        }
        File dir = new File(path + topic.getTopicmapId() + File.separator + topic.getId() + File.separator + occurrenceId);
        dir.delete();
        occurrenceService.deleteOccurrenceById(occurrenceId);
        logger.info("Occurrence with id {} deleted.", occurrenceId);
        return new ResponseEntity<>(Collections.singletonMap("message", "Occurrence with id " + occurrenceId + " deleted."), HttpStatus.OK);
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
    private ResponseEntity<?> checkOccurrenceExistence(long occurrenceId){
        if(!occurrenceService.existsOccurrenceById(occurrenceId)) {
            logger.error("Occurrence with id {} not found.", occurrenceId);
            return new ResponseEntity<>(Collections.singletonMap("message", "No Occurrence found for this id: " + occurrenceId), HttpStatus.NOT_FOUND);
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

    @Nullable
    private String generateFile(MultipartFile file, long topicmapId, long topicId, long occurrenceId){
        String fileName = file.getOriginalFilename();
        String extension = fileName.substring(fileName.lastIndexOf('.')+1);
        fileName = fileName.substring(0,fileName.lastIndexOf('.'));
        String dir = path + topicmapId + File.separator + topicId + File.separator + occurrenceId + File.separator;
        String url = dir + fileName + '.' + extension;

        try {

            File dirToSave = new File(dir);
            dirToSave.mkdirs();
            File fileToSave = new File(url);
            if(fileToSave.exists()){
                fileName = fileName.concat("_1");
                url = dir+fileName+'.'+extension;
                fileToSave = new File(url);
                while(fileToSave.exists()){
                    fileName = fileName.concat("1");
                    url = dir+fileName+'.'+extension;
                    fileToSave = new File(url);
                }
            } else if(!fileToSave.createNewFile()) return null;
            FileOutputStream fos = new FileOutputStream(fileToSave);
            fos.write(file.getBytes());
            fos.close();
            return url;

        } catch (IOException e) {
            e.printStackTrace();
        }
        return null;
    }
}
