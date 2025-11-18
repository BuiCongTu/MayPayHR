package fpt.aptech.springbootapp.mappers.ModuleB;

import fpt.aptech.springbootapp.dtos.ModuleB.OvertimeEmployeeDTO;
import fpt.aptech.springbootapp.dtos.ModuleB.OvertimeTicketDTO;
import fpt.aptech.springbootapp.entities.Core.TbLine;
import fpt.aptech.springbootapp.entities.Core.TbUser;
import fpt.aptech.springbootapp.entities.ModuleB.TbOvertimeTicket;
import fpt.aptech.springbootapp.entities.ModuleB.TbOvertimeTicketEmployee;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class OvertimeTicketMapper {

    public static OvertimeTicketDTO toDTO(TbOvertimeTicket entity) {
        if (entity == null) {
            return null;
        }

        OvertimeTicketDTO dto = new OvertimeTicketDTO();

        dto.setId(entity.getId());

        dto.setReason(entity.getReason());
        dto.setStatus(entity.getStatus());
        dto.setCreatedAt(entity.getCreatedAt());

        if (entity.getManager() != null) {
            dto.setManagerId(entity.getManager().getId());
            dto.setManagerName(entity.getManager().getFullName());
        }

        if (entity.getOvertimeRequest() != null) {
            dto.setRequestId(entity.getOvertimeRequest().getId());
            if (entity.getOvertimeRequest().getFactoryManager() != null) {
                dto.setRequesterName(entity.getOvertimeRequest().getFactoryManager().getFullName());
            }
        }

        if (entity.getConfirmedBy() != null) {
            dto.setConfirmedById(entity.getConfirmedBy().getId());
            dto.setConfirmedByName(entity.getConfirmedBy().getFullName());
        }

        if (entity.getApprovedBy() != null) {
            dto.setApprovedById(entity.getApprovedBy().getId());
            dto.setApprovedByName(entity.getApprovedBy().getFullName());
        }

        if (entity.getOvertimeEmployees() != null) {
            List<OvertimeEmployeeDTO> employeeDTOList = entity.getOvertimeEmployees().stream()
                    .map(OvertimeTicketMapper::toEmployeeDTO)
                    .collect(Collectors.toList());
            dto.setEmployeeList(employeeDTOList);
        } else {
            dto.setEmployeeList(Collections.emptyList());
        }

        return dto;
    }

    private static OvertimeEmployeeDTO toEmployeeDTO(TbOvertimeTicketEmployee association) {
        if (association == null) {
            return null;
        }

        OvertimeEmployeeDTO empDto = new OvertimeEmployeeDTO();
        empDto.setAssociationId(association.getId());
        empDto.setStatus(association.getStatus());

        if (association.getOvertimeTicket() != null) {
            empDto.setOvertimeTicketId(association.getOvertimeTicket().getId());
        }

        TbUser employee = association.getEmployee();
        if (employee != null) {
            empDto.setEmployeeId(employee.getId());
            empDto.setEmployeeName(employee.getFullName());
        }

        TbLine line = association.getLine();
        if (line != null) {
            empDto.setLineId(line.getId());
            empDto.setLineName(line.getName());
        }

        return empDto;
    }
}