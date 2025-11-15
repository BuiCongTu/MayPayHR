package fpt.aptech.springbootapp.mappers;

import fpt.aptech.springbootapp.dtos.response.UserResponseDto;
import fpt.aptech.springbootapp.entities.Core.TbUser;

public class UserMapper {
    
    public static UserResponseDto toDTO(TbUser entity){
        if(entity == null) return null;
        UserResponseDto dto = new UserResponseDto();
        dto.setId(entity.getId());
        dto.setFullName(entity.getFullName());
        dto.setEmail(entity.getEmail());
        dto.setPhone(entity.getPhone());

        if (entity.getRole() != null) {
            dto.setRoleId(entity.getRole().getId());
            dto.setRoleName(entity.getRole().getName());
        }

        if (entity.getDepartment() != null) {
            dto.setDepartmentId(entity.getDepartment().getId());
            dto.setDepartmentName(entity.getDepartment().getName());
        }

        if (entity.getLine() != null) {
            dto.setLineId(entity.getLine().getId());
            dto.setLineName(entity.getLine().getName());
        }

        if (entity.getSkillLevel() != null) {
            dto.setSkillLevelId(entity.getSkillLevel().getId());
            dto.setSkillLevelName(entity.getSkillLevel().getName());
        }

        dto.setSalaryType(entity.getSalaryType());
        dto.setBaseSalary(entity.getBaseSalary());
        dto.setHireDate(entity.getHireDate());
        dto.setStatus(entity.getStatus());
        dto.setCreatedAt(entity.getCreatedAt());

        return dto;
    }
}
