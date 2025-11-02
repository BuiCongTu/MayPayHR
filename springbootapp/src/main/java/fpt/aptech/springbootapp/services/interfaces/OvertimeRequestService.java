package fpt.aptech.springbootapp.services.interfaces;

import fpt.aptech.springbootapp.entities.ModuleB.TbOvertimeRequest;

import java.util.List;

public interface OvertimeRequestService {
    public void create(TbOvertimeRequest overtimeRequest);
    public TbOvertimeRequest read(int id);
    public void update(TbOvertimeRequest overtimeRequest);
    public void delete(int id);
    public List<TbOvertimeRequest> list();
}
