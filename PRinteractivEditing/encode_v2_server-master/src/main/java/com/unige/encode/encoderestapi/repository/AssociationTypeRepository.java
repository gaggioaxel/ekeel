package com.unige.encode.encoderestapi.repository;

import com.unige.encode.encoderestapi.model.AssociationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface AssociationTypeRepository extends JpaRepository<AssociationType, Long> {

    AssociationType getById(long id);
    List<AssociationType> getBySchemaIdIsIn(Set<Long> schemaIds);
    void deleteById(long id);
    boolean existsById(long id);

}
