package fpt.aptech.springbootapp.repositories.ModuleB;

import fpt.aptech.springbootapp.entities.ModuleB.TbOvertimeRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface OvertimeRequestRepository extends JpaRepository<TbOvertimeRequest, Integer>,
        JpaSpecificationExecutor<TbOvertimeRequest>
{
}
