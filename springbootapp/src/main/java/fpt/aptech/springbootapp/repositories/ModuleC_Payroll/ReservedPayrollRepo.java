package fpt.aptech.springbootapp.repositories.ModuleC_Payroll;

import fpt.aptech.springbootapp.entities.ModuleC.TbPayroll;
import fpt.aptech.springbootapp.entities.ModuleC.TbReservedPayroll;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

//CRUD luong Bảo lưu, hash data
@Repository
public interface ReservedPayrollRepo extends JpaRepository<TbReservedPayroll, Integer> {
}
