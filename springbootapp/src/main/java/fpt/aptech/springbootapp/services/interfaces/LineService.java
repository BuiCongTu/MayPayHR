package fpt.aptech.springbootapp.services.interfaces;

import fpt.aptech.springbootapp.entities.Core.TbLine;
import java.util.List;

public interface LineService {
    List<TbLine> getLinesByDepartment(Integer departmentId);
}