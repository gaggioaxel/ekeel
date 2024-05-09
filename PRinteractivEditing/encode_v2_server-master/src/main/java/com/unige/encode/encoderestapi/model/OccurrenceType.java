package com.unige.encode.encoderestapi.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

import javax.persistence.*;
import java.util.Collection;
import java.util.Objects;

@Entity
@Table(name = "encode_occurrences_types", schema = "unige_encode_db", catalog = "")
public class OccurrenceType {
    private long id;
    private String name;
    private String description;
    private long schemaId;
    private Schema occurrenceTypeSchema;
    private Collection<Occurrence> occurrenceTypeOccurrences;

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
    @Column(name = "name", nullable = false, length = 32)
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
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
        OccurrenceType that = (OccurrenceType) o;
        return id == that.id &&
                Objects.equals(name, that.name) &&
                Objects.equals(description, that.description);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, name, description);
    }

    @Basic
    @Column(name = "schema_id", nullable = false, insertable = false , updatable=false)
    public long getSchemaId() { return schemaId; }

    public void setSchemaId(long schemaId) {
        this.schemaId = schemaId;
    }

    @ManyToOne
    @JoinColumn(name = "schema_id", referencedColumnName = "id", nullable = false)
    @JsonIgnore
    public Schema getOccurrenceTypeSchema() { return occurrenceTypeSchema; }

    public void setOccurrenceTypeSchema(Schema occurrenceTypeSchema) { this.occurrenceTypeSchema = occurrenceTypeSchema; }

    @OneToMany(mappedBy = "occurrenceOccurrenceType")
    @JsonIgnore
    public Collection<Occurrence> getOccurrenceTypeOccurrences() {
        return occurrenceTypeOccurrences;
    }

    public void setOccurrenceTypeOccurrences(Collection<Occurrence> occurrenceTypeOccurrences) {
        this.occurrenceTypeOccurrences = occurrenceTypeOccurrences;
    }
}
