package fpt.aptech.springbootapp.repositories.ModuleB;

import fpt.aptech.springbootapp.entities.ModuleB.TbOvertimeTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface OvertimeTicketRepository extends JpaRepository<TbOvertimeTicket, Integer>,
        JpaSpecificationExecutor<TbOvertimeTicket>
{
    @Query("SELECT CASE WHEN COUNT(ote) > 0 THEN true ELSE false END " +
            "FROM TbOvertimeTicketEmployee ote " +
            "WHERE ote.overtimeTicket.overtimeRequest.id = :requestId " +
            "AND ote.line.id = :lineId " +
            "AND ote.overtimeTicket.status != 'rejected'")
    boolean existsByRequestIdAndLineId(@Param("requestId") Integer requestId, @Param("lineId") Integer lineId);

    @Query("SELECT CASE WHEN COUNT(ote) > 0 THEN true ELSE false END " +
            "FROM TbOvertimeTicketEmployee ote " +
            "WHERE ote.overtimeTicket.overtimeRequest.id = :requestId " +
            "AND ote.employee.id = :employeeId " +
            "AND ote.overtimeTicket.status != 'rejected'")
    boolean isEmployeeAlreadyAssigned(@Param("requestId") Integer requestId, @Param("employeeId") Integer employeeId);
}