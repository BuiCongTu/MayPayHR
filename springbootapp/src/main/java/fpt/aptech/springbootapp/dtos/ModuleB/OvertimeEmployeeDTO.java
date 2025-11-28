package fpt.aptech.springbootapp.dtos.ModuleB;

import fpt.aptech.springbootapp.entities.ModuleB.TbOvertimeTicketEmployee;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OvertimeEmployeeDTO {
    private Long associationId;
    private Integer overtimeTicketId;
    private Integer employeeId;
    private String employeeName;
    private String employeeEmail;
    private String employeePhone;
    private String skillLevelName;
    private Integer lineId;
    private String lineName;
    private TbOvertimeTicketEmployee.EmployeeOvertimeStatus status;
}