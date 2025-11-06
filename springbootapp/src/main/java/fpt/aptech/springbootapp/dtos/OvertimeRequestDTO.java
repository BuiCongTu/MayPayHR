package fpt.aptech.springbootapp.dtos;

import fpt.aptech.springbootapp.entities.ModuleB.TbOvertimeRequest.OvertimeRequestStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
public class OvertimeRequestDTO {
    private Integer id;
    private OvertimeRequestStatus status;
    private Double overtimeTime;
    private Integer numEmployees;
    private String details;
    private Instant createdAt;

    private Integer departmentId;
    private String departmentName;

    private Integer factoryManagerId;
    private String factoryManagerName;

    private List<OvertimeTicketDTO> overtimeTickets;
}
