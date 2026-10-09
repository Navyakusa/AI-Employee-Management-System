
package com.ems.controller;

import com.ems.common.ApiResponse;
import com.ems.common.OfferStatus;
import com.ems.dto.OfferDto;
import com.ems.dto.OfferStatsDto;
import com.ems.service.OfferService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/offers")
@CrossOrigin(origins = "http://localhost:5173")
public class OfferController {

    private final OfferService offerService;

    public OfferController(OfferService offerService) {
        this.offerService = offerService;
    }

    // =========================================================
    // HR - CREATE OFFER
    // =========================================================
    @PostMapping
    @PreAuthorize("hasAnyRole('HR', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<OfferDto>> createOffer(
            @RequestBody OfferDto dto) {

        return offerService.createOffer(dto);
    }

    // =========================================================
    // HR - GET ALL OFFERS
    // =========================================================
    @GetMapping
    @PreAuthorize("hasAnyRole('HR', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<OfferDto>>> getAllOffers() {

        return offerService.getAllOffers();
    }

    // =========================================================
    // CANDIDATE - GET MY OFFERS
    // =========================================================
    @GetMapping("/my")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<List<OfferDto>>> getMyOffers(
            Authentication authentication) {

        return offerService.getOffersForCandidateEmail(
                authentication.getName());
    }

    // =========================================================
    // GET OFFER BY ID
    // =========================================================
    @GetMapping("/{offerId}")
    @PreAuthorize("hasAnyRole('HR', 'SUPER_ADMIN', 'CANDIDATE')")
    public ResponseEntity<ApiResponse<OfferDto>> getOfferById(
            @PathVariable Long offerId) {

        return offerService.getOfferById(offerId);
    }

    // =========================================================
    // SEARCH OFFERS
    // =========================================================
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('HR', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<OfferDto>>> searchOffers(
            @RequestParam String query) {

        return offerService.searchOffers(query);
    }

    // =========================================================
    // FILTER OFFERS BY STATUS
    // =========================================================
    @GetMapping("/status")
    @PreAuthorize("hasAnyRole('HR', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<OfferDto>>> getByStatus(
            @RequestParam OfferStatus status) {

        return offerService.getByStatus(status);
    }

    // =========================================================
    // HR - APPROVE OFFER
    // =========================================================
    @PutMapping("/{offerId}/approve")
    @PreAuthorize("hasAnyRole('HR', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<OfferDto>> approveOffer(
            @PathVariable Long offerId) {

        return offerService.approveOffer(offerId);
    }

    // =========================================================
    // HR - SEND OFFER
    // =========================================================
    @PutMapping("/{offerId}/send")
    @PreAuthorize("hasAnyRole('HR', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<OfferDto>> sendOffer(
            @PathVariable Long offerId) {

        return offerService.sendOffer(offerId);
    }

    // =========================================================
    // CANDIDATE - ACCEPT OFFER
    // =========================================================
    @PutMapping("/{offerId}/accept")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<OfferDto>> acceptOffer(
            @PathVariable Long offerId,
            Authentication authentication) {

        return offerService.acceptOffer(
                offerId,
                authentication.getName());
    }

    // =========================================================
    // CANDIDATE - REJECT OFFER
    // =========================================================
    @PutMapping("/{offerId}/reject")
    @PreAuthorize("hasRole('CANDIDATE')")
    public ResponseEntity<ApiResponse<OfferDto>> rejectOffer(
            @PathVariable Long offerId,
            Authentication authentication) {

        return offerService.rejectOffer(
                offerId,
                authentication.getName());
    }

    // =========================================================
    // OFFER STATISTICS
    // =========================================================
    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('HR', 'SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<OfferStatsDto>> getStats() {

        return offerService.getStats();
    }
}
