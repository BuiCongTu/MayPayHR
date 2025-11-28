package fpt.aptech.springbootapp.dtos.request.Auth;

import lombok.*;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;


@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RegisterReq {
    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password; // plaintext password

    @NotBlank(message = "Phone is required")
    @Pattern(regexp = "^[0-9]{10,11}$", message = "Phone must be 10-11 digits")
    private String phone;

    @NotNull(message = "Role ID is required")
    private Integer roleId;

    @NotNull(message = "Department ID is required")
    private Integer departmentId;

    private String verificationMethod; // hinhf thuc email hoac sms

    // Optional fields
    private Integer lineId;
    private Integer skillLevelId;
    private String salaryType;
    private BigDecimal baseSalary;
    private LocalDate hireDate;

}
