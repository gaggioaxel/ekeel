package com.unige.encode.encoderestapi.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import javax.persistence.*;
import java.sql.Timestamp;
import java.util.Collection;
import java.util.Objects;
import java.util.Set;

@Entity
@Table(name = "encode_topicmaps", schema = "unige_encode_db2", catalog = "")
public class Topicmap {
    private long id;
    private String title;
    private Timestamp creationDate;
    private Timestamp lastModifyDate;
    private String description;
    private String version;
    private long schemaId;
    private Schema topicmapSchema;
    private Collection<Association> allAssociations;
    private Set<User> editors;
    private Collection<Topic> allTopics;

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
    @Column(name = "title", nullable = false, length = 60)
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    @Basic
    @Column(name = "creation_date", nullable = false)
    public Timestamp getCreationDate() {
        return creationDate;
    }

    public void setCreationDate(Timestamp creationDate) {
        this.creationDate = creationDate;
    }

    @Basic
    @Column(name = "last_modify_date")
    public Timestamp getLastModifyDate() {
        return lastModifyDate;
    }

    public void setLastModifyDate(Timestamp lastModifyDate) {
        this.lastModifyDate = lastModifyDate;
    }

    @Basic
    @Column(name = "description", nullable = true, length = 200)
    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    @Basic
    @Column(name = "version", nullable = true, length = 8)
    public String getVersion() {
        return version;
    }

    public void setVersion(String version) {
        this.version = version;
    }

    @Basic
    @Column(name = "schema_id", nullable = false, insertable = false , updatable=false)
    public long getSchemaId() { return schemaId; }

    public void setSchemaId(long schemaId) { this.schemaId = schemaId; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Topicmap topicmap = (Topicmap) o;
        return id == topicmap.id &&
                Objects.equals(title, topicmap.title) &&
                Objects.equals(creationDate, topicmap.creationDate) &&
                Objects.equals(description, topicmap.description) &&
                Objects.equals(version, topicmap.version) &&
                Objects.equals(lastModifyDate, topicmap.lastModifyDate);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, title, creationDate, description, version, lastModifyDate);
    }

    @OneToMany(mappedBy = "associationTopicmap")
    @JsonIgnoreProperties({"topicmapId","associationTopicmap","associationTopicAssociationRoles","associationAssociationType","associationAssociationScopes","associationTypeId"})/* "associationTopicAssociationRoles","associationTypeId",*/
    public Collection<Association> getAllAssociations() {
        return allAssociations;
    }

    public void setAllAssociations(Collection<Association> allAssociations) {
        this.allAssociations = allAssociations;
    }

    @OneToMany(mappedBy = "topicTopicmap")
    @JsonIgnoreProperties({"subjectLocator","subjectIdentifier","variantName","topicmapId","topicOccurrences","topicTopicScopes","topicTopicmap","topicTopicType","topicTopicAssociationRoles"})/*"name","topicTypeId",*/
    public Collection<Topic> getAllTopics() {
        return allTopics;
    }

    public void setAllTopics(Collection<Topic> allTopics) {
        this.allTopics = allTopics;
    }

    @ManyToOne
    @JoinColumn(name = "schema_id", referencedColumnName = "id", nullable = false)
    @JsonIgnore
    public Schema getTopicmapSchema() { return topicmapSchema; }

    public void setTopicmapSchema(Schema topicmapSchema) { this.topicmapSchema = topicmapSchema; }


    //JsonIgnoreProperties enables the fetching of the Users except their collection of Topicmaps, to avoid infinite loop
    @ManyToMany(mappedBy = "allUserSharedTopicmap", fetch = FetchType.LAZY)
    @JsonIgnoreProperties({"password", "username", "firstName", "lastName", "enabled", "creationDate", "allUserSharedTopicmap", "allUserAuthorizations"})
    public Set<User> getEditors() { return editors; }

    public void setEditors(Set<User> editors) { this.editors = editors; }
}
