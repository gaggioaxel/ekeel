package com.unige.encode.encoderestapi.repository;

import com.unige.encode.encoderestapi.model.TopicAssociationRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TopicAssociationRoleRepository extends JpaRepository<TopicAssociationRole, Long> {

    TopicAssociationRole getById(long id);
    List<TopicAssociationRole> getAllByAssociationId(long associationId);
    List<TopicAssociationRole> getAllByRoleIdAndTopicId(long roleId, long topicId);
    void deleteById(long id);
    boolean existsById(long id);
    boolean existsByRoleIdAndTopicId(long roleId, long topicId);
    boolean existsByRoleIdAndTarTopic_TopicTypeId(long roleId, long topicTypeId);

}