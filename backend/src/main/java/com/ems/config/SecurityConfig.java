package com.ems.config;

import com.ems.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

        private final JwtAuthenticationFilter jwtAuthenticationFilter;

        public SecurityConfig(
                JwtAuthenticationFilter jwtAuthenticationFilter) {

                this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        }

        // =====================================================
        // CORS CONFIGURATION
        // =====================================================

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
                                "OPTIONS"
                        )
                );

                configuration.setAllowedHeaders(
                        List.of(
                                "Authorization",
                                "Content-Type"
                        )
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

        // =====================================================
        // SECURITY FILTER CHAIN
        // =====================================================

        @Bean
        public SecurityFilterChain securityFilterChain(
                HttpSecurity http) throws Exception {

                http

                        // =====================================================
                        // CSRF
                        // =====================================================

                        .csrf(csrf -> csrf.disable())

                        // =====================================================
                        // CORS
                        // =====================================================

                        .cors(cors -> {
                        })

                        // =====================================================
                        // SESSION MANAGEMENT
                        // =====================================================

                        .sessionManagement(session ->
                                session.sessionCreationPolicy(
                                        SessionCreationPolicy.STATELESS
                                )
                        )

                        // =====================================================
                        // AUTHORIZATION
                        // =====================================================

                        .authorizeHttpRequests(auth -> auth

                                // =================================================
                                // CORS PREFLIGHT
                                // =================================================

                                .requestMatchers(
                                        HttpMethod.OPTIONS,
                                        "/**"
                                ).permitAll()

                                // =================================================
                                // AUTHENTICATION
                                // =================================================

                                .requestMatchers(
                                        "/api/auth/**",
                                        "/api/login/**",
                                        "/api/register/**",
                                        "/api/signup/**"
                                ).permitAll()

                                // =================================================
                                // SWAGGER
                                // =================================================

                                .requestMatchers(
                                        "/swagger-ui/**",
                                        "/swagger-ui.html",
                                        "/v3/api-docs/**"
                                ).permitAll()

                                // =================================================
                                // CANDIDATE DASHBOARD
                                // =================================================

                                .requestMatchers(
                                        "/api/candidate-dashboard/**"
                                ).hasRole("CANDIDATE")

                                // =================================================
                                // CANDIDATE PROFILE
                                // =================================================

                                .requestMatchers(
                                        "/api/candidate-profile/**"
                                ).hasRole("CANDIDATE")

                                // =================================================
                                // EMPLOYEE / RECRUITER / INTERVIEWER PROFILE
                                // =================================================

                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/profile/get"
                                ).hasAnyRole(
                                        "EMPLOYEE",
                                        "HIRING_MANAGER",
                                        "RECRUITER",
                                        "INTERVIEWER"
                                )

                                .requestMatchers(
                                        HttpMethod.PUT,
                                        "/api/profile/update"
                                ).hasAnyRole(
                                        "EMPLOYEE",
                                        "HIRING_MANAGER",
                                        "RECRUITER",
                                        "INTERVIEWER"
                                )

                                // =================================================
                                // ATTENDANCE
                                // =================================================

                                .requestMatchers(
                                        "/api/attendance/**"
                                ).hasRole("EMPLOYEE")

                                // =================================================
                                // JOBS
                                // =================================================

                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/jobs/**"
                                ).authenticated()

                                .requestMatchers(
                                        HttpMethod.POST,
                                        "/api/jobs/**"
                                ).hasAnyRole(
                                        "EMPLOYER",
                                        "HIRING_MANAGER",
                                        "RECRUITER",
                                        "SUPER_ADMIN"
                                )

                                .requestMatchers(
                                        HttpMethod.PUT,
                                        "/api/jobs/**"
                                ).hasAnyRole(
                                        "EMPLOYER",
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

                                // =================================================
                                // CANDIDATE APPLICATIONS
                                // =================================================

                                .requestMatchers(
                                        HttpMethod.POST,
                                        "/api/applications/apply"
                                ).hasRole("CANDIDATE")

                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/applications/my/**"
                                ).hasRole("CANDIDATE")

                                .requestMatchers(
                                        HttpMethod.PUT,
                                        "/api/applications/*/withdraw"
                                ).hasRole("CANDIDATE")

                                // =================================================
                                // APPLICATION MANAGEMENT
                                // =================================================

                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/applications/eligible-for-interview"
                                ).hasAnyRole(
                                        "HR",
                                        "EMPLOYER",
                                        "HIRING_MANAGER",
                                        "RECRUITER",
                                        "SUPER_ADMIN"
                                )

                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/applications/job/**"
                                ).hasAnyRole(
                                        "EMPLOYER",
                                        "HIRING_MANAGER",
                                        "RECRUITER",
                                        "SUPER_ADMIN"
                                )

                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/applications/**"
                                ).hasAnyRole(
                                        "EMPLOYER",
                                        "HIRING_MANAGER",
                                        "RECRUITER",
                                        "SUPER_ADMIN"
                                )

                                .requestMatchers(
                                        HttpMethod.PUT,
                                        "/api/applications/**"
                                ).hasAnyRole(
                                        "EMPLOYER",
                                        "HIRING_MANAGER",
                                        "RECRUITER",
                                        "SUPER_ADMIN"
                                )

                                // =================================================
                                // INTERVIEWS
                                // =================================================

                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/interviews/interviewer/my-candidates"
                                ).hasRole("INTERVIEWER")

                                // HR ADDED
                                .requestMatchers(
                                        HttpMethod.POST,
                                        "/api/interviews/schedule"
                                ).hasAnyRole(
                                        "HR",
                                        "HIRING_MANAGER",
                                        "RECRUITER",
                                        "SUPER_ADMIN"
                                )

                                // HR ADDED
                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/interviews/available-interviewers"
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
                                        "HIRING_MANAGER",
                                        "RECRUITER",
                                        "SUPER_ADMIN"
                                )

                                .requestMatchers(
                                        HttpMethod.PUT,
                                        "/api/interviews/*/reschedule"
                                ).hasAnyRole(
                                        "HIRING_MANAGER",
                                        "RECRUITER",
                                        "SUPER_ADMIN"
                                )

                                .requestMatchers(
                                        HttpMethod.PUT,
                                        "/api/interviews/*/status"
                                ).hasAnyRole(
                                        "INTERVIEWER",
                                        "HIRING_MANAGER",
                                        "RECRUITER",
                                        "SUPER_ADMIN"
                                )

                                // HR ADDED
                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/interviews/management"
                                ).hasAnyRole(
                                        "HR",
                                        "HIRING_MANAGER",
                                        "RECRUITER",
                                        "SUPER_ADMIN"
                                )

                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/interviews/stats"
                                ).hasAnyRole(
                                        "HIRING_MANAGER",
                                        "RECRUITER",
                                        "SUPER_ADMIN"
                                )

                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/interviews/upcoming"
                                ).hasAnyRole(
                                        "HIRING_MANAGER",
                                        "RECRUITER",
                                        "SUPER_ADMIN"
                                )

                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/interviews/search"
                                ).hasAnyRole(
                                        "HIRING_MANAGER",
                                        "RECRUITER",
                                        "SUPER_ADMIN"
                                )

                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/interviews/status/**"
                                ).hasAnyRole(
                                        "HIRING_MANAGER",
                                        "RECRUITER",
                                        "SUPER_ADMIN"
                                )

                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/interviews/*"
                                ).hasAnyRole(
                                        "CANDIDATE",
                                        "INTERVIEWER",
                                        "HIRING_MANAGER",
                                        "RECRUITER",
                                        "SUPER_ADMIN"
                                )

                                // =================================================
                                // INTERVIEW FEEDBACK / EVALUATION
                                // =================================================

                                .requestMatchers(
                                        HttpMethod.POST,
                                        "/api/interview-feedback"
                                ).hasRole("INTERVIEWER")

                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/interview-feedback/my"
                                ).hasRole("INTERVIEWER")

                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/interview-feedback/interview/**"
                                ).hasAnyRole(
                                        "INTERVIEWER",
                                        "HIRING_MANAGER",
                                        "RECRUITER",
                                        "SUPER_ADMIN"
                                )

                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/interview-feedback"
                                ).hasAnyRole(
                                        "HIRING_MANAGER",
                                        "RECRUITER",
                                        "SUPER_ADMIN"
                                )

                                // =================================================
                                // OFFERS
                                // =================================================

                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/offers/my"
                                ).hasRole("CANDIDATE")

                                .requestMatchers(
                                        HttpMethod.PUT,
                                        "/api/offers/*/accept"
                                ).hasRole("CANDIDATE")

                                .requestMatchers(
                                        HttpMethod.PUT,
                                        "/api/offers/*/reject"
                                ).hasRole("CANDIDATE")

                                // HR ADDED
                                .requestMatchers(
                                        HttpMethod.POST,
                                        "/api/offers"
                                ).hasAnyRole(
                                        "HR",
                                        "HIRING_MANAGER",
                                        "RECRUITER",
                                        "SUPER_ADMIN"
                                )

                                // HR ADDED
                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/offers"
                                ).hasAnyRole(
                                        "HR",
                                        "HIRING_MANAGER",
                                        "RECRUITER",
                                        "SUPER_ADMIN"
                                )

                                // HR ADDED
                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/offers/search"
                                ).hasAnyRole(
                                        "HR",
                                        "HIRING_MANAGER",
                                        "RECRUITER",
                                        "SUPER_ADMIN"
                                )

                                // HR ADDED
                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/offers/status"
                                ).hasAnyRole(
                                        "HR",
                                        "HIRING_MANAGER",
                                        "RECRUITER",
                                        "SUPER_ADMIN"
                                )

                                // HR ADDED
                                .requestMatchers(
                                        HttpMethod.PUT,
                                        "/api/offers/*/send"
                                ).hasAnyRole(
                                        "HR",
                                        "HIRING_MANAGER",
                                        "RECRUITER",
                                        "SUPER_ADMIN"
                                )

                                // HR ADDED
                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/offers/stats"
                                ).hasAnyRole(
                                        "HR",
                                        "HIRING_MANAGER",
                                        "RECRUITER",
                                        "SUPER_ADMIN"
                                )

                                // HR ADDED
                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/offers/*"
                                ).hasAnyRole(
                                        "HR",
                                        "HIRING_MANAGER",
                                        "RECRUITER",
                                        "SUPER_ADMIN"
                                )

                                // =================================================
                                // NOTIFICATIONS
                                // =================================================

                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/notifications/**"
                                ).authenticated()

                                .requestMatchers(
                                        HttpMethod.PUT,
                                        "/api/notifications/**"
                                ).authenticated()

                                // =================================================
                                // AUDIT LOGS
                                // =================================================

                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/audit-logs/**"
                                ).hasAnyRole(
                                        "HIRING_MANAGER",
                                        "RECRUITER",
                                        "SUPER_ADMIN"
                                )

                                .requestMatchers(
                                        HttpMethod.POST,
                                        "/api/audit-logs/**"
                                ).hasAnyRole(
                                        "HIRING_MANAGER",
                                        "RECRUITER",
                                        "SUPER_ADMIN"
                                )

                                // =================================================
                                // SETTINGS
                                // =================================================

                                .requestMatchers(
                                        "/api/settings/**"
                                ).hasAnyRole(
                                        "HIRING_MANAGER",
                                        "RECRUITER",
                                        "SUPER_ADMIN"
                                )

                                // =================================================
                                // EVERYTHING ELSE
                                // =================================================

                                .anyRequest().authenticated()
                        )

                        // =====================================================
                        // JWT AUTHENTICATION FILTER
                        // =====================================================

                        .addFilterBefore(
                                jwtAuthenticationFilter,
                                UsernamePasswordAuthenticationFilter.class
                        );

                return http.build();
        }
}