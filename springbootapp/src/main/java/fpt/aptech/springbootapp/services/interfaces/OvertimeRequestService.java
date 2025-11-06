package fpt.aptech.springbootapp.services.interfaces;

import fpt.aptech.springbootapp.dtos.OvertimeRequestDTO;
import fpt.aptech.springbootapp.filter.OvertimeRequestFilter;
import fpt.aptech.springbootapp.entities.ModuleB.TbOvertimeRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface OvertimeRequestService {
    public void create(TbOvertimeRequest overtimeRequest);
    public TbOvertimeRequest read(int id);
    public void update(TbOvertimeRequest overtimeRequest);
    public void delete(int id);
    public List<TbOvertimeRequest> list();
    public Page<OvertimeRequestDTO> getFilteredRequests(OvertimeRequestFilter filter, Pageable pageable);
}
