package fpt.aptech.springbootapp.entities.Core;

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
    private String email;

     //thêm passwordhash thay vì password
    @Size(max = 255)
    @Column(name = "password_hash")
    private String passwordHash;


    @Size(max = 20)
    @NotNull
    @Column(name = "phone", nullable = false, length = 20)
    private String phone;

    //relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id")
    private TbRole role;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private TbDepartment department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "line_id")
    private TbLine line;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skill_level_id")
    private TbSkillLevel skillLevel;

    //fields
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

    //enum
    public enum SalaryType {
        ProductBased, TimeBased
    }

    public enum UserStatus {
        Active, Inactive, Terminated
    }

}