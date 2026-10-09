
package com.ems.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DocumentVerificationRequestDto {

    private String status;

    private String rejectionReason;
}
