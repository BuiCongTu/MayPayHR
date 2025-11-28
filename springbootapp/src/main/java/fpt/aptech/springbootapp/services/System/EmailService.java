package fpt.aptech.springbootapp.services.System;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
@Service
public interface EmailService{
        void sendPasswordResetEmail(String toEmail, String resetToken, String userName);
        void sendEmail(String to, String subject, String text);
        String buildEmailBody(String userName, String resetUrl);
        void sendSimpleEmail(String to, String subject, String body);

        void sendResetPasswordEmail(String email, String resetToken, String fullName);

        void sendRegistrationEmail(String email, String token, String fullName);

        void sendOtpEmail(String email, String otp, String fullName);

        void sendSmsOtp(String phone, String otp);
}
