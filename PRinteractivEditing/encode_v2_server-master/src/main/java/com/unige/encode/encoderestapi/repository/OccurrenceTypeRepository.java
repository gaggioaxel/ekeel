package com.unige.encode.encoderestapi.repository;

import com.unige.encode.encoderestapi.model.OccurrenceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository
public interface OccurrenceTypeRepository extends JpaRepository<OccurrenceType, Long> {

    OccurrenceType getById(long id);
    List<OccurrenceType> getBySchemaIdIsIn(Set<Long> schemaIds);
    void deleteById(long id);
    boolean existsById(long id);

}
