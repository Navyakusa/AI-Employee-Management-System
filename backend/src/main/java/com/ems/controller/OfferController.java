package com.ems.controller;

import com.ems.common.ApiResponse;
import com.ems.common.OfferStatus;
import com.ems.dto.OfferDto;
import com.ems.dto.OfferStatsDto;
import com.ems.service.OfferService;

import org.springframework.http.ResponseEntity;
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

    @PostMapping
    public ResponseEntity<ApiResponse<OfferDto>>
    createOffer(
            @RequestBody OfferDto dto
    ) {

        return offerService
                .createOffer(dto);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<OfferDto>>>
    getAllOffers() {

        return offerService
                .getAllOffers();
    }

    @GetMapping("/{offerId}")
    public ResponseEntity<ApiResponse<OfferDto>>
    getOfferById(
            @PathVariable Long offerId
    ) {

        return offerService
                .getOfferById(offerId);
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<OfferDto>>>
    searchOffers(
            @RequestParam String query
    ) {

        return offerService
                .searchOffers(query);
    }

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<List<OfferDto>>>
    getByStatus(
            @RequestParam OfferStatus status
    ) {

        return offerService
                .getByStatus(status);
    }

    @PutMapping("/{offerId}/send")
    public ResponseEntity<ApiResponse<OfferDto>>
    sendOffer(
            @PathVariable Long offerId
    ) {

        return offerService
                .sendOffer(offerId);
    }

    @PutMapping("/{offerId}/accept")
    public ResponseEntity<ApiResponse<OfferDto>>
    acceptOffer(
            @PathVariable Long offerId
    ) {

        return offerService
                .acceptOffer(offerId);
    }

    @PutMapping("/{offerId}/reject")
    public ResponseEntity<ApiResponse<OfferDto>>
    rejectOffer(
            @PathVariable Long offerId
    ) {

        return offerService
                .rejectOffer(offerId);
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<OfferStatsDto>>
    getStats() {

        return offerService
                .getStats();
    }
}