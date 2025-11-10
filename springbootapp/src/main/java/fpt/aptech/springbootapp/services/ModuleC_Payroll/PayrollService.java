package fpt.aptech.springbootapp.services.ModuleC_Payroll;

import fpt.aptech.springbootapp.entities.ModuleC.TbEmployeePayroll;
import org.springframework.stereotype.Service;

import java.util.List;

// CRUD bang luong
@Service
public interface PayrollService {
    //lay bang luong theo thang cu the trong nam
    TbEmployeePayroll getEmpPayrollByYearMonth(Integer userId, Integer year, Integer month);

    //lay danh sach luong theo nam cua emp
    List<TbEmployeePayroll> getEmpPayrollByYear(Integer userId, Integer year);
    //lay toan bo ds luong cua emp
    List<TbEmployeePayroll> getEmpPayrollHistory(Integer userId);

    // dropdown bang luong namw, ds nam co du lieu luong
    List<Integer> getAvailableYears(Integer userId);
    // dropdown thang co du lieu luong
    List<Integer> getAvailableMonths(Integer userId, Integer year);

}
