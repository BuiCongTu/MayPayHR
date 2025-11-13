package fpt.aptech.springbootapp.filter;

import fpt.aptech.springbootapp.entities.ModuleB.TbOvertimeTicket.OvertimeTicketStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class OvertimeTicketFilter {
    private Integer managerId;
    private String managerName;
    private Integer requestId;
    private String requesterName;
    private OvertimeTicketStatus status;
    private Integer confirmedById;
    private String confirmedByName;
    private Integer approvedById;
    private String approvedByName;
    private Instant createdAfter;
    private Instant createdBefore;
}
