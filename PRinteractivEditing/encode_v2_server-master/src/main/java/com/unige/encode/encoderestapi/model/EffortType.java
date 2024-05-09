package com.unige.encode.encoderestapi.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import javafx.print.Collation;

import javax.persistence.*;
import java.util.Collection;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "encode_efforts_types", schema = "unige_encode_db2", catalog = "")
public class EffortType {
    private long id;
    private String metricType;
    private String description;
    private long schemaId;
    private List<EffortTypeOccurrence> effortTypeOccurrences;
    private Schema effortTypeSchema;

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
    @Column(name = "metric_type", nullable = false, length = 32)
    public String getMetricType() {
        return metricType;
    }

    public void setMetricType(String metricType) {
        this.metricType = metricType;
    }

    @Basic
    @Column(name = "description", length = 512)
    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        EffortType effort = (EffortType) o;
        return id == effort.id &&
                schemaId == effort.schemaId &&
                Objects.equals(metricType, effort.metricType) &&
                Objects.equals(this.description, effort.description);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, metricType, description, schemaId);
    }

    @Basic
    @Column(name = "schema_id", nullable = false, insertable = false , updatable=false)
    public long getSchemaId() {
        return schemaId;
    }

    public void setSchemaId(long schemaId) {
        this.schemaId = schemaId;
    }

    @OneToMany(mappedBy = "effortType")
    public List<EffortTypeOccurrence> getEffortTypeOccurrences() {
        return effortTypeOccurrences;
    }

    public void setEffortTypeOccurrences(List<EffortTypeOccurrence> effortTypeOccurrences) {
        this.effortTypeOccurrences = effortTypeOccurrences;
    }

    @ManyToOne
    @JoinColumn(name = "schema_id", referencedColumnName = "id", nullable = false)
    @JsonIgnore
    public Schema getEffortTypeSchema() { return effortTypeSchema; }

    public void setEffortTypeSchema(Schema effortTypeSchema) { this.effortTypeSchema = effortTypeSchema; }

}
