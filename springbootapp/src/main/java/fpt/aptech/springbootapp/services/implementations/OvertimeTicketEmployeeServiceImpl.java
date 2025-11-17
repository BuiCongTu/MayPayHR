package fpt.aptech.springbootapp.services.implementations;

import fpt.aptech.springbootapp.entities.ModuleB.TbOvertimeTicketEmployee;
import fpt.aptech.springbootapp.entities.ModuleB.TbOvertimeTicketEmployeeId;
import fpt.aptech.springbootapp.repositories.ModuleB.OvertimeTicketEmployeeRepository;
import fpt.aptech.springbootapp.services.interfaces.OvertimeTicketEmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class OvertimeTicketEmployeeServiceImpl implements OvertimeTicketEmployeeService {

    final OvertimeTicketEmployeeRepository overtimeTicketEmployeeRepository;
    @Autowired
    public OvertimeTicketEmployeeServiceImpl(OvertimeTicketEmployeeRepository overtimeTicketEmployeeRepository) {
        this.overtimeTicketEmployeeRepository = overtimeTicketEmployeeRepository;
    }

    @Override
    public void saveNewOvertimeTicketEmployee(Integer userId, Integer overtimeTicketId) {
        if(userId == null || overtimeTicketId == null){
            throw new IllegalArgumentException("User id or overtime ticket id is null");
        }
        TbOvertimeTicketEmployeeId id = new TbOvertimeTicketEmployeeId(userId, overtimeTicketId);
        TbOvertimeTicketEmployee overtimeTicketEmployee = new TbOvertimeTicketEmployee(id);
        overtimeTicketEmployeeRepository.save(overtimeTicketEmployee);
    }
}
