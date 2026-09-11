package com.ems.dto;

import com.ems.common.OfferStatus;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OfferDto {

    private Long offerId;

    private String offerCode;

    private Long candidateId;

    private String candidateName;

    private String position;

    private Double salary;

    private LocalDate joiningDate;

    private String location;

    private String employmentType;

    private OfferStatus status;

    private String offerLetterUrl;
}