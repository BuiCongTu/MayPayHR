package fpt.aptech.springbootapp.entities.ModuleB;

import fpt.aptech.springbootapp.entities.Core.*;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

import java.time.*;
import java.util.*;

@Getter
@Setter
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "tbOvertimeRequest")
public class TbOvertimeRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "request_id", nullable = false)
    private Integer id;

    //n:1 factory manager
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "factory_manager_id", nullable = false)
    private TbUser factoryManager;

    //n:1 department
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "department_id", nullable = false)
    private TbDepartment department;

    @NotNull
    @Column(name = "overtime_time", nullable = false)
    private Double overtimeTime;

    @NotNull
    @Column(name = "num_employees", nullable = false)
    private Integer numEmployees;

    @Enumerated(EnumType.STRING)
    @ColumnDefault("'pending'")
    @Column(name = "status", length = 20)
    private OvertimeRequestStatus status = OvertimeRequestStatus.pending;

    @Lob //khai bao dang large text
    @Column(name = "details")
    private String details;

    @ColumnDefault("getdate()")
    @Column(name = "created_at")
    private Instant createdAt;
    //sửa request thành overtimeRequest 
    @OneToMany(mappedBy = "overtimeRequest", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private List<TbOvertimeTicket> overtimeTickets = new ArrayList<>();

    public enum OvertimeRequestStatus {
        pending, processed
    }

}