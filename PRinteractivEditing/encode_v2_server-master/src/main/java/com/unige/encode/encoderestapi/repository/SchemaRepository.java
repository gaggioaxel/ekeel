package com.unige.encode.encoderestapi.repository;

import com.unige.encode.encoderestapi.model.Schema;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SchemaRepository extends JpaRepository<Schema, Long> {

    Schema getById(long id);
    List<Schema> getAllBySchemaOwner_Email(String email);
    Schema getByNameAndSchemaOwner_Email(String title, String email);
    void deleteById(long id);
    void deleteAllBySchemaOwner_Email(String email);
    boolean existsById(long id);

}
