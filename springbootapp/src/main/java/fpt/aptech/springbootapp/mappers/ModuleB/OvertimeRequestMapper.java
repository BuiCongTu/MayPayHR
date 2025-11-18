package fpt.aptech.springbootapp.mappers.ModuleB;

import fpt.aptech.springbootapp.dtos.ModuleB.OvertimeRequestDTO;
import fpt.aptech.springbootapp.entities.ModuleB.TbOvertimeRequest;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {OvertimeTicketMapper.class})
public interface OvertimeRequestMapper {

    @Mapping(source = "factoryManager.id", target = "factoryManagerId")
    @Mapping(source = "factoryManager.fullName", target = "factoryManagerName")
    @Mapping(source = "department.id", target = "departmentId")
    @Mapping(source = "department.name", target = "departmentName")
    @Mapping(source = "overtimeTickets", target = "overtimeTickets")
    OvertimeRequestDTO toDTO(TbOvertimeRequest request);

    @Mapping(source = "factoryManagerId", target = "factoryManager.id")
    @Mapping(source = "departmentId", target = "department.id")
    @Mapping(target = "overtimeTime", ignore = true)
    @Mapping(target = "overtimeTickets", ignore = true)
    TbOvertimeRequest toEntity(OvertimeRequestDTO dto);
}