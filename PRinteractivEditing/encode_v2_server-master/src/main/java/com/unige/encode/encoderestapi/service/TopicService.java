package com.unige.encode.encoderestapi.service;

import com.unige.encode.encoderestapi.model.Topic;

import java.util.List;

public interface TopicService {

    void saveTopic(Topic topic);
    Topic getTopicById(long id);
    void updateTopic(Topic newTopic, Topic olTopic);
    void deleteTopic(long id);
    boolean existsTopicById(long id);
    void deleteTopicList(List<Long> topicIds);
}
