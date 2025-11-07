package fpt.aptech.springbootapp.services.interfaces;

import fpt.aptech.springbootapp.dtos.OvertimeTicketDTO;
import fpt.aptech.springbootapp.filter.OvertimeTicketFilter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface OvertimeTicketService {
    public Page<OvertimeTicketDTO> getFilteredTicket(OvertimeTicketFilter filter, Pageable pageable);
}
