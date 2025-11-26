package fpt.aptech.springbootapp.services.interfaces;

import fpt.aptech.springbootapp.dtos.ModuleB.DepartmentDTO;

import java.util.List;

public interface DepartmentService {
    List<DepartmentDTO> findALl();
}
