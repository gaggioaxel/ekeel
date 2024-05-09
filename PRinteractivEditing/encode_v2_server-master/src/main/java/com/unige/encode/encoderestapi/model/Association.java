package com.unige.encode.encoderestapi.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import javax.persistence.*;
import java.util.Collection;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "encode_associations", schema = "unige_encode_db2", catalog = "")
public class Association {
    private long id;
    private long topicmapId;
    private long associationTypeId;
    private Topicmap associationTopicmap;
    private AssociationType associationAssociationType;
    private Collection<TopicAssociationRole> associationTopicAssociationRoles;
    private List<AssociationScope> associationAssociationScopes;

    @Id
    @GeneratedValue
    @Column(name = "id", nullable = false)
    public long getId() { return id; }

    public void setId(long id) { this.id = id; }

    @Basic
    @Column(name = "association_type_id", nullable = false, insertable = false , updatable=false)
    public long getAssociationTypeId() { return associationTypeId; }

    public void setAssociationTypeId(long associationTypeId) {
        this.associationTypeId = associationTypeId;
    }

    @Basic
    @Column(name = "topicmap_id", nullable = false, insertable = false , updatable=false)
    public long getTopicmapId() { return topicmapId; }

    public void setTopicmapId(long topicmapId) {
        this.topicmapId = topicmapId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Association that = (Association) o;
        return id == that.id &&
                topicmapId == that.topicmapId &&
                associationTypeId == that.associationTypeId;
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, topicmapId, associationTypeId);
    }

    @OneToMany(mappedBy = "association")
    public List<AssociationScope> getAssociationAssociationScopes() {
        return associationAssociationScopes;
    }

    public void setAssociationAssociationScopes(List<AssociationScope> associationAssociationScopes) {
        this.associationAssociationScopes = associationAssociationScopes;
    }

    @ManyToOne
    @JoinColumn(name = "association_type_id", referencedColumnName = "id", nullable = false)
    @JsonIgnore
    public AssociationType getAssociationAssociationType() { return associationAssociationType; }

    public void setAssociationAssociationType(AssociationType associationAssociationType) {
        this.associationAssociationType = associationAssociationType;
    }

    @ManyToOne
    @JoinColumn(name = "topicmap_id", referencedColumnName = "id", nullable = false)
    @JsonIgnore
    public Topicmap getAssociationTopicmap() { return associationTopicmap; }

    public void setAssociationTopicmap(Topicmap associationTopicmap) { this.associationTopicmap = associationTopicmap; }


    @OneToMany(mappedBy = "tarAssociation")
    @JsonIgnoreProperties("associationId")
    public Collection<TopicAssociationRole> getAssociationTopicAssociationRoles() {
        return associationTopicAssociationRoles;
    }

    public void setAssociationTopicAssociationRoles(Collection<TopicAssociationRole> associationTopicAssociationRoles) {
        this.associationTopicAssociationRoles = associationTopicAssociationRoles;
    }
}
