package fpt.aptech.springbootapp.services.interfaces;

import fpt.aptech.springbootapp.dtos.ModuleB.OvertimeTicketDTO;
import fpt.aptech.springbootapp.entities.ModuleB.TbOvertimeTicket;
import fpt.aptech.springbootapp.filter.OvertimeTicketFilter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface OvertimeTicketService {
    Page<OvertimeTicketDTO> getFilteredTicket(OvertimeTicketFilter filter, Pageable pageable);
    OvertimeTicketDTO confirmTicket(Integer id);
    OvertimeTicketDTO rejectTicket(Integer id, String reason);
    OvertimeTicketDTO approveTicket(Integer id, String reason);
    void create(TbOvertimeTicket overtimeTicket);
}
