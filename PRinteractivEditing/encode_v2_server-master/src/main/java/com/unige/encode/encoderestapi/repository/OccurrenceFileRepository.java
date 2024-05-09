package com.unige.encode.encoderestapi.repository;

import com.unige.encode.encoderestapi.model.OccurrenceFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OccurrenceFileRepository extends JpaRepository<OccurrenceFile, Long> {

    OccurrenceFile getById(long id);
    List<OccurrenceFile> getAllByOccurrenceId(long id);
    void deleteById(long id);
    boolean existsById(long id);
}
