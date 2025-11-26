package fpt.aptech.springbootapp.services.ModuleA_Time_Attendance;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import fpt.aptech.springbootapp.entities.Core.TbUser;
import fpt.aptech.springbootapp.entities.ModuleA.TbAttendance;
import fpt.aptech.springbootapp.repositories.ModuleA_Time_Attendance.AttendanceRepository;
import fpt.aptech.springbootapp.repositories.UserRepository;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final UserRepository userRepository;

    @Autowired
    public AttendanceService(AttendanceRepository attendanceRepository,
            UserRepository userRepository) {
        this.attendanceRepository = attendanceRepository;
        this.userRepository = userRepository;
    }

    /**
     * Check-in: Tạo attendance record mới
     */
    @Transactional
    public TbAttendance checkIn(Integer userId, Double confidence) {
        TbUser user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        LocalDate today = LocalDate.now();

        // Kiểm tra đã check-in chưa
        Optional<TbAttendance> existing = attendanceRepository
                .findByUserAndDate(user, today);

        if (existing.isPresent() && existing.get().getTimeIn() != null) {
            throw new IllegalStateException("Already checked in today");
        }

        TbAttendance attendance;
        if (existing.isPresent()) {
            // Update existing record
            attendance = existing.get();
        } else {
            // Create new record
            attendance = new TbAttendance();
            attendance.setUser(user);
            attendance.setDate(today);
        }

        attendance.setTimeIn(LocalTime.now());
        attendance.setStatus(TbAttendance.AttendanceStatus.SUCCESS);

        attendance = attendanceRepository.save(attendance);

        log.info("Check-in successful - User: {}, Time: {}", user.getFullName(), attendance.getTimeIn());

        return attendance;
    }

    /**
     * Check-out: Cập nhật time_out
     */
    @Transactional
    public TbAttendance checkOut(Integer userId, Double confidence) {
        TbUser user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        LocalDate today = LocalDate.now();

        // Tìm attendance record hôm nay
        TbAttendance attendance = attendanceRepository
                .findByUserAndDate(user, today)
                .orElseThrow(() -> new IllegalStateException("No check-in record found today. Please check-in first"));

        if (attendance.getTimeIn() == null) {
            throw new IllegalStateException("No check-in time found. Please check-in first");
        }

        if (attendance.getTimeOut() != null) {
            throw new IllegalStateException("Already checked out today");
        }

        attendance.setTimeOut(LocalTime.now());

        // Kiểm tra late (ví dụ: sau 8:30 AM là late)
        if (attendance.getTimeIn().isAfter(LocalTime.of(8, 30))) {
            attendance.setStatus(TbAttendance.AttendanceStatus.LATE);
        }

        attendance = attendanceRepository.save(attendance);

        log.info("Check-out successful - User: {}, Time: {}", user.getFullName(), attendance.getTimeOut());

        return attendance;
    }

    /**
     * Lấy attendance record của user theo ngày
     */
    public Optional<TbAttendance> getAttendanceByUserAndDate(Integer userId, LocalDate date) {
        TbUser user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return Optional.empty();
        }
        return attendanceRepository.findByUserAndDate(user, date);
    }

    /**
     * Lấy attendance của department theo ngày
     */
    public List<TbAttendance> getAttendanceByDepartmentAndDate(Integer departmentId, LocalDate date) {
        return attendanceRepository.findByUserDepartmentIdAndDate(departmentId, date);
    }

    /**
     * Lấy attendance history của user trong khoảng thời gian
     */
    public List<TbAttendance> getAttendanceByUserAndDateRange(Integer userId, LocalDate startDate, LocalDate endDate) {
        TbUser user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return List.of();
        }
        return attendanceRepository.findByUserAndDateBetween(user, startDate, endDate);
    }
}
