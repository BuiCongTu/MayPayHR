package fpt.aptech.springbootapp.repositories.ModuleA_Time_Attendance;

import fpt.aptech.springbootapp.entities.Core.TbUser;
import fpt.aptech.springbootapp.entities.ModuleA.TbAttendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<TbAttendance, Long> {
//tim user vaf ngay
    Optional<TbAttendance> findByUserAndDate(TbUser userId, LocalDate date);
 }
