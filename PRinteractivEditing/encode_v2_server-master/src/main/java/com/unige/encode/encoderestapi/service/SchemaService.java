package com.unige.encode.encoderestapi.service;

import com.unige.encode.encoderestapi.model.Schema;

import java.sql.Timestamp;
import java.util.List;

public interface SchemaService {

    void saveSchema(Schema schema);
    Schema getSchemaById(long id);
    Schema getSchemaByNameAndSchemaOwner_Email(String title, String email);
    List<Schema> getAllSchemasBySchemaOwner_Email(String email);
    void updateSchema(Schema schemaToUpdate, Schema schemaUpdated);
    void deleteSchemaById(long id);
    boolean existsSchemaById(long id);
    boolean hasUserRightsOnSchema(String email, long schemaId);

}

