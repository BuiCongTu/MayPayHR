package fpt.aptech.springbootapp.entities.ModuleB;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class TbOvertimeRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "request_id", nullable = false)
    private Integer id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "factory_manager_id", nullable = false)
    private TbUser factoryManager;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "department_id", nullable = false)
    private TbDepartment department;

    // [NEW] Date and Time Fields
    @NotNull
    @Column(name = "overtime_date", nullable = false)
    private LocalDate overtimeDate;

    @NotNull
    @ColumnDefault("'17:00:00'")
    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @NotNull
    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

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

    @Lob
    @Column(name = "details")
    private String details;

    @ColumnDefault("getdate()")
    @Column(name = "created_at")
    private Instant createdAt;

    @OneToMany(mappedBy = "overtimeRequest", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private List<TbOvertimeTicket> overtimeTickets = new ArrayList<>();

    public enum OvertimeRequestStatus {
        pending,    // Waiting for FD
        open,       // FD Approved
        processed,  // Done (Ticket Approved)
        rejected,   // FD Rejected
        expired     // Date passed without action
    }
}