package com.unige.encode.encoderestapi.service;

import com.unige.encode.encoderestapi.model.TopicScope;
import com.unige.encode.encoderestapi.repository.TopicScopeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;

@Service
public class TopicScopeServiceImpl implements TopicScopeService {

    @Autowired TopicScopeRepository topicScopeRepository;

    @Override
    public void save(TopicScope topicScope) {
        topicScopeRepository.save(topicScope);
    }

    @Override
    @Transactional
    public void delete(TopicScope topicScope) {
        TopicScope s = topicScopeRepository.getById(topicScope.getId());
        topicScopeRepository.delete(s);
    }
}
