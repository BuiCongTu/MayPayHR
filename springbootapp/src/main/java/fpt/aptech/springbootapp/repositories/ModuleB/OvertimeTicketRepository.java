package fpt.aptech.springbootapp.repositories.ModuleB;

import fpt.aptech.springbootapp.entities.ModuleB.TbOvertimeTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface OvertimeTicketRepository extends JpaRepository<TbOvertimeTicket, Integer>,
        JpaSpecificationExecutor<TbOvertimeTicket>
{
}
