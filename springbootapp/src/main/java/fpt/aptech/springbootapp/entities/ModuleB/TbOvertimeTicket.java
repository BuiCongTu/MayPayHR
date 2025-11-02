package fpt.aptech.springbootapp.entities.ModuleB;

import fpt.aptech.springbootapp.entities.Core.*;
import jakarta.persistence.*;
import jakarta.persistence.Table;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.*;

import java.math.*;
import java.time.*;

@Getter
@Setter
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "tbOvertimeTicket")
public class TbOvertimeTicket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ticket_id", nullable = false)
    private Integer id;

    //manager
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "manager_id", nullable = false)
    private TbUser manager;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id")
    private TbOvertimeRequest request;

    @NotNull
    @Lob//khai bao dang large text
    @Column(name = "employee_list", nullable = false)
    private String employeeList;

    @NotNull
    @Column(name = "overtime_time", nullable = false, precision = 15, scale = 2)
    private BigDecimal overtimeTime;

    @Lob//khai bao dang large text
    @Column(name = "reason")
    private String reason;

    @Enumerated(EnumType.STRING)
    @ColumnDefault("'pending'")
    @Column(name = "status", length = 20)
    private OvertimeTicketStatus status = OvertimeTicketStatus.pending;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "confirmed_by")
    private TbUser confirmedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private TbUser approvedBy;

    @ColumnDefault("getdate()")
    @Column(name = "created_at")
    private Instant createdAt;

    public enum OvertimeTicketStatus {
        pending, confirmed, approved, rejected
    }

}