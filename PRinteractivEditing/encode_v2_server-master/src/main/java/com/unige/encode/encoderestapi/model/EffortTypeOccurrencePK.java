package com.unige.encode.encoderestapi.model;

import javax.persistence.Column;
import javax.persistence.Embeddable;
import java.io.Serializable;
import javax.persistence.*;

@Embeddable
public class EffortTypeOccurrencePK implements Serializable {
    //default serial version id, required for serializable classes.
    private static final long serialVersionUID = 1L;

    private long occurrence_id;
    private long effort_id;

    @Column(name="occurrence_id")
    public long getOccurrenceId() { return occurrence_id; }

    public void setOccurrenceId(long occurrenceId) { this.occurrence_id = occurrenceId; }

    @Column(name="effort_id")
    public long getEffortId() { return effort_id; }

    public void setEffortId(long effortId) { this.effort_id = effortId ;}

    public EffortTypeOccurrencePK() {}

    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        EffortTypeOccurrencePK that = (EffortTypeOccurrencePK) o;
        return this.occurrence_id == that.occurrence_id &&
                this.effort_id == that.effort_id;
    }

    public int hashCode() {
        final int prime = 31;
        int hash = 17;
        hash = hash * prime + Long.hashCode(this.occurrence_id);
        hash = hash * prime + Long.hashCode(this.effort_id);

        return hash; }
}