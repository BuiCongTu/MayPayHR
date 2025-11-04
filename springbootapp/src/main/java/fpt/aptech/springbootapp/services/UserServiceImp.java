package fpt.aptech.springbootapp.services;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import fpt.aptech.springbootapp.dtos.request.Auth.UserDto;
import fpt.aptech.springbootapp.dtos.response.UserResponseDto;
import fpt.aptech.springbootapp.securities.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import fpt.aptech.springbootapp.entities.Core.TbRole;
import fpt.aptech.springbootapp.entities.Core.TbUser;
import fpt.aptech.springbootapp.repository.RoleRepository;
import fpt.aptech.springbootapp.repository.UserRepository;

@Service
public class UserServiceImp implements UserService {

    private UserRepository userRepository;
    private RoleRepository roleRepository;
    private JwtUtils jwtUtils;
    private PasswordEncoder passwordEncoder;

    @Autowired
    public UserServiceImp(UserRepository userRepository, RoleRepository roleRepository, JwtUtils jwtUtils, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.jwtUtils = jwtUtils;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public TbUser register(TbUser user) {
        user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));
        return createOrUpdateUser(user);
    }

    @Override
    public TbUser createOrUpdateUser(TbUser user) {
      TbRole userRole = roleRepository.findByName("USER")
                .orElseGet(() -> roleRepository.save(new TbRole(null, "USER", "Default user role", null)));
        user.setRole(userRole);
        user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));
        user.setCreatedAt(Instant.now());
        user.setStatus(TbUser.UserStatus.Active);
        return userRepository.save(user);
    }

    @Override
    public String login(UserDto userDto) {
        TbUser user = userRepository.findByEmail(userDto.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (passwordEncoder.matches(userDto.getPassword(), user.getPasswordHash())) {
            return jwtUtils.generateToken(user.getEmail(), user.getRole().getName());
        }
        else {
            throw new RuntimeException("Invalid username or wrong password");
        }
    }

    @Override
    public Optional<TbUser> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public UserResponseDto getUserByEmail(String email) {
        TbUser user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Not found employee: " + email));

        return UserResponseDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .roleName(user.getRole() != null ? user.getRole().getName() : null)
                .departmentName(user.getDepartment() != null ? user.getDepartment().getName() : null)
                .lineName(user.getLine() != null ? user.getLine().getName() : null)
                .skillLevelName(user.getSkillLevel() != null ? user.getSkillLevel().getName() : null)
                .salaryType(user.getSalaryType() != null ? user.getSalaryType().name() : null)
                .baseSalary(user.getBaseSalary())
                .hireDate(user.getHireDate())
                .status(user.getStatus() != null ? user.getStatus().name() : null)
                .createdAt(user.getCreatedAt())
                .build();

    }

    @Override
    public List<TbUser> findAllUsers() {
        return userRepository.findAll();
    }
    
}