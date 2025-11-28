package fpt.aptech.springbootapp.dtos.ModuleB;

import fpt.aptech.springbootapp.entities.ModuleB.TbOvertimeTicket.OvertimeTicketStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Getter
@Setter
public class OvertimeTicketDTO {
    private Integer id;
    private Integer managerId;
    private String managerName;

    private Integer requestId;

    private String requesterName; // Factory Manager Name
    private String departmentName;
    private LocalDate overtimeDate;
    private LocalTime startTime;
    private LocalTime endTime;

    private String reason;
    private OvertimeTicketStatus status;

    private Integer confirmedById;
    private String confirmedByName;

    private Integer approvedById;
    private String approvedByName;

    private Instant createdAt;

    private List<OvertimeEmployeeDTO> employeeList;
}