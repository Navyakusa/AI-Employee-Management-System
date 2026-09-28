
        package com.ems.service;

import com.ems.entity.EmailTemplate;
import com.ems.entity.User;

import com.ems.repository.EmailTemplateRepository;
import com.ems.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import com.ems.config.AppProperties;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailNotificationService {

    private final JavaMailSender mailSender;

    private final EmailTemplateRepository emailTemplateRepository;

    private final UserRepository userRepository;
    private final AppProperties appProperties;

    @Value("${spring.mail.username}")
    private String fromEmail;

    private static final Pattern VARIABLE_PATTERN =
            Pattern.compile(
                    "\\$\\{([a-zA-Z][a-zA-Z0-9_]*)\\}"
            );

    // =========================================================
    // SEND EMAIL ONLY WHEN ACTIVE TEMPLATE EXISTS
    // =========================================================

    public boolean sendEmail(
            Long userId,
            String templateCode,
            Map<String, String> variables
    ) {

        // 1. Validate event information

        if (userId == null) {
            throw new IllegalArgumentException(
                    "Recipient user ID cannot be null"
            );
        }

        if (templateCode == null || templateCode.isBlank()) {
            throw new IllegalArgumentException(
                    "Email template code cannot be empty"
            );
        }

        // 2. Check database for an active email template

        Optional<EmailTemplate> optionalTemplate =
                emailTemplateRepository
                        .findByTemplateCodeAndActiveTrue(
                                templateCode
                        );

        // No active template means no email

        if (optionalTemplate.isEmpty()) {

            log.debug(
                    "Email skipped: No active template for event {}",
                    templateCode
            );

            return false;
        }

        EmailTemplate template = optionalTemplate.get();

        // 3. Fetch recipient details from users table

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Recipient user not found: " + userId
                        )
                );

        if (user.getEmail() == null
                || user.getEmail().isBlank()) {

            throw new IllegalArgumentException(
                    "Recipient email address is missing"
            );
        }

        // 4. Prepare email subject and body from database

        String subject = replaceVariables(
                template.getSubject(),
                variables
        );

        String body = replaceVariables(
                template.getBody(),
                variables
        );

        // 5. Prepare SMTP message

        SimpleMailMessage message = new SimpleMailMessage();

        message.setFrom(fromEmail);

        message.setTo(user.getEmail());

        message.setSubject(subject);

        message.setText(body);

        // 6. Send using existing SMTP configuration

        mailSender.send(message);

        log.info(
                "Email submitted to SMTP for user ID: {}, event: {}",
                userId,
                templateCode
        );

        return true;
    }

    // =========================================================
    // SEND CONTACT MESSAGE RESOLUTION EMAIL
    // =========================================================

    public boolean sendContactMessageResolutionEmail(
            String recipientEmail,
            String recipientName,
            String originalSubject,
            String resolution
    ) {

        // Validate submitted email

        if (recipientEmail == null || recipientEmail.isBlank()) {

            throw new IllegalArgumentException(
                    "Contact message email address is missing"
            );
        }

        // Prepare email subject

        String emailSubject =
                "EMS - Response to your contact message";

        // Prepare email body

        String emailBody =
                "Hello " + recipientName + ",\n\n"
                        + "Thank you for contacting EMS.\n\n"
                        + "Your message:\n"
                        + originalSubject + "\n\n"
                        + "Admin response:\n"
                        + resolution + "\n\n"
                        + "Your contact message has been marked as resolved.\n\n"
                        + "Regards,\n"
                        + "EMS Support Team";

        // Prepare SMTP message

        SimpleMailMessage message =
                new SimpleMailMessage();

        message.setFrom(fromEmail);

        message.setTo(recipientEmail);

        message.setSubject(emailSubject);

        message.setText(emailBody);

        // Send email

        mailSender.send(message);

        log.info(
                "Contact message resolution email sent to: {}",
                recipientEmail
        );

        return true;
    }

    // =========================================================
    // SEND PASSWORD RESET EMAIL
    // =========================================================

    public void sendPasswordResetEmail(
            String email,
            String userName,
            String resetToken
    ) {

        // Validate recipient email

        if (email == null || email.isBlank()) {

            throw new IllegalArgumentException(
                    "Recipient email address is missing"
            );
        }

        // Validate reset token

        if (resetToken == null || resetToken.isBlank()) {

            throw new IllegalArgumentException(
                    "Password reset token is missing"
            );
        }

        // Create frontend reset-password link

        String frontendUrl =
                appProperties.getFrontendUrl();

        if (frontendUrl == null || frontendUrl.isBlank()) {
            throw new IllegalStateException(
                    "Frontend URL is not configured. "
                            + "Please configure app.frontend-url "
                            + "in application.yml"
            );
        }

        frontendUrl = frontendUrl.replaceAll("/+$", "");

        String resetLink =
                frontendUrl
                        + "/reset-password?token="
                        + resetToken;
        // Email subject

        String emailSubject =
                "EMS - Password Reset Request";

        // Email body

        String emailBody =
                "Hello " + userName + ",\n\n"
                        + "We received a request to reset your EMS password.\n\n"
                        + "Please use the following link to reset your password:\n\n"
                        + resetLink + "\n\n"
                        + "This password reset link will expire in 30 minutes.\n\n"
                        + "If you did not request a password reset, please ignore this email.\n\n"
                        + "Regards,\n"
                        + "EMS Support Team";

        // Prepare SMTP message

        SimpleMailMessage message =
                new SimpleMailMessage();

        message.setFrom(fromEmail);

        message.setTo(email);

        message.setSubject(emailSubject);

        message.setText(emailBody);

        // Send email through Gmail SMTP

        mailSender.send(message);

        log.info(
                "Password reset email sent to: {}",
                email
        );
    }

    // =========================================================
    // REPLACE DYNAMIC VARIABLES
    // =========================================================

    private String replaceVariables(
            String content,
            Map<String, String> variables
    ) {

        if (content == null) {
            throw new IllegalArgumentException(
                    "Email template content cannot be null"
            );
        }

        Map<String, String> safeVariables =
                variables == null
                        ? Map.of()
                        : variables;

        Matcher matcher =
                VARIABLE_PATTERN.matcher(content);

        StringBuffer result = new StringBuffer();

        while (matcher.find()) {

            String variableName = matcher.group(1);

            String replacement =
                    safeVariables.get(variableName);

            if (replacement == null) {

                throw new IllegalArgumentException(
                        "Missing email template variable: "
                                + variableName
                );
            }

            matcher.appendReplacement(
                    result,
                    Matcher.quoteReplacement(replacement)
            );
        }

        matcher.appendTail(result);

        return result.toString();
    }

    // =========================================================
    // OTHER EMAIL METHODS
    // =========================================================

    public void sendApplicationAcceptedEmail(
            String email,
            String name,
            String title
    ) {
    }

    public void sendApplicationRejectedEmail(
            String email,
            String name,
            String title
    ) {
    }
}

