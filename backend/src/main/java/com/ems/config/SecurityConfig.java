package com.ems.config;

import com.ems.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter
    ) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http

                // =========================
                // CORS
                // =========================
                .cors(cors -> {
                })

                // =========================
                // CSRF
                // =========================
                .csrf(csrf -> csrf.disable())

                // =========================
                // STATELESS SESSION
                // =========================
                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )

                // =========================
                // AUTHORIZATION
                // =========================
                .authorizeHttpRequests(auth -> auth

                        // =========================
                        // AUTH APIs
                        // =========================
                        .requestMatchers(
                                "/api/auth/login",
                                "/api/auth/signup"
                        ).permitAll()

                        // =========================
                        // SWAGGER
                        // =========================
                        .requestMatchers(
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**"
                        ).permitAll()

                        // =========================
                        // CANDIDATE DASHBOARD
                        // =========================
                        .requestMatchers(
                                "/api/candidate-dashboard/**"
                        ).hasRole("CANDIDATE")

                        // =========================
                        // CANDIDATE PROFILE
                        // =========================
                        .requestMatchers(
                                "/api/candidate-profile/**"
                        ).hasRole("CANDIDATE")

                        // =========================
                        // EMPLOYEE PROFILE
                        // =========================
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/profile/get"
                        ).hasRole("EMPLOYEE")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/profile/update"
                        ).hasRole("EMPLOYEE")

                        // =========================
                        // ATTENDANCE APIs
                        // =========================
                        .requestMatchers(
                                "/api/attendance/**"
                        ).hasRole("EMPLOYEE")

                        // =========================
                        // JOB APIs
                        // =========================
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/jobs",
                                "/api/jobs/**"
                        ).authenticated()

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/jobs"
                        ).hasAnyRole(
                                "EMPLOYER",
                                "HR",
                                "HIRING_MANAGER",
                                "RECRUITER",
                                "SUPER_ADMIN"
                        )

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/jobs/**"
                        ).hasAnyRole(
                                "EMPLOYER",
                                "HR",
                                "HIRING_MANAGER",
                                "RECRUITER",
                                "SUPER_ADMIN"
                        )

                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/jobs/**"
                        ).hasAnyRole(
                                "EMPLOYER",
                                "SUPER_ADMIN"
                        )

                        // =========================
                        // APPLICATION APIs
                        // =========================
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/applications/apply/**"
                        ).hasRole("CANDIDATE")

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/applications/my"
                        ).hasRole("CANDIDATE")

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/applications/*/withdraw"
                        ).hasRole("CANDIDATE")

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/applications/job/**"
                        ).hasAnyRole(
                                "EMPLOYER",
                                "HR",
                                "HIRING_MANAGER",
                                "RECRUITER",
                                "SUPER_ADMIN"
                        )

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/applications/**"
                        ).hasAnyRole(
                                "EMPLOYER",
                                "HR",
                                "HIRING_MANAGER",
                                "RECRUITER",
                                "SUPER_ADMIN"
                        )

                        // =========================
                        // INTERVIEW APIs
                        // =========================
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/interviews/schedule"
                        ).hasAnyRole(
                                "HR",
                                "HIRING_MANAGER",
                                "RECRUITER",
                                "SUPER_ADMIN"
                        )

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/interviews/my"
                        ).hasRole("CANDIDATE")

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/interviews/job/**"
                        ).hasAnyRole(
                                "HR",
                                "HIRING_MANAGER",
                                "RECRUITER",
                                "SUPER_ADMIN"
                        )

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/interviews/interviewer/**"
                        ).hasAnyRole(
                                "INTERVIEWER",
                                "HR",
                                "HIRING_MANAGER",
                                "RECRUITER",
                                "SUPER_ADMIN"
                        )

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/interviews/**"
                        ).hasAnyRole(
                                "HR",
                                "HIRING_MANAGER",
                                "RECRUITER",
                                "SUPER_ADMIN"
                        )

                        // =========================
                        // INTERVIEW FEEDBACK
                        // =========================
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/interview-feedback"
                        ).hasRole("INTERVIEWER")

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/interview-feedback/**"
                        ).hasAnyRole(
                                "HR",
                                "HIRING_MANAGER",
                                "RECRUITER",
                                "SUPER_ADMIN"
                        )

                        // =========================
                        // OFFER APIs
                        // =========================

                        // Candidate - My Offers
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/offers/my"
                        ).hasRole("CANDIDATE")

                        // Candidate - Accept Offer
                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/offers/*/accept"
                        ).hasRole("CANDIDATE")

                        // Candidate - Reject Offer
                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/offers/*/reject"
                        ).hasRole("CANDIDATE")

                        // HR - Create Offer
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/offers"
                        ).hasAnyRole(
                                "HR",
                                "HIRING_MANAGER",
                                "RECRUITER",
                                "SUPER_ADMIN"
                        )

                        // HR - Get All Offers
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/offers"
                        ).hasAnyRole(
                                "HR",
                                "HIRING_MANAGER",
                                "RECRUITER",
                                "SUPER_ADMIN"
                        )

                        // HR - Search Offers
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/offers/search"
                        ).hasAnyRole(
                                "HR",
                                "HIRING_MANAGER",
                                "RECRUITER",
                                "SUPER_ADMIN"
                        )

                        // HR - Filter Offers
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/offers/status"
                        ).hasAnyRole(
                                "HR",
                                "HIRING_MANAGER",
                                "RECRUITER",
                                "SUPER_ADMIN"
                        )

                        // HR - Send Offer
                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/offers/*/send"
                        ).hasAnyRole(
                                "HR",
                                "HIRING_MANAGER",
                                "RECRUITER",
                                "SUPER_ADMIN"
                        )

                        // HR - Offer Statistics
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/offers/stats"
                        ).hasAnyRole(
                                "HR",
                                "HIRING_MANAGER",
                                "RECRUITER",
                                "SUPER_ADMIN"
                        )

                        // HR - Get Offer By ID
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/offers/*"
                        ).hasAnyRole(
                                "HR",
                                "HIRING_MANAGER",
                                "RECRUITER",
                                "SUPER_ADMIN"
                        )

                        // =========================
                        // NOTIFICATIONS
                        // =========================
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/notifications/**"
                        ).authenticated()

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/notifications/**"
                        ).authenticated()

                        // =========================
                        // AUDIT LOG APIs
                        // =========================
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/audit-logs/**"
                        ).hasAnyRole(
                                "HR",
                                "HIRING_MANAGER",
                                "RECRUITER",
                                "SUPER_ADMIN"
                        )

                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/audit-logs/**"
                        ).hasAnyRole(
                                "HR",
                                "HIRING_MANAGER",
                                "RECRUITER",
                                "SUPER_ADMIN"
                        )

                        // =========================
                        // ALL OTHER APIs
                        // =========================
                        .anyRequest()
                        .authenticated()
                )

                // =========================
                // JWT FILTER
                // =========================
                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }


    // =========================
    // CORS CONFIGURATION
    // =========================

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();

        configuration.setAllowedOrigins(
                List.of("http://localhost:5173")
        );

        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "DELETE",
                        "PATCH",
                        "OPTIONS"
                )
        );

        configuration.setAllowedHeaders(
                List.of("*")
        );

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }


    // =========================
    // AUTHENTICATION MANAGER
    // =========================

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration
    ) throws Exception {

        return configuration.getAuthenticationManager();
    }
}