package fpt.aptech.springbootapp.filter;

import fpt.aptech.springbootapp.entities.ModuleB.TbOvertimeRequest.OvertimeRequestStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Setter
@Getter
public class OvertimeRequestFilter {
    private Integer factoryManagerId;
    private Integer departmentId;
    private OvertimeRequestStatus status;
    private Instant createdAfter;
    private Instant createdBefore;
}
