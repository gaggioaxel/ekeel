package com.unige.encode.encoderestapi.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import javax.persistence.*;
import java.util.Collection;

@Entity
@Table(name = "encode_schema", schema = "unige_encode_db2", catalog = "")
public class Schema {
    private long id;
    private String name;
    private String description;
    private String owner;
    private User schemaOwner;
    private Collection<AssociationType> schemaAssociationTypes;
    private Collection<TopicType> schemaTopicTypes;
    private Collection<Scope> schemaScopes;
    private Collection<Topicmap> schemaTopicMaps;
    private Collection<OccurrenceType> schemaOccurrenceTypes;
    private Collection<EffortType> schemaEffortTypes;

    @Id
    @Column(name = "id", nullable = false)
    @GeneratedValue
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

    @Basic
    @Column(name = "owner", length = 60, nullable = false, insertable = false , updatable=false)
    public String getOwner() { return owner; }

    public void setOwner(String owner) {
        this.owner = owner;
    }

    @ManyToOne
    @JoinColumn(name = "owner", referencedColumnName = "email")
    @JsonIgnore
    public User getSchemaOwner() { return schemaOwner; }

    public void setSchemaOwner(User schemaOwner) { this.schemaOwner = schemaOwner; }

    @OneToMany(mappedBy = "associationTypeSchema")
    @JsonIgnoreProperties({"name","description","schemaId","associationTypeSchema","allAssociations","associationTypeRoles"})
    public Collection<AssociationType> getSchemaAssociationTypes() {
        return schemaAssociationTypes;
    }

    public void setSchemaAssociationTypes(Collection<AssociationType> schemaAssociationTypes) {
        this.schemaAssociationTypes = schemaAssociationTypes;
    }

    @OneToMany(mappedBy = "topicTypeSchema")
    @JsonIgnoreProperties({"name","description","schemaId","topicTypeSchema","topicTypeTopics","topicTypeRoles"})
    public Collection<TopicType> getSchemaTopicTypes() {
        return schemaTopicTypes;
    }

    public void setSchemaTopicTypes(Collection<TopicType> schemaTopicTypes) {
        this.schemaTopicTypes = schemaTopicTypes;
    }

    @OneToMany(mappedBy = "scopeSchema")
    @JsonIgnoreProperties({"name","description","schemaId","scopeSchema","scopeOccurrenceScopes","scopeTopicScopes","scopeAssociationScopes"})
    public Collection<Scope> getSchemaScopes() {
        return schemaScopes;
    }

    public void setSchemaScopes(Collection<Scope> schemaScopes) {
        this.schemaScopes = schemaScopes;
    }

    @OneToMany(mappedBy = "topicmapSchema")
    @JsonIgnoreProperties({"title","creationDate","lastModifyDate","description","version","schemaId","topicmapSchema","allAssociations","editors","allTopics"})
    public Collection<Topicmap> getSchemaTopicMaps() {
        return schemaTopicMaps;
    }

    public void setSchemaTopicMaps(Collection<Topicmap> schemaTopicMaps) {
        this.schemaTopicMaps = schemaTopicMaps;
    }

    @OneToMany(mappedBy = "occurrenceTypeSchema")
    @JsonIgnoreProperties({"name","description","schemaId","occurrenceTypeSchema","occurrenceTypeOccurrences"})
    public Collection<OccurrenceType> getSchemaOccurrenceTypes() {
        return schemaOccurrenceTypes;
    }

    public void setSchemaOccurrenceTypes(Collection<OccurrenceType> schemaOccurrenceTypes) {
        this.schemaOccurrenceTypes = schemaOccurrenceTypes;
    }

    @OneToMany(mappedBy = "effortTypeSchema")
    @JsonIgnoreProperties({"metricType","description","schemaId","effortTypeOccurrences","effortTypeSchema"})
    public Collection<EffortType> getSchemaEffortTypes() {
        return schemaEffortTypes;
    }

    public void setSchemaEffortTypes(Collection<EffortType> schemaEffortTypes) {
        this.schemaEffortTypes = schemaEffortTypes;
    }

}
