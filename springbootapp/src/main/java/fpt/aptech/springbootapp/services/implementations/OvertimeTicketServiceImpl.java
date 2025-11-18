package fpt.aptech.springbootapp.services.implementations;

import fpt.aptech.springbootapp.dtos.ModuleB.OvertimeTicketDTO;
import fpt.aptech.springbootapp.entities.Core.TbLine;
import fpt.aptech.springbootapp.entities.Core.TbUser;
import fpt.aptech.springbootapp.entities.ModuleB.TbOvertimeRequest;
import fpt.aptech.springbootapp.entities.ModuleB.TbOvertimeTicket;
import fpt.aptech.springbootapp.entities.ModuleB.TbOvertimeTicket.OvertimeTicketStatus;
import fpt.aptech.springbootapp.entities.ModuleB.TbOvertimeTicketEmployee;
import fpt.aptech.springbootapp.filter.OvertimeTicketFilter;
import fpt.aptech.springbootapp.mappers.ModuleB.OvertimeTicketMapper;
import fpt.aptech.springbootapp.repositories.LineRepository;
import fpt.aptech.springbootapp.repositories.ModuleB.OvertimeRequestRepository;
import fpt.aptech.springbootapp.repositories.ModuleB.OvertimeTicketRepository;
import fpt.aptech.springbootapp.repositories.UserRepository;
import fpt.aptech.springbootapp.services.interfaces.OvertimeTicketService;
import fpt.aptech.springbootapp.specifications.OvertimeTicketSpecification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

@Service
public class OvertimeTicketServiceImpl implements OvertimeTicketService {

    private final OvertimeTicketRepository overtimeTicketRepository;
    private final UserRepository userRepository;
    private final OvertimeRequestRepository overtimeRequestRepository;
    private final LineRepository lineRepository;

    @Autowired
    public OvertimeTicketServiceImpl(OvertimeTicketRepository overtimeTicketRepository,
                                     UserRepository userRepository,
                                     OvertimeRequestRepository overtimeRequestRepository,
                                     LineRepository lineRepository) {
        this.overtimeTicketRepository = overtimeTicketRepository;
        this.userRepository = userRepository;
        this.overtimeRequestRepository = overtimeRequestRepository;
        this.lineRepository = lineRepository;
    }

    @Override
    public Page<OvertimeTicketDTO> getFilteredTicket(OvertimeTicketFilter filter, Pageable pageable) {
        Specification<TbOvertimeTicket> spec = OvertimeTicketSpecification.build(filter);
        return overtimeTicketRepository.findAll(spec, pageable).map(OvertimeTicketMapper::toDTO);
    }

    @Override
    public OvertimeTicketDTO confirmTicket(Integer id) {
        TbOvertimeTicket overtimeTicket = overtimeTicketRepository.findById(id).orElse(null);
        if(overtimeTicket != null){
            overtimeTicket.setStatus(OvertimeTicketStatus.confirmed);
            return OvertimeTicketMapper.toDTO(overtimeTicketRepository.save(overtimeTicket));
        }
        throw new IllegalArgumentException("Overtime ticket not found");
    }

    @Override
    public OvertimeTicketDTO rejectTicket(Integer id, String reason) {
        TbOvertimeTicket overtimeTicket = overtimeTicketRepository.findById(id).orElse(null);
        if(overtimeTicket != null){
            overtimeTicket.setStatus(OvertimeTicketStatus.rejected);
            overtimeTicket.setReason(reason);
            return OvertimeTicketMapper.toDTO(overtimeTicketRepository.save(overtimeTicket));
        }
        throw new IllegalArgumentException("Overtime ticket not found");
    }

    @Override
    public OvertimeTicketDTO approveTicket(Integer id, String reason) {
        TbOvertimeTicket overtimeTicket = overtimeTicketRepository.findById(id).orElse(null);
        if(overtimeTicket != null){
            overtimeTicket.setStatus(OvertimeTicketStatus.approved);
            overtimeTicket.setReason(reason);
            return OvertimeTicketMapper.toDTO(overtimeTicketRepository.save(overtimeTicket));
        }
        throw new IllegalArgumentException("Overtime ticket not found");
    }

    @Override
    public void create(TbOvertimeTicket overtimeTicket) {
        if(overtimeTicket == null){
            throw new IllegalArgumentException("Overtime ticket cannot be null");
        }

        if(overtimeTicket.getManager() == null){
            throw new IllegalArgumentException("Manager is required");
        }
        if(overtimeTicket.getManager().getId() == null){
            throw new IllegalArgumentException("Manager id is required");
        }

        TbUser manager = userRepository.findById(overtimeTicket.getManager().getId()).orElse(null);
        if(manager == null){
            throw new IllegalArgumentException("Manager not found");
        }

        if(!manager.getRole().getName().equals("Manager")){
            throw new IllegalArgumentException("Not a manager");
        }

        //request
        if(overtimeTicket.getOvertimeRequest() == null){
            throw new IllegalArgumentException("Overtime request is required");
        }
        if(overtimeTicket.getOvertimeRequest().getId() == null){
            throw new IllegalArgumentException("Overtime request id is required");
        }
        TbOvertimeRequest request = overtimeRequestRepository.findById(overtimeTicket.getOvertimeRequest().getId()).orElse(null);
        if(request == null){
            throw new IllegalArgumentException("Overtime request not found");
        }

        if (overtimeTicket.getOvertimeEmployees() == null || overtimeTicket.getOvertimeEmployees().isEmpty()) {
            throw new IllegalArgumentException("At least one employee is required for the overtime ticket");
        }

        Set<TbOvertimeTicketEmployee> managedOvertimeEmployees = new HashSet<>();
        for (TbOvertimeTicketEmployee association : overtimeTicket.getOvertimeEmployees()) {
            if (association == null) {
                throw new IllegalArgumentException("Employee association cannot be null");
            }
            if (association.getEmployee() == null || association.getEmployee().getId() == null) {
                throw new IllegalArgumentException("Employee and employee ID are required in the association");
            }
            if (association.getLine() == null || association.getLine().getId() == null) {
                throw new IllegalArgumentException("Line and line ID are required in the association");
            }

            // Fetch the managed employee
            TbUser managedEmployee = userRepository.findById(association.getEmployee().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Employee not found with id: " + association.getEmployee().getId()));

            // Fetch the managed line
            TbLine managedLine = lineRepository.findById(association.getLine().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Line not found with id: " + association.getLine().getId()));

            // Create new, managed association object
            TbOvertimeTicketEmployee managedAssociation = new TbOvertimeTicketEmployee();
            managedAssociation.setEmployee(managedEmployee);
            managedAssociation.setLine(managedLine);
            managedAssociation.setOvertimeTicket(overtimeTicket);
            managedOvertimeEmployees.add(managedAssociation);
        }
        overtimeTicket.setOvertimeEmployees(managedOvertimeEmployees);
        overtimeTicket.setCreatedAt(java.time.Instant.now());
        overtimeTicketRepository.save(overtimeTicket);
    }
}
