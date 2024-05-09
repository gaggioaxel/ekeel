package com.unige.encode.encoderestapi.service;

import com.unige.encode.encoderestapi.model.Topic;
import com.unige.encode.encoderestapi.model.TopicScope;
import com.unige.encode.encoderestapi.repository.TopicRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.List;

@Service
public class TopicServiceImpl implements TopicService{

    @Autowired private TopicRepository topicRepository;
    @Autowired private TopicScopeService topicScopeService;

    @Override
    @Transactional
    public void saveTopic(Topic topic) {
        long topicId = topicRepository.save(topic).getId();
        List<TopicScope> topicScopes = topic.getTopicTopicScopes();
        if(topicScopes != null){
            for(TopicScope ts : topicScopes){
                ts.getId().setTopicId(topicId);
                topicScopeService.save(ts);
            }
        }
    }

    @Override
    public Topic getTopicById(long id) {
        return topicRepository.getById(id);
    }

    @Override
    @Transactional
    public void updateTopic(Topic newTopic, Topic oldTopic) {
        oldTopic.setName(newTopic.getName());
        oldTopic.setSubjectLocator(newTopic.getSubjectLocator());
        oldTopic.setSubjectIdentifier(newTopic.getSubjectIdentifier());
        oldTopic.setVariantName(newTopic.getVariantName());

        List<TopicScope> oldTopicScopes = oldTopic.getTopicTopicScopes();
        List<TopicScope> newTopicScopes = newTopic.getTopicTopicScopes();

        if(oldTopicScopes != null) {
            for (TopicScope ts : oldTopicScopes) {
                if (newTopicScopes == null || !newTopicScopes.contains(ts)) {
                    topicScopeService.delete(ts);
                }
            }
        }
        if(newTopicScopes != null) newTopicScopes.forEach(ts -> topicScopeService.save(ts));
        oldTopic.setTopicTopicScopes(newTopicScopes);
        topicRepository.save(oldTopic);
    }

    @Override
    public void deleteTopic(long id) {
        topicRepository.deleteById(id);
    }

    @Override
    public boolean existsTopicById(long id) {
        return topicRepository.existsById(id);
    }

    @Override
    @Transactional
    public void deleteTopicList(List<Long> topicIds) {
        topicRepository.deleteByIdIn(topicIds);
    }
}
