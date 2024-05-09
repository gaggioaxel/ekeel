/**
 * Alessio De Fabio
 * Version: 1.0
 * Description: Class that model a Jwt authentication response object.
 * Creation date: 11/2017
 */

package com.unige.encode.encoderestapi.security;

import org.springframework.security.core.GrantedAuthority;

import java.io.Serializable;
import java.util.Collection;

public class JwtAuthenticationResponse implements Serializable {

    private static final long serialVersionUID = 1250166508152483573L;

    private final String token;

    public JwtAuthenticationResponse(String token, Collection<? extends GrantedAuthority> authorities) {
        System.out.println("JwtAuthenticationResponse");
        this.token = token;
        System.out.println("JwtAuthenticationResponse__Token: "+token);
    }

    public String getToken() {

        System.out.println("JwtAuthenticationResponse getToken(): "+this.token);
        return this.token;
    }
}
