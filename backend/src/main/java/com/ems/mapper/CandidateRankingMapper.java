package com.ems.mapper;

import com.ems.dto.CandidateRankingResponseDto;
import com.ems.entity.CandidateRanking;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface CandidateRankingMapper {

    @Mapping(
            target = "missingMustHave",
            expression = "java(convertMissingSkills(ranking.getMissingMustHave()))"
    )
    CandidateRankingResponseDto toResponseDto(
            CandidateRanking ranking
    );

    default List<String> convertMissingSkills(String missingSkills) {

        if (missingSkills == null || missingSkills.isBlank()) {
            return Collections.emptyList();
        }

        return Arrays.stream(missingSkills.split(","))
                .map(String::trim)
                .filter(skill -> !skill.isEmpty())
                .collect(Collectors.toList());
    }
}