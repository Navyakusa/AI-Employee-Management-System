
package com.ems.controller;

import com.ems.common.ApiResponse;
import com.ems.dto.LeaveRequestDto;
import com.ems.dto.LeaveResponseDto;
import com.ems.dto.LeaveSummaryDto;
import com.ems.dto.LeaveTypeDto;
import com.ems.service.LeaveService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaves")
public class LeaveController {

    private final LeaveService leaveService;

    public LeaveController(
            LeaveService leaveService) {

        this.leaveService = leaveService;
    }

    @PutMapping("/{leaveId}/approve")
    public ResponseEntity<ApiResponse<LeaveResponseDto>> approveLeave(
            @PathVariable Long leaveId) {

        return leaveService.approveLeave(leaveId);
    }
    // =========================================================
    // APPLY LEAVE
    // =========================================================

    @PostMapping
    public ResponseEntity<ApiResponse<LeaveResponseDto>>
    applyLeave(
            @Valid @RequestBody LeaveRequestDto request,
            Authentication authentication) {

        return leaveService.applyLeave(
                request,
                authentication
        );
    }


    // =========================================================
    // GET MY LEAVE REQUESTS
    // =========================================================

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<LeaveResponseDto>>>
    getMyLeaves(
            Authentication authentication) {

        return leaveService.getMyLeaves(
                authentication
        );
    }


    // =========================================================
    // GET MY LEAVE BY ID
    // =========================================================

    @GetMapping("/{leaveId}")
    public ResponseEntity<ApiResponse<LeaveResponseDto>>
    getMyLeaveById(
            @PathVariable Long leaveId,
            Authentication authentication) {

        return leaveService.getMyLeaveById(
                leaveId,
                authentication
        );
    }


    // =========================================================
    // GET LEAVE SUMMARY
    // =========================================================

    @GetMapping("/my/summary")
    public ResponseEntity<ApiResponse<LeaveSummaryDto>>
    getLeaveSummary(
            Authentication authentication) {

        return leaveService.getLeaveSummary(
                authentication
        );
    }


    // =========================================================
    // GET LEAVE TYPES
    // =========================================================

    @GetMapping("/types")
    public ResponseEntity<ApiResponse<List<LeaveTypeDto>>>
    getLeaveTypes() {

        return leaveService.getLeaveTypes();
    }
}