package com.unige.encode.encoderestapi.service;

import com.unige.encode.encoderestapi.model.EffortType;
import com.unige.encode.encoderestapi.model.OccurrenceType;
import com.unige.encode.encoderestapi.repository.EffortTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
public class EffortTypeServiceImpl implements EffortTypeService {

    @Autowired private EffortTypeRepository effortTypeRepository;

    @Override
    public void saveEffortType(EffortType effortType) {
        effortTypeRepository.save(effortType);
    }

    @Override
    public void saveAllEffortTypes(List<EffortType> effortTypes) {
        effortTypeRepository.saveAll(effortTypes);
    }

    @Override
    public EffortType getEffortTypeById(long id) {
        return effortTypeRepository.getById(id);
    }

    @Override
    public List<EffortType> getBySchemaIdIsIn(Set<Long> schemaIds){
        return effortTypeRepository.getBySchemaIdIsIn(schemaIds);
    }

    @Override
    public List<EffortType> getAllEffortType() {
        return effortTypeRepository.findAll();
    }

    @Override
    public void updateEffortType(EffortType newEffort, EffortType oldEffort) {
        oldEffort.setMetricType(newEffort.getMetricType());
        oldEffort.setDescription(newEffort.getDescription());
        saveEffortType(oldEffort);
    }

    @Override
    public void deleteEffortType(long id) {
        effortTypeRepository.deleteById(id);
    }

    @Override
    public boolean existsEffortTypeById(long id) {
        return effortTypeRepository.existsById(id);
    }

}
