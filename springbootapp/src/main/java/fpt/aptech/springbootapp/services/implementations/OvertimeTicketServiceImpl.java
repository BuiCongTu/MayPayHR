package fpt.aptech.springbootapp.services.implementations;

import fpt.aptech.springbootapp.dtos.ModuleB.LineAllocationDTO;
import fpt.aptech.springbootapp.dtos.ModuleB.OvertimeTicketCreateDTO;
import fpt.aptech.springbootapp.dtos.ModuleB.OvertimeTicketDTO;
import fpt.aptech.springbootapp.entities.Core.TbLine;
import fpt.aptech.springbootapp.entities.Core.TbUser;
import fpt.aptech.springbootapp.entities.ModuleB.TbOvertimeRequest;
import fpt.aptech.springbootapp.entities.ModuleB.TbOvertimeRequestDetail;
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
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Service
public class OvertimeTicketServiceImpl implements OvertimeTicketService {

    private final OvertimeTicketRepository overtimeTicketRepository;
    private final UserRepository userRepository;
    private final OvertimeRequestRepository overtimeRequestRepository;
    private final LineRepository lineRepository;
    private final OvertimeTicketMapper overtimeTicketMapper;

    @Autowired
    public OvertimeTicketServiceImpl(OvertimeTicketRepository overtimeTicketRepository,
                                     UserRepository userRepository,
                                     OvertimeRequestRepository overtimeRequestRepository,
                                     LineRepository lineRepository,
                                     OvertimeTicketMapper overtimeTicketMapper) {
        this.overtimeTicketRepository = overtimeTicketRepository;
        this.userRepository = userRepository;
        this.overtimeRequestRepository = overtimeRequestRepository;
        this.lineRepository = lineRepository;
        this.overtimeTicketMapper = overtimeTicketMapper;
    }

    @Override
    public Page<OvertimeTicketDTO> getFilteredTicket(OvertimeTicketFilter filter, Pageable pageable) {
        Specification<TbOvertimeTicket> spec = OvertimeTicketSpecification.build(filter);
        return overtimeTicketRepository.findAll(spec, pageable).map(overtimeTicketMapper::toDTO);
    }

    @Override
    public OvertimeTicketDTO submitTicket(Integer id) {
        TbOvertimeTicket overtimeTicket = overtimeTicketRepository.findById(id).orElse(null);
        if (overtimeTicket != null) {
            overtimeTicket.setStatus(OvertimeTicketStatus.submitted);
            return overtimeTicketMapper.toDTO(overtimeTicketRepository.save(overtimeTicket));
        }
        throw new IllegalArgumentException("Overtime ticket not found");
    }

    @Override
    public OvertimeTicketDTO confirmTicket(Integer id) {
        TbOvertimeTicket overtimeTicket = overtimeTicketRepository.findById(id).orElse(null);
        if (overtimeTicket != null) {
            overtimeTicket.setStatus(OvertimeTicketStatus.confirmed);
            return overtimeTicketMapper.toDTO(overtimeTicketRepository.save(overtimeTicket));
        }
        throw new IllegalArgumentException("Overtime ticket not found");
    }

    @Override
    public OvertimeTicketDTO rejectTicket(Integer id, String reason) {
        TbOvertimeTicket overtimeTicket = overtimeTicketRepository.findById(id).orElse(null);
        if (overtimeTicket != null) {
            overtimeTicket.setStatus(OvertimeTicketStatus.rejected);
            overtimeTicket.setReason(reason);
            return overtimeTicketMapper.toDTO(overtimeTicketRepository.save(overtimeTicket));
        }
        throw new IllegalArgumentException("Overtime ticket not found");
    }

    @Override
    public OvertimeTicketDTO approveTicket(Integer id, String reason) {
        TbOvertimeTicket overtimeTicket = overtimeTicketRepository.findById(id).orElse(null);
        if (overtimeTicket != null) {
            overtimeTicket.setStatus(OvertimeTicketStatus.approved);
            overtimeTicket.setReason(reason);
            return overtimeTicketMapper.toDTO(overtimeTicketRepository.save(overtimeTicket));
        }
        throw new IllegalArgumentException("Overtime ticket not found");
    }

    @Override
    public OvertimeTicketDTO getTicketById(Integer id) {
        TbOvertimeTicket ticket = overtimeTicketRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found with id: " + id));
        return overtimeTicketMapper.toDTO(ticket);
    }

