package com.unige.encode.encoderestapi.service;

import com.unige.encode.encoderestapi.model.Association;
import com.unige.encode.encoderestapi.model.AssociationScope;
import com.unige.encode.encoderestapi.model.OccurrenceType;
import com.unige.encode.encoderestapi.repository.AssociationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.List;
import java.util.Set;

@Service
public class AssociationServiceImpl implements AssociationService {

    @Autowired private AssociationRepository associationRepository;
    @Autowired private AssociationScopeService associationScopeService;

    @Override
    public void saveAssociation(Association association){
        long associationId = associationRepository.save(association).getId();
        List<AssociationScope> associationScopes = association.getAssociationAssociationScopes();
        if(associationScopes != null){
            for(AssociationScope as : associationScopes){
                as.getId().setAssociationId(associationId);
                associationScopeService.save(as);
            }
        }
    }

    @Override
    public Association getAssociationById(long id){
        return associationRepository.getById(id);
    }
    @Override
    public List<Association> getByTopicmapIdIsIn(Set<Long> topicmapIds){
        return associationRepository.getByTopicmapIdIsIn(topicmapIds);
    }
    @Override
    @Transactional
    public void updateAssociation(Association newAssociation, Association oldAssociation) {
        List<AssociationScope> oldAssociationScopes = oldAssociation.getAssociationAssociationScopes();
        List<AssociationScope> newAssociationScopes = newAssociation.getAssociationAssociationScopes();

        if(oldAssociationScopes != null) {
            for (AssociationScope as : oldAssociationScopes) {
                if (newAssociationScopes == null || !newAssociationScopes.contains(as)) {
                    associationScopeService.delete(as);
                }
            }
        }
        if(newAssociationScopes != null) newAssociationScopes.forEach(ts -> associationScopeService.save(ts));
        oldAssociation.setAssociationAssociationScopes(newAssociationScopes);
        associationRepository.save(oldAssociation);
    }

    @Override
    public void deleteAssociation(long id){
        associationRepository.deleteById(id);
    }

    @Override
    public boolean existsAssociationById(long id){
        return associationRepository.existsById(id);
    }

    public List<Association> getAllAssociationByTopicmapId(long topicmapId){ return associationRepository.getAllByTopicmapId(topicmapId);}

}
