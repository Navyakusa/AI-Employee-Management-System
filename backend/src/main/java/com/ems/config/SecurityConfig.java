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

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter) {

        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http

                // =====================================================
                // CSRF
                // =====================================================

                .csrf(csrf -> csrf.disable())


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
                        // EMPLOYEE / RECRUITER PROFILE
                        // =================================================

                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/profile/get"
                        ).hasAnyRole(
                                "EMPLOYEE",
                                "HIRING_MANAGER",
                                "RECRUITER"
                        )

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/profile/update"
                        ).hasAnyRole(
                                "EMPLOYEE",
                                "HIRING_MANAGER",
                                "RECRUITER"
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

                        // Interviewer - assigned candidates
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/interviews/interviewer/my-candidates"
                        ).hasRole("INTERVIEWER")


                        // Schedule interview
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/interviews/schedule"
                        ).hasAnyRole(
                                "HIRING_MANAGER",
                                "RECRUITER",
                                "SUPER_ADMIN"
                        )


                        // Available interviewers
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/interviews/available-interviewers"
                        ).hasAnyRole(
                                "HIRING_MANAGER",
                                "RECRUITER",
                                "SUPER_ADMIN"
                        )


                        // Candidate - my interviews
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/interviews/my"
                        ).hasRole("CANDIDATE")


                        // Interviews by job
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/interviews/job/**"
                        ).hasAnyRole(
                                "HIRING_MANAGER",
                                "RECRUITER",
                                "SUPER_ADMIN"
                        )


                        // Reschedule interview
                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/interviews/*/reschedule"
                        ).hasAnyRole(
                                "HIRING_MANAGER",
                                "RECRUITER",
                                "SUPER_ADMIN"
                        )


                        // Update interview status
                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/interviews/*/status"
                        ).hasAnyRole(
                                "INTERVIEWER",
                                "HIRING_MANAGER",
                                "RECRUITER",
                                "SUPER_ADMIN"
                        )


                        // Interview management
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/interviews/management"
                        ).hasAnyRole(
                                "HIRING_MANAGER",
                                "RECRUITER",
                                "SUPER_ADMIN"
                        )


                        // Interview statistics
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/interviews/stats"
                        ).hasAnyRole(
                                "HIRING_MANAGER",
                                "RECRUITER",
                                "SUPER_ADMIN"
                        )


                        // Upcoming interviews
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/interviews/upcoming"
                        ).hasAnyRole(
                                "HIRING_MANAGER",
                                "RECRUITER",
                                "SUPER_ADMIN"
                        )


                        // Search interviews
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/interviews/search"
                        ).hasAnyRole(
                                "HIRING_MANAGER",
                                "RECRUITER",
                                "SUPER_ADMIN"
                        )


                        // Interviews by status
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/interviews/status/**"
                        ).hasAnyRole(
                                "HIRING_MANAGER",
                                "RECRUITER",
                                "SUPER_ADMIN"
                        )


                        // Single interview details
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

                        // Interviewer submits evaluation
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/interview-feedback"
                        ).hasRole("INTERVIEWER")


                        // Interviewer - own evaluations
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/interview-feedback/my"
                        ).hasRole("INTERVIEWER")


                        // Evaluation for a specific interview
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/interview-feedback/interview/**"
                        ).hasAnyRole(
                                "INTERVIEWER",
                                "HIRING_MANAGER",
                                "RECRUITER",
                                "SUPER_ADMIN"
                        )


                        // All evaluations
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

                        // Candidate - my offers
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/offers/my"
                        ).hasRole("CANDIDATE")


                        // Candidate - accept offer
                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/offers/*/accept"
                        ).hasRole("CANDIDATE")


                        // Candidate - reject offer
                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/offers/*/reject"
                        ).hasRole("CANDIDATE")


                        // Create offer
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/offers"
                        ).hasAnyRole(
                                "HIRING_MANAGER",
                                "RECRUITER",
                                "SUPER_ADMIN"
                        )


                        // All offers
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/offers"
                        ).hasAnyRole(
                                "HIRING_MANAGER",
                                "RECRUITER",
                                "SUPER_ADMIN"
                        )


                        // Search offers
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/offers/search"
                        ).hasAnyRole(
                                "HIRING_MANAGER",
                                "RECRUITER",
                                "SUPER_ADMIN"
                        )


                        // Offer status
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/offers/status"
                        ).hasAnyRole(
                                "HIRING_MANAGER",
                                "RECRUITER",
                                "SUPER_ADMIN"
                        )


                        // Send offer
                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/offers/*/send"
                        ).hasAnyRole(
                                "HIRING_MANAGER",
                                "RECRUITER",
                                "SUPER_ADMIN"
                        )


                        // Offer statistics
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/offers/stats"
                        ).hasAnyRole(
                                "HIRING_MANAGER",
                                "RECRUITER",
                                "SUPER_ADMIN"
                        )


                        // Individual offer
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/offers/*"
                        ).hasAnyRole(
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