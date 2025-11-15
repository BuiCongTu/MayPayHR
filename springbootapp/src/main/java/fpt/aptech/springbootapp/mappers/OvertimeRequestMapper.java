package fpt.aptech.springbootapp.mappers;

import fpt.aptech.springbootapp.dtos.*;
import fpt.aptech.springbootapp.entities.ModuleB.TbOvertimeRequest;
import fpt.aptech.springbootapp.entities.ModuleB.TbOvertimeTicket;
import java.util.stream.Collectors;

public class OvertimeRequestMapper {

    public static OvertimeRequestDTO toDTO(TbOvertimeRequest entity) {
        if (entity == null) return null;

        OvertimeRequestDTO dto = new OvertimeRequestDTO();
        dto.setId(entity.getId());
        dto.setStatus(entity.getStatus());
        dto.setOvertimeTime(entity.getOvertimeTime());
        dto.setNumEmployees(entity.getNumEmployees());
        dto.setDetails(entity.getDetails());
        dto.setCreatedAt(entity.getCreatedAt());

        if (entity.getDepartment() != null) {
            dto.setDepartmentId(entity.getDepartment().getId());
            dto.setDepartmentName(entity.getDepartment().getName());
        }

        if (entity.getFactoryManager() != null) {
            dto.setFactoryManagerId(entity.getFactoryManager().getId());
            dto.setFactoryManagerName(entity.getFactoryManager().getFullName());
        }

        if (entity.getOvertimeTickets() != null) {
            dto.setOvertimeTickets(
                    entity.getOvertimeTickets().stream()
                            .map(OvertimeTicketMapper::toDTO)
                            .collect(Collectors.toList())
            );
        }
        return dto;
    }
}
