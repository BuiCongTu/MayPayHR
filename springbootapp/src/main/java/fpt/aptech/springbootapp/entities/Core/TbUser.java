package fpt.aptech.springbootapp.entities.Core;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

import java.math.*;
import java.time.*;

@Getter
@Setter
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "tbUser")
public class TbUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id", nullable = false)
    private Integer id;

    @Size(max = 255)
    @NotNull
    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Size(max = 255)
    @Column(name = "email")
    @Pattern(regexp = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$", message = "Invalid email format")
    private String email;

    // thêm passwordhash thay vì password
    @JsonIgnore
    @Size(max = 255)
    @Column(name = "password_hash")
    private String passwordHash;

    

    @Size(max = 20)
    @NotNull
    @Column(name = "phone", nullable = false, length = 20)
    private String phone;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id")
    @JsonIgnoreProperties({"users"})
    private TbRole role;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    @JsonIgnoreProperties({"users", "lines", "manager"})
    private TbDepartment department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "line_id")
    @JsonIgnoreProperties({"users", "department", "manager"})
    private TbLine line;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skill_level_id")
    @JsonIgnoreProperties({"users"})
    private TbSkillLevel skillLevel;

    // fields
    @JsonIgnore
    @Lob
    @Column(name = "face_data")
    private String faceData;

    @Enumerated(EnumType.STRING)
    @ColumnDefault("'TimeBased'")
    @Column(name = "salary_type", length = 20)
    private SalaryType salaryType;

    @ColumnDefault("0")
    @Column(name = "base_salary", precision = 10, scale = 2)
    private BigDecimal baseSalary;

    @Column(name = "hire_date")
    private LocalDate hireDate;

    @Enumerated(EnumType.STRING)
    @ColumnDefault("'Active'")
    @Column(name = "status", length = 20)
    private UserStatus status;

    @ColumnDefault("getdate()")
    @Column(name = "created_at")
    private Instant createdAt;

    // enum
    public enum SalaryType {
        ProductBased, TimeBased
    }

    public enum UserStatus {
        Active, Inactive, Terminated
    }

}