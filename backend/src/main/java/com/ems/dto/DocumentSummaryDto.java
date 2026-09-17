
package com.ems.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentSummaryDto {

    private Long totalDocuments;

    private Long verifiedDocuments;

    private Long pendingDocuments;

    private Long notUploadedDocuments;
}