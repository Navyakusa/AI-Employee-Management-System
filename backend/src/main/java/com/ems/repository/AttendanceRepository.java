package com.ems.repository;

import com.ems.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    List<Attendance> findByEmployeeId(Long employeeId);

    List<Attendance> findByAttendanceDate(LocalDate attendanceDate);

    List<Attendance> findByStatusIgnoreCase(String status);

    List<Attendance> findByEmployeeIdAndAttendanceDate(
            Long employeeId,
            LocalDate attendanceDate
    );
}