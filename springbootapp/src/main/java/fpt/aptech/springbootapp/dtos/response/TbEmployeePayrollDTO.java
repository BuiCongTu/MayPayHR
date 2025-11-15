package fpt.aptech.springbootapp.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TbEmployeePayrollDTO {
    private Integer payrollId;
    private Integer employeeId;
    private String employeeName;
    private Integer payrollMonth;
    private Integer payrollYear;
    private BigDecimal baseSalary;
    private BigDecimal bonus;
    private BigDecimal deduction;
    private BigDecimal totalSalary;
    private String status;
    private Date createdAt;
    private Date updatedAt;

    private PayrollDetailDTO payroll;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PayrollDetailDTO {
        private Integer payrollId;
        private Integer departmentId;
        private String departmentName;
        private BigDecimal payrollAmount;
        private String payrollStatus;
    }
}
