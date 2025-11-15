package fpt.aptech.springbootapp.mappers;

import fpt.aptech.springbootapp.dtos.OvertimeTicketDTO;
import fpt.aptech.springbootapp.entities.ModuleB.TbOvertimeTicket;

public class OvertimeTicketMapper {

    public static OvertimeTicketDTO toDTO(TbOvertimeTicket entity) {
        if (entity == null) return null;

        OvertimeTicketDTO dto = new OvertimeTicketDTO();
        dto.setId(entity.getId());
        dto.setEmployeeList(entity.getEmployeeList());
        dto.setOvertimeTime(entity.getOvertimeTime());
        dto.setReason(entity.getReason());
        dto.setStatus(entity.getStatus());
        dto.setCreatedAt(entity.getCreatedAt());

        if (entity.getManager() != null) {
            dto.setManagerId(entity.getManager().getId());
            dto.setManagerName(entity.getManager().getFullName());
        }

        if (entity.getOvertimeRequest() != null) {
            dto.setRequestId(entity.getOvertimeRequest().getId());
        }

        if (entity.getConfirmedBy() != null) {
            dto.setConfirmedById(entity.getConfirmedBy().getId());
            dto.setConfirmedByName(entity.getConfirmedBy().getFullName());
        }

        if (entity.getApprovedBy() != null) {
            dto.setApprovedById(entity.getApprovedBy().getId());
            dto.setApprovedByName(entity.getApprovedBy().getFullName());
        }

        return dto;
    }
}
