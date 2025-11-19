package fpt.aptech.springbootapp.services.System;

import java.time.Instant;
import java.util.*;

import fpt.aptech.springbootapp.dtos.request.Auth.*;
import fpt.aptech.springbootapp.dtos.response.*;
import fpt.aptech.springbootapp.entities.Core.TbRole;
import fpt.aptech.springbootapp.entities.Core.TbUser;
import fpt.aptech.springbootapp.entities.System.TbPasswordResetToken;
import fpt.aptech.springbootapp.repositories.RoleRepository;
import fpt.aptech.springbootapp.repositories.System.PasswordResetTokenRepository;
import fpt.aptech.springbootapp.repositories.UserRepository;
import fpt.aptech.springbootapp.securities.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserServiceImp implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final JwtUtils jwtUtils;
    private final PasswordEncoder passwordEncoder;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailService emailService;

    @Autowired
    public UserServiceImp(
            UserRepository userRepository,
            RoleRepository roleRepository,
            JwtUtils jwtUtils,
            PasswordEncoder passwordEncoder,
            PasswordResetTokenRepository passwordResetTokenRepository,
            EmailService emailService) {
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
        user.setPhone(registerReq.getPhone());
        user.setPasswordHash(passwordEncoder.encode(registerReq.getPassword()));
        user.setRole(role);
        user.setStatus(TbUser.UserStatus.Active);
        user.setCreatedAt(Instant.now());

        TbUser savedUser = userRepository.save(user);
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
    public TbUser updateUser(Integer id, TbUser userUpdate) {
        TbUser existing = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (userUpdate.getFullName() != null) existing.setFullName(userUpdate.getFullName());
        if (userUpdate.getPhone() != null) existing.setPhone(userUpdate.getPhone());
        if (userUpdate.getRole() != null) existing.setRole(userUpdate.getRole());
        if (userUpdate.getStatus() != null) existing.setStatus(userUpdate.getStatus());

        return userRepository.save(existing);
    }

    @Override
    public LoginResponse login(LoginReq loginReq) {
        TbUser user = userRepository.findByPhone(loginReq.getPhone())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(loginReq.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid phone or password");
        }

        String token = jwtUtils.generateToken(user.getPhone(), user.getRole().getName());
        return LoginResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .user(buildUserResponseDto(user))
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

        passwordResetTokenRepository.deleteByUser(user);

        String resetToken = UUID.randomUUID().toString();
        TbPasswordResetToken tokenEntity = new TbPasswordResetToken();
        tokenEntity.setToken(resetToken);
        tokenEntity.setUser(user);
        tokenEntity.setExpiryDate(Instant.now().plusMillis(60 * 60 * 1000));
        tokenEntity.setUsed(false);
        tokenEntity.setCreatedAt(Instant.now());

        passwordResetTokenRepository.save(tokenEntity);
        emailService.sendPasswordResetEmail(user.getEmail(), resetToken, user.getFullName());
    }

    @Override
    @Transactional
    public void resetPassword(String token, String newPassword) {
        if (token == null || token.trim().isEmpty()) {
            throw new RuntimeException("Reset token is required");
        }
        if (newPassword == null || newPassword.length() < 6) {
            throw new RuntimeException("New password must be at least 6 characters");
        }

        TbPasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid reset token"));

        if (resetToken.getUsed()) throw new RuntimeException("Reset token has already been used");
        if (resetToken.isExpired()) throw new RuntimeException("Reset token has expired");

        TbUser user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);
    }

    private UserResponseDto buildUserResponseDto(TbUser user) {
        return UserResponseDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .roleId(user.getRole() != null ? user.getRole().getId() : null)
                .roleName(user.getRole() != null ? user.getRole().getName() : null)
                .status(user.getStatus() != null ? user.getStatus().name() : null)
                .createdAt(user.getCreatedAt())
                .build();
    }
}
