package com.ems.controller;

import com.ems.common.ApiResponse;
import com.ems.common.OfferStatus;
import com.ems.dto.OfferDto;
import com.ems.dto.OfferStatsDto;
import com.ems.service.OfferService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/offers")
@CrossOrigin(origins = "http://localhost:5173")
public class OfferController {

    private final OfferService offerService;

    public OfferController(
            OfferService offerService
    ) {
        this.offerService = offerService;
    }


    // =========================================================
    // HR - CREATE OFFER
    // =========================================================

    @PostMapping
    public ResponseEntity<ApiResponse<OfferDto>>
    createOffer(
            @RequestBody OfferDto dto
    ) {

        return offerService.createOffer(dto);
    }


    // =========================================================
    // HR - GET ALL OFFERS
    // =========================================================

    @GetMapping
    public ResponseEntity<ApiResponse<List<OfferDto>>>
    getAllOffers() {

        return offerService.getAllOffers();
    }


    // =========================================================
    // CANDIDATE - GET MY OFFERS
    // =========================================================

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<OfferDto>>>
    getMyOffers(
            Authentication authentication
    ) {

        return offerService.getOffersForCandidateEmail(
                authentication.getName()
        );
    }


    // =========================================================
    // GET OFFER BY ID
    // =========================================================

    @GetMapping("/{offerId}")
    public ResponseEntity<ApiResponse<OfferDto>>
    getOfferById(
            @PathVariable Long offerId
    ) {

        return offerService.getOfferById(offerId);
    }


    // =========================================================
    // SEARCH OFFERS
    // =========================================================

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<OfferDto>>>
    searchOffers(
            @RequestParam String query
    ) {

        return offerService.searchOffers(query);
    }


    // =========================================================
    // FILTER OFFERS BY STATUS
    // =========================================================

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<List<OfferDto>>>
    getByStatus(
            @RequestParam OfferStatus status
    ) {

        return offerService.getByStatus(status);
    }


    // =========================================================
    // HR - SEND OFFER
    // =========================================================

    @PutMapping("/{offerId}/send")
    public ResponseEntity<ApiResponse<OfferDto>>
    sendOffer(
            @PathVariable Long offerId
    ) {

        return offerService.sendOffer(offerId);
    }


    // =========================================================
    // CANDIDATE - ACCEPT OFFER
    // =========================================================

    @PutMapping("/{offerId}/accept")
    public ResponseEntity<ApiResponse<OfferDto>>
    acceptOffer(
            @PathVariable Long offerId,
            Authentication authentication
    ) {

        return offerService.acceptOffer(
                offerId,
                authentication.getName()
        );
    }


    // =========================================================
    // CANDIDATE - REJECT OFFER
    // =========================================================

    @PutMapping("/{offerId}/reject")
    public ResponseEntity<ApiResponse<OfferDto>>
    rejectOffer(
            @PathVariable Long offerId,
            Authentication authentication
    ) {

        return offerService.rejectOffer(
                offerId,
                authentication.getName()
        );
    }


    // =========================================================
    // OFFER STATISTICS
    // =========================================================

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<OfferStatsDto>>
    getStats() {

        return offerService.getStats();
    }
}