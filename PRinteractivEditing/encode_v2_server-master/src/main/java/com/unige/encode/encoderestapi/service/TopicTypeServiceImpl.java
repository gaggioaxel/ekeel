package com.unige.encode.encoderestapi.service;

import com.unige.encode.encoderestapi.model.TopicType;
import com.unige.encode.encoderestapi.repository.TopicTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
public class TopicTypeServiceImpl implements TopicTypeService{

    @Autowired private TopicTypeRepository topicTypeRepository;

    @Override
    public void saveTopicType(TopicType topicType) {
        topicTypeRepository.save(topicType);
    }

    @Override
    public void saveAllTopicTypes(List<TopicType> topicTypes) {
        topicTypeRepository.saveAll(topicTypes);
    }

    @Override
    public TopicType getTopicTypeById(long id) {
        return topicTypeRepository.getById(id);
    }

    @Override
    public List<TopicType> getAllTopicType() {
        return topicTypeRepository.findAll();
    }

    @Override
    public List<TopicType> getBySchemaIdIsIn(Set<Long> schemaIds){
        return topicTypeRepository.getBySchemaIdIsIn(schemaIds);
    }

    @Override
    public void updateTopicType(TopicType newTopicType, TopicType oldTopicType) {
        oldTopicType.setName(newTopicType.getName());
        oldTopicType.setDescription(newTopicType.getDescription());
        saveTopicType(oldTopicType);
    }

    @Override
    public void deleteTopicType(long id) {
        topicTypeRepository.deleteById(id);
    }

    @Override
    public boolean existsTopicTypeById(long id) {
        return topicTypeRepository.existsById(id);
    }

}
