package fpt.aptech.springbootapp.api;

import fpt.aptech.springbootapp.dtos.request.Auth.*;
import fpt.aptech.springbootapp.dtos.response.*;
import fpt.aptech.springbootapp.entities.Core.TbUser;
import fpt.aptech.springbootapp.securities.JwtUtils;
import fpt.aptech.springbootapp.services.System.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private JwtUtils jwtUtils;
    private UserService userService;

    @Autowired
    public AuthController(
            JwtUtils jwtUtils,
            UserService userService) {
        this.jwtUtils = jwtUtils;
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginReq request) {
        try {
            LoginResponse loginResponse = userService.login(request);
            return ResponseEntity.ok(ApiResponse.success("Login successful", loginResponse));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout() {
        return ResponseEntity.ok(ApiResponse.success("Logout successful", null));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponseDto>> register(@Valid @RequestBody RegisterReq request) {
        try {
            UserResponseDto user = userService.register(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Registration successful", user));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/getallemp")
    public ResponseEntity<ApiResponse<List<TbUser>>> getAllEmployees() {
        try {
            List<TbUser> users = userService.findAllUsers();
            return ResponseEntity.ok(ApiResponse.success(users));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/getemp/{email}")
    public ResponseEntity<ApiResponse<UserResponseDto>> getUserByEmail(@PathVariable String email) {
        try {
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Email cannot be empty"));
            }

            UserResponseDto user = userService.getUserByEmail(email);
            return ResponseEntity.ok(ApiResponse.success(user));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/updateuser/{email}")
    public ResponseEntity<ApiResponse<UserResponseDto>> updateUser(
            @PathVariable String email,
            @RequestBody TbUser userUpdate) {
        try {
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Email cannot be empty"));
            }

            if (userUpdate == null) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("User update data cannot be null"));
            }

            TbUser existingUser = userService.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // ko cập nhật password và email)
            if (userUpdate.getFullName() != null) {
                existingUser.setFullName(userUpdate.getFullName());
            }
            if (userUpdate.getPhone() != null) {
                existingUser.setPhone(userUpdate.getPhone());
            }
            if (userUpdate.getRole() != null) {
                existingUser.setRole(userUpdate.getRole());
            }
            if (userUpdate.getDepartment() != null) {
                existingUser.setDepartment(userUpdate.getDepartment());
            }
            if (userUpdate.getLine() != null) {
                existingUser.setLine(userUpdate.getLine());
            }
            if (userUpdate.getSkillLevel() != null) {
                existingUser.setSkillLevel(userUpdate.getSkillLevel());
            }
            if (userUpdate.getSalaryType() != null) {
                existingUser.setSalaryType(userUpdate.getSalaryType());
            }
            if (userUpdate.getBaseSalary() != null) {
                existingUser.setBaseSalary(userUpdate.getBaseSalary());
            }
            if (userUpdate.getHireDate() != null) {
                existingUser.setHireDate(userUpdate.getHireDate());
            }
            if (userUpdate.getStatus() != null) {
                existingUser.setStatus(userUpdate.getStatus());
            }

            TbUser updatedUser = userService.createOrUpdateUser(existingUser);
            UserResponseDto userResponse = userService.getUserByEmail(updatedUser.getEmail());

            return ResponseEntity.ok(ApiResponse.success("Update successful", userResponse));

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Update Error: " + e.getMessage()));
        }
    }

    // lay thong tin user hiện tại từ JWT token
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponseDto>> getCurrentUser() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();

            UserResponseDto user = userService.getUserByEmail(email);
            return ResponseEntity.ok(ApiResponse.success(user));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/change-password")
    public ResponseEntity<ApiResponse<String>> changePassword(
            @RequestParam String email,
            @Valid @RequestBody ChangePassReq request) {
        try {
            userService.changePassword(email, request);
            return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@RequestParam String email) {
        try {
            userService.forgotPassword(email);
            return ResponseEntity.ok(
                    ApiResponse.success("Password reset link sent to your email", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(
            @RequestParam String token,
            @RequestParam String newPassword) {
        try {
            userService.resetPassword(token, newPassword);
            return ResponseEntity.ok(ApiResponse.success("Password reset successful", null));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}