package fpt.aptech.springbootapp.dtos.ModuleB;

import fpt.aptech.springbootapp.entities.ModuleB.TbOvertimeTicket.OvertimeTicketStatus;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
public class OvertimeTicketDTO {
    private Integer id;

    private Integer managerId;
    private String managerName;

    private Integer requestId;

    private String employeeList;
    private BigDecimal overtimeTime;
    private String reason;
    private OvertimeTicketStatus status;

    private Integer confirmedById;
    private String confirmedByName;

    private Integer approvedById;
    private String approvedByName;

    private Instant createdAt;
}
