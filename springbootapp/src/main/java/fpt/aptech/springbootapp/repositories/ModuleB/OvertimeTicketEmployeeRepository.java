package fpt.aptech.springbootapp.repositories.ModuleB;

import fpt.aptech.springbootapp.entities.ModuleB.TbOvertimeTicketEmployee;
import fpt.aptech.springbootapp.entities.ModuleB.TbOvertimeTicketEmployeeId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OvertimeTicketEmployeeRepository extends JpaRepository<TbOvertimeTicketEmployee, TbOvertimeTicketEmployeeId> {

}
