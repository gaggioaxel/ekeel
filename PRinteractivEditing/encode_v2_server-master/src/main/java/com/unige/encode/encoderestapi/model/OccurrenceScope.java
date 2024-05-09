package com.unige.encode.encoderestapi.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

import java.io.Serializable;
import javax.persistence.*;

@Entity
@Table(name="encode_occurrences_scopes")
public class OccurrenceScope implements Serializable {
	private static final long serialVersionUID = 1L;

	@EmbeddedId
	private OccurrenceScopePK id;

	@Basic
	@Column(name = "content", columnDefinition="TEXT")
	private String content;

	@ManyToOne(fetch=FetchType.LAZY)
	@JoinColumn(name="scope_id", insertable=false, updatable=false)
	private Scope scope;

	@ManyToOne(fetch=FetchType.LAZY)
	@JoinColumn(name="occurrence_id", insertable=false, updatable=false)
	private Occurrence occurrence;

	public OccurrenceScope() {
	}

	public OccurrenceScopePK getId() {
		return this.id;
	}

	public void setId(OccurrenceScopePK id) {
		this.id = id;
	}

	public String getContent() {
		return this.content;
	}

	public void setContent(String content) {
		this.content = content;
	}

	@JsonIgnore
	public Occurrence getOccurrence() {
		return occurrence;
	}

	public void setOccurrence(Occurrence occurrence) {
		this.occurrence = occurrence;
	}

	@JsonIgnore
	public Scope getScope() {
		return scope;
	}

	public void setScope(Scope scope) {
		this.scope = scope;
	}
}