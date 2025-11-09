package fpt.aptech.springbootapp.repositories.ModuleC_Payroll;

import fpt.aptech.springbootapp.entities.Core.TbDepartment;
import fpt.aptech.springbootapp.entities.ModuleC.TbPayroll;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PayrollRepo extends JpaRepository<TbPayroll, Integer> {
    //1. tìm bảng lương của department theo tháng
    Optional<TbPayroll> findPayRollByMonth(LocalDate month, TbDepartment department);
    //2. lay danh sach bang luong theo thang
    List<TbPayroll> findByMonth(LocalDate month);
    //3. tim tat cả bảng lương theo tháng và status
    List<TbPayroll> findByMonthAndStatus(LocalDate month, TbPayroll.PayrollStatus status);
    //4. tim bang luong theo thang, theo department, status
    Optional<TbPayroll> findByMonthAndDepartmentAndStatus(
            LocalDate month,
            TbDepartment department,
            TbPayroll.PayrollStatus status);
    //5. lay danh sach bang luong chua duyet
    @Query("SELECT p FROM TbPayroll p WHERE p.status IN ('pending', 'balanced') " +
            "ORDER BY p.createdAt DESC")
    List<TbPayroll> findPendingPayrolls();
    // timf toong luong theo thang
    @Query("SELECT SUM(p.totalSalary) FROM TbPayroll p " +
            "WHERE YEAR(p.month) = :year AND MONTH(p.month) = :month " +
            "AND p.status = 'approved'")
    Long sumApprovedPayrollByMonth(
            @Param("year") int year,
            @Param("month") int month
    );
}
