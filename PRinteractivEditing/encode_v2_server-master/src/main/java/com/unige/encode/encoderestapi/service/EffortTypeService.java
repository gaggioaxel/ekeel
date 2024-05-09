package com.unige.encode.encoderestapi.service;

import com.unige.encode.encoderestapi.model.EffortType;

import java.util.List;
import java.util.Set;

public interface EffortTypeService {

    void saveEffortType(EffortType effortType);
    void saveAllEffortTypes(List<EffortType> effortTypes);
    EffortType getEffortTypeById(long id);
    List<EffortType> getBySchemaIdIsIn(Set<Long> schemaIds);
    List<EffortType> getAllEffortType();
    void updateEffortType(EffortType newEffortType, EffortType oldEffortType);
    void deleteEffortType(long id);
    boolean existsEffortTypeById(long id);

}
