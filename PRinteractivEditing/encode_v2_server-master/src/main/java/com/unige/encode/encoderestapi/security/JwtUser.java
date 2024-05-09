/**
 * Alessio De Fabio
 * Version: 1.0
 * Description: Class that model a JWT user for authenticate an User to encode.
 * Creation date: 11/2017
 */

package com.unige.encode.encoderestapi.security;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;

public class JwtUser implements UserDetails {

    private final String email;
    private final String password;
    private final Collection<? extends GrantedAuthority> authorizations;
    private final boolean enabled;

    public JwtUser(
            String email,
            String password, Collection<? extends GrantedAuthority> authorities,
            boolean enabled
    ) {
        this.email = email;
        System.out.println("JWTUSER auth email: "+ email);
        this.password = password;
        this.authorizations = authorities;
        this.enabled = enabled;
    }


    @Override
    public String getUsername() {
        return email;
    }

    @JsonIgnore
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @JsonIgnore
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @JsonIgnore
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }


    @JsonIgnore
    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorizations;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }

}