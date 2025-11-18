package fpt.aptech.springbootapp.api.ModuleB;

import fpt.aptech.springbootapp.dtos.ModuleB.OvertimeRequestDTO;
import fpt.aptech.springbootapp.filter.OvertimeRequestFilter;
import fpt.aptech.springbootapp.entities.ModuleB.TbOvertimeRequest;
import fpt.aptech.springbootapp.mappers.ModuleB.OvertimeRequestMapper;
import fpt.aptech.springbootapp.services.interfaces.OvertimeRequestService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/overtime-request")
public class OvertimeRequestController {

    final OvertimeRequestService overtimeRequestService;
    private final OvertimeRequestMapper overtimeRequestMapper;

    @Autowired
    public OvertimeRequestController(OvertimeRequestService overtimeRequestService,
                                     OvertimeRequestMapper overtimeRequestMapper) {
        this.overtimeRequestService = overtimeRequestService;
        this.overtimeRequestMapper = overtimeRequestMapper;
    }

    @GetMapping("/list")
    public ResponseEntity<List<TbOvertimeRequest>> list() {
        try {
            return ResponseEntity.ok(overtimeRequestService.list());
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<TbOvertimeRequest> read(@PathVariable int id) {
        try {
            return ResponseEntity.ok(overtimeRequestService.read(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/create")
    public ResponseEntity<?> createOvertimeRequest(@Valid @RequestBody OvertimeRequestDTO requestDTO) {
        try {
            TbOvertimeRequest entity = overtimeRequestMapper.toEntity(requestDTO);
            overtimeRequestService.create(entity);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(e.getMessage());
        }
    }

    @GetMapping("/")
    @ResponseStatus(code = HttpStatus.OK)
    public Page<OvertimeRequestDTO> getFiltered(@ModelAttribute OvertimeRequestFilter filter, Pageable pageable) {
        return overtimeRequestService.getFilteredRequests(filter, pageable);
    }
}
