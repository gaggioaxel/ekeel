package com.unige.encode.encoderestapi.service;

import com.unige.encode.encoderestapi.model.TopicAssociationRole;
import com.unige.encode.encoderestapi.repository.TopicAssociationRoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Service
public class TopicAssociationRoleServiceImpl implements TopicAssociationRoleService {

    @Autowired private TopicAssociationRoleRepository topicAssociationRoleRepository;
    @Autowired private AssociationTypeService associationService;

    @Override
    public void saveTopicAssociationRole(TopicAssociationRole topicAssociationRole) {
        topicAssociationRoleRepository.save(topicAssociationRole);
    }

    @Override
    @Transactional
    public void saveAllTopicAssociationRole(Collection<TopicAssociationRole> topicAssociationRoles) {
        topicAssociationRoleRepository.saveAll(topicAssociationRoles);
    }

    @Override
    public TopicAssociationRole getTopicAssociationRoleById(long id) {
        return topicAssociationRoleRepository.getById(id);
    }

    @Override
    public List<TopicAssociationRole> getTopicAssociationRolesByRoleIdAndTopicId(long roleId, long topicId){
        return topicAssociationRoleRepository.getAllByRoleIdAndTopicId(roleId, topicId);
    }

    @Override
    public List<TopicAssociationRole> getAllByAssociationId(long associationId) {
        return topicAssociationRoleRepository.getAllByAssociationId(associationId);
    }

    @Override
    public void updateTopicAssociationRole(TopicAssociationRole topicAssociationRoleToUpdate) {
        saveTopicAssociationRole(topicAssociationRoleToUpdate);
    }

    @Override
    @Transactional
    public void deleteTopicAssociationRole(long id) {
        long associationId = topicAssociationRoleRepository.getById(id).getAssociationId();
        //topicAssociationRoleRepository.deleteById(id);
        associationService.deleteAssociationType(associationId);
    }

    @Override
    public boolean existsTopicAssociationRoleById(long id) {
        return topicAssociationRoleRepository.existsById(id);
    }

    @Override
    public boolean existsTopicAssociationRoleByRoleIdAndTopicId(long roleId, long topicId){
        return topicAssociationRoleRepository.existsByRoleIdAndTopicId(roleId, topicId);
    }

    @Override
    public boolean existsTopicAssociationRoleByRoleIdAndTopicTypeId(long roleId, long topicTypeId){
        return topicAssociationRoleRepository.existsByRoleIdAndTarTopic_TopicTypeId(roleId, topicTypeId);
    }
}
