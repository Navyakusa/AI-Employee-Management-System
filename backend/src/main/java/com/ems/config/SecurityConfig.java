
package com.ems.config;

import com.ems.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
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
@EnableMethodSecurity
public class SecurityConfig {

        private final JwtAuthenticationFilter jwtAuthenticationFilter;

        public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
                this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration configuration = new CorsConfiguration();

                configuration.setAllowedOrigins(List.of("http://localhost:5173"));
                configuration.setAllowedMethods(List.of(
                        "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"
                ));
                configuration.setAllowedHeaders(List.of(
                        "Authorization", "Content-Type"
                ));
                configuration.setAllowCredentials(true);

                UrlBasedCorsConfigurationSource source =
                        new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);

                return source;
        }

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http)
                throws Exception {

                http
                        .csrf(csrf -> csrf.disable())
                        .cors(cors -> {})
                        .sessionManagement(session ->
                                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                        )
                        .authorizeHttpRequests(auth -> auth

                                // CORS preflight
                                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                                // Public authentication and password recovery
                                .requestMatchers(
                                        "/api/auth/**",
                                        "/api/login/**",
                                        "/api/register/**",
                                        "/api/signup/**"
                                ).permitAll()
                                .requestMatchers(
                                        HttpMethod.POST,
                                        "/api/auth/reset-password",
                                        "/api/auth/forgot-password"
                                ).permitAll()

                                // Swagger
                                .requestMatchers(
                                        "/swagger-ui/**",
                                        "/swagger-ui.html",
                                        "/v3/api-docs/**"
                                ).permitAll()

                                // Candidate dashboard and profile
                                .requestMatchers("/api/candidate-dashboard/**")
                                .hasRole("CANDIDATE")
                                .requestMatchers("/api/candidate-profile/**")
                                .hasRole("CANDIDATE")

                                // User profiles
                                .requestMatchers(HttpMethod.GET, "/api/profile/get")
                                .hasAnyRole("EMPLOYEE", "HIRING_MANAGER",
                                        "RECRUITER", "INTERVIEWER")
                                .requestMatchers(HttpMethod.PUT, "/api/profile/update")
                                .hasAnyRole("EMPLOYEE", "HIRING_MANAGER",
                                        "RECRUITER", "INTERVIEWER")

                                // Attendance
                                .requestMatchers("/api/attendance/**")
                                .hasRole("EMPLOYEE")

                                // Hiring manager assigned jobs
                                .requestMatchers(HttpMethod.GET, "/api/jobs/assigned")
                                .hasRole("HIRING_MANAGER")

                                // Jobs
                                .requestMatchers(HttpMethod.GET, "/api/jobs/**").permitAll()
                                .requestMatchers(HttpMethod.POST, "/api/jobs/**")
                                .hasAnyRole("EMPLOYER", "HR", "HIRING_MANAGER",
                                        "RECRUITER", "SUPER_ADMIN")
                                .requestMatchers(HttpMethod.PUT, "/api/jobs/**")
                                .hasAnyRole("EMPLOYER", "HR", "HIRING_MANAGER",
                                        "RECRUITER", "SUPER_ADMIN")
                                .requestMatchers(HttpMethod.DELETE, "/api/jobs/**")
                                .hasAnyRole("EMPLOYER", "SUPER_ADMIN")

                                // Candidate management
                                .requestMatchers(HttpMethod.GET, "/api/candidates/all")
                                .hasAnyRole("HR", "RECRUITER", "SUPER_ADMIN")

                                // Candidate applications
                                .requestMatchers(HttpMethod.POST, "/api/applications/apply")
                                .hasRole("CANDIDATE")
                                .requestMatchers(HttpMethod.GET, "/api/applications/my/**")
                                .hasRole("CANDIDATE")
                                .requestMatchers(HttpMethod.PUT, "/api/applications/*/withdraw")
                                .hasRole("CANDIDATE")

                                // Application management
                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/applications/eligible-for-interview"
                                ).hasAnyRole("HR", "EMPLOYER", "HIRING_MANAGER",
                                        "RECRUITER", "SUPER_ADMIN")
                                .requestMatchers(HttpMethod.GET, "/api/applications/job/**")
                                .hasAnyRole("EMPLOYER", "HIRING_MANAGER",
                                        "RECRUITER", "SUPER_ADMIN")
                                .requestMatchers(HttpMethod.GET, "/api/applications/**")
                                .hasAnyRole("EMPLOYER", "HIRING_MANAGER",
                                        "RECRUITER", "SUPER_ADMIN")
                                .requestMatchers(HttpMethod.PUT, "/api/applications/**")
                                .hasAnyRole("EMPLOYER", "HIRING_MANAGER",
                                        "RECRUITER", "SUPER_ADMIN")

                                // Onboarding: candidate's own onboarding
                                .requestMatchers(HttpMethod.GET, "/api/onboarding/my")
                                .hasRole("CANDIDATE")

                                // Onboarding documents
                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/onboarding/*/documents"
                                ).hasAnyRole("CANDIDATE", "HR", "SUPER_ADMIN")

                                // HR/Super Admin onboarding operations
                                .requestMatchers(HttpMethod.POST, "/api/onboarding/start")
                                .hasAnyRole("HR", "SUPER_ADMIN")
                                .requestMatchers(HttpMethod.GET, "/api/onboarding/**")
                                .hasAnyRole("HR", "SUPER_ADMIN")

                                // Interview scheduling and management
                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/interviews/interviewer/my-candidates"
                                ).hasRole("INTERVIEWER")
                                .requestMatchers(HttpMethod.POST, "/api/interviews/schedule")
                                .hasAnyRole("HR", "HIRING_MANAGER",
                                        "RECRUITER", "SUPER_ADMIN")
                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/interviews/available-interviewers"
                                ).hasAnyRole("HR", "HIRING_MANAGER",
                                        "RECRUITER", "SUPER_ADMIN")
                                .requestMatchers(HttpMethod.GET, "/api/interviews/my")
                                .hasRole("CANDIDATE")
                                .requestMatchers(HttpMethod.GET, "/api/interviews/job/**")
                                .hasAnyRole("HIRING_MANAGER", "RECRUITER", "SUPER_ADMIN")
                                .requestMatchers(
                                        HttpMethod.PUT, "/api/interviews/*/reschedule"
                                ).hasAnyRole("HR", "HIRING_MANAGER",
                                        "RECRUITER", "SUPER_ADMIN")
                                .requestMatchers(
                                        HttpMethod.PUT, "/api/interviews/*/status"
                                ).hasAnyRole("HR", "INTERVIEWER", "HIRING_MANAGER",
                                        "RECRUITER", "SUPER_ADMIN")
                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/interviews/management",
                                        "/api/interviews/stats",
                                        "/api/interviews/upcoming",
                                        "/api/interviews/search",
                                        "/api/interviews/status/**"
                                ).hasAnyRole("HR", "HIRING_MANAGER",
                                        "RECRUITER", "SUPER_ADMIN")
                                .requestMatchers(HttpMethod.GET, "/api/interviews/*")
                                .hasAnyRole("CANDIDATE", "HR", "INTERVIEWER",
                                        "HIRING_MANAGER", "RECRUITER", "SUPER_ADMIN")

                                // Interview feedback
                                .requestMatchers(HttpMethod.POST, "/api/interview-feedback")
                                .hasRole("INTERVIEWER")
                                .requestMatchers(HttpMethod.GET, "/api/interview-feedback/my")
                                .hasRole("INTERVIEWER")
                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/interview-feedback/interview/**"
                                ).hasAnyRole("INTERVIEWER", "HIRING_MANAGER",
                                        "RECRUITER", "SUPER_ADMIN")
                                .requestMatchers(HttpMethod.GET, "/api/interview-feedback")
                                .hasAnyRole("HIRING_MANAGER", "RECRUITER", "SUPER_ADMIN")

                                // Offers
                                .requestMatchers(HttpMethod.GET, "/api/offers/my")
                                .hasRole("CANDIDATE")
                                .requestMatchers(
                                        HttpMethod.PUT,
                                        "/api/offers/*/accept",
                                        "/api/offers/*/reject"
                                ).hasRole("CANDIDATE")
                                .requestMatchers(HttpMethod.POST, "/api/offers")
                                .hasAnyRole("HR", "HIRING_MANAGER",
                                        "RECRUITER", "SUPER_ADMIN")
                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/offers",
                                        "/api/offers/search",
                                        "/api/offers/status",
                                        "/api/offers/stats"
                                ).hasAnyRole("HR", "HIRING_MANAGER",
                                        "RECRUITER", "SUPER_ADMIN")
                                .requestMatchers(HttpMethod.PUT, "/api/offers/*/send")
                                .hasAnyRole("HR", "HIRING_MANAGER",
                                        "RECRUITER", "SUPER_ADMIN")
                                .requestMatchers(HttpMethod.GET, "/api/offers/*")
                                .hasAnyRole("HR", "HIRING_MANAGER",
                                        "RECRUITER", "SUPER_ADMIN")

                                // Contact messages
                                .requestMatchers(HttpMethod.POST, "/api/contact/messages")
                                .permitAll()
                                .requestMatchers(
                                        HttpMethod.GET, "/api/contact/messages/**"
                                ).hasAnyRole("HR", "SUPER_ADMIN")
                                .requestMatchers(
                                        HttpMethod.PUT, "/api/contact/messages/*/read"
                                ).hasAnyRole("HR", "SUPER_ADMIN")
                                .requestMatchers(
                                        HttpMethod.PUT,
                                        "/api/contact/messages/*/status",
                                        "/api/contact/messages/*/resolve"
                                ).hasRole("SUPER_ADMIN")

                                // Leave management
                                .requestMatchers(
                                        HttpMethod.PUT,
                                        "/api/leaves/*/approve",
                                        "/api/leaves/*/reject"
                                ).hasRole("HR")

                                // Notifications
                                .requestMatchers(
                                        HttpMethod.GET, "/api/notifications/**"
                                ).authenticated()
                                .requestMatchers(
                                        HttpMethod.PUT, "/api/notifications/**"
                                ).authenticated()

                                // Audit logs
                                .requestMatchers(HttpMethod.GET, "/api/audit-logs/**")
                                .hasAnyRole("HIRING_MANAGER", "RECRUITER", "SUPER_ADMIN")
                                .requestMatchers(HttpMethod.POST, "/api/audit-logs/**")
                                .hasAnyRole("HIRING_MANAGER", "RECRUITER", "SUPER_ADMIN")

                                // Settings
                                .requestMatchers("/api/settings/**")
                                .hasAnyRole("HIRING_MANAGER", "RECRUITER", "SUPER_ADMIN")

                                // Resume upload
                                .requestMatchers(HttpMethod.POST, "/api/resumes/upload")
                                .hasAnyRole("CANDIDATE", "RECRUITER", "HR", "SUPER_ADMIN")

                                // Hiring manager
                                .requestMatchers("/api/hiring-manager/**")
                                .hasRole("HIRING_MANAGER")

                                // Candidate decisions
                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/candidate-decisions",
                                        "/api/candidate-decisions/**"
                                ).hasAnyRole("HIRING_MANAGER", "HR",
                                        "RECRUITER", "SUPER_ADMIN")
                                .requestMatchers(
                                        HttpMethod.PATCH,
                                        "/api/candidate-decisions/*/approve",
                                        "/api/candidate-decisions/*/reject"
                                ).hasRole("HIRING_MANAGER")
                                .requestMatchers(
                                        HttpMethod.POST,
                                        "/api/candidate-decisions/recommend"
                                ).hasRole("HIRING_MANAGER")

                                // Performance management: HR/Super Admin
                                .requestMatchers(
                                        HttpMethod.GET,
                                        "/api/performance/employees",
                                        "/api/performance/reviews",
                                        "/api/performance/reviews/*"
                                ).hasAnyRole("HR", "SUPER_ADMIN")
                                .requestMatchers(
                                        HttpMethod.POST,
                                        "/api/performance/reviews"
                                ).hasAnyRole("HR", "SUPER_ADMIN")

                                // Employee self-service performance endpoints
                                .requestMatchers(
                                        "/api/performance/my",
                                        "/api/performance/my/**"
                                ).hasRole("EMPLOYEE")

                                // Chatbot
                                .requestMatchers(HttpMethod.POST, "/api/chatbot/chat")
                                .permitAll()

                                // Everything else requires authentication
                                .anyRequest().authenticated()
                        )
                        .addFilterBefore(
                                jwtAuthenticationFilter,
                                UsernamePasswordAuthenticationFilter.class
                        );

                return http.build();
        }
}
