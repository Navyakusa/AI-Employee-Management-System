package com.ems.service;

import com.ems.entity.AuditLog;
import com.ems.repository.AuditLogRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(
            AuditLogRepository auditLogRepository
    ) {
        this.auditLogRepository = auditLogRepository;
    }

    // ============================================
    // CREATE AUDIT LOG
    // ============================================

    public AuditLog createAuditLog(AuditLog auditLog) {

        if (auditLog.getDateTime() == null) {
            auditLog.setDateTime(LocalDateTime.now());
        }

        return auditLogRepository.save(auditLog);
    }

    // ============================================
    // CREATE AUDIT LOG - SIMPLE METHOD
    // ============================================

    public AuditLog createAuditLog(
            String module,
            String action,
            String details,
            String performedBy
    ) {

        AuditLog auditLog = new AuditLog();

        auditLog.setModule(module);
        auditLog.setAction(action);
        auditLog.setDetails(details);
        auditLog.setPerformedBy(performedBy);
        auditLog.setDateTime(LocalDateTime.now());

        return auditLogRepository.save(auditLog);
    }

    // ============================================
    // GET ALL - NEWEST FIRST
    // ============================================

    public List<AuditLog> getAllAuditLogs() {
        return auditLogRepository
                .findAllByOrderByDateTimeDesc();
    }

    // ============================================
    // GET BY ID
    // ============================================

    public AuditLog getAuditLogById(Long id) {
        return auditLogRepository
                .findById(id)
                .orElse(null);
    }

    // ============================================
    // SEARCH
    // ============================================

    public List<AuditLog> searchAuditLogs(
            String module,
            String action,
            LocalDate date
    ) {

        List<AuditLog> logs =
                auditLogRepository
                        .findAllByOrderByDateTimeDesc();

        return logs.stream()

                .filter(log ->
                        module == null ||
                                module.isBlank() ||
                                (
                                        log.getModule() != null &&
                                                log.getModule()
                                                        .toLowerCase()
                                                        .contains(
                                                                module.toLowerCase()
                                                        )
                                )
                )

                .filter(log ->
                        action == null ||
                                action.isBlank() ||
                                (
                                        log.getAction() != null &&
                                                log.getAction()
                                                        .equalsIgnoreCase(action)
                                )
                )

                .filter(log ->
                        date == null ||
                                (
                                        log.getDateTime() != null &&
                                                log.getDateTime()
                                                        .toLocalDate()
                                                        .equals(date)
                                )
                )

                .toList();
    }
}