package com.unige.encode.encoderestapi.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import javax.persistence.*;
import java.util.Collection;
import java.util.Objects;

@Entity
@Table(name = "encode_topics_associations_roles", schema = "unige_encode_db2", catalog = "")
public class TopicAssociationRole {
    private long id;
    private long associationId;
    private long roleId;
    private long topicId;
    private Association tarAssociation;
    private Role tarRole;
    private Topic tarTopic;

    @Id
    @GeneratedValue
    @Column(name = "id", nullable = false)
    public long getId() { return id; }

    public void setId(long id) { this.id = id; }

    @Basic
    @Column(name = "association_id", nullable = false, insertable = false , updatable=false)
    public long getAssociationId() { return associationId; }

    public void setAssociationId(long associationId) {
        this.associationId = associationId;
    }

    @Basic
    @Column(name = "role_id", nullable = false, insertable = false, updatable = false)
    public long getRoleId() { return roleId; }

    public void setRoleId(long roleId) { this.roleId = roleId; }

    @Basic
    @Column(name = "topic_id", nullable = false, insertable = false , updatable=false)
    public long getTopicId() { return topicId; }

    public void setTopicId(long topicId) {
        this.topicId = topicId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        TopicAssociationRole that = (TopicAssociationRole) o;
        return id == that.id &&
                associationId == that.associationId &&
                roleId == that.roleId &&
                topicId == that.topicId;
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, topicId, roleId, associationId);
    }

    @ManyToOne
    @JoinColumn(name = "association_id", referencedColumnName = "id", nullable = false)
    @JsonIgnore
    public Association getTarAssociation() { return tarAssociation; }

    public void setTarAssociation(Association tarAssociation) { this.tarAssociation = tarAssociation; }


    @ManyToOne
    @JoinColumn(name = "role_id", referencedColumnName = "id", nullable = false)
    @JsonIgnore
    public Role getTarRole() { return tarRole; }

    public void setTarRole(Role tarRole) { this.tarRole = tarRole; }

    @ManyToOne
    @JoinColumn(name = "topic_id", referencedColumnName = "id", nullable = false)
    @JsonIgnore
    public Topic getTarTopic() { return tarTopic; }

    public void setTarTopic(Topic tarTopic) { this.tarTopic = tarTopic; }
}
