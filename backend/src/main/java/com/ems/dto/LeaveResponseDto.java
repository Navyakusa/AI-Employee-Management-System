package com.ems.dto;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveResponseDto {

    private Long id;

    private Long employeeId;

    private String leaveType;

    private LocalDate fromDate;

    private LocalDate toDate;

    private Integer days;

    private String reason;

    private LocalDateTime appliedOn;

    private String status;
}