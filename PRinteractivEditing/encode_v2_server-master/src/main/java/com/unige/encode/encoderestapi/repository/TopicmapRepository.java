package com.unige.encode.encoderestapi.repository;

import com.unige.encode.encoderestapi.model.Topicmap;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.sql.Timestamp;
import java.util.List;

@Repository
public interface TopicmapRepository extends JpaRepository<Topicmap, Long> {

    Topicmap getById(long id);
    List<Topicmap> getAllByTopicmapSchema_Owner(String email);
    Topicmap getByTitleAndTopicmapSchema_Owner(String title, String email);
    List<Topicmap> getAllByCreationDateAfterAndTopicmapSchema_Owner(Timestamp timestamp, String email);
    void deleteById(long id);
    boolean existsById(long id);

}
