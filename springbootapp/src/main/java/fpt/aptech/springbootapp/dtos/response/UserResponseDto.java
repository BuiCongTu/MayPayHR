package fpt.aptech.springbootapp.dtos.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class UserResponseDto {
    private Integer id;
    private String fullName;
    private String email;
    private String phone;
    private String roleName;
    private String departmentName;
    private String lineName;
    private String skillLevelName;
    private String salaryType;
    private BigDecimal baseSalary;
    private LocalDate hireDate;
    private String status;
    private Instant createdAt;

}
