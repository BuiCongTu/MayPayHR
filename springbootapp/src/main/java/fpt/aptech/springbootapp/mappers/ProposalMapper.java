package fpt.aptech.springbootapp.mappers;

import fpt.aptech.springbootapp.dtos.ProposalDTO;
import fpt.aptech.springbootapp.entities.ModuleB.TbProposal;

public class ProposalMapper {

    public static ProposalDTO toDTO(TbProposal entity) {
        if(entity == null) return null;

        ProposalDTO dto = new ProposalDTO();

        dto.setId(entity.getId());
        dto.setType(entity.getType());

        if (entity.getProposer() != null) {

            dto.setProposerId(entity.getProposer().getId());
            dto.setProposerName(entity.getProposer().getFullName());
        }

        if(entity.getTargetUser() != null){
            dto.setTargetUserId(entity.getTargetUser().getId());
            dto.setTargetUserName(entity.getTargetUser().getFullName());
        }

        dto.setDetails(entity.getDetails());
        dto.setReason(entity.getReason());

        dto.setStatus(entity.getStatus());

        if(entity.getApprovedBy() != null){
            dto.setApprovedById(entity.getApprovedBy().getId());
            dto.setApprovedByName(entity.getApprovedBy().getFullName());
        }

        dto.setRejectReason(entity.getRejectReason());

        dto.setCreatedAt(entity.getCreatedAt());

        return dto;
    }
}
