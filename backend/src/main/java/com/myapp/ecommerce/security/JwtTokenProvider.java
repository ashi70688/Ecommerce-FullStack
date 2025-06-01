package com.myapp.ecommerce.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtTokenProvider {

    private static final String AUTHORITIES_KEY = "auth";
    private static final String TOKEN_TYPE = "type";
    private static final String ACCESS_TOKEN = "access";
    private static final String REFRESH_TOKEN = "refresh";

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    @Value("${jwt.refresh-expiration:604800000}") // 7 days default
    private long refreshExpiration;

    private SecretKey key;

    @PostConstruct
    protected void init() {
        this.key = Keys.hmacShaKeyFor(Base64.getDecoder().decode(jwtSecret));
    }

    public String createAccessToken(Authentication authentication) {
        return createToken(authentication, jwtExpiration, ACCESS_TOKEN);
    }

    public String createRefreshToken(Authentication authentication) {
        return createToken(authentication, refreshExpiration, REFRESH_TOKEN);
    }

    private String createToken(Authentication authentication, long expiration, String tokenType) {
        String username = authentication.getName();
        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();

        Instant now = Instant.now();
        Instant expiryDate = now.plusMillis(expiration);

        return Jwts.builder()
                .claims()
                .subject(username)
                .add(AUTHORITIES_KEY, authorities.stream()
                        .map(GrantedAuthority::getAuthority)
                        .collect(Collectors.joining(",")))
                .add(TOKEN_TYPE, tokenType)
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiryDate))
                .and()
                .signWith(key)
                .compact();
    }

    public Authentication getAuthentication(String token) {
        Claims claims = extractClaims(token);

        String authoritiesString = claims.get(AUTHORITIES_KEY, String.class);
        Collection<? extends GrantedAuthority> authorities = Arrays.stream(
                authoritiesString.split(","))
                .filter(auth -> !auth.trim().isEmpty())
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());

        User principal = new User(claims.getSubject(), "", authorities);
        return new UsernamePasswordAuthenticationToken(principal, token, authorities);
    }

    public boolean validateToken(String token) {
        try {
            Claims claims = extractClaims(token);

            // Check if token is expired
            if (claims.getExpiration().before(new Date())) {
                log.warn("JWT token is expired");
                return false;
            }

            // Validate token type
            String tokenType = claims.get(TOKEN_TYPE, String.class);
            if (!ACCESS_TOKEN.equals(tokenType)) {
                log.warn("Invalid token type");
                return false;
            }

            return true;
        } catch (SignatureException e) {
            log.error("Invalid JWT signature", e);
        } catch (MalformedJwtException e) {
            log.error("Invalid JWT token", e);
        } catch (ExpiredJwtException e) {
            log.error("Expired JWT token", e);
        } catch (UnsupportedJwtException e) {
            log.error("Unsupported JWT token", e);
        } catch (IllegalArgumentException e) {
            log.error("JWT claims string is empty", e);
        }
        return false;
    }

    public boolean validateRefreshToken(String token) {
        try {
            Claims claims = extractClaims(token);

            // Check if token is expired
            if (claims.getExpiration().before(new Date())) {
                log.warn("Refresh token is expired");
                return false;
            }

            // Validate token type
            String tokenType = claims.get(TOKEN_TYPE, String.class);
            if (!REFRESH_TOKEN.equals(tokenType)) {
                log.warn("Invalid token type for refresh token");
                return false;
            }

            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.error("Error validating refresh token", e);
            return false;
        }
    }

    private Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
