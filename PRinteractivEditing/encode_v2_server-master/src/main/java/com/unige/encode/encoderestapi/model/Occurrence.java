package com.unige.encode.encoderestapi.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import javax.persistence.*;
import java.util.Collection;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "encode_occurrences", schema = "unige_encode_db", catalog = "")
public class Occurrence {
    private long id;
    private String dataValue;
    private String dataReference;
    private long topicId;
    private long occurrenceTypeId;
    private Topic occurrenceTopic;
    private OccurrenceType occurrenceOccurrenceType;
    private Collection<OccurrenceFile> occurrenceFiles;
    private List<EffortTypeOccurrence> occurrenceEffortType;
    private List<OccurrenceScope> occurrenceOccurrenceScope;

    @Id
    @GeneratedValue
    @Column(name = "id", nullable = false)
    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    @Basic
    @Column(name = "data_value", columnDefinition="TEXT")
    public String getDataValue() {
        return dataValue;
    }

    public void setDataValue(String dataValue) {
        this.dataValue = dataValue;
    }

    @Basic
    @Column(name = "data_reference", length = 2048)
    public String getDataReference() {
        return dataReference;
    }

    public void setDataReference(String dataReference) {
        this.dataReference = dataReference;
    }

    @Basic
    @Column(name = "topic_id", nullable = false, length = 11, insertable = false , updatable=false)
    public long getTopicId() {
        return topicId;
    }

    public void setTopicId(long topicId) {
        this.topicId = topicId;
    }

    @Basic
    @Column(name = "occurrence_type_id", nullable = false, length = 11, insertable = false , updatable=false)
    public long getOccurrenceTypeId() {
        return occurrenceTypeId;
    }

    public void setOccurrenceTypeId(long occurrenceTypeId) {
        this.occurrenceTypeId = occurrenceTypeId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Occurrence that = (Occurrence) o;
        return id == that.id &&
                topicId == that.topicId &&
                Objects.equals(dataValue, that.dataValue) &&
                Objects.equals(dataReference, that.dataReference) &&
                occurrenceTypeId == that.occurrenceTypeId;
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, dataValue, dataReference, topicId, occurrenceTypeId);
    }

    @ManyToOne
    @JoinColumn(name = "topic_id", referencedColumnName = "id", nullable = false)
    @JsonIgnore
    public Topic getOccurrenceTopic() {
        return occurrenceTopic;
    }

    public void setOccurrenceTopic(Topic occurrenceTopic) {
        this.occurrenceTopic = occurrenceTopic;
    }

    @ManyToOne
    @JoinColumn(name = "occurrence_type_id", referencedColumnName = "id", nullable = false)
    @JsonIgnore
    public OccurrenceType getOccurrenceOccurrenceType() {
        return occurrenceOccurrenceType;
    }

    public void setOccurrenceOccurrenceType(OccurrenceType occurrenceOccurrenceType) {
        this.occurrenceOccurrenceType = occurrenceOccurrenceType;
    }

    @OneToMany(mappedBy="occurrence", fetch = FetchType.LAZY, orphanRemoval = true)
    public List<OccurrenceScope> getOccurrenceOccurrenceScope() {
        return occurrenceOccurrenceScope;
    }

    public void setOccurrenceOccurrenceScope(List<OccurrenceScope> occurrenceOccurrenceScope) {
        this.occurrenceOccurrenceScope = occurrenceOccurrenceScope;
    }

    @OneToMany(mappedBy = "fileOccurrence")
    public Collection<OccurrenceFile> getOccurrenceFiles() {
        return occurrenceFiles;
    }

    public void setoccurrenceFiles(Collection<OccurrenceFile> occurrenceFiles) {
        this.occurrenceFiles = occurrenceFiles;
    }

    @OneToMany(mappedBy = "occurrence")
    public List<EffortTypeOccurrence> getOccurrenceEffortType() {
        return occurrenceEffortType;
    }

    public void setOccurrenceEffortType(List<EffortTypeOccurrence> occurrenceEffortType) {
        this.occurrenceEffortType = occurrenceEffortType;
    }
}
