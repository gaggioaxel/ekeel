package com.unige.encode.encoderestapi.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

import java.io.Serializable;
import javax.persistence.*;

@Entity
@Table(name="encode_associations_scopes")
public class AssociationScope implements Serializable {
    private static final long serialVersionUID = 1L;

    @EmbeddedId
    private AssociationScopePK id;

    @Basic
    @Column(name = "content", length = 32)
    private String content;

    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name="scope_id", insertable=false, updatable=false)
    private Scope scope;

    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name="association_id", insertable=false, updatable=false)
    private Association association;

    public AssociationScope() {
    }

    public AssociationScopePK getId() {
        return this.id;
    }

    public void setId(AssociationScopePK id) {
        this.id = id;
    }

    public String getContent() {
        return this.content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    @JsonIgnore
    public Association getAssociation() {
        return association;
    }

    public void setAssociation(Association association) {
        this.association = association;
    }

    @JsonIgnore
    public Scope getScope() {
        return scope;
    }

    public void setScope(Scope scope) {
        this.scope = scope;
    }
}