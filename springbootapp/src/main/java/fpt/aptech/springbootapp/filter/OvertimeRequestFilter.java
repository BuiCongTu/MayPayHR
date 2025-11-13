package fpt.aptech.springbootapp.filter;

import fpt.aptech.springbootapp.entities.ModuleB.TbOvertimeRequest.OvertimeRequestStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Setter
@Getter
public class OvertimeRequestFilter {
    private Integer factoryManagerId;
    private String factoryManagerName;
    private Integer departmentId;
    private String departmentName;
    private Integer numEmployees;
    private Double overtimeTime;
    private OvertimeRequestStatus status;
    private Instant createdAfter;
    private Instant createdBefore;
}
