package com.unige.encode.encoderestapi.service;

import com.unige.encode.encoderestapi.model.AssociationType;

import java.util.List;
import java.util.Set;

public interface AssociationTypeService {

    void saveAssociationType(AssociationType associationType);
    void saveAllAssociationType(List<AssociationType> associationTypes);
    AssociationType getAssociationTypeById(long id);
    List<AssociationType> getBySchemaIdIsIn(Set<Long> schemaIds);
    List<AssociationType> getAllAssociationsTypes();
    void updateAssociationType(AssociationType newAssociationType, AssociationType oldAssociationType);
    void deleteAssociationType(long id);
    boolean existsAssociationTypeById(long id);

}
