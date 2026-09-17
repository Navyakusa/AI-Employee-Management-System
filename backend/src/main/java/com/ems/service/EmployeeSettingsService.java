package com.ems.service;

import com.ems.common.ApiResponse;
import com.ems.dto.EmployeeSettingsDto;
import com.ems.dto.EmployeeSettingsUpdateDto;
import com.ems.entity.Employee;
import com.ems.entity.EmployeeSettings;
import com.ems.repository.EmployeeRepository;
import com.ems.repository.EmployeeSettingsRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
public class EmployeeSettingsService {

    private final EmployeeRepository employeeRepository;
    private final EmployeeSettingsRepository employeeSettingsRepository;

    public EmployeeSettingsService(
            EmployeeRepository employeeRepository,
            EmployeeSettingsRepository employeeSettingsRepository) {

        this.employeeRepository = employeeRepository;
        this.employeeSettingsRepository = employeeSettingsRepository;
    }

    public ResponseEntity<ApiResponse<EmployeeSettingsDto>> getMySettings(
            Authentication authentication) {

        Employee employee = getLoggedInEmployee(authentication);

        if (employee == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(
                            false,
                            "Employee profile not found",
                            null
                    ));
        }

        EmployeeSettings settings =
                employeeSettingsRepository
                        .findByEmployeeId(employee.getId())
                        .orElse(null);

        if (settings == null) {

            settings = EmployeeSettings.builder()
                    .employeeId(employee.getId())
                    .emailNotifications(true)
                    .systemNotifications(true)
                    .darkMode(false)
                    .build();

            settings =
                    employeeSettingsRepository.save(settings);
        }

        EmployeeSettingsDto response =
                convertToDto(employee, settings);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Employee settings retrieved successfully",
                        response
                )
        );
    }

    public ResponseEntity<ApiResponse<EmployeeSettingsDto>> updateMySettings(
            EmployeeSettingsUpdateDto request,
            Authentication authentication) {

        Employee employee = getLoggedInEmployee(authentication);

        if (employee == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(
                            false,
                            "Employee profile not found",
                            null
                    ));
        }

        EmployeeSettings settings =
                employeeSettingsRepository
                        .findByEmployeeId(employee.getId())
                        .orElse(null);

        if (settings == null) {

            settings = EmployeeSettings.builder()
                    .employeeId(employee.getId())
                    .emailNotifications(true)
                    .systemNotifications(true)
                    .darkMode(false)
                    .build();
        }

        if (request.getEmployeeName() != null
                && !request.getEmployeeName().trim().isEmpty()) {

            employee.setName(
                    request.getEmployeeName().trim()
            );
        }

        if (request.getEmail() != null
                && !request.getEmail().trim().isEmpty()
                && !request.getEmail()
                .equalsIgnoreCase(employee.getEmail())) {

            boolean emailExists =
                    employeeRepository
                            .findByEmailIgnoreCase(
                                    request.getEmail().trim()
                            )
                            .filter(existing ->
                                    !existing.getId()
                                            .equals(employee.getId())
                            )
                            .isPresent();

            if (emailExists) {
                return ResponseEntity
                        .status(HttpStatus.CONFLICT)
                        .body(new ApiResponse<>(
                                false,
                                "Email already registered",
                                null
                        ));
            }

            employee.setEmail(
                    request.getEmail().trim().toLowerCase()
            );
        }

        if (request.getDesignation() != null
                && !request.getDesignation().trim().isEmpty()) {

            employee.setDesignation(
                    request.getDesignation().trim()
            );
        }

        if (request.getEmailNotifications() != null) {

            settings.setEmailNotifications(
                    request.getEmailNotifications()
            );
        }

        if (request.getSystemNotifications() != null) {

            settings.setSystemNotifications(
                    request.getSystemNotifications()
            );
        }

        if (request.getDarkMode() != null) {

            settings.setDarkMode(
                    request.getDarkMode()
            );
        }

        Employee updatedEmployee =
                employeeRepository.save(employee);

        EmployeeSettings updatedSettings =
                employeeSettingsRepository.save(settings);

        EmployeeSettingsDto response =
                convertToDto(
                        updatedEmployee,
                        updatedSettings
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Employee settings updated successfully",
                        response
                )
        );
    }

    private Employee getLoggedInEmployee(
            Authentication authentication) {

        if (authentication == null) {
            return null;
        }

        String email = authentication.getName();

        if (email == null || email.isBlank()) {
            return null;
        }

        return employeeRepository
                .findByEmailIgnoreCase(email)
                .orElse(null);
    }

    private EmployeeSettingsDto convertToDto(
            Employee employee,
            EmployeeSettings settings) {

        EmployeeSettingsDto dto =
                new EmployeeSettingsDto();

        dto.setEmployeeId(employee.getId());
        dto.setEmployeeName(employee.getName());
        dto.setEmail(employee.getEmail());
        dto.setDesignation(employee.getDesignation());

        dto.setEmailNotifications(
                settings.getEmailNotifications()
        );

        dto.setSystemNotifications(
                settings.getSystemNotifications()
        );

        dto.setDarkMode(
                settings.getDarkMode()
        );

        return dto;
    }
}