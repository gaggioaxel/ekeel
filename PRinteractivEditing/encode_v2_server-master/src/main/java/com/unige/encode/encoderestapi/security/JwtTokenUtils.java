package com.unige.encode.encoderestapi.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.io.Serializable;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class JwtTokenUtils implements Serializable {

    static final String CLAIM_KEY_USERNAME = "sub";
    static final String CLAIM_KEY_CREATED = "iat";
    static final String CLAIM_KEY_AUTHORITIES = "roles";
    static final String CLAIM_KEY_IS_ENABLED = "isEnabled";

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private Long expiration;

    public Date getCreatedDateFromToken(String token) {
        System.out.println("getCreatedDateFromToken");
        Date created;
        try {
            final Claims claims = getClaimsFromToken(token);
            created = new Date((Long) claims.get(CLAIM_KEY_CREATED));
        } catch (Exception e) {
            created = null;
        }
        return created;
    }

    public String generateToken(UserDetails userDetails){
        System.out.println("generateToken1");
        Map<String, Object> claims = new HashMap<>();
        claims.put(CLAIM_KEY_USERNAME, userDetails.getUsername());
        claims.put(CLAIM_KEY_CREATED, new Date());
        List<String> auth = userDetails.getAuthorities().stream().map(role->role.getAuthority()).collect(Collectors.toList());
        claims.put(CLAIM_KEY_AUTHORITIES, auth);
        claims.put(CLAIM_KEY_IS_ENABLED, userDetails.isEnabled());
        return generateToken(claims);
    }

    private String generateToken(Map<String, Object> claims){
        System.out.println("generateToken2");
        return Jwts.builder()
                .setClaims(claims)
                .setExpiration(generateExpirationDate())
                .signWith(SignatureAlgorithm.HS256, secret)
                .compact();
    }

    public JwtUser getUserDetails(String token) {
        System.out.println("getUserDetails");
        if(token == null){
            return null;
        }
        try {
            final Claims claims = getClaimsFromToken(token);
            List<SimpleGrantedAuthority> authorities = null;
            if (claims.get(CLAIM_KEY_AUTHORITIES) != null) {
                authorities = ((List<String>) claims.get(CLAIM_KEY_AUTHORITIES)).stream().map(role-> new SimpleGrantedAuthority(role)).collect(Collectors.toList());
            }

            return new JwtUser(
                    claims.getSubject(),
                    "",
                    authorities,
                    (boolean) claims.get(CLAIM_KEY_IS_ENABLED)
            );
        } catch (Exception e) {
            return null;
        }

    }

    private Claims getClaimsFromToken(String token) {
        System.out.println("getClaimsFromToken");
        Claims claims;
        try {
            claims = Jwts.parser()
                    .setSigningKey(secret)
                    .parseClaimsJws(token)
                    .getBody();
            System.out.println("getClaimsFromToken CLAIMS: "+ claims);
        } catch (Exception e) {
            claims = null;
        }
        return claims;
    }

    public Boolean validateToken(String token, UserDetails userDetails) {
        JwtUser user = (JwtUser) userDetails;
        System.out.println("validateToken IN, email"+getEmailFromToken(token));
        final String email = getEmailFromToken(token);
        return (
                email.equals(user.getUsername())
                        && !isTokenExpired(token));
    }

    public String getEmailFromToken(String token) {
        System.out.println("getEmailFromToken");
        String email;
        try {
            final Claims claims = getClaimsFromToken(token);
            email = claims.getSubject();
        } catch (Exception e) {
            email = null;
        }
        return email;
    }

    private Boolean isTokenExpired(String token) {
        System.out.println("isTokenExpired");
        final Date expiration = getExpirationDateFromToken(token);
        return expiration.before(new Date());
    }

    public Date getExpirationDateFromToken(String token) {
        System.out.println("getExpirationDateFromToken");
        Date expiration;
        try {
            final Claims claims = getClaimsFromToken(token);
            expiration = claims.getExpiration();
        } catch (Exception e) {
            expiration = null;
        }
        return expiration;
    }

    private Date generateExpirationDate() {
        System.out.println("generateExpirationDate");
        return new Date(System.currentTimeMillis() + expiration * 1000);
    }

    public String refreshToken(String token) {
        System.out.println("RefreshToken");
        String refreshedToken;
        try {
            final Claims claims = getClaimsFromToken(token);
            claims.put(CLAIM_KEY_CREATED, new Date());
            refreshedToken = generateToken(claims);
        } catch (Exception e) {
            refreshedToken = null;
        }
        return refreshedToken;
    }

    public Boolean canTokenBeRefreshed(String token) {
        System.out.println("canTokenBeRefreshed");
        final Date created = getCreatedDateFromToken(token);
        return  (!isTokenExpired(token));
    }
}
