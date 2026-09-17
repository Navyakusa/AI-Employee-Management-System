package com.ems.repository;

import com.ems.entity.Leave;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LeaveRepository
        extends JpaRepository<Leave, Long> {

    List<Leave> findByEmployeeIdOrderByAppliedOnDesc(
            Long employeeId
    );

    List<Leave> findByEmployeeIdAndStatusIgnoreCase(
            Long employeeId,
            String status
    );
}