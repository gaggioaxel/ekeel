package com.unige.encode.encoderestapi.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import javax.persistence.*;
import java.util.Collection;
import java.util.Objects;

@Entity
@Table(name = "encode_associations_types", schema = "unige_encode_db2", catalog = "")
public class AssociationType {
    private long id;
    private String name;
    private String description;
    private long schemaId;
    private Schema associationTypeSchema;
    private Collection<Association> allAssociations;
    private Collection<Role> associationTypeRoles;

    @Id
    @GeneratedValue
    @Column(name = "id", nullable = false)
    public long getId() { return id; }

    public void setId(long id) { this.id= id;}

    @Basic
    @Column(name = "name", nullable = false, length = 32)
    public String getName() {
        return name;
    }

    public void setName(String name) { this.name = name; }

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
        AssociationType that = (AssociationType) o;
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
    public Schema getAssociationTypeSchema() { return associationTypeSchema; }

    public void setAssociationTypeSchema(Schema associationTypeSchema) { this.associationTypeSchema = associationTypeSchema; }

    @OneToMany(mappedBy = "associationAssociationType")
    @JsonIgnore
    public Collection<Association> getAllAssociations() { return allAssociations; }

    public void setAllAssociations(Collection<Association> allAssociations) { this.allAssociations = allAssociations; }

    @OneToMany(mappedBy = "roleAssociationType")
    @JsonIgnoreProperties({"roleAssociationType","associationTypeId"})
    public Collection<Role> getAssociationTypeRoles() { return associationTypeRoles; }

    public void setAssociationTypeRoles(Collection<Role> associationTypeRoles) { this.associationTypeRoles = associationTypeRoles; }
}
