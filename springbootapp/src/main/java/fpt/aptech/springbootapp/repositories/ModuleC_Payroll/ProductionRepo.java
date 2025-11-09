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

@Repository
public interface ProductionRepo extends JpaRepository<TbProduction,Integer> {
    //1.tim tất cả product
    List<TbProduction> findAll();
    //2. tim product theo id
    TbProduction findProductionById(Integer id);
    //3. tim product theo name
    TbProduction findProductionByName(String name);
    //4. tim product theo status
    List<TbProduction> findAllByStatus(String status);
    //5. them va sua product
    void addOrUpdateProduction(TbProduction production);

    //6. xoa product theo id
    void deleteProductionById(Integer id);

    //7 . tim theo department va ngay cuj the
    Optional<TbProduction> findByDepartmentAndDop(TbDepartment department, LocalDate dop);
    //8. tim tổng số product theo dep trong thang
    @Query("SELECT SUM(p.productCount) FROM TbProduction p " +
            "WHERE p.department.id = :departmentId " +
            "AND YEAR(p.dop) = :year AND MONTH(p.dop) = :month")
    Long sumProductCountByDepartmentAndMonth(
            @Param("departmentId") Integer departmentId,
            @Param("year") int year,
            @Param("month") int month
    );

    //9. tổng giá trị sản lượng theo deparrt trong tháng
    @Query("SELECT SUM(p.productCount * p.unitPrice) FROM TbProduction p " +
            "WHERE p.department.id = :departmentId " +
            "AND YEAR(p.dop) = :year AND MONTH(p.dop) = :month")
    BigDecimal sumProductPriceByDepartmentAndMonth(
            @Param("departmentId") Integer departmentId,
            @Param("year") int year,
            @Param("month") int month
    );

}
