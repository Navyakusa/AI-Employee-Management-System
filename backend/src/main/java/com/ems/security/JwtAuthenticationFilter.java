
package com.ems.security;

import com.ems.service.CustomUserDetailsService;
import com.ems.service.JwtService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

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
import java.util.Locale;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            CustomUserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        System.out.println(
                "REQUEST: " + request.getMethod()
                        + " " + request.getRequestURI()
        );

        String authHeader = request.getHeader("Authorization");

        // Never print the Authorization header or token.
        System.out.println(
                "Bearer token present: "
                        + (authHeader != null
                        && authHeader.startsWith("Bearer "))
        );

        if (authHeader == null
                || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7).trim();

        if (token.isEmpty()) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String email = jwtService.extractEmail(token);

            if (email == null || email.isBlank()) {
                filterChain.doFilter(request, response);
                return;
            }

            if (SecurityContextHolder.getContext()
                    .getAuthentication() == null) {

                UserDetails userDetails =
                        userDetailsService.loadUserByUsername(email);

                boolean valid = jwtService.validateToken(
                        token,
                        userDetails.getUsername()
                );

                if (valid) {
                    Collection<? extends GrantedAuthority> original =
                            userDetails.getAuthorities();

                    List<GrantedAuthority> normalized =
                            original.stream()
                                    .filter(authority ->
                                            authority != null
                                                    && authority.getAuthority() != null)
                                    .map(this::normalizeAuthority)
                                    .toList();

                    System.out.println(
                            "JWT authentication accepted for user: "
                                    + userDetails.getUsername()
                    );

                    System.out.println(
                            "Normalized authorities: " + normalized
                    );

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    normalized
                            );

                    authentication.setDetails(
                            new WebAuthenticationDetailsSource()
                                    .buildDetails(request)
                    );

                    SecurityContextHolder.getContext()
                            .setAuthentication(authentication);

                } else {
                    System.out.println(
                            "JWT validation failed or token expired."
                    );
                }
            }

        } catch (Exception e) {
            // Do not expose tokens, credentials, or sensitive data.
            System.out.println(
                    "JWT authentication failed: "
                            + e.getClass().getSimpleName()
            );
        }

        filterChain.doFilter(request, response);
    }

    private GrantedAuthority normalizeAuthority(
            GrantedAuthority authority) {

        String name = authority.getAuthority().trim();

        if (name.isEmpty()) {
            return new SimpleGrantedAuthority(name);
        }

        String upperName = name.toUpperCase(Locale.ROOT);

        if (upperName.startsWith("ROLE_")) {
            return new SimpleGrantedAuthority(upperName);
        }

        if (isApplicationRole(upperName)) {
            return new SimpleGrantedAuthority("ROLE_" + upperName);
        }

        return new SimpleGrantedAuthority(name);
    }

    private boolean isApplicationRole(String authority) {
        return switch (authority) {
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
