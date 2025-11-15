package fpt.aptech.springbootapp.entities.ModuleB;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import fpt.aptech.springbootapp.entities.Core.*;
import jakarta.persistence.*;
import jakarta.persistence.Table;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.*;

import java.math.*;
import java.time.*;
import java.util.Set;
import java.util.HashSet;

@Getter
@Setter
@Entity
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "tbOvertimeTicket")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class TbOvertimeTicket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ticket_id", nullable = false)
    private Integer id;

    // manager
    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "manager_id", nullable = false)
    private TbUser manager;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id")
    private TbOvertimeRequest overtimeRequest;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "tb_overtime_ticket_employees", // The new conjunction table
            joinColumns = @JoinColumn(name = "overtime_ticket_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<TbUser> employees = new HashSet<>();

    @NotNull
    @Column(name = "overtime_time", nullable = false, precision = 15, scale = 2)
    private BigDecimal overtimeTime;

    @Lob // khai bao dang large text
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