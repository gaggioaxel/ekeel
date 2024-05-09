package com.unige.encode.encoderestapi.repository;

import com.unige.encode.encoderestapi.model.EffortType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository
public interface EffortTypeRepository extends JpaRepository<EffortType, Long> {

    EffortType getById(long id);
    List<EffortType> getBySchemaIdIsIn(Set<Long> schemaIds);
    void deleteById(long id);
    boolean existsById(long id);

}
