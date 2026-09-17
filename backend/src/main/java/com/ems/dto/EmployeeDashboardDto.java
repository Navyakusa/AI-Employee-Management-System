package com.ems.dto;

import com.ems.entity.Notification;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeDashboardDto {

    // =========================
    // EMPLOYEE INFORMATION
    // =========================

    private Long employeeId;

    private String employeeCode;

    private String name;

    private String email;

    private String department;

    private String designation;

    private String manager;

    private String location;

    private String employmentType;

    private String employeeStatus;


    // =========================
    // TODAY'S ATTENDANCE
    // =========================

    private String attendanceStatus;

    private String checkInTime;

    private String checkOutTime;

    private String workingHours;


    // =========================
    // NOTIFICATIONS
    // =========================

    private Long unreadNotificationCount;

    private List<Notification> notifications;
}