package com.unige.encode.encoderestapi.service;

import com.unige.encode.encoderestapi.model.Association;
import com.unige.encode.encoderestapi.model.OccurrenceType;

import java.util.List;
import java.util.Set;

public interface AssociationService {

    void saveAssociation(Association association);
    Association getAssociationById(long id);
    void updateAssociation(Association newAssociation, Association oldAssociation);
    void deleteAssociation(long id);
    boolean existsAssociationById(long id);
    List<Association> getByTopicmapIdIsIn(Set<Long> topicmapIds);
    List<Association> getAllAssociationByTopicmapId(long topicmapId);

}
