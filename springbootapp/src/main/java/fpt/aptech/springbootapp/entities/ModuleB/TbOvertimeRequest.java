package fpt.aptech.springbootapp.entities.ModuleB;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import fpt.aptech.springbootapp.entities.Core.TbDepartment;
import fpt.aptech.springbootapp.entities.Core.TbUser;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

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

    @PrePersist
    @PreUpdate
    private void calculateDuration() {
        if (this.startTime != null && this.endTime != null) {
            long minutes = java.time.Duration.between(this.startTime, this.endTime).toMinutes();
            if (minutes < 0) minutes += 1440;
            this.overtimeTime = Math.round((minutes / 60.0) * 100.0) / 100.0;
        }
    }

    @OneToMany(mappedBy = "overtimeRequest", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    @JsonIgnoreProperties("overtimeRequest")
    private List<TbOvertimeRequestDetail> lineDetails = new ArrayList<>();

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