package fpt.aptech.springbootapp.repositories.ModuleC_Payroll;

import fpt.aptech.springbootapp.entities.ModuleC.TbReservedPayroll;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReservedPayrollRepo extends JpaRepository<TbReservedPayroll, Integer> {
}
