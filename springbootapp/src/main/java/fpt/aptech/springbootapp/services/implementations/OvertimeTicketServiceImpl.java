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

import java.sql.Time;
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

        // 1. Validate Manager
        TbUser manager = userRepository.findById(dto.getManagerId())
                .orElseThrow(() -> new IllegalArgumentException("Manager not found"));

        if (!manager.getRole().getName().equalsIgnoreCase("manager")) {
            throw new IllegalArgumentException("User is not a manager");
        }

        // 2. Validate Request
        TbOvertimeRequest request = overtimeRequestRepository.findById(dto.getRequestId())
                .orElseThrow(() -> new IllegalArgumentException("Overtime Request not found"));

        if (request.getStatus() == TbOvertimeRequest.OvertimeRequestStatus.rejected) {
            throw new IllegalArgumentException("Cannot create ticket: The Overtime Request has been rejected.");
        }
        if (request.getStatus() != TbOvertimeRequest.OvertimeRequestStatus.open) {
            throw new IllegalArgumentException("Cannot create ticket: The Request is not Open for submissions.");
        }

        // 3. Create Ticket Object
        TbOvertimeTicket ticket = new TbOvertimeTicket();
        ticket.setManager(manager);
        ticket.setOvertimeRequest(request);
        ticket.setStatus(OvertimeTicketStatus.pending);
        ticket.setCreatedAt(Instant.now());

        Set<TbOvertimeTicketEmployee> ticketEmployees = new HashSet<>();
        Set<Integer> processedEmployeeIds = new HashSet<>();

        // 4. Process Allocations
        for (LineAllocationDTO allocation : dto.getAllocations()) {
            TbLine line = lineRepository.findById(allocation.getLineId())
                    .orElseThrow(() -> new IllegalArgumentException("Line not found: " + allocation.getLineId()));

            // --- CONSTRAINT: Line Ownership ---
            // We check if the Manager belongs to this Line (instead of checking if the Line points to the Manager)
            if (manager.getLine() == null || !manager.getLine().getId().equals(line.getId())) {
                throw new IllegalArgumentException("Unauthorized: You (" + manager.getFullName() +
                        ") belong to Line '" + (manager.getLine() != null ? manager.getLine().getName() : "None") +
                        "', but are trying to create a ticket for Line '" + line.getName() + "'.");
            }

            // --- LOGIC: Check Quantity Quota (Refill allowed if employees rejected) ---

            // A. Get limit from Request
            TbOvertimeRequestDetail lineDetail = request.getLineDetails().stream()
                    .filter(d -> d.getLine().getId().equals(line.getId()))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Line " + line.getName() + " is not part of this Overtime Request"));

            // B. Count ACTIVE assignments (Ignore rejected)
            long currentAssignedCount = overtimeTicketRepository.countAssignedEmployeesByLine(request.getId(), line.getId());
            int newAllocationCount = allocation.getEmployeeIds().size();

            // C. Validate Quota
            if (currentAssignedCount + newAllocationCount > lineDetail.getNumEmployees()) {
                long remainingSlots = lineDetail.getNumEmployees() - currentAssignedCount;
                throw new IllegalArgumentException(String.format(
                        "Quota exceeded for %s. Limit: %d. Active: %d. Remaining: %d. You tried to add: %d.",
                        line.getName(), lineDetail.getNumEmployees(), currentAssignedCount, remainingSlots, newAllocationCount
                ));
            }

            // D. Process Employees
            for (Integer empId : allocation.getEmployeeIds()) {
                // Check Duplicate in Payload
                if (processedEmployeeIds.contains(empId)) {
                    throw new IllegalArgumentException("Employee ID " + empId + " is assigned multiple times.");
                }

                // Check Duplicate in DB
                // We verify if this employee is already in another ticket for THIS request
                if (overtimeTicketRepository.isEmployeeAlreadyAssigned(request.getId(), empId)) {
                    throw new IllegalArgumentException("Employee ID " + empId + " is already assigned to another ticket in this request.");
                }


                // Check if this employee is busy in ANY other request at this specific time
                if (overtimeTicketRepository.existsGlobalTimeConflict(
                        empId,
                        request.getOvertimeDate(),
                        request.getStartTime(),
                        request.getEndTime()) > 0) {

                    // Fetch user name for a helpful error message
                    TbUser conflictUser = userRepository.findById(empId).orElse(null);
                    String name = conflictUser != null ? conflictUser.getFullName() : ("ID " + empId);

                    throw new IllegalArgumentException(String.format(
                            "Conflict: %s is already scheduled for overtime during this time slot (%s - %s on %s).",
                            name, request.getStartTime(), request.getEndTime(), request.getOvertimeDate()
                    ));
                }

                processedEmployeeIds.add(empId);

                TbUser employee = userRepository.findById(empId)
                        .orElseThrow(() -> new IllegalArgumentException("Employee not found: " + empId));

                // --- CONSTRAINT: Department Flexibility ---
                // Employee must belong to the same department as the request/manager
                if (!employee.getDepartment().getId().equals(request.getDepartment().getId())) {
                    throw new IllegalArgumentException(String.format(
                            "Employee %s does not belong to the Request's Department (%s).",
                            employee.getFullName(), request.getDepartment().getName()
                    ));
                }

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