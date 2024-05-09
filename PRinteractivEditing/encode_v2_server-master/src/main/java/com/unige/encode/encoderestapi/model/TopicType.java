package com.unige.encode.encoderestapi.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import javax.persistence.*;
import java.util.Collection;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "encode_topics_types", schema = "unige_encode_db2", catalog = "")
public class TopicType {
    private long id;
    private String name;
    private String description;
    private long schemaId;
    private Schema topicTypeSchema;
    private Collection<Topic> topicTypeTopics;
    private List<Role> topicTypeRoles;

    @Id
    @GeneratedValue
    @Column(name = "id", nullable = false)
    public long getId() { return id; }

    public void setId(long id) { this.id = id;}

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
        TopicType that = (TopicType) o;
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
    public Schema getTopicTypeSchema() { return topicTypeSchema; }

    public void setTopicTypeSchema(Schema topicTypeSchema) { this.topicTypeSchema = topicTypeSchema; }

    @OneToMany(mappedBy = "topicTopicType")
    @JsonIgnore
    public Collection<Topic> getTopicTypeTopics() {
        return topicTypeTopics;
    }

    public void setTopicTypeTopics(Collection<Topic> topicTypeTopics) {
        this.topicTypeTopics = topicTypeTopics;
    }

    //JsonIgnoreProperties enables the fetching of the Users except their collection of Authorizations, to avoid infinite loop
    @ManyToMany(mappedBy = "roleTopicTypes", fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value={"roleTopicTypes","schemaId", "associationTypeSchema", "allAssociations", "associationTypeRoles"}, allowSetters=true)
    public List<Role> getTopicTypeRoles() {
        return topicTypeRoles;
    }

    public void setTopicTypeRoles(List<Role> topicTypeRoles) {
        this.topicTypeRoles = topicTypeRoles;
    }
}