    //deprecated
    @Override
    public void create(TbOvertimeTicket overtimeTicket) {
        throw new UnsupportedOperationException("Use createTicket(DTO) instead");
    }

    // --- MAIN CREATE METHOD ---
    @Override
    @Transactional
    public void createTicket(OvertimeTicketCreateDTO dto) {
        if (dto.getManagerId() == null || dto.getRequestId() == null || dto.getAllocations() == null) {
            throw new IllegalArgumentException("Missing required fields");
        }

        // 1. Fetch Context
        TbUser manager = userRepository.findById(dto.getManagerId())
                .orElseThrow(() -> new IllegalArgumentException("Manager not found"));

        //check role: manager
        if(!manager.getRole().getName().equalsIgnoreCase("manager")) {
            throw new IllegalArgumentException("User is not a manager");
        }

        TbOvertimeRequest request = overtimeRequestRepository.findById(dto.getRequestId())
                .orElseThrow(() -> new IllegalArgumentException("Overtime Request not found"));

        if (request.getStatus() == TbOvertimeRequest.OvertimeRequestStatus.rejected) {
            throw new IllegalArgumentException("Cannot create ticket: The Overtime Request has been rejected.");
        }
        if (request.getStatus() != TbOvertimeRequest.OvertimeRequestStatus.open) {
            throw new IllegalArgumentException("Cannot create ticket: The Request is not Open for submissions.");
        }

        // 2. Create Ticket Shell
        TbOvertimeTicket ticket = new TbOvertimeTicket();
        ticket.setManager(manager);
        ticket.setOvertimeRequest(request);
        ticket.setStatus(OvertimeTicketStatus.pending);
        ticket.setCreatedAt(Instant.now());

        Set<TbOvertimeTicketEmployee> ticketEmployees = new HashSet<>();
        Set<Integer> processedEmployeeIds = new HashSet<>();

        for (LineAllocationDTO allocation : dto.getAllocations()) {
            TbLine line = lineRepository.findById(allocation.getLineId())
                    .orElseThrow(() -> new IllegalArgumentException("Line not found: " + allocation.getLineId()));

            // --- LOGIC: Check Line Exclusivity (Ticket cannot cover the same lines) ---
            if (overtimeTicketRepository.existsByRequestIdAndLineId(request.getId(), line.getId())) {
                throw new IllegalArgumentException("A ticket already exists for Line: " + line.getName());
            }

            // --- LOGIC: Check Quantity Limit ---
            // Find the requirement for this line in the request
            TbOvertimeRequestDetail lineDetail = request.getLineDetails().stream()
                    .filter(d -> d.getLine().getId().equals(line.getId()))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Line " + line.getName() + " is not part of this Overtime Request"));

            if (allocation.getEmployeeIds().size() > lineDetail.getNumEmployees()) {
                throw new IllegalArgumentException(String.format(
                        "Cannot assign %d employees to %s. Maximum allowed is %d.",
                        allocation.getEmployeeIds().size(), line.getName(), lineDetail.getNumEmployees()
                ));
            }

            for (Integer empId : allocation.getEmployeeIds()) {
                // Check 1: Duplicate in payload
                if (processedEmployeeIds.contains(empId)) {
                    throw new IllegalArgumentException("Employee ID " + empId + " is assigned multiple times.");
                }
                // Check 2: Duplicate in DB
                if (overtimeTicketRepository.isEmployeeAlreadyAssigned(request.getId(), empId)) {
                    throw new IllegalArgumentException("Employee ID " + empId + " is already assigned to another ticket.");
                }

                processedEmployeeIds.add(empId);

                TbUser employee = userRepository.findById(empId)
                        .orElseThrow(() -> new IllegalArgumentException("Employee not found: " + empId));

                TbOvertimeTicketEmployee association = new TbOvertimeTicketEmployee();
                association.setOvertimeTicket(ticket);
                association.setLine(line);
                association.setEmployee(employee);
                association.setStatus(TbOvertimeTicketEmployee.EmployeeOvertimeStatus.pending);

                ticketEmployees.add(association);
            }
        }

        if (ticketEmployees.isEmpty()) {
            throw new IllegalArgumentException("Ticket must have at least one employee assigned.");
        }

        ticket.setOvertimeEmployees(ticketEmployees);
        overtimeTicketRepository.save(ticket);
    }
}