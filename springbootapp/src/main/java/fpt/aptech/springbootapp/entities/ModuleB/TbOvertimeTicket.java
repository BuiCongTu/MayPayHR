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
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

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

    @NotNull
    @Lob // khai bao dang large text
    @Column(name = "employee_list", nullable = false)
    private String employeeList; //ex: "CN1, CN2, CN3"

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

    @Transient
    private List<String> employeeIdList;

    public List<String> toEmployeeIdList(String employeeListStr) {
        if (employeeListStr == null || employeeListStr.trim().isEmpty()) {
            return Collections.emptyList();
        }

        final String VALID_ID_PATTERN = "^[a-zA-Z0-9]+$";

        return Arrays.stream(employeeListStr.split(","))
                .map(String::trim)
                .filter(id -> !id.isEmpty())
                .filter(id -> id.matches(VALID_ID_PATTERN))

                .collect(Collectors.toList());
    }

    public String fromEmployeeIdList(List<String> idList) {
        if (idList == null || idList.isEmpty()) {
            return "";
        }
        return String.join(", ", idList);
    }

    @PostLoad
    void populateEmployeeIdList() {
        this.employeeIdList = this.toEmployeeIdList(this.employeeList);
    }

    @PrePersist
    void populateEmployeeListString() {
        this.employeeList = this.fromEmployeeIdList(this.employeeIdList);
    }

    @PreUpdate
    void populateEmployeeListStringOnUpdate() {
        this.employeeList = this.fromEmployeeIdList(this.employeeIdList);
    }

    public List<String> getEmployeeIdList() {
        if (this.employeeIdList == null) {
            this.employeeIdList = this.toEmployeeIdList(this.employeeList);
        }
        return this.employeeIdList;
    }
}