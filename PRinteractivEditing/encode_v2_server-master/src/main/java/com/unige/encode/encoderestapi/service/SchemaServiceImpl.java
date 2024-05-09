package com.unige.encode.encoderestapi.service;

import com.unige.encode.encoderestapi.model.Schema;
import com.unige.encode.encoderestapi.repository.SchemaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SchemaServiceImpl implements SchemaService{

    @Autowired private SchemaRepository schemaRepository;

    @Override
    public void saveSchema(Schema schema) {
        schemaRepository.save(schema);
    }

    @Override
    public Schema getSchemaById(long id) { return schemaRepository.getById(id); }

    @Override
    public List<Schema> getAllSchemasBySchemaOwner_Email(String email) {
        return schemaRepository.getAllBySchemaOwner_Email(email);
    }

    @Override
    public Schema getSchemaByNameAndSchemaOwner_Email(String title, String email) {
        return schemaRepository.getByNameAndSchemaOwner_Email(title, email);
    }

    @Override
    public void updateSchema(Schema schemaToUpdate, Schema schemaUpdated) {
        schemaToUpdate.setName(schemaUpdated.getName());
        schemaToUpdate.setDescription(schemaUpdated.getDescription());
        schemaRepository.save(schemaToUpdate);
    }

    @Override
    public void deleteSchemaById(long id) {
        schemaRepository.deleteById(id);
    }

    @Override
    public boolean existsSchemaById(long id) {
        return schemaRepository.existsById(id);
    }

    @Override
    public boolean hasUserRightsOnSchema(String email, long schemaId){
        return email.equals(getSchemaById(schemaId).getOwner());
    }

}
