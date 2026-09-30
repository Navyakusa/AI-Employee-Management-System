package com.ems.security;

import com.ems.service.CustomUserDetailsService;
import com.ems.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class
JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        // =====================================================
        // REQUEST INFORMATION
        // =====================================================

        System.out.println(
                "REQUEST: "
                        + request.getMethod()
                        + " "
                        + request.getRequestURI()
        );

        // =====================================================
        // GET AUTHORIZATION HEADER
        // =====================================================

        String authHeader =
                request.getHeader("Authorization");

        System.out.println(
                "Authorization Header: " + authHeader
        );

        // =====================================================
        // NO JWT TOKEN
        // =====================================================

        if (authHeader == null ||
                !authHeader.startsWith("Bearer ")) {

            System.out.println(
                    "No Bearer token found."
            );

            filterChain.doFilter(
                    request,
                    response
            );

            return;
        }

        // =====================================================
        // EXTRACT JWT TOKEN
        // =====================================================

        String token =
                authHeader.substring(7).trim();

        if (token.isEmpty()) {

            System.out.println(
                    "Bearer token is empty."
            );

            filterChain.doFilter(
                    request,
                    response
            );

            return;
        }

        // =====================================================
        // EXTRACT EMAIL FROM JWT
        // =====================================================

        String email;

        try {

            email =
                    jwtService.extractEmail(token);

            System.out.println(
                    "JWT Email: " + email
            );

        } catch (Exception e) {

            System.out.println(
                    "Invalid JWT: "
                            + e.getMessage()
            );

            filterChain.doFilter(
                    request,
                    response
            );

            return;
        }

        // =====================================================
        // AUTHENTICATE USER
        // =====================================================

        if (email != null &&
                !email.isBlank() &&
                SecurityContextHolder
                        .getContext()
                        .getAuthentication() == null) {

            UserDetails userDetails;

            try {

                userDetails =
                        userDetailsService
                                .loadUserByUsername(email);

            } catch (Exception e) {

                System.out.println(
                        "User not found for JWT email: "
                                + email
                );

                filterChain.doFilter(
                        request,
                        response
                );

                return;
            }

            // =================================================
            // VALIDATE JWT
            // =================================================

            boolean valid;

            try {

                valid =
                        jwtService.validateToken(
                                token,
                                userDetails.getUsername()
                        );

            } catch (Exception e) {

                System.out.println(
                        "JWT validation failed: "
                                + e.getMessage()
                );

                filterChain.doFilter(
                        request,
                        response
                );

                return;
            }

            if (valid) {

                // =============================================
                // ORIGINAL AUTHORITIES
                // =============================================

                Collection<? extends GrantedAuthority>
                        originalAuthorities =
                        userDetails.getAuthorities();

                System.out.println(
                        "Original Authorities: "
                                + originalAuthorities
                );

                // =============================================
                // NORMALIZE AUTHORITIES
                // =============================================

                List<GrantedAuthority>
                        normalizedAuthorities =
                        originalAuthorities
                                .stream()
                                .map(this::normalizeAuthority)
                                .collect(Collectors.toList());

                System.out.println(
                        "Normalized Authorities: "
                                + normalizedAuthorities
                );

                // =============================================
                // CREATE AUTHENTICATION
                // =============================================

                UsernamePasswordAuthenticationToken
                        authentication =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                normalizedAuthorities
                        );

                authentication.setDetails(
                        new WebAuthenticationDetailsSource()
                                .buildDetails(request)
                );

                // =============================================
                // STORE AUTHENTICATION
                // =============================================

                SecurityContextHolder
                        .getContext()
                        .setAuthentication(
                                authentication
                        );

                System.out.println(
                        "Authenticated User: "
                                + userDetails.getUsername()
                );

                System.out.println(
                        "Authorities: "
                                + normalizedAuthorities
                );
            } else {

                System.out.println(
                        "JWT is invalid or expired."
                );
            }
        }

        // =====================================================
        // CONTINUE REQUEST
        // =====================================================

        filterChain.doFilter(
                request,
                response
        );
    }

    // =========================================================
    // NORMALIZE ROLE AUTHORITY
    // =========================================================

    private GrantedAuthority normalizeAuthority(
            GrantedAuthority authority) {

        if (authority == null ||
                authority.getAuthority() == null) {

            return authority;
        }

        String authorityName =
                authority.getAuthority().trim();

        // -----------------------------------------------------
        // Already ROLE_ format
        // -----------------------------------------------------

        if (authorityName.startsWith("ROLE_")) {

            return new SimpleGrantedAuthority(
                    authorityName
            );
        }

        // -----------------------------------------------------
        // Convert application role to Spring role
        // -----------------------------------------------------

        if (isApplicationRole(authorityName)) {

            return new SimpleGrantedAuthority(
                    "ROLE_" +
                            authorityName.toUpperCase()
            );
        }

        // -----------------------------------------------------
        // Keep other authorities unchanged
        // -----------------------------------------------------

        return new SimpleGrantedAuthority(
                authorityName
        );
    }

    // =========================================================
    // APPLICATION ROLES
    // =========================================================

    private boolean isApplicationRole(
            String authority) {

        if (authority == null) {
            return false;
        }

        return switch (authority.toUpperCase()) {

            case "CANDIDATE",
                 "EMPLOYEE",
                 "RECRUITER",
                 "HIRING_MANAGER",
                 "EMPLOYER",
                 "INTERVIEWER",
                 "HR",
                 "SUPER_ADMIN" -> true;

            default -> false;
        };
    }
}