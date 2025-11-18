package fpt.aptech.springbootapp.filter;

import fpt.aptech.springbootapp.entities.ModuleB.TbOvertimeRequest.OvertimeRequestStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;

@Setter
@Getter
public class OvertimeRequestFilter {
    private Integer factoryManagerId;
    private String factoryManagerName;
    private Integer departmentId;
    private String departmentName;
    private Integer numEmployees;
    private Double overtimeTime;
    private LocalDate overtimeDate;
    private LocalDate overtimeDateStart;
    private LocalDate overtimeDateEnd;
    private OvertimeRequestStatus status;
    private Instant createdAfter;
    private Instant createdBefore;
}
