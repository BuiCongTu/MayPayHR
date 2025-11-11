package fpt.aptech.springbootapp.api;

import fpt.aptech.springbootapp.dtos.ModuleB.DepartmentDTO;
import fpt.aptech.springbootapp.services.interfaces.DepartmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/department")
public class DepartmentController {

    private final DepartmentService departmentService;

    @Autowired
    public DepartmentController(DepartmentService departmentService) {
        this.departmentService = departmentService;
    }

    @GetMapping("/")
    @ResponseStatus(code = HttpStatus.OK)
    public List<DepartmentDTO> getDepartments(){
        try{
            return departmentService.findALl();
        }catch(Exception e){
            System.out.println(e.getMessage());
            return null;
        }
    }
}
