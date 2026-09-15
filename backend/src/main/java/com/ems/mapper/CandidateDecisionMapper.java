package com.ems.mapper;

import com.ems.dto.CandidateDecisionDto;
import com.ems.entity.Candidate;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CandidateDecisionMapper {

    @Mapping(source = "id", target = "candidateId")
    @Mapping(source = "name", target = "candidateName")
    @Mapping(source = "email", target = "candidateEmail")
    @Mapping(source = "experience", target = "experience")
    CandidateDecisionDto candidateToDto(Candidate candidate);
}