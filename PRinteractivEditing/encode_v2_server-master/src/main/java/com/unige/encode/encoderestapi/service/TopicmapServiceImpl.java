package com.unige.encode.encoderestapi.service;

import com.unige.encode.encoderestapi.model.Topicmap;
import com.unige.encode.encoderestapi.model.User;
import com.unige.encode.encoderestapi.repository.TopicmapRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.List;

@Service
public class TopicmapServiceImpl implements TopicmapService{

    @Autowired private TopicmapRepository topicmapRepository;

    @Override
    public void saveTopicmap(Topicmap topicmap) {
        topicmapRepository.save(topicmap);
    }

    @Override
    public Topicmap getTopicmapById(long id) {
        return topicmapRepository.getById(id);
    }

    @Override
    public List<Topicmap> getAllTopicmapsByTopicmapSchema_Owner(String email) {
        return topicmapRepository.getAllByTopicmapSchema_Owner(email);
    }

    /*@Override
    public Topicmap getTopicmapByTitleAndTopicmapOwner_Email(String title, String email) {
        return topicmapRepository.getByTitleAndTopicmapOwner_Email(title, email);
    }

    @Override
    public List<Topicmap> getAllTopicmapsByCreationDateAfterAndTopicmapOwner_Email(Timestamp timestamp, String email) {
        return topicmapRepository.getAllByCreationDateAfterAndTopicmapOwner_Email(timestamp, email);
    }*/

    @Override
    public void updateTopicmap(Topicmap newTopicmap, Topicmap oldTopicmap) {
        oldTopicmap.setTitle(newTopicmap.getTitle());
        oldTopicmap.setDescription(newTopicmap.getDescription());
        oldTopicmap.setVersion(newTopicmap.getVersion());
        oldTopicmap.setLastModifyDate(new Timestamp(System.currentTimeMillis()));
        saveTopicmap(oldTopicmap);
    }

    @Override
    public void deleteTopicmapById(long id) {
        topicmapRepository.deleteById(id);
    }

    @Override
    public boolean existsTopicmapById(long id) {
        return topicmapRepository.existsById(id);
    }

    @Override
    public boolean hasUserRightsOnTopicmap(User user, long topicmapId){
        Topicmap topicmap = topicmapRepository.getById(topicmapId);
        return topicmap.getEditors().contains(user) || user.getEmail().equals(topicmap.getTopicmapSchema().getOwner());
    }

}
