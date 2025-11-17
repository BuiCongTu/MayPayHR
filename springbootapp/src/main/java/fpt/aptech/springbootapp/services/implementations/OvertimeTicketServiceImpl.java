package fpt.aptech.springbootapp.services.implementations;

import fpt.aptech.springbootapp.dtos.ModuleB.OvertimeTicketDTO;
import fpt.aptech.springbootapp.entities.Core.TbUser;
import fpt.aptech.springbootapp.entities.ModuleB.TbOvertimeTicket;
import fpt.aptech.springbootapp.entities.ModuleB.TbOvertimeTicket.OvertimeTicketStatus;
import fpt.aptech.springbootapp.filter.OvertimeTicketFilter;
import fpt.aptech.springbootapp.mappers.ModuleB.OvertimeTicketMapper;
import fpt.aptech.springbootapp.repositories.ModuleB.OvertimeTicketRepository;
import fpt.aptech.springbootapp.repositories.UserRepository;
import fpt.aptech.springbootapp.services.interfaces.OvertimeTicketEmployeeService;
import fpt.aptech.springbootapp.services.interfaces.OvertimeTicketService;
import fpt.aptech.springbootapp.specifications.OvertimeTicketSpecification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class OvertimeTicketServiceImpl implements OvertimeTicketService {

    private final OvertimeTicketRepository overtimeTicketRepository;
    private final UserRepository userRepository;
    private final OvertimeTicketEmployeeService overtimeTicketEmployeeService;

    @Autowired
    public OvertimeTicketServiceImpl(OvertimeTicketRepository overtimeTicketRepository, UserRepository userRepository, OvertimeTicketEmployeeService overtimeTicketEmployeeService) {
        this.overtimeTicketRepository = overtimeTicketRepository;
        this.userRepository = userRepository;
        this.overtimeTicketEmployeeService = overtimeTicketEmployeeService;
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
        if(manager.getRole().getId() != 199010001){
            throw new IllegalArgumentException("Not a manager");
        }

        //request
        if(overtimeTicket.getOvertimeRequest() == null){
            throw new IllegalArgumentException("Overtime request is required");
        }
        if(overtimeTicket.getOvertimeRequest().getId() == null){
            throw new IllegalArgumentException("Overtime request id is required");
        }
        TbOvertimeTicket request = overtimeTicketRepository.findById(overtimeTicket.getOvertimeRequest().getId()).orElse(null);
        if(request == null){
            throw new IllegalArgumentException("Overtime request not found");
        }

        if(overtimeTicket.getOvertimeTime().compareTo(BigDecimal.ZERO) <= 0){ //overtime time must be greater than 0
            throw new IllegalArgumentException("Valid overtime time is required");
        }

        //TODO: add employee

        overtimeTicket.setCreatedAt(java.time.Instant.now());
        overtimeTicketRepository.save(overtimeTicket);
    }
}
