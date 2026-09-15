package com.ems.mapper;

import com.ems.dto.JobAssignedDto;
import com.ems.entity.Job;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface JobAssignedMapper {

    @Mapping(source = "id", target = "jobId")
    @Mapping(target = "candidateCount", ignore = true)
    JobAssignedDto toDto(Job job);
}