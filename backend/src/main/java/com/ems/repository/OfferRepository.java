package com.ems.repository;

import com.ems.common.OfferStatus;
import com.ems.entity.Offer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OfferRepository
        extends JpaRepository<Offer, Long> {

    Optional<Offer> findByOfferCode(
            String offerCode
    );

    List<Offer> findByStatus(
            OfferStatus status
    );

    List<Offer>
    findByCandidateNameContainingIgnoreCaseOrPositionContainingIgnoreCaseOrOfferCodeContainingIgnoreCase(
            String candidateName,
            String position,
            String offerCode
    );

    long countByStatus(
            OfferStatus status
    );
}