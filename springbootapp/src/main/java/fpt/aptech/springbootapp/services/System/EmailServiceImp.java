package fpt.aptech.springbootapp.services.System;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.*;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImp implements EmailService {
    @Autowired
    private JavaMailSender mailSender;
    @Value("${spring.mail.username}")
    private String fromEmail;

    public void sendEmail(String to, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);
        mailSender.send(message);
    }

    @Override
    public String buildEmailBody(String userName, String resetUrl) {
        return String.format("""
            Hello %s,
            
            You have requested to reset your password for MayPayHR system.
            
            Please click the link below to reset your password:
            %s
            
            This link will expire in 1 hour.
            
            If you did not request this, please ignore this email.
            
            Best regards,
            MayPayHR Team
            """, userName, resetUrl);
    }

    public void sendPasswordResetEmail(String toEmail, String resetToken, String userName) {
        //
        String resetUrl = "http://localhost:3000/reset-password?token=" + resetToken;
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("MayPayHR - Password Reset Request");
            helper.setText(buildEmailBody(userName, resetUrl), true);

            mailSender.send(message);
            System.out.println("Email sent to: " + toEmail);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send email: " + e.getMessage());
        }
    }
}
