package fpt.aptech.springbootapp.configs;

import fpt.aptech.springbootapp.entities.Core.TbRole;
import fpt.aptech.springbootapp.entities.Core.TbUser;


import fpt.aptech.springbootapp.repositories.RoleRepository;
import fpt.aptech.springbootapp.repositories.UserRepository;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {

        // Tạo vai trò nếu chưa tồn tại
        TbRole adminRole = roleRepository.findByName("ADMIN")
                .orElseGet(() -> roleRepository.save(new TbRole(null, "ADMIN", null, null)));

        TbRole userRole = roleRepository.findByName("USER")
                .orElseGet(() -> roleRepository.save(new TbRole(null, "USER", null, null)));

        // Tạo tài khoản admin nếu chưa có
        if (userRepository.findByPhone("0987654321").isEmpty()) {
            TbUser admin = new TbUser();
            admin.setEmail("admin@admin.com");
            admin.setFullName("Admin User");
            admin.setPhone("0987654321");
            admin.setPasswordHash(passwordEncoder.encode("123456"));
            admin.setStatus(TbUser.UserStatus.Active);
            admin.setCreatedAt(Instant.now());
            admin.setRole(adminRole);

            userRepository.save(admin);
            System.out.println(" Admin account created: admin@admin.com / 123456");
        }

        
    }
}
