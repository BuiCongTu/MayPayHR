package fpt.aptech.springbootapp.services.implementations;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import fpt.aptech.springbootapp.entities.Core.TbRole;
import fpt.aptech.springbootapp.entities.Core.TbUser;
import fpt.aptech.springbootapp.repository.RoleRepository;
import fpt.aptech.springbootapp.repository.UserRepository;
import fpt.aptech.springbootapp.services.interfaces.UserService;

@Service
public class UserServiceImp implements UserService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public TbUser saveUser(TbUser user) {
      TbRole userRole = roleRepository.findByName("USER")
                .orElseGet(() -> roleRepository.save(new TbRole(null, "USER", "Default user role", null)));  // Tạo vai trò USER nếu chưa tồn tại
        user.setRole(userRole);  // Gán vai trò USER cho user mới
        user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));   // Mã hóa mật khẩu trước khi lưu
        user.setCreatedAt(Instant.now());// Đặt thời gian tạo hiện tại
        user.setStatus(TbUser.UserStatus.Active);// Đặt trạng thái là Active
        return userRepository.save(user);// Lưu user vào database và trả về đối tượng đã lưu
        
    }

    @Override
    public Optional<TbUser> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public List<TbUser> findAllUsers() {
        return userRepository.findAll();
    }
    
}