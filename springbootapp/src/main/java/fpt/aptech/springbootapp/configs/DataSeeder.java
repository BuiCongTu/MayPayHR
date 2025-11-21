package fpt.aptech.springbootapp.configs;

import java.time.Instant;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import fpt.aptech.springbootapp.entities.Core.TbRole;
import fpt.aptech.springbootapp.entities.Core.TbUser;
import fpt.aptech.springbootapp.repositories.RoleRepository;
import fpt.aptech.springbootapp.repositories.UserRepository;

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
        }

        // Tạo tài khoản user nếu chưa có
        // if (userRepository.findByEmail("user@user.com").isEmpty()) {
        //     TbUser user = new TbUser();
        //     user.setEmail("user@user.com");
        //     user.setFullName("Normal User");
        //     user.setPhone("0123456789");
        //     user.setPasswordHash(passwordEncoder.encode("123456"));
        //     user.setStatus(TbUser.UserStatus.Active);
        //     user.setCreatedAt(Instant.now());
        //     user.setRole(userRole);
        //     userRepository.save(user);
        //     System.out.println(" User account created: user@user.com / 123456");
        // }
    }
}
