package fpt.aptech.springbootapp.repositories.ModuleC_Payroll;

import fpt.aptech.springbootapp.entities.ModuleC.TbEmployeePayroll;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.*;

@Repository
public interface EmployeePayrollRepo extends JpaRepository<TbEmployeePayroll, Integer> {
    //1. tim chi tiet luong Employee
    Optional<TbEmployeePayroll> findById(Integer id);
}
