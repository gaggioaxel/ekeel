package com.unige.encode.encoderestapi.repository;

import com.unige.encode.encoderestapi.model.Occurrence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OccurrenceRepository extends JpaRepository<Occurrence, Long> {

    Occurrence getById(long id);
    List<Occurrence> getAllByTopicId(long id);
    void deleteById(long id);
    boolean existsById(long id);
}
