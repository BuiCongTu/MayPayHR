package fpt.aptech.springbootapp.dtos.ModuleB;

import lombok.Data;
import java.util.List;

@Data
public class OvertimeTicketCreateDTO {
    private Integer requestId;
    private Integer managerId;
    private List<LineAllocationDTO> allocations;
}