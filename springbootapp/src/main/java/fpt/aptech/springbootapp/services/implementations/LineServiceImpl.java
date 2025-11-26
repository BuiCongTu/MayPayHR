package fpt.aptech.springbootapp.services.implementations;

import fpt.aptech.springbootapp.entities.Core.TbLine;
import fpt.aptech.springbootapp.repositories.LineRepository;
import fpt.aptech.springbootapp.services.interfaces.LineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LineServiceImpl implements LineService {

    private final LineRepository lineRepository;

    @Autowired
    public LineServiceImpl(LineRepository lineRepository) {
        this.lineRepository = lineRepository;
    }

    @Override
    public List<TbLine> getLinesByDepartment(Integer departmentId) {
        return lineRepository.findByDepartmentId(departmentId);
    }
}