package fpt.aptech.springbootapp.api.ModuleC;

import fpt.aptech.springbootapp.entities.ModuleC.TbEmployeePayroll;
import fpt.aptech.springbootapp.services.ModuleC_Payroll.PayrollService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payroll")
//@CrossOrigin(origins = "*")
public class PayrollController {
    private PayrollService payrollService;

    @Autowired
    public PayrollController(PayrollService payrollService) {
        this.payrollService = payrollService;
    }
    // lay bang luong theo thang cu the
    @GetMapping("/employee/{userId}")
//    @PreAuthorize("hasAnyRole('WORKER', 'LEADER', 'MANAGER', 'FACTORY_MANAGER', 'FACTORY_DIRECTOR', 'HR', 'ADMIN')")
    public ResponseEntity<?> getEmployeePayrollByYearMonth(
            @PathVariable Integer userId,
            @RequestParam Integer year,
            @RequestParam Integer month){
        try{
            if(userId == null || year == null || month == null){
                return ResponseEntity.badRequest().body(buildErrorResponse("Missing required parameters(userId, year, month)"));
            }

            if(month < 1 || month > 12){
                return ResponseEntity.badRequest().body(buildErrorResponse("Invalid month"));
            }
            TbEmployeePayroll payroll = payrollService.getEmpPayrollByYearMonth(userId, year, month);

            return ResponseEntity.ok(payroll);
        } catch (RuntimeException e){
            return ResponseEntity.badRequest().body(buildErrorResponse(e.getMessage()));
        } catch (Exception e){
            return ResponseEntity.badRequest().body(buildErrorResponse("Server Error: " + e.getMessage()));
        }
    }

    //lay ds luong theo nam
    @GetMapping("/employee/{userId}/year")
//    @PreAuthorize("hasAnyRole('WORKER', 'LEADER', 'MANAGER', 'FACTORY_MANAGER', 'FACTORY_DIRECTOR', 'HR', 'ADMIN')")
    public ResponseEntity<?> getAvailableYears(@PathVariable Integer userId, @RequestParam Integer year){
        try{
            List<TbEmployeePayroll> payrolls = payrollService.getEmpPayrollByYear(userId, year);
            return ResponseEntity.ok(payrolls);
        } catch (RuntimeException e){
            return ResponseEntity.badRequest().body(buildErrorResponse(e.getMessage()));
        } catch (Exception e){
            return ResponseEntity.badRequest().body(buildErrorResponse("Server Error: " + e.getMessage()));
        }
    }

    //lay toan bo lich su luong
    @GetMapping("/employee/{userId}/history")
//    @PreAuthorize("hasAnyRole('WORKER', 'LEADER', 'MANAGER', 'FACTORY_MANAGER', 'FACTORY_DIRECTOR', 'HR', 'ADMIN')")
    public ResponseEntity<?> getEmployeePayrollHistory(@PathVariable Integer userId){
        try{
            List<TbEmployeePayroll> payrolls = payrollService.getEmpPayrollHistory(userId);
            return ResponseEntity.ok(payrolls);
        } catch (RuntimeException e){
            return ResponseEntity.badRequest().body(buildErrorResponse(e.getMessage()));
        } catch (Exception e){
            return ResponseEntity.badRequest().body(buildErrorResponse("Server Error: " + e.getMessage()));
        }
    }

    @GetMapping("/employee/{userId}/available-years")
//    @PreAuthorize("hasAnyRole('WORKER', 'LEADER', 'MANAGER', 'FACTORY_MANAGER', 'FACTORY_DIRECTOR', 'HR', 'ADMIN')")
    public ResponseEntity<?> getAvailableYears(@PathVariable Integer userId){
        try{
            List<Integer> years = payrollService.getAvailableYears(userId);
            Map<String, Object> response = new HashMap<>();
            response.put("userId", userId);
            response.put("years", years);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e){
            return ResponseEntity.badRequest().body(buildErrorResponse(e.getMessage()));
        } catch (Exception e){
            return ResponseEntity.badRequest().body(buildErrorResponse("Server Error: " + e.getMessage()));
        }
    }

    @GetMapping("/employee/{userId}/available-months")
//    @PreAuthorize("hasAnyRole('WORKER', 'LEADER', 'MANAGER', 'FACTORY_MANAGER', 'FACTORY_DIRECTOR', 'HR', 'ADMIN')")
    public ResponseEntity<?> getAvailableMonths(@PathVariable Integer userId, @RequestParam Integer year){
        try{
            List<Integer> months = payrollService.getAvailableMonths(userId, year);
            Map<String, Object> response = new HashMap<>();
            response.put("userId", userId);
            response.put("year", year);
            response.put("months", months);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e){
            return ResponseEntity.badRequest().body(buildErrorResponse(e.getMessage()));
        }
    }

    private Map<String, String> buildErrorResponse(String message) {
        Map<String, String> response = new HashMap<>();
        response.put("error", message);
        return response;
    }

}
