package com.unige.encode.encoderestapi.service;

import com.unige.encode.encoderestapi.model.AssociationType;
import com.unige.encode.encoderestapi.repository.AssociationTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class AssociationTypeServiceImpl implements AssociationTypeService {

    @Autowired private AssociationTypeRepository associationTypeRepository;

    @Override
    public void saveAssociationType(AssociationType associationType) {
        associationTypeRepository.save(associationType);
    }

    @Override
    public void saveAllAssociationType(List<AssociationType> associationTypes) {
        associationTypeRepository.saveAll(associationTypes);
    }

    @Override
    public AssociationType getAssociationTypeById(long id) {
        return associationTypeRepository.getById(id);
    }

    @Override
    public List<AssociationType> getAllAssociationsTypes() {
        return associationTypeRepository.findAll();
    }

    @Override
    public List<AssociationType> getBySchemaIdIsIn(Set<Long> schemaIds){
        return associationTypeRepository.getBySchemaIdIsIn(schemaIds);
    }

    @Override
    public void updateAssociationType(AssociationType newAssociationType, AssociationType oldAssociationType) {
        oldAssociationType.setName(newAssociationType.getName());
        oldAssociationType.setDescription(newAssociationType.getDescription());
        saveAssociationType(oldAssociationType);
    }

    @Override
    @Transactional
    public void deleteAssociationType(long id) {
        associationTypeRepository.deleteById(id);
    }

    @Override
    public boolean existsAssociationTypeById(long id) {
        return associationTypeRepository.existsById(id);
    }

}
