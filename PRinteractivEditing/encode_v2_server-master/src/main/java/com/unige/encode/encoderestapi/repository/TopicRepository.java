package com.unige.encode.encoderestapi.repository;

import com.unige.encode.encoderestapi.model.Topic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TopicRepository extends JpaRepository<Topic, Long> {

    Topic getById(long id);
    void deleteById(long id);
    void deleteByIdIn(List<Long> ids);
    boolean existsById(long id);
}
