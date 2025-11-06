package fpt.aptech.springbootapp.services.implementations;

import fpt.aptech.springbootapp.dtos.OvertimeRequestDTO;
import fpt.aptech.springbootapp.filter.OvertimeRequestFilter;
import fpt.aptech.springbootapp.entities.ModuleB.TbOvertimeRequest;
import fpt.aptech.springbootapp.mappers.OvertimeRequestMapper;
import fpt.aptech.springbootapp.repository.OvertimeRequestRepository;
import fpt.aptech.springbootapp.services.interfaces.OvertimeRequestService;
import fpt.aptech.springbootapp.specifications.OvertimeRequestSpecification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class OvertimeRequestServiceImpl implements OvertimeRequestService {
    
    private final OvertimeRequestRepository overtimeRequestRepository;

    @Autowired
    public OvertimeRequestServiceImpl(OvertimeRequestRepository overtimeRequestRepository) {
        this.overtimeRequestRepository = overtimeRequestRepository;
    }
    
    @Override
    public void create(TbOvertimeRequest overtimeRequest) {
        try{
            if (overtimeRequest == null) {
                throw new IllegalArgumentException("Overtime request cannot be null");
            }
            if (overtimeRequest.getFactoryManager() == null) {
                throw new IllegalArgumentException("Factory manager is required");
            }
            //TODO: check valid factory manager
            if (overtimeRequest.getDepartment() == null) {
                throw new IllegalArgumentException("Department is required");
            }
            //TODO: check valid department
            if (overtimeRequest.getOvertimeTime() == null || overtimeRequest.getOvertimeTime() <= 0) {
                throw new IllegalArgumentException("Valid overtime time is required");
            }
            if (overtimeRequest.getNumEmployees() == null || overtimeRequest.getNumEmployees() <= 0) {
                throw new IllegalArgumentException("Valid number of employees is required");
            }
            overtimeRequest.setCreatedAt(Instant.now());
            overtimeRequestRepository.save(overtimeRequest);
        }catch (Exception e){
            System.out.println(e.getMessage());
        }
    }

    @Override
    public TbOvertimeRequest read(int id) {
        try{
            return overtimeRequestRepository.findById(id).orElse(null);
        }catch (Exception e){
            System.out.println(e.getMessage());
        }
        return null;
    }

    @Override
    public void update(TbOvertimeRequest overtimeRequest) {

    }

    @Override
    public void delete(int id) {

    }

    @Override
    public List<TbOvertimeRequest> list() {
        try{
            return overtimeRequestRepository.findAll();
        }catch (Exception e){
            System.out.println(e.getMessage());
        }
        return null;
    }

    @Override
    public Page<OvertimeRequestDTO> getFilteredRequests(OvertimeRequestFilter filter, Pageable pageable) {
        Specification<TbOvertimeRequest> spec = OvertimeRequestSpecification.build(filter);
        return overtimeRequestRepository.findAll(spec, pageable)
                .map(OvertimeRequestMapper::toDTO);
    }
}