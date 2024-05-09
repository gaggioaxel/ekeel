package com.unige.encode.encoderestapi.service;

import com.unige.encode.encoderestapi.model.TopicType;

import java.util.List;
import java.util.Set;

public interface TopicTypeService {

    void saveTopicType(TopicType topicType);
    void saveAllTopicTypes(List<TopicType> topicTypes);
    TopicType getTopicTypeById(long id);
    List<TopicType> getBySchemaIdIsIn(Set<Long> schemaIds);
    List<TopicType> getAllTopicType();
    void updateTopicType(TopicType newTopicType, TopicType oldTopicType);
    void deleteTopicType(long id);
    boolean existsTopicTypeById(long id);
}
