package com.unige.encode.encoderestapi.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import javax.persistence.*;
import java.util.Collection;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "encode_roles", schema = "unige_encode_db2", catalog = "")
public class Role {
    private long id;
    private String name;
    private String description;
    private long associationTypeId;
    private AssociationType roleAssociationType;
    private List<TopicType> roleTopicTypes;
    private Collection<TopicAssociationRole> roleTopicAssociationRoles;

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

    @Basic
    @Column(name = "association_type_id", nullable = false, insertable = false , updatable=false)
    public long getAssociationTypeId() { return associationTypeId; }

    public void setAssociationTypeId(long associationTypeId) {
        this.associationTypeId = associationTypeId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Role role = (Role) o;
        return id == role.id &&
                Objects.equals(name, role.name) &&
                Objects.equals(description, role.description) &&
                associationTypeId == role.associationTypeId;
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, name, description, associationTypeId);
    }

    @ManyToOne
    @JoinColumn(name = "association_type_id", referencedColumnName = "id", nullable = false)
    @JsonIgnoreProperties("allRoles")
    public AssociationType getRoleAssociationType() { return roleAssociationType; }

    public void setRoleAssociationType(AssociationType roleAssociationType) { this.roleAssociationType = roleAssociationType; }


    @ManyToMany(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value={"schemaId", "topicTypeSchema", "topicTypeTopics", "topicTypeRoles"}, allowSetters=true)
    @JoinTable(
            name = "encode_roles_topics_types",
            joinColumns = {@JoinColumn(name = "role_id", referencedColumnName = "id")},
            inverseJoinColumns = {@JoinColumn(name = "topic_type_id", referencedColumnName = "id")})
    public List<TopicType> getRoleTopicTypes() {
        return roleTopicTypes;
    }

    public void setRoleTopicTypes(List<TopicType> roleTopicTypes) {
        this.roleTopicTypes = roleTopicTypes;
    }

    @OneToMany(mappedBy = "tarRole")
    @JsonIgnoreProperties({"tarRole", "tarTopic", "tarAssociation", "roleId"})
    public Collection<TopicAssociationRole> getRoleTopicAssociationRoles() {
        return roleTopicAssociationRoles;
    }

    public void setRoleTopicAssociationRoles(Collection<TopicAssociationRole> roleTopicAssociationRoles) {
        this.roleTopicAssociationRoles = roleTopicAssociationRoles;
    }
}
