package fpt.aptech.springbootapp.dtos.ModuleB;

import lombok.Data;
import java.util.List;

@Data
public class LineAllocationDTO {
    private Integer lineId;
    private List<Integer> employeeIds;
}