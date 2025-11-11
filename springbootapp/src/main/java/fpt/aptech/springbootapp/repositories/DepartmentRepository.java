package fpt.aptech.springbootapp.repositories;

import fpt.aptech.springbootapp.entities.Core.TbDepartment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DepartmentRepository extends JpaRepository<TbDepartment, Integer> {
}
