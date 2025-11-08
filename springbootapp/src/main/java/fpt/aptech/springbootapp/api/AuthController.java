package fpt.aptech.springbootapp.api;

import fpt.aptech.springbootapp.dtos.request.Auth.UserDto;
import fpt.aptech.springbootapp.dtos.response.UserResponseDto;
import fpt.aptech.springbootapp.entities.Core.TbUser;
import fpt.aptech.springbootapp.securities.JwtUtils;
import fpt.aptech.springbootapp.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private AuthenticationManager authenticationManager;
    private JwtUtils jwtUtils;
    private UserService userService;
    private PasswordEncoder passwordEncoder;

    @Autowired
    public AuthController(AuthenticationManager authenticationManager, JwtUtils jwtUtils, UserService userService, PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/getallemp")
    public ResponseEntity<?> getAll() {
        try {
            List<TbUser> users = userService.findAllUsers();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(e.getMessage());
        }
    }

    @GetMapping("/getemp/{email}")
    public ResponseEntity<?> getEmployee(@PathVariable String email) {
        try {
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Email cannot be empty");
            }
            UserResponseDto user = userService.getUserByEmail(email);
            return ResponseEntity.ok(user);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(e.getMessage());
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody TbUser user) {
        try {
            // Kiểm tra các trường bắt buộc
            if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(createErrorResponse("Email is required"));
            }
            if (user.getPasswordHash() == null || user.getPasswordHash().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(createErrorResponse("Password is required"));
            }
            // Thêm kiểm tra các trường not null khác trong TbUser
            if (user.getFullName() == null || user.getFullName().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(createErrorResponse("Full Name is required"));
            }
            if (user.getPhone() == null || user.getPhone().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(createErrorResponse("Phone number is required"));
            }

            // Kiểm tra email đã tồn tại chưa
            Optional<TbUser> existingUser = userService.findByEmail(user.getEmail());
            if (existingUser.isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(createErrorResponse("Email already in use"));
            }

            //  Gọi service để tạo user mới
            TbUser newUser = userService.createOrUpdateUser(user);

            //  Trả về response thành công 
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Registration successful. User created with default role.");
            response.put("email", newUser.getEmail());

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            System.err.println("Registration Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Registration Error: " + e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<String> loginUser(@RequestBody UserDto userDto) {
        try{
            if (userDto == null) {
                return ResponseEntity.badRequest().body("UserDto cannot be null");
            }
            if(userDto.getEmail() == null || userDto.getEmail().trim().isEmpty()){
                return ResponseEntity.badRequest().body("Email cannot be empty");
            }
            if(userDto.getPassword() == null || userDto.getPassword().trim().isEmpty()){
                return ResponseEntity.badRequest().body("Password cannot be empty");
            }
            String token = userService.login(userDto);

            UserResponseDto userInfo = userService.getUserByEmail(userDto.getEmail());
            return ResponseEntity.ok(token);
        } catch (IllegalArgumentException e) {
            // validation 400
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(createErrorResponse(e.getMessage()).toString());
        } catch (RuntimeException e) {
            // 401 Unauthorized
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse(e.getMessage()).toString());
        } catch (Exception e) {
            // 500 Internal Server Error
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Server Error: " + e.getMessage()).toString());
        }

    }

    @GetMapping("/logout")
    public ResponseEntity<String> logoutUser() {
        try {
            return ResponseEntity.ok("Logout success");
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/updateuser/{email}")
    public ResponseEntity<?> updateUser(@PathVariable String email, @RequestBody TbUser userUpdate) {
        try {
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("Email cannot be empty"));
            }

            if (userUpdate == null) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("User update data cannot be null"));
            }

            // Tìm user hiện tại
            TbUser existingUser = userService.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Cập nhật các trường (không update password và email)
            existingUser.setFullName(userUpdate.getFullName() != null ? userUpdate.getFullName() : existingUser.getFullName());
            existingUser.setPhone(userUpdate.getPhone() != null ? userUpdate.getPhone() : existingUser.getPhone());
            existingUser.setRole(userUpdate.getRole() != null ? userUpdate.getRole() : existingUser.getRole());
            existingUser.setDepartment(userUpdate.getDepartment() != null ? userUpdate.getDepartment() : existingUser.getDepartment());
            existingUser.setLine(userUpdate.getLine() != null ? userUpdate.getLine() : existingUser.getLine());
            existingUser.setSkillLevel(userUpdate.getSkillLevel() != null ? userUpdate.getSkillLevel() : existingUser.getSkillLevel());
            existingUser.setSalaryType(userUpdate.getSalaryType() != null ? userUpdate.getSalaryType() : existingUser.getSalaryType());
            existingUser.setBaseSalary(userUpdate.getBaseSalary() != null ? userUpdate.getBaseSalary() : existingUser.getBaseSalary());
            existingUser.setHireDate(userUpdate.getHireDate() != null ? userUpdate.getHireDate() : existingUser.getHireDate());
            existingUser.setStatus(userUpdate.getStatus() != null ? userUpdate.getStatus() : existingUser.getStatus());

            TbUser updatedUser = userService.createOrUpdateUser(existingUser);
            UserResponseDto userResponse = userService.getUserByEmail(updatedUser.getEmail());

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Update success");
            response.put("data", userResponse);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Update Error: " + e.getMessage()));
        }
    }


    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> error = new HashMap<>();
        error.put("success", false);
        error.put("message", message);
        return error;
    }


}

