package com.unige.encode.encoderestapi.service;

import com.unige.encode.encoderestapi.model.OccurrenceType;
import com.unige.encode.encoderestapi.repository.OccurrenceTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
public class OccurrenceTypeServiceImpl implements OccurrenceTypeService{

    @Autowired private OccurrenceTypeRepository occurrenceTypeRepository;

    @Override
    public void saveOccurrenceType(OccurrenceType occurrenceType) {
        occurrenceTypeRepository.save(occurrenceType);
    }

    @Override
    public void saveAllOccurrenceType(List<OccurrenceType> occurrenceTypes) {
        occurrenceTypeRepository.saveAll(occurrenceTypes);
    }

    @Override
    public OccurrenceType getOccurrenceTypeById(long id) {
        return occurrenceTypeRepository.getById(id);
    }

    @Override
    public List<OccurrenceType> getBySchemaIdIsIn(Set<Long> schemaIds){
        return occurrenceTypeRepository.getBySchemaIdIsIn(schemaIds);
    }

    @Override
    public List<OccurrenceType> getAllOccurrenceType() {
        return occurrenceTypeRepository.findAll();
    }

    @Override
    public void updateOccurrenceType(OccurrenceType newOccurrenceType, OccurrenceType oldOccurrenceType) {
        oldOccurrenceType.setName(newOccurrenceType.getName());
        oldOccurrenceType.setDescription(newOccurrenceType.getDescription());
        saveOccurrenceType(oldOccurrenceType);
    }

    @Override
    public void deleteOccurrenceTypeById(long id) {
        occurrenceTypeRepository.deleteById(id);
    }

    @Override
    public boolean existsOccurrenceTypeById(long id) {
        return occurrenceTypeRepository.existsById(id);
    }

}
