package com.unige.encode.encoderestapi.repository;

import com.unige.encode.encoderestapi.model.TopicType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

@Repository
public interface TopicTypeRepository extends JpaRepository<TopicType, Long> {

    TopicType getById(long id);
    List<TopicType> getBySchemaIdIsIn(Set<Long> schemaIds);
    void deleteById(long id);
    boolean existsById(long id);
}
