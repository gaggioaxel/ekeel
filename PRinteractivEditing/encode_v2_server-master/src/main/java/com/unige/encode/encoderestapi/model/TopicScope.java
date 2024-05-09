package com.unige.encode.encoderestapi.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

import java.io.Serializable;
import javax.persistence.*;

@Entity
@Table(name="encode_topics_scopes")
public class TopicScope implements Serializable {
	private static final long serialVersionUID = 1L;

	@EmbeddedId
	private TopicScopePK id;

	@Basic
	@Column(name = "content", columnDefinition="TEXT")
	private String content;

	@ManyToOne(fetch=FetchType.LAZY)
	@JoinColumn(name="scope_id", insertable=false, updatable=false)
	private Scope scope;

	@ManyToOne(fetch=FetchType.LAZY)
	@JoinColumn(name="topic_id", insertable=false, updatable=false)
	private Topic topic;

	public TopicScope() {
	}

	public TopicScopePK getId() {
		return this.id;
	}

	public void setId(TopicScopePK id) {
		this.id = id;
	}

	public String getContent() {
		return this.content;
	}

	public void setContent(String content) {
		this.content = content;
	}

	@JsonIgnore
	public Topic getTopic() {
		return topic;
	}

	public void setTopic(Topic topic) {
		this.topic = topic;
	}

	@JsonIgnore
	public Scope getScope() {
		return scope;
	}

	public void setScope(Scope scope) {
		this.scope = scope;
	}
}