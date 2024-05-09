package com.unige.encode.encoderestapi.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

import java.io.Serializable;
import javax.persistence.*;

@Entity
@Table(name = "encode_efforts_occurrences")
public class EffortTypeOccurrence implements Serializable {
    private static final long serialVersionUID = 1L;

    @EmbeddedId
    private EffortTypeOccurrencePK id;

    @Basic
    @Column(name = "metric_value", nullable = false, length = 32)
    private String metricValue;

    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name="occurrence_id", insertable=false, updatable=false)
    private Occurrence occurrence;

    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name="effort_id", insertable=false, updatable=false)
    private EffortType effortType;

    public EffortTypeOccurrence() {
    }

    public EffortTypeOccurrencePK getId() {
        return this.id;
    }

    public void setId(EffortTypeOccurrencePK id) {
        this.id = id;
    }

    public String getMetricValue() { return metricValue; }

    public void setMetricValue(String metricValue) { this.metricValue = metricValue; }

    @JsonIgnore
    public Occurrence getOccurrence() {
        return occurrence;
    }

    public void setOccurrence(Occurrence occurrence) {
        this.occurrence = occurrence;
    }

    @JsonIgnore
    public EffortType getEffortType() {
        return effortType;
    }

    public void setEffortType(EffortType effortType) {
        this.effortType = effortType;
    }
}