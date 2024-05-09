package com.unige.encode.encoderestapi.model;

import java.io.Serializable;
import javax.persistence.*;

@Embeddable
public class OccurrenceScopePK implements Serializable {
	//default serial version id, required for serializable classes.
	private static final long serialVersionUID = 1L;

	private long occurrence_id;
	private long scope_id;

	@Column(name="occurrence_id")
	public long getOccurrenceId() { return this.occurrence_id; }

	public void setOccurrenceId(long occurrenceId) { this.occurrence_id = occurrenceId; }

	@Column(name="scope_id")
	public long getScopeId() { return this.scope_id; }

	public void setScopeId(long scopeId) { this.scope_id = scopeId; }

	public OccurrenceScopePK() {}

	public boolean equals(Object o) {
		if (this == o) return true;
		if (o == null || getClass() != o.getClass()) return false;
		OccurrenceScopePK that = (OccurrenceScopePK) o;
		return this.occurrence_id == that.occurrence_id &&
				this.scope_id == that.scope_id;
	}

	public int hashCode() {
		final int prime = 31;
		int hash = 17;
		hash = hash * prime + Long.hashCode(this.occurrence_id);
		hash = hash * prime + Long.hashCode(this.scope_id);

		return hash; }
}