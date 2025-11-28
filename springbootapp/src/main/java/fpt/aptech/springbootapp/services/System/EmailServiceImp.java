package fpt.aptech.springbootapp.services.System;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

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

    @Override
    public void sendSimpleEmail(String to, String subject, String body) {
        sendEmail(to, subject, body);
    }

    @Override
    public void sendResetPasswordEmail(String toEmail, String resetToken, String userName) {
        String resetUrl = "http://localhost:3000/reset-password?token=" + resetToken;
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("MayPayHR - Password Reset Request");
            helper.setText(buildEmailBody(userName, resetUrl), true);

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send email: " + e.getMessage());
        }
    }

    @Override
    public void sendRegistrationEmail(String email, String token, String fullName) {
        String verificationUrl = "http://localhost:3000/verify-registration?token=" + token;
        String subject = "MayPayHR - Verify Your Registration";
        String body = String.format("""
            Hello %s,
            
            Thank you for registering with MayPayHR system.
            
            Please verify your email by clicking the link below:
            %s
            
            This link will expire in 24 hours.
            
            If you did not register, please ignore this email.
            
            Best regards,
            MayPayHR Team
            """, fullName, verificationUrl);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(email);
            helper.setSubject(subject);
            helper.setText(body, true);

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send registration email: " + e.getMessage());
        }
    }

    @Override
    public void sendOtpEmail(String email, String otp, String fullName) {
        String subject = "MayPayHR - Your OTP Code";
        String body = String.format("""
            Hello %s,
            
            Your One-Time Password (OTP) for MayPayHR is:
            
            %s
            
            This OTP will expire in 10 minutes.
            
            Do not share this code with anyone.
            
            Best regards,
            MayPayHR Team
            """, fullName, otp);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(email);
            helper.setSubject(subject);
            helper.setText(body, true);

            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send OTP email: " + e.getMessage());
        }
    }

    @Override
    public void sendSmsOtp(String phone, String otp) {
        System.out.println("Sending SMS to: " + phone + " with OTP: " + otp);
    }

    public void sendPasswordResetEmail(String email, String resetToken, String fullName) {
        sendPasswordResetEmail(email, resetToken, fullName);
    }
}
