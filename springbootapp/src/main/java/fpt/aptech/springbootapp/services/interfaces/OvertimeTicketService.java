package fpt.aptech.springbootapp.services.interfaces;

import fpt.aptech.springbootapp.dtos.ModuleB.OvertimeTicketCreateDTO;
import fpt.aptech.springbootapp.dtos.ModuleB.OvertimeTicketDTO;
import fpt.aptech.springbootapp.entities.ModuleB.TbOvertimeTicket;
import fpt.aptech.springbootapp.filter.OvertimeTicketFilter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface OvertimeTicketService {
    Page<OvertimeTicketDTO> getFilteredTicket(OvertimeTicketFilter filter, Pageable pageable);
    OvertimeTicketDTO submitTicket(Integer id);
    OvertimeTicketDTO confirmTicket(Integer id);
    OvertimeTicketDTO rejectTicket(Integer id, String reason);
    OvertimeTicketDTO approveTicket(Integer id, String reason);

    //not used
    void create(TbOvertimeTicket overtimeTicket);


    OvertimeTicketDTO getTicketById(Integer id);
    void createTicket(OvertimeTicketCreateDTO dto);
}
