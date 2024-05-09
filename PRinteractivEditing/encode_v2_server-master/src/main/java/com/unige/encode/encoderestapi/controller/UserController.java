package com.unige.encode.encoderestapi.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.unige.encode.encoderestapi.model.Authorization;
import com.unige.encode.encoderestapi.model.User;
import com.unige.encode.encoderestapi.security.JwtAuthenticationRequest;
import com.unige.encode.encoderestapi.security.JwtAuthenticationResponse;
import com.unige.encode.encoderestapi.security.JwtTokenUtils;
import com.unige.encode.encoderestapi.service.AuthorizationServiceImpl;
import com.unige.encode.encoderestapi.service.UserServiceImpl;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.validation.Valid;
import java.security.Principal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@RestController
@Api(value = "User Management System")
public class UserController {

    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    @Value("${jwt.header}")
    private String tokenHeader;

    @Autowired private AuthenticationManager authenticationManager;
    @Autowired private UserServiceImpl userService;
    @Autowired private AuthorizationServiceImpl authorizationService;
    @Autowired private UserDetailsService userDetailsService;
    @Autowired private JwtTokenUtils jwtTokenUtils;

    @ApiOperation(value = "Register a user", response = List.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, response = void.class, message = "Successfully added new user"),
            @ApiResponse(code = 409, response = void.class, message = "If a user already uses this email")
    })
    @RequestMapping(value = "public/v1/registration", method = RequestMethod.POST, produces = "application/json")
    public ResponseEntity<?> createStandardUser(@RequestBody @Valid User newUser){

        logger.info("Received a sign-up request from user: {}", newUser.getEmail());

        /*If the user is already registered notify an error to the client*/
        if(!userService.existsUserByEmail(newUser.getEmail())){

            List<Authorization> authorizations = new ArrayList<>();
            authorizations.add(authorizationService.getAuthorizationByName("ROLE_USER"));
            newUser.setAllUserAuthorizations(authorizations);
            newUser.setPassword(encryptPassword(newUser.getPassword()));
            newUser.setEnabled(true);
            userService.saveUser(newUser);
            logger.info("User {} correctly registered.", newUser.getEmail());
            return new ResponseEntity<>(Collections.singletonMap("message", "User " + newUser.getUsername() + " correctly signed up!"), HttpStatus.CREATED);

        }else{
            logger.error("User {} already exists error.", newUser.getEmail());
            return new ResponseEntity<>(Collections.singletonMap("message", "Email already exists, please specify another email!"), HttpStatus.CONFLICT);
        }
    }

    @ApiOperation(value = "Log the user", response = List.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, response = void.class, message = "Successfully authenticated user, sending back token"),
            @ApiResponse(code = 401, response = void.class, message = "If authentication fails (wrong password or email)")
    })
    @RequestMapping(value = "/public/v1/login", method = RequestMethod.POST, produces = "application/json")
    public ResponseEntity<?> loginUser (@RequestBody JwtAuthenticationRequest jwtAuthenticationRequest, HttpServletResponse response) throws AuthenticationException, JsonProcessingException {

        logger.info("Received an authentication request from: {}", jwtAuthenticationRequest.getEmail());
        System.out.println("LoginUser__Httpservlet response: "+response);
        /*Carry out the authentication..*/
        final Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        jwtAuthenticationRequest.getEmail(),
                        jwtAuthenticationRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);//setta autenticazione dopo il login
        System.out.println("LoginUser__authentication: "+authentication);

        /*..get user details..*/
        final UserDetails userDetails = userDetailsService.loadUserByUsername(jwtAuthenticationRequest.getEmail());
        System.out.println("LoginUser__UserDetails: "+userDetails);

        /*..generate token..*/
        final String token = jwtTokenUtils.generateToken(userDetails);
        response.setHeader(tokenHeader, token);

        logger.info("User authenticated: {}", userDetails.getUsername());
        logger.info("Generated token: {}", token);

        return ResponseEntity.ok(new JwtAuthenticationResponse(token,userDetails.getAuthorities()));
    }


    @ApiOperation(value = "Refresh the token", response = List.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, response = void.class, message = "Successfully refreshed the token"),
            @ApiResponse(code = 400, response = void.class, message = "Cannot refresh token")
    })
    @RequestMapping(value = "/protected/v1/refresh-token", method = RequestMethod.GET) //was protected
    public ResponseEntity<?> refreshAndGetAuthenticationToken(HttpServletRequest request, HttpServletResponse response) {
        String token = request.getHeader(tokenHeader);
        System.out.println("refresh-token request "+request );
        System.out.println("refresh-token request "+response );
        System.out.println("refresh-token token "+token );
        System.out.println("refresh-token header__ UserDetails Principal"+ SecurityContextHolder.getContext().getAuthentication().getPrincipal());
        UserDetails userDetails =
                (UserDetails)SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (jwtTokenUtils.canTokenBeRefreshed(token)) {
            String refreshedToken = jwtTokenUtils.refreshToken(token);
            response.setHeader(tokenHeader,refreshedToken);
            return ResponseEntity.ok(new JwtAuthenticationResponse(userDetails.getUsername(),userDetails.getAuthorities()));
        } else {
            System.out.println("refresh-token token null" );
            return ResponseEntity.badRequest().body(null);
        }
    }


    @ApiOperation(value = "Refresh the token", response = List.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, response = void.class, message = "Successfully retrieved users"),
            @ApiResponse(code = 404, response = void.class, message = "If user does not exist")
    })
    @RequestMapping(value = "/protected/v1/users", method = RequestMethod.GET, produces = "application/json")// //was protected
    public ResponseEntity<?> getAllUser(Principal principal){
        System.out.println("/public/v1/users principal: "+principal);
        String principalName = principal.getName();
        logger.info("User {} requested all users.", principalName);

        //Check that user exists
        if(!userService.existsUserByEmail(principalName)) {
            logger.error("Problem during authentication.");
            return new ResponseEntity<>(Collections.singletonMap("message","No User found with this email: " + principalName), HttpStatus.NOT_FOUND);
        }

        //Get all users
        List<User> users = userService.getAllUsers();
        logger.info("Found all Users.");
        return new ResponseEntity<>(users, HttpStatus.OK);
    }


    @ApiOperation(value = "Delete the user", response = List.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, response = void.class, message = "Successfully deleted user"),
            @ApiResponse(code = 400, response = void.class, message = "User does not have the right to delete the user"),
            @ApiResponse(code = 404, response = void.class, message = "User or user to delete do not exist")
    })
    @RequestMapping(value = "/protected/v1/user", method = RequestMethod.DELETE, produces = "application/json")//was Protected
    public ResponseEntity<?> deleteUser(@RequestParam("email") String email, Principal principal){
        String principalName = principal.getName();
        logger.info("Received a DELETE request from User {} for User with email: {}.", principalName, email);

        //Check that user exists
        if(!userService.existsUserByEmail(principalName)) {
            logger.error("Problem during authentication.");
            return new ResponseEntity<>(Collections.singletonMap("message","No User found with this email: " + principalName), HttpStatus.NOT_FOUND);
        }

        //Check that user to delete exists
        if(!userService.existsUserByEmail(email)) {
            logger.error("User {} not found.", email);
            return new ResponseEntity<>(Collections.singletonMap("message","No User found with this email: " + email), HttpStatus.NOT_FOUND);
        }

        //Check that the user has the right == delete himself OR is admin
        if(!userService.isUserAdmin(email) || !email.equals(principalName)){
            logger.error("User {} does not have the right to delete User {}.", principalName, email);
            return new ResponseEntity<>(Collections.singletonMap("message","User cannot delete this email."), HttpStatus.FORBIDDEN);
        }

        //Delete user
        userService.deleteUserByEmail(email);
        logger.info("User {} deleted.", email);
        return new ResponseEntity<>(Collections.singletonMap("message","Deleted User with email: " + email), HttpStatus.OK);

    }

    private String encryptPassword(String password){
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        return encoder.encode(password);
    }
}
