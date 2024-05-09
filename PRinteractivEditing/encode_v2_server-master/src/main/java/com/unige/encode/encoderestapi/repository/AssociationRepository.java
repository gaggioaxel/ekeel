package com.unige.encode.encoderestapi.repository;

import com.unige.encode.encoderestapi.model.Association;
import com.unige.encode.encoderestapi.model.OccurrenceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository
public interface AssociationRepository extends JpaRepository<Association, Long> {

    Association getById(long id);
    List<Association> getAllByTopicmapId(long topicmapId);
    List<Association> getByTopicmapIdIsIn(Set<Long> topicmapIds);
    void deleteById(long id);
    boolean existsById(long id);

}
