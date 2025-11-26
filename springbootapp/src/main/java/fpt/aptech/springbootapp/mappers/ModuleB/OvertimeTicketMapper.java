package fpt.aptech.springbootapp.mappers.ModuleB;

import fpt.aptech.springbootapp.dtos.ModuleB.OvertimeTicketDTO;
import fpt.aptech.springbootapp.entities.ModuleB.TbOvertimeTicket;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {OvertimeEmployeeMapper.class})
public interface OvertimeTicketMapper {

    @Mapping(source = "manager.id", target = "managerId")
    @Mapping(source = "manager.fullName", target = "managerName")
    @Mapping(source = "overtimeRequest.id", target = "requestId")

    // Flattened fields for easy display
    @Mapping(source = "overtimeRequest.factoryManager.fullName", target = "requesterName")
    @Mapping(source = "overtimeRequest.department.name", target = "departmentName")
    @Mapping(source = "overtimeRequest.overtimeDate", target = "overtimeDate")
    @Mapping(source = "overtimeRequest.startTime", target = "startTime")
    @Mapping(source = "overtimeRequest.endTime", target = "endTime")

    @Mapping(source = "confirmedBy.id", target = "confirmedById")
    @Mapping(source = "confirmedBy.fullName", target = "confirmedByName")
    @Mapping(source = "approvedBy.id", target = "approvedById")
    @Mapping(source = "approvedBy.fullName", target = "approvedByName")

    @Mapping(source = "overtimeEmployees", target = "employeeList")
    OvertimeTicketDTO toDTO(TbOvertimeTicket ticket);

    @Mapping(source = "managerId", target = "manager.id")
    @Mapping(source = "requestId", target = "overtimeRequest.id")
    @Mapping(target = "overtimeEmployees", ignore = true) // We handle employees manually in Service create()
    TbOvertimeTicket toEntity(OvertimeTicketDTO dto);
}