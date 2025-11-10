package fpt.aptech.springbootapp.repositories.ModuleC_Payroll;

import fpt.aptech.springbootapp.entities.Core.TbDepartment;
import fpt.aptech.springbootapp.entities.ModuleC.TbProduction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

//CRUD product
@Repository
public interface ProductionRepo extends JpaRepository<TbProduction,Integer> {

}
