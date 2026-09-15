package com.ems.service;

import com.ems.entity.Employee;
import com.ems.repository.EmployeeRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;

    public EmployeeService(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    // Create employee
    public Employee createEmployee(Employee employee) {
        return employeeRepository.save(employee);
    }

    // Get all employees
    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    // Get employee by ID
    public Employee getEmployeeById(Long id) {
        return employeeRepository.findById(id).orElse(null);
    }

    // Update employee
    public Employee updateEmployee(Long id, Employee updatedEmployee) {

        Employee existingEmployee = employeeRepository.findById(id).orElse(null);

        if (existingEmployee == null) {
            return null;
        }

        existingEmployee.setEmployeeId(updatedEmployee.getEmployeeId());
        existingEmployee.setName(updatedEmployee.getName());
        existingEmployee.setEmail(updatedEmployee.getEmail());
        existingEmployee.setDepartment(updatedEmployee.getDepartment());
        existingEmployee.setDesignation(updatedEmployee.getDesignation());
        existingEmployee.setJoiningDate(updatedEmployee.getJoiningDate());
        existingEmployee.setManager(updatedEmployee.getManager());
        existingEmployee.setLocation(updatedEmployee.getLocation());
        existingEmployee.setEmploymentType(updatedEmployee.getEmploymentType());
        existingEmployee.setStatus(updatedEmployee.getStatus());

        return employeeRepository.save(existingEmployee);
    }

    // Delete employee
    public boolean deleteEmployee(Long id) {

        Employee employee = employeeRepository.findById(id).orElse(null);

        if (employee == null) {
            return false;
        }

        employeeRepository.delete(employee);
        return true;
    }

    // Search employees
    public List<Employee> searchEmployees(String keyword) {

        if (keyword == null || keyword.isBlank()) {
            return employeeRepository.findAll();
        }

        String searchKeyword = keyword.toLowerCase().trim();

        return employeeRepository.findAll()
                .stream()
                .filter(employee ->
                        contains(employee.getName(), searchKeyword)
                                || contains(employee.getEmployeeId(), searchKeyword)
                                || contains(employee.getDepartment(), searchKeyword)
                                || contains(employee.getEmail(), searchKeyword)
                                || contains(employee.getDesignation(), searchKeyword)
                )
                .toList();
    }

    // Filter employees by status
    public List<Employee> getEmployeesByStatus(String status) {

        if (status == null || status.isBlank()) {
            return employeeRepository.findAll();
        }

        String requestedStatus = status.trim();

        return employeeRepository.findAll()
                .stream()
                .filter(employee ->
                        employee.getStatus() != null
                                && employee.getStatus().equalsIgnoreCase(requestedStatus)
                )
                .toList();
    }

    // Dashboard statistics
    public Map<String, Long> getEmployeeStatistics() {

        List<Employee> employees = employeeRepository.findAll();

        long totalEmployees = employees.size();

        long activeEmployees = employees.stream()
                .filter(employee ->
                        employee.getStatus() != null
                                && employee.getStatus().equalsIgnoreCase("ACTIVE")
                )
                .count();

        long onLeave = employees.stream()
                .filter(employee ->
                        employee.getStatus() != null
                                && employee.getStatus().equalsIgnoreCase("ON_LEAVE")
                )
                .count();

        YearMonth currentMonth = YearMonth.now();

        long newEmployees = employees.stream()
                .filter(employee -> employee.getJoiningDate() != null)
                .filter(employee ->
                        YearMonth.from(employee.getJoiningDate()).equals(currentMonth)
                )
                .count();

        return Map.of(
                "totalEmployees", totalEmployees,
                "activeEmployees", activeEmployees,
                "newEmployees", newEmployees,
                "onLeave", onLeave
        );
    }

    // Helper method for search
    private boolean contains(String value, String keyword) {

        return value != null
                && value.toLowerCase().contains(keyword);
    }
}