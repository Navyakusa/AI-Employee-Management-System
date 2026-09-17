package com.ems.repository;

import com.ems.entity.EmployeeDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeDocumentRepository
        extends JpaRepository<EmployeeDocument, Long> {

    List<EmployeeDocument> findByEmployeeIdOrderByUploadedAtDesc(
            Long employeeId
    );

    Optional<EmployeeDocument> findByIdAndEmployeeId(
            Long id,
            Long employeeId
    );

    long countByEmployeeId(
            Long employeeId
    );

    long countByEmployeeIdAndStatusIgnoreCase(
            Long employeeId,
            String status
    );
}