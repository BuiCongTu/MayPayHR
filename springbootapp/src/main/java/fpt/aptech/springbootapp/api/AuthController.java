package fpt.aptech.springbootapp.api;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.authentication.UserServiceBeanDefinitionParser;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import fpt.aptech.springbootapp.entities.Core.TbUser;
import fpt.aptech.springbootapp.securities.JwtUtils;
import fpt.aptech.springbootapp.service.UserService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

 @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtils jwtUtils; // Sử dụng JwtUtils để tạo token

    @Autowired
    private UserService userService;  // Sử dụng UserService để thao tác với User
    @Autowired
    private PasswordEncoder passwordEncoder;   // Sử dụng PasswordEncoder để mã hóa mật khẩu

    // Register
    @PostMapping("/register")
    public TbUser register(@RequestBody TbUser user) {
        user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));  // Mã hóa mật khẩu trước khi lưu
        return userService.saveUser(user);
    }

    // Login
    @PostMapping("/login")
    public String login(@RequestBody TbUser user) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getEmail(), user.getPasswordHash())   // Tạo đối tượng Authentication
        );

        if (authentication.isAuthenticated()) {  // Kiểm tra xác thực thành công
            Optional<TbUser> existingUser = userService.findByEmail(user.getEmail());   // Lấy thông tin user từ database
            if (existingUser.isPresent()) {   // Kiểm tra user có tồn tại
                return jwtUtils.generateToken(    // Tạo và trả về JWT token
                        existingUser.get().getEmail(),  // Email của user
                        existingUser.get().getRole().getName()    // Role của user
                );
            }
        }
        return "Invalid credentials";
    }
}

