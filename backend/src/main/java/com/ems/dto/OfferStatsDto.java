package com.ems.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OfferStatsDto {

    private long totalOffers;

    private long pendingOffers;

    private long sentOffers;

    private long acceptedOffers;

    private long rejectedOffers;
}