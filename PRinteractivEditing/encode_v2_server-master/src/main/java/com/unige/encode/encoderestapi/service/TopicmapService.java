package com.unige.encode.encoderestapi.service;

import com.unige.encode.encoderestapi.model.Topicmap;
import com.unige.encode.encoderestapi.model.User;

import java.sql.Timestamp;
import java.util.List;

public interface TopicmapService {

    void saveTopicmap(Topicmap topicmap);
    Topicmap getTopicmapById(long id);
    List<Topicmap> getAllTopicmapsByTopicmapSchema_Owner(String email);
    //Topicmap getTopicmapByTitleAndTopicmapOwner_Email(String title, String email);
    //List<Topicmap> getAllTopicmapsByCreationDateAfterAndTopicmapOwner_Email(Timestamp timestamp, String email);
    void updateTopicmap(Topicmap newTopicmap, Topicmap oldTopicmap);
    void deleteTopicmapById(long id);
    boolean existsTopicmapById(long id);
    boolean hasUserRightsOnTopicmap(User user, long topicmapId);

}
