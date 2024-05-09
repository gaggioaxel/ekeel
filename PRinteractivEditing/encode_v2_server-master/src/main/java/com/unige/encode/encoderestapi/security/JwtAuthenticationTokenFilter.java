/**
 * Alessio De Fabio
 * Version: 1.0
 * Description: Class that model an entrypoint filter for authentication to encode.
 * Creation date: 11/2017
 */

package com.unige.encode.encoderestapi.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public class JwtAuthenticationTokenFilter extends OncePerRequestFilter {


    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private JwtTokenUtils jwtTokenUtils;

    @Value("${jwt.header}")
    private String tokenHeader;


    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws ServletException, IOException {
        String authToken = request.getHeader(this.tokenHeader);

        UserDetails userDetails = null;
        System.out.println("\n JWT authenticationT filter -> AUTHTOKEN:  " + authToken);
        System.out.println("JWT authenticationT filter -> request.getHeader:  " + request.getHeader(this.tokenHeader));
        if(authToken != null){
            userDetails = jwtTokenUtils.getUserDetails(authToken);//stampe da fare
        }

        if (userDetails != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            System.out.println("JWT authT filter -> userDetails != null && SecurityContextHolder.getContext().getAuthentication() == null");

            // Token integrity control
            if (jwtTokenUtils.validateToken(authToken, userDetails)) {
                System.out.println("JWT authT filter VALIDATE TOKEN-> AUTHTOKEN: "+authToken+" USERDETAILS:  "+userDetails);
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }
        System.out.println("JWT authT filter request & response:"+request+" e "+response);
        chain.doFilter(request, response);
    }
}