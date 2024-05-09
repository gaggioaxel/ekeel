package com.unige.encode.encoderestapi.service;

import com.unige.encode.encoderestapi.model.OccurrenceType;

import java.util.List;
import java.util.Set;

public interface OccurrenceTypeService {

    void saveOccurrenceType(OccurrenceType occurrenceType);
    void saveAllOccurrenceType(List<OccurrenceType> occurrenceTypes);
    OccurrenceType getOccurrenceTypeById(long id);
    List<OccurrenceType> getBySchemaIdIsIn(Set<Long> schemaIds);
    List<OccurrenceType> getAllOccurrenceType();
    void updateOccurrenceType(OccurrenceType newOccurrenceType, OccurrenceType oldOccurrenceType);
    void deleteOccurrenceTypeById(long id);
    boolean existsOccurrenceTypeById(long id);

}
