package com.unige.encode.encoderestapi.repository;

import com.unige.encode.encoderestapi.model.Scope;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository
public interface ScopeRepository extends JpaRepository<Scope, Long> {

    Scope getById(long id);
    //List<Scope> getAllByTopicId(long id);
    //List<Scope> getAllByOccurrenceId(long id);
    //List<Scope> getAllByLinkedTopicsId(long id);
    //void deleteAllByTopicId(long id);
    //void deleteAllByLinkedTopicsId(long id);
    //void deleteAllByOccurrenceId(long id);*/
    List<Scope> getBySchemaIdIsIn(Set<Long> schemaIds);
    void deleteById(long id);
    boolean existsById(long id);

}
