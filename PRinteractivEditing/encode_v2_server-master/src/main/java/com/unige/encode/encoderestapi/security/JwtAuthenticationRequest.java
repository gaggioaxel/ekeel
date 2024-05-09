/**
 * Alessio De Fabio
 * Version: 1.0
 * Description: Class that model a Jwt authentication request object.
 * Creation date: 11/2017
 */

package com.unige.encode.encoderestapi.security;

import java.io.Serializable;


public class JwtAuthenticationRequest implements Serializable {

    private static final long serialVersionUID = -8445943548965154778L;

    private String email;
    private String password;

    public JwtAuthenticationRequest() {
        super();
    }

    public JwtAuthenticationRequest(String email, String password) {
        this.setEmail(email);
        System.out.println("JWT auth email: "+ email);
        this.setPassword(password);
        System.out.println("JWT auth pass: "+ password);
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return this.password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
