package fpt.aptech.springbootapp.mappers;

import fpt.aptech.springbootapp.dtos.ModuleB.DepartmentDTO;
import fpt.aptech.springbootapp.entities.Core.TbDepartment;

public class DepartmentMapper {

    public static DepartmentDTO toDTO(TbDepartment entity){
        if(entity == null) return null;

        DepartmentDTO dto = new DepartmentDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());

        return dto;
    }
}
