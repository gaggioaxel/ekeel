package com.unige.encode.encoderestapi.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import javax.persistence.*;
import java.util.Collection;

@Entity
@Table(name = "encode_authorizations", schema = "unige_encode_db2", catalog = "")
public class Authorization {
    private long id;
    private String name;
    private Collection<User> userAuthorizationByAuthorizationsId;

    @Id
    @Column(name = "id", nullable = false)
    public long getId() { return id; }

    public void setId(long id) { this.id = id; }

    @Basic
    @Column(name = "name", nullable = false, length=32)
    public String getName() { return name; }

    public void setName(String name) { this.name = name; }

    /*
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Authorization authorization = (Authorization) o;
        return id == authorization.id &&
                name == authorization.name;
    }

    @Override
    public int hashCode() { return Objects.hash(id, name); }
    */

    //JsonIgnoreProperties enables the fetching of the Users except their collection of Authorizations, to avoid infinite loop
    @ManyToMany(mappedBy = "allUserAuthorizations", fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value="allUserAuthorizations", allowSetters=true)
    public Collection<User> getUserAuthorizationByAuthorizationsId() {
        return userAuthorizationByAuthorizationsId;
    }

    public void setUserAuthorizationByAuthorizationsId(Collection<User> userAuthorizationByAuthorizationsId) {
        this.userAuthorizationByAuthorizationsId = userAuthorizationByAuthorizationsId;
    }
}
