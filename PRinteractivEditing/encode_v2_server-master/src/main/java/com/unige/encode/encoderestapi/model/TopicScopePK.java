package com.unige.encode.encoderestapi.model;

import java.io.Serializable;
import javax.persistence.*;


@Embeddable
public class TopicScopePK implements Serializable {
	//default serial version id, required for serializable classes.
	private static final long serialVersionUID = 1L;

	private long topic_id;
	private long scope_id;

	@Column(name="topic_id")
	public long getTopicId() { return this.topic_id; }

	public void setTopicId(long topicId) { this.topic_id = topicId; }

	@Column(name="scope_id")
	public long getScopeId() { return this.scope_id; }

	public void setScopeId(long scopeId) { this.scope_id = scopeId; }

	public TopicScopePK() {}

	public boolean equals(Object o) {
		if (this == o) return true;
		if (o == null || getClass() != o.getClass()) return false;
		TopicScopePK that = (TopicScopePK) o;
		return this.topic_id == that.topic_id &&
				this.scope_id == that.scope_id;
	}

	public int hashCode() {
		final int prime = 31;
		int hash = 17;
		hash = hash * prime + Long.hashCode(this.topic_id);
		hash = hash * prime + Long.hashCode(this.scope_id);

		return hash; }
}