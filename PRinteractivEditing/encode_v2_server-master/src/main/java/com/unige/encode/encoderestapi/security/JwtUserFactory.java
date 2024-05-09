/**
 * Alessio De Fabio
 * Version: 1.0
 * Description: A class for create a JWT user.
 * Creation date: 11/2017
 */

package com.unige.encode.encoderestapi.security;

import com.unige.encode.encoderestapi.model.Authorization;
import com.unige.encode.encoderestapi.model.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.List;
import java.util.stream.Collectors;

public final class JwtUserFactory {

    private JwtUserFactory() {
    }

    public static JwtUser create(User user) {
        return new JwtUser(
                user.getEmail(),
                user.getPassword(),
                mapToGrantedAuthorities((List<Authorization>) user.getAllUserAuthorizations()),
                user.getEnabled()
        );
    }

    private static List<GrantedAuthority> mapToGrantedAuthorities(List<Authorization> authorities) {
        return authorities.stream()
                .map(authority -> new SimpleGrantedAuthority(authority.getName()))
                .collect(Collectors.toList());
    }
}