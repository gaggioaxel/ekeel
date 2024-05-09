// NOT IMPLEMENTED YET

/*
package com.unige.encode.encoderestapi.controller;

import com.unige.encode.encoderestapi.model.Authorization;
import com.unige.encode.encoderestapi.model.User;
import com.unige.encode.encoderestapi.security.JwtTokenUtils;
import com.unige.encode.encoderestapi.service.AuthorizationServiceImpl;
import com.unige.encode.encoderestapi.service.UserServiceImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class AuthorizationController {

    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Value("${jwt.header}")
    private String tokenHeader;

    @Autowired private AuthenticationManager authenticationManager;
    @Autowired private UserServiceImpl userService;
    @Autowired private UserDetailsService userDetailsService;
    @Autowired private JwtTokenUtils jwtTokenUtils;
    @Autowired private AuthorizationServiceImpl authorizationService;


    @RequestMapping(value = "/protected/v1/authorizations", method = RequestMethod.GET, produces = "application/json")
    public ResponseEntity<?> getAllAuthorizations(){

        logger.info("Searching all users.");
        authorizationService.getAuthorizationById(1);
        List<Authorization> authorizations = authorizationService.getAllAuthorizations();

        return new ResponseEntity<>(authorizations, HttpStatus.OK);
    }
}
 */