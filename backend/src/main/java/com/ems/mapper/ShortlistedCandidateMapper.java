package com.ems.mapper;

import com.ems.dto.ShortlistedCandidateDto;
import com.ems.entity.AICandidateMatching;
import com.ems.entity.Application;
import com.ems.entity.Candidate;
import com.ems.entity.Job;
import com.ems.entity.Resume;
import com.ems.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ShortlistedCandidateMapper {

    @Mapping(
            target = "applicationId",
            source = "application.applicationId"
    )
    @Mapping(
            target = "candidateId",
            source = "user.userId"
    )
    @Mapping(
            target = "candidateName",
            source = "user.userName"
    )
    @Mapping(
            target = "email",
            source = "user.email"
    )
    @Mapping(
            target = "jobId",
            source = "job.id"
    )
    @Mapping(
            target = "jobTitle",
            source = "job.title"
    )
    @Mapping(
            target = "department",
            source = "job.department"
    )
    @Mapping(
            target = "location",
            source = "job.location"
    )
    @Mapping(
            target = "experience",
            source = "candidate.experience"
    )
    @Mapping(
            target = "skills",
            source = "candidate.skills"
    )
    @Mapping(
            target = "aiMatchScore",
            source = "aiMatching.overallMatchScore"
    )
    @Mapping(
            target = "resumeId",
            source = "resume.id"
    )
    @Mapping(
            target = "resumeFileName",
            source = "resume.fileName"
    )
    @Mapping(
            target = "status",
            expression = "java(application.getStatus() != null ? application.getStatus().name() : null)"
    )
    @Mapping(
            target = "appliedAt",
            source = "application.appliedAt"
    )
    ShortlistedCandidateDto toDto(
            Application application,
            User user,
            Candidate candidate,
            Job job,
            Resume resume,
            AICandidateMatching aiMatching
    );
}