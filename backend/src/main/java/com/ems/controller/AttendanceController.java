package com.ems.controller;

import com.ems.common.ApiResponse;
import com.ems.entity.Attendance;
import com.ems.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;


    // =========================
    // MARK ATTENDANCE
    // =========================

    @PostMapping
    public ResponseEntity<ApiResponse<Attendance>> markAttendance(
            @RequestBody Attendance attendance) {

        return attendanceService.markAttendance(attendance);
    }


    // =========================
    // GET ALL ATTENDANCE
    // =========================

    @GetMapping
    public ResponseEntity<ApiResponse<List<Attendance>>> getAllAttendance() {

        return attendanceService.getAllAttendance();
    }


    // =========================
    // GET ATTENDANCE BY EMPLOYEE
    // =========================

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<ApiResponse<List<Attendance>>>
    getAttendanceByEmployee(
            @PathVariable Long employeeId) {

        return attendanceService.getAttendanceByEmployee(
                employeeId
        );
    }


    // =========================
    // GET ATTENDANCE BY DATE
    // =========================

    @GetMapping("/date")
    public ResponseEntity<ApiResponse<List<Attendance>>>
    getAttendanceByDate(
            @RequestParam LocalDate date) {

        return attendanceService.getAttendanceByDate(
                date
        );
    }


    // =========================
    // GET ATTENDANCE BY STATUS
    // =========================

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<List<Attendance>>>
    getAttendanceByStatus(
            @RequestParam String status) {

        return attendanceService.getAttendanceByStatus(
                status
        );
    }


    // =========================
    // ATTENDANCE STATISTICS
    // =========================

    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<Map<String, Long>>>
    getAttendanceStatistics() {

        return attendanceService.getAttendanceStatistics();
    }


    // =========================
    // MY MONTHLY ATTENDANCE STATISTICS
    // =========================

    @GetMapping("/my/statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>>
    getMyMonthlyAttendanceStatistics(
            @RequestParam String month,
            Authentication authentication) {

        return attendanceService.getMyMonthlyAttendanceStatistics(
                month,
                authentication
        );
    }


    // =========================
    // GET ATTENDANCE BY ID
    // =========================

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Attendance>>
    getAttendanceById(
            @PathVariable Long id) {

        return attendanceService.getAttendanceById(id);
    }


    // =========================
    // UPDATE ATTENDANCE
    // =========================

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Attendance>>
    updateAttendance(
            @PathVariable Long id,
            @RequestBody Attendance attendance) {

        return attendanceService.updateAttendance(
                id,
                attendance
        );
    }


    // =========================
    // DELETE ATTENDANCE
    // =========================

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>>
    deleteAttendance(
            @PathVariable Long id) {

        return attendanceService.deleteAttendance(id);
    }
}