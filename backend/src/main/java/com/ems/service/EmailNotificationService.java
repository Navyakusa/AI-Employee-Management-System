package com.ems.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailNotificationService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    /**
     * Sends an email when a candidate's application is accepted.
     */
    public void sendApplicationAcceptedEmail(
            String candidateEmail,
            String candidateName,
            String jobTitle
    ) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setFrom(fromEmail);
        message.setTo(candidateEmail);

        message.setSubject(
                "Application Update - " + jobTitle
        );

        message.setText(
                "Dear " + candidateName + ",\n\n" +
                        "We are pleased to inform you that your application " +
                        "for the position of " + jobTitle +
                        " has been accepted.\n\n" +
                        "Our recruitment team will contact you with the next steps.\n\n" +
                        "Congratulations!\n\n" +
                        "Regards,\n" +
                        "TalentAI Recruitment Team"
        );

        mailSender.send(message);
    }

    /**
     * Sends an email when a candidate's application is rejected.
     */
    public void sendApplicationRejectedEmail(
            String candidateEmail,
            String candidateName,
            String jobTitle
    ) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setFrom(fromEmail);
        message.setTo(candidateEmail);

        message.setSubject(
                "Application Update - " + jobTitle
        );

        message.setText(
                "Dear " + candidateName + ",\n\n" +
                        "Thank you for your interest in the position of " +
                        jobTitle + ".\n\n" +
                        "After careful consideration, we regret to inform you " +
                        "that your application has not been selected for the next stage.\n\n" +
                        "We appreciate the time and effort you invested in the application " +
                        "and wish you success in your future opportunities.\n\n" +
                        "Regards,\n" +
                        "TalentAI Recruitment Team"
        );

        mailSender.send(message);
    }

    /**
     * Sends a test email to verify SMTP configuration.
     */
    public void sendTestEmail(String to) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setFrom(fromEmail);
        message.setTo(to);

        message.setSubject("EMS SMTP Test Email");

        message.setText(
                "Hello,\n\n" +
                        "This is a test email from the Employee Management System.\n\n" +
                        "SMTP email configuration is working successfully.\n\n" +
                        "Regards,\n" +
                        "TalentAI Recruitment Team"
        );

        mailSender.send(message);
    }

    /**
     * Sends password reset email.
     */
    public void sendPasswordResetEmail(
            String userEmail,
            String userName,
            String resetToken
    ) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setFrom(fromEmail);
        message.setTo(userEmail);

        message.setSubject(
                "Password Reset - TalentAI"
        );

        message.setText(
                "Dear " + userName + ",\n\n" +

                        "We received a request to reset your TalentAI account password.\n\n" +

                        "Use the following reset token to create a new password:\n\n" +

                        resetToken + "\n\n" +

                        "This reset token is valid for 30 minutes.\n\n" +

                        "If you did not request a password reset, " +
                        "please ignore this email.\n\n" +

                        "Regards,\n" +
                        "TalentAI Recruitment Team"
        );

        mailSender.send(message);
    }
}