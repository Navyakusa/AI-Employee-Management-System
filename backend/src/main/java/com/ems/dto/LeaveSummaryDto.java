
package com.ems.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaveSummaryDto {

    private Integer leaveBalance;

    private Integer pendingRequests;

    private Integer approvedLeave;

    private Integer usedLeave;
}