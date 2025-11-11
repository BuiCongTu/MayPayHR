package fpt.aptech.springbootapp.repositories;

import fpt.aptech.springbootapp.entities.Core.TbDepartment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DepartmentRepository extends JpaRepository<TbDepartment, Integer> {
}
