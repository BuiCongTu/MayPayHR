package fpt.aptech.springbootapp.api.ModuleB;

import fpt.aptech.springbootapp.dtos.OvertimeTicketDTO;
import fpt.aptech.springbootapp.filter.OvertimeTicketFilter;
import fpt.aptech.springbootapp.services.interfaces.OvertimeTicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/overtime-ticket")
public class OvertimeTicketController {

    private final OvertimeTicketService overtimeTicketService;

    @Autowired
    public OvertimeTicketController(OvertimeTicketService overtimeTicketService) {
        this.overtimeTicketService = overtimeTicketService;
    }

    @GetMapping("/")
    @ResponseStatus(code = HttpStatus.OK)
    public Page<OvertimeTicketDTO> getFiltered(@ModelAttribute OvertimeTicketFilter filter, Pageable pageable){
        return overtimeTicketService.getFilteredTicket(filter, pageable);
    }
}
