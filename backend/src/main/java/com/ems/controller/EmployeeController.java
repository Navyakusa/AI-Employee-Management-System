package com.ems.controller;

import com.ems.entity.Employee;
import com.ems.service.EmployeeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    // Create employee
    @PostMapping
    public ResponseEntity<Employee> createEmployee(
            @RequestBody Employee employee) {

        return ResponseEntity.ok(
                employeeService.createEmployee(employee)
        );
    }

    // Get all employees
    @GetMapping
    public ResponseEntity<List<Employee>> getAllEmployees() {

        return ResponseEntity.ok(
                employeeService.getAllEmployees()
        );
    }

    // Search employees
    @GetMapping("/search")
    public ResponseEntity<List<Employee>> searchEmployees(
            @RequestParam(required = false) String keyword) {

        return ResponseEntity.ok(
                employeeService.searchEmployees(keyword)
        );
    }

    // Filter by status
    @GetMapping("/status")
    public ResponseEntity<List<Employee>> getEmployeesByStatus(
            @RequestParam String status) {

        return ResponseEntity.ok(
                employeeService.getEmployeesByStatus(status)
        );
    }

    // Dashboard statistics
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Long>> getEmployeeStatistics() {

        return ResponseEntity.ok(
                employeeService.getEmployeeStatistics()
        );
    }

    // Get employee by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getEmployeeById(
            @PathVariable Long id) {

        Employee employee = employeeService.getEmployeeById(id);

        if (employee == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(employee);
    }

    // Update employee
    @PutMapping("/{id}")
    public ResponseEntity<?> updateEmployee(
            @PathVariable Long id,
            @RequestBody Employee employee) {

        Employee updatedEmployee =
                employeeService.updateEmployee(id, employee);

        if (updatedEmployee == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(updatedEmployee);
    }

    // Delete employee
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEmployee(
            @PathVariable Long id) {

        boolean deleted = employeeService.deleteEmployee(id);

        if (!deleted) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(
                "Employee deleted successfully"
        );
    }
}