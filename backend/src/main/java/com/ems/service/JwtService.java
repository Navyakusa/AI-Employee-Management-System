package com.ems.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    private static final String SECRET_KEY =
            "VGhpcy1pcy1hLXN1cGVyLXNlY3JldC1rZXktZm9yLWp3dC1hdXRoZW50aWNhdGlvbi0xMjM0NTY=";


    // =========================
    // GENERATE TOKEN
    // =========================
    public String generateToken(
            Long userId,
            String userName,
            String email,
            String role) {

        Map<String, Object> claims = new HashMap<>();

        claims.put("userId", userId);
        claims.put("userName", userName);
        claims.put("email", email);
        claims.put("role", role);

        return Jwts.builder()
                .claims(claims)

                // Keep email as subject because
                // JwtAuthenticationFilter uses it
                .subject(email)

                .issuedAt(
                        new Date(System.currentTimeMillis())
                )

                .expiration(
                        new Date(
                                System.currentTimeMillis()
                                        + 1000 * 60 * 60 * 24
                        )
                )

                .signWith(getSigningKey())
                .compact();
    }


    // =========================
    // EXTRACT EMAIL
    // =========================
    public String extractEmail(String token) {

        return extractClaim(
                token,
                Claims::getSubject
        );
    }


    // =========================
    // EXTRACT USER ID
    // =========================
    public Long extractUserId(String token) {

        return extractClaim(
                token,
                claims -> claims.get("userId", Long.class)
        );
    }


    // =========================
    // EXTRACT USER NAME
    // =========================
    public String extractUserName(String token) {

        return extractClaim(
                token,
                claims -> claims.get("userName", String.class)
        );
    }


    // =========================
    // EXTRACT ROLE
    // =========================
    public String extractRole(String token) {

        return extractClaim(
                token,
                claims -> claims.get("role", String.class)
        );
    }


    // =========================
    // EXTRACT EXPIRATION
    // =========================
    public Date extractExpiration(String token) {

        return extractClaim(
                token,
                Claims::getExpiration
        );
    }


    // =========================
    // EXTRACT CLAIM
    // =========================
    public <T> T extractClaim(
            String token,
            Function<Claims, T> claimsResolver) {

        Claims claims =
                extractAllClaims(token);

        return claimsResolver.apply(claims);
    }


    // =========================
    // EXTRACT ALL CLAIMS
    // =========================
    private Claims extractAllClaims(String token) {

        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }


    // =========================
    // SIGNING KEY
    // =========================
    private SecretKey getSigningKey() {

        byte[] keyBytes =
                Decoders.BASE64.decode(
                        SECRET_KEY
                );

        return Keys.hmacShaKeyFor(
                keyBytes
        );
    }


    // =========================
    // CHECK EXPIRATION
    // =========================
    public boolean isTokenExpired(String token) {

        return extractExpiration(token)
                .before(new Date());
    }


    // =========================
    // VALIDATE TOKEN
    // =========================
    public boolean validateToken(
            String token,
            String email) {

        String extractedEmail =
                extractEmail(token);

        return extractedEmail.equals(email)
                && !isTokenExpired(token);
    }
}