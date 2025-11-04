package fpt.aptech.springbootapp.api;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import fpt.aptech.springbootapp.dto.LoginRequest;
import fpt.aptech.springbootapp.entities.Core.TbUser;
import fpt.aptech.springbootapp.securities.JwtUtils;
import fpt.aptech.springbootapp.services.interfaces.UserService;




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
public String login(@RequestBody LoginRequest request) {
    Optional<TbUser> existingUser = userService.findByEmail(request.getEmail());

    if (existingUser.isEmpty()) {
        System.out.println("User not found: " + request.getEmail());
        return "User not found";
    }

    TbUser user = existingUser.get();

    System.out.println("Found user: " + user.getEmail());
    System.out.println("Password hash: " + user.getPasswordHash());


    String token = jwtUtils.generateToken(
        user.getEmail(),
        user.getRole().getName()
    );

    System.out.println("Token generated: " + token);

    return token;
}


}

