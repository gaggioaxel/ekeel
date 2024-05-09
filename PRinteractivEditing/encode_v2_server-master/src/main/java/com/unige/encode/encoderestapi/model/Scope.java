package com.unige.encode.encoderestapi.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "encode_scopes", schema = "unige_encode_db", catalog = "")
public class Scope {
    private long id;
    private String name;
    private String description;
    private long schemaId;
    private Schema scopeSchema;
    private List<OccurrenceScope> scopeOccurrenceScopes;
    private List<TopicScope> scopeTopicScopes;
    private List<AssociationScope> scopeAssociationScopes;

    @Id
    @GeneratedValue
    @Column(name = "id", nullable = false)
    public long getId() { return id; }

    public void setId(long id) { this.id = id; }

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
        Scope scope = (Scope) o;
        return id == scope.id &&
                Objects.equals(name, scope.name) &&
                Objects.equals(description, scope.description);
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
    public Schema getScopeSchema() { return scopeSchema; }

    public void setScopeSchema(Schema scopeSchema) { this.scopeSchema = scopeSchema; }

    @OneToMany(mappedBy="scope")
    public List<OccurrenceScope> getScopeOccurrenceScopes() {
        return scopeOccurrenceScopes;
    }

    public void setScopeOccurrenceScopes(List<OccurrenceScope> scopeOccurrenceScopes) {
        this.scopeOccurrenceScopes = scopeOccurrenceScopes;
    }

    @OneToMany(mappedBy="scope")
    public List<TopicScope> getScopeTopicScopes() { return scopeTopicScopes; }

    public void setScopeTopicScopes(List<TopicScope> scopeTopicScopes) { this.scopeTopicScopes = scopeTopicScopes; }

    @OneToMany(mappedBy="scope")
    public List<AssociationScope> getScopeAssociationScopes() { return scopeAssociationScopes; }

    public void setScopeAssociationScopes(List<AssociationScope> scopeAssociationScopes) {
        this.scopeAssociationScopes = scopeAssociationScopes;
    }
}
