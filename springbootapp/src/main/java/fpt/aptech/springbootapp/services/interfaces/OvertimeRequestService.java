package fpt.aptech.springbootapp.services.interfaces;

import fpt.aptech.springbootapp.dtos.OvertimeRequestDTO;
import fpt.aptech.springbootapp.filter.OvertimeRequestFilter;
import fpt.aptech.springbootapp.entities.ModuleB.TbOvertimeRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface OvertimeRequestService {
    void create(TbOvertimeRequest overtimeRequest);
    TbOvertimeRequest read(int id);
    void update(TbOvertimeRequest overtimeRequest);
    void delete(int id);
    List<TbOvertimeRequest> list();
    Page<OvertimeRequestDTO> getFilteredRequests(OvertimeRequestFilter filter, Pageable pageable);
}
