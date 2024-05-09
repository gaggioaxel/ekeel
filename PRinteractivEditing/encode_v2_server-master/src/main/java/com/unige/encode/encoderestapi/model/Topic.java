package com.unige.encode.encoderestapi.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import javax.persistence.*;
import java.util.*;

@Entity
@Table(name = "encode_topics", schema = "unige_encode_db", catalog = "")
public class Topic {
    private long id;
    private String name;
    private String subjectLocator;
    private String subjectIdentifier;
    private String variantName;
    private long topicmapId;
    private long topicTypeId;
    private Collection<Occurrence> topicOccurrences;
    private List<TopicScope> topicTopicScopes;
    private Topicmap topicTopicmap;
    private TopicType topicTopicType;
    private Collection<TopicAssociationRole> topicTopicAssociationRoles;

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
    @Column(name = "name", nullable = false, length = 128)
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    @Basic
    @Column(name = "subject_locator", nullable = true, length = 2048)
    public String getSubjectLocator() {
        return subjectLocator;
    }

    public void setSubjectLocator(String subjectLocator) {
        this.subjectLocator = subjectLocator;
    }

    @Basic
    @Column(name = "subject_identifier", nullable = true, length = 2048)
    public String getSubjectIdentifier() {
        return subjectIdentifier;
    }

    public void setSubjectIdentifier(String subjectIdentifier) {
        this.subjectIdentifier = subjectIdentifier;
    }

    @Basic
    @Column(name = "variant_name", nullable = false, length = 128)
    public String getVariantName() {
        return variantName;
    }

    public void setVariantName(String variantName) {
        this.variantName = variantName;
    }

    @Basic
    @Column(name = "topicmap_id", nullable = false, insertable = false , updatable=false)
    public long getTopicmapId() {
        return topicmapId;
    }

    public void setTopicmapId(long topicmapId) {
        this.topicmapId = topicmapId;
    }

    @Basic
    @Column(name = "topic_type_id", nullable = false, length = 11, insertable = false , updatable=false)
    public long getTopicTypeId() {
        return topicTypeId;
    }

    public void setTopicTypeId(long topicTypeId) {
        this.topicTypeId = topicTypeId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Topic topic = (Topic) o;
        return id == topic.id &&
                topicmapId == topic.topicmapId &&
                Objects.equals(name, topic.name) &&
                Objects.equals(subjectLocator, topic.subjectLocator) &&
                Objects.equals(subjectIdentifier, topic.subjectIdentifier) &&
                topicTypeId == topic.topicTypeId;
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, name, subjectLocator, subjectIdentifier, topicmapId, topicTypeId);
    }

    @OneToMany(mappedBy = "occurrenceTopic")
    @JsonIgnore
    public Collection<Occurrence> getTopicOccurrences() {
        return topicOccurrences;
    }

    public void setTopicOccurrences(Collection<Occurrence> topicOccurrences) {
        this.topicOccurrences = topicOccurrences;
    }

    @OneToMany(mappedBy = "topic")
    public List<TopicScope> getTopicTopicScopes() {
        return topicTopicScopes;
    }

    public void setTopicTopicScopes(List<TopicScope> topicTopicScopes) {
        this.topicTopicScopes = topicTopicScopes;
    }

    @ManyToOne
    @JoinColumn(name = "topicmap_id", referencedColumnName = "id", nullable = false)
    @JsonIgnore
    public Topicmap getTopicTopicmap() { return topicTopicmap; }

    public void setTopicTopicmap(Topicmap topicTopicmap) {
        this.topicTopicmap = topicTopicmap;
    }

    @ManyToOne
    @JoinColumn(name = "topic_type_id", referencedColumnName = "id", nullable = false)
    @JsonIgnore
    public TopicType getTopicTopicType() {
        return topicTopicType;
    }

    public void setTopicTopicType(TopicType topicTopicType) {
        this.topicTopicType = topicTopicType;
    }

    @OneToMany(mappedBy = "tarTopic")
    @JsonIgnoreProperties({"tarTopic", "associationTopicmap", "tarAssociation", "tarRole", "topicId"})
    public Collection<TopicAssociationRole> getTopicTopicAssociationRoles() {
        return topicTopicAssociationRoles;
    }

    public void setTopicTopicAssociationRoles(Collection<TopicAssociationRole> topicTopicAssociationRoles) {
        this.topicTopicAssociationRoles = topicTopicAssociationRoles;
    }
}
