package fpt.aptech.springbootapp.filter;

import fpt.aptech.springbootapp.entities.ModuleB.TbOvertimeTicket.OvertimeTicketStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class OvertimeTicketFilter {
    private Integer managerId;
    private Integer requestId;
    private OvertimeTicketStatus status;
    private Integer confirmedById;
    private Integer approvedById;
    private Instant createdAfter;
    private Instant createdBefore;
}
