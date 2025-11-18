package fpt.aptech.springbootapp.api.ModuleB;

import fpt.aptech.springbootapp.dtos.ModuleB.OvertimeTicketDTO;
import fpt.aptech.springbootapp.entities.ModuleB.TbOvertimeTicket;
import fpt.aptech.springbootapp.filter.OvertimeTicketFilter;
import fpt.aptech.springbootapp.services.interfaces.OvertimeTicketService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
    public Page<OvertimeTicketDTO> getFiltered(@ModelAttribute OvertimeTicketFilter filter, Pageable pageable) {
        return overtimeTicketService.getFilteredTicket(filter, pageable);
    }

    @PostMapping("/{id}/confirm")
    @ResponseStatus(code = HttpStatus.OK)
    public OvertimeTicketDTO confirmTicket(@PathVariable Integer id) {
        return overtimeTicketService.confirmTicket(id);
    }

    @PostMapping("/{id}/reject")
    @ResponseStatus(code = HttpStatus.OK)
    public OvertimeTicketDTO rejectTicket(@PathVariable Integer id, @RequestParam String reason) {
        return overtimeTicketService.rejectTicket(id, reason);
    }

    @PostMapping("/{id}/approve")
    @ResponseStatus(code = HttpStatus.OK)
    public OvertimeTicketDTO approveTicket(@PathVariable Integer id, @RequestParam String reason) {
        return overtimeTicketService.approveTicket(id, reason);
    }

    @PostMapping("/create")
    public ResponseEntity<?> create(@Valid @RequestBody TbOvertimeTicket overtimeTicket) {
        try {
            overtimeTicketService.create(overtimeTicket);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
