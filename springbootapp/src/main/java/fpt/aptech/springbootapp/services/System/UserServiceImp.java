package fpt.aptech.springbootapp.services.System;

import java.time.Instant;
import java.util.*;

import fpt.aptech.springbootapp.dtos.request.Auth.*;
import fpt.aptech.springbootapp.dtos.response.*;
import fpt.aptech.springbootapp.entities.System.*;
import fpt.aptech.springbootapp.repositories.RoleRepository;
import fpt.aptech.springbootapp.repositories.System.*;
import fpt.aptech.springbootapp.repositories.UserRepository;
import fpt.aptech.springbootapp.securities.JwtUtils;
import org.springframework.beans.factory.annotation.*;
import org.springframework.security.crypto.password.*;
import org.springframework.stereotype.Service;

import fpt.aptech.springbootapp.entities.Core.*;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserServiceImp implements UserService {

    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private UserRepository userRepository;
    private RoleRepository roleRepository;
    private JwtUtils jwtUtils;
    private PasswordEncoder passwordEncoder;
    private EmailService emailService;

    @Autowired
    public UserServiceImp(
            UserRepository userRepository,
            RoleRepository roleRepository,
            JwtUtils jwtUtils,
            PasswordEncoder passwordEncoder,
            PasswordResetTokenRepository passwordResetTokenRepository,
            EmailService emailService
        ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.jwtUtils = jwtUtils;
        this.passwordEncoder = passwordEncoder;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.emailService = emailService;
    }

    @Override
    public UserResponseDto register(RegisterReq registerReq) {
        if (userRepository.findByPhone(registerReq.getPhone()).isPresent()) {
            throw new RuntimeException("Phone already exists");
        }

        TbRole role = roleRepository.findById(registerReq.getRoleId())
                .orElseThrow(() -> new RuntimeException("Role not found"));


        TbUser user = new TbUser();
        user.setFullName(registerReq.getFullName());
        user.setEmail(registerReq.getEmail());
        user.setPasswordHash(passwordEncoder.encode(registerReq.getPassword())); // Hash password
        user.setPhone(registerReq.getPhone());
        user.setRole(role);

        if (registerReq.getDepartmentId() != null) {
            // Fetch department từ repository và set
//             user.setDepartment(departmentRepository.findById(registerReq.getDepartmentId()).orElse(null));
        }
        if (registerReq.getLineId() != null) {
//             user.setLine(lineRepository.findById(registerReq.getLineId()).orElse(null));
        }
        if (registerReq.getSkillLevelId() != null) {
//             user.setSkillLevel(skillLevelRepository.findById(registerReq.getSkillLevelId()).orElse(null));
        }
        if (registerReq.getSalaryType() != null) {
            user.setSalaryType(TbUser.SalaryType.valueOf(registerReq.getSalaryType()));
        }
        if (registerReq.getBaseSalary() != null) {
            user.setBaseSalary(registerReq.getBaseSalary());
        }
        if (registerReq.getHireDate() != null) {
            user.setHireDate(registerReq.getHireDate());
        }

        user.setStatus(TbUser.UserStatus.Active);
        user.setCreatedAt(Instant.now());

        // Save
        TbUser savedUser = userRepository.save(user);

        // Return DTO
        return buildUserResponseDto(savedUser);
    }

    @Override
    public TbUser createOrUpdateUser(TbUser user) {
        if (user.getId() == null) {
            TbRole userRole = roleRepository.findByName("USER")
                .orElseGet(() -> roleRepository.save(new TbRole(null, "USER", "Default user role", null)));
            user.setRole(userRole);
            user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));
            user.setCreatedAt(Instant.now());
            user.setStatus(TbUser.UserStatus.Active);
        }
        return userRepository.save(user);
    }

    @Override
    public LoginResponse login(LoginReq loginReq) {
        //tim
        TbUser user = userRepository.findByPhone(loginReq.getPhone())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(loginReq.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid phone or password");
        }

        String token = jwtUtils.generateToken(user.getPhone(), user.getRole().getName());

        UserResponseDto userDto = buildUserResponseDto(user);

        return LoginResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .user(userDto)
                .build();

    }

    //Anh Tú có thể dùng UserMapper
    private UserResponseDto buildUserResponseDto(TbUser user) {
        return UserResponseDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .roleId(user.getRole() != null ? user.getRole().getId() : null)
                .roleName(user.getRole() != null ? user.getRole().getName() : null)
                .departmentId(user.getDepartment() != null ? user.getDepartment().getId() : null)
                .departmentName(user.getDepartment() != null ? user.getDepartment().getName() : null)
                .lineId(user.getLine() != null ? user.getLine().getId() : null)
                .lineName(user.getLine() != null ? user.getLine().getName() : null)
                .skillLevelId(user.getSkillLevel() != null ? user.getSkillLevel().getId() : null)
                .skillLevelName(user.getSkillLevel() != null ? user.getSkillLevel().getName() : null)
                .salaryType(user.getSalaryType() != null ? user.getSalaryType() : null)
                .baseSalary(user.getBaseSalary())
                .hireDate(user.getHireDate())
                .status(user.getStatus() != null ? user.getStatus() : null)
                .createdAt(user.getCreatedAt())
                .build();
    }

    @Override
    public Optional<TbUser> findByPhone(String phone) {
        return userRepository.findByPhone(phone);
    }

    @Override
    public UserResponseDto getUserByPhone(String phone) {
        TbUser user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("Not found employee: " + phone));

        return buildUserResponseDto(user);
    }

    @Override
    public List<TbUser> findAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public void changePassword(String phone, ChangePassReq request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("New password and confirm password do not match");
        }

        TbUser user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Old password is incorrect");
        }
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void forgotPassword(String phone) {
        TbUser user = userRepository.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // xoá token cũ
        passwordResetTokenRepository.deleteByUser(user);
        // TODO: Generate reset token and send email
         String resetToken = UUID.randomUUID().toString();
        // Save token to database with expiration time
        TbPasswordResetToken passwordResetToken = new TbPasswordResetToken();
        passwordResetToken.setToken(resetToken);
        passwordResetToken.setUser(user);
        passwordResetToken.setExpiryDate(Instant.now().plusMillis(60 * 60 * 1000)); // 5 phut
        passwordResetToken.setUsed(false);
        passwordResetToken.setCreatedAt(Instant.now());

        passwordResetTokenRepository.save(passwordResetToken);
        // Send email with reset link
        emailService.sendPasswordResetEmail(user.getEmail(), resetToken, user.getFullName());
        System.out.println("Password reset email sent to " + user.getEmail());
    }

    @Override
    @Transactional
    public void resetPassword(String token, String newPassword) {
        // TODO: Validate token and reset password
        // Find user by reset token
        if (token == null || token.trim().isEmpty()) {
            throw new RuntimeException("Reset token is required");
        }
        if (newPassword == null || newPassword.length() < 6) {
            throw new RuntimeException("New password must be at least 6 characters");
        }
        // Check if token is expired
        TbPasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid reset token"));
        if (resetToken.getUsed()) {
            throw new RuntimeException("Reset token has already been used");
        }
        if (resetToken.isExpired()) {
            throw new RuntimeException("Reset token has expired. Please request a new one.");
        }
        TbUser user = resetToken.getUser();
        // Update password
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);
        System.out.println("Password reset successful for user " + user.getEmail());
    }
}
