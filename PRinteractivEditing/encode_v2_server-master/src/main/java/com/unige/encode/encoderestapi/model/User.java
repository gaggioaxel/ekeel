package com.unige.encode.encoderestapi.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import javax.persistence.*;
import java.sql.Timestamp;
import java.util.Collection;
import java.util.Objects;
import java.util.Set;

@Entity
@Table(name = "encode_users", schema = "unige_encode_db2", catalog = "")
public class User {
    private String email;
    private String username;
    private String password;
    private String firstName;
    private String lastName;
    private boolean enabled;
    private Timestamp creationDate;
    private Collection<Schema> allUserSchemas;
    private Set<Topicmap> allUserSharedTopicmap;
    private Collection<Authorization> allUserAuthorizations;

    @Id
    @Column(name = "email", nullable = false, length = 60)
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    @Basic
    @Column(name = "username", nullable = false, length = 50)
    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    @Basic
    @Column(name = "password", nullable = false, length = 100)
    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    @Basic
    @Column(name = "enabled", nullable = false)
    public boolean getEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    @Basic
    @Column(name = "creation_date", nullable = true)
    public Timestamp getCreationDate() {
        return creationDate;
    }

    public void setCreationDate(Timestamp creationDate) {
        this.creationDate = creationDate;
    }

    @Basic
    @Column(name = "first_name", nullable = false, length = 64)
    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    @Basic
    @Column(name = "last_name", nullable = false, length = 64)
    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        User user = (User) o;
        return enabled == user.enabled &&
                Objects.equals(email, user.email) &&
                Objects.equals(username, user.username) &&
                Objects.equals(password, user.password) &&
                Objects.equals(creationDate, user.creationDate);
    }

    @Override
    public int hashCode() {
        return Objects.hash(email, username, password, enabled, creationDate);
    }

    @OneToMany(mappedBy = "schemaOwner")
    @JsonIgnore
    public Collection<Schema> getAllUserSchemas() {
        return allUserSchemas;
    }

    public void setAllUserSchemas(Collection<Schema> allUserSchemas) {
        this.allUserSchemas = allUserSchemas;
    }

    /*Representation of cardinality many to Many between UserInfo and Authority table
     *A Join table for represent many to many cardinality, it represents which roles each individual user has*/
    //JsonIgnoreProperties enables the fetching of the Authorizations except their collection of Users, to avoid infinite loop
    @ManyToMany(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value="userAuthorizationByAuthorizationsId", allowSetters=true)
    @JoinTable(
            name = "encode_users_authorizations",
            joinColumns = {@JoinColumn(name = "user_email", referencedColumnName = "email")},
            inverseJoinColumns = {@JoinColumn(name = "authorization_id", referencedColumnName = "id")})
    public Collection<Authorization> getAllUserAuthorizations() {
        return allUserAuthorizations;
    }

    public void setAllUserAuthorizations(Collection<Authorization> allUserAuthorizations) { this.allUserAuthorizations = allUserAuthorizations; }

    //JsonIgnoreProperties enables the fetching of the Topicmaps shared except their collection of Users, to avoid infinite loop
    @ManyToMany(fetch = FetchType.LAZY)
    @JsonIgnoreProperties({"password","title","creationDate","lastModifyDate","description","version","schemaId","topicmapSchema","allAssociations","editors","allTopics"})
    @JoinTable(
            name = "encode_editors",
            joinColumns = {@JoinColumn(name = "user_email", referencedColumnName = "email")},
            inverseJoinColumns = {@JoinColumn(name = "topicmap_id", referencedColumnName = "id")})
    public Set<Topicmap> getAllUserSharedTopicmap() {
        return allUserSharedTopicmap;
    }

    public void setAllUserSharedTopicmap(Set<Topicmap> allUserSharedTopicmap) { this.allUserSharedTopicmap = allUserSharedTopicmap; }
}
