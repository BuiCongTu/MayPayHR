package fpt.aptech.springbootapp.repositories;

import fpt.aptech.springbootapp.entities.Core.TbLine;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LineRepository extends JpaRepository<TbLine, Integer> {
    List<TbLine> findByDepartmentId(Integer departmentId);
}
