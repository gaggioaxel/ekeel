package com.unige.encode.encoderestapi.repository;

import com.unige.encode.encoderestapi.model.TopicScope;
import com.unige.encode.encoderestapi.model.TopicScopePK;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TopicScopeRepository extends JpaRepository<TopicScope, TopicScopePK> {

    TopicScope getById(TopicScopePK pk);

}