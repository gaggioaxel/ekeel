package com.unige.encode.encoderestapi.service;

import com.unige.encode.encoderestapi.model.TopicAssociationRole;

import java.util.Collection;
import java.util.List;

public interface TopicAssociationRoleService {

    void saveTopicAssociationRole(TopicAssociationRole topicAssociationRole);
    void saveAllTopicAssociationRole(Collection<TopicAssociationRole> topicAssociationRoles);
    TopicAssociationRole getTopicAssociationRoleById(long id);
    List<TopicAssociationRole> getTopicAssociationRolesByRoleIdAndTopicId(long roleId, long topicId);
    List<TopicAssociationRole> getAllByAssociationId(long associationId);
    void updateTopicAssociationRole(TopicAssociationRole topicAssociationRoleToUpdate);
    void deleteTopicAssociationRole(long id);
    boolean existsTopicAssociationRoleById(long id);
    boolean existsTopicAssociationRoleByRoleIdAndTopicId(long roleId, long topicId);
    boolean existsTopicAssociationRoleByRoleIdAndTopicTypeId(long roleId, long topicTypeId);
}
