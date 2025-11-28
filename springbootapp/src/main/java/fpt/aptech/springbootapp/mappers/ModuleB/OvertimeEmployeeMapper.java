package fpt.aptech.springbootapp.mappers.ModuleB;

import fpt.aptech.springbootapp.dtos.ModuleB.OvertimeEmployeeDTO;
import fpt.aptech.springbootapp.entities.ModuleB.TbOvertimeTicketEmployee;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface OvertimeEmployeeMapper {

    @Mapping(source = "id", target = "associationId")
    @Mapping(source = "overtimeTicket.id", target = "overtimeTicketId")
    @Mapping(source = "employee.id", target = "employeeId")
    @Mapping(source = "employee.fullName", target = "employeeName")
    @Mapping(source = "employee.email", target = "employeeEmail")
    @Mapping(source = "employee.phone", target = "employeePhone")
    @Mapping(source = "employee.skillLevel.name", target = "skillLevelName")
    @Mapping(source = "line.id", target = "lineId")
    @Mapping(source = "line.name", target = "lineName")
    @Mapping(source = "status", target = "status")
    OvertimeEmployeeDTO toDTO(TbOvertimeTicketEmployee entity);
}