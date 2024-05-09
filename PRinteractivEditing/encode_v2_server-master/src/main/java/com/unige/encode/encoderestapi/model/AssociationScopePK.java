package com.unige.encode.encoderestapi.model;

import java.io.Serializable;
import javax.persistence.*;


@Embeddable
public class AssociationScopePK implements Serializable {
    //default serial version id, required for serializable classes.
    private static final long serialVersionUID = 1L;

    private long association_id;
    private long scope_id;

    @Column(name="association_id")
    public long getAssociationId() { return this.association_id; }

    public void setAssociationId(long associationId) { this.association_id = associationId; }

    @Column(name="scope_id")
    public long getScopeId() { return this.scope_id; }

    public void setScopeId(long scopeId) { this.scope_id = scopeId; }

    public AssociationScopePK() {}

    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        AssociationScopePK that = (AssociationScopePK) o;
        return this.association_id == that.association_id &&
                this.scope_id == that.scope_id;
    }

    public int hashCode() {
        final int prime = 31;
        int hash = 17;
        hash = hash * prime + Long.hashCode(this.association_id);
        hash = hash * prime + Long.hashCode(this.scope_id);

        return hash; }
}