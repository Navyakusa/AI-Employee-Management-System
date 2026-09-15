package com.ems.mapper;

import com.ems.dto.CandidateReviewDto;
import com.ems.entity.*;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CandidateReviewMapper {

    // Application
    @Mapping(
            target = "applicationId",
            source = "application.applicationId"
    )
    @Mapping(
            target = "status",
            expression =
                    "java(application.getStatus() != null ? application.getStatus().name() : null)"
    )
    @Mapping(
            target = "appliedAt",
            source = "application.appliedAt"
    )

    // User
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

    // Candidate
    @Mapping(
            target = "phone",
            source = "candidate.phone"
    )
    @Mapping(
            target = "location",
            source = "candidate.location"
    )
    @Mapping(
            target = "education",
            source = "candidate.education"
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
            target = "linkedin",
            source = "candidate.linkedin"
    )
    @Mapping(
            target = "portfolio",
            source = "candidate.portfolio"
    )
    @Mapping(
            target = "expectedSalary",
            source = "candidate.expectedSalary"
    )
    @Mapping(
            target = "noticePeriod",
            source = "candidate.noticePeriod"
    )
    @Mapping(
            target = "source",
            source = "candidate.source"
    )

    // Job
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
            target = "employmentType",
            source = "job.employmentType"
    )
    @Mapping(
            target = "jobLocation",
            source = "job.location"
    )
    @Mapping(
            target = "requiredSkills",
            source = "job.requiredSkills"
    )
    @Mapping(
            target = "preferredSkills",
            source = "job.preferredSkills"
    )

    // Resume
    @Mapping(
            target = "resumeId",
            source = "resume.id"
    )
    @Mapping(
            target = "resumeFileName",
            source = "resume.fileName"
    )
    @Mapping(
            target = "resumeFileType",
            source = "resume.fileType"
    )
    @Mapping(
            target = "extractedSkills",
            source = "resume.extractedSkills"
    )
    @Mapping(
            target = "extractedExperience",
            source = "resume.extractedExperience"
    )
    @Mapping(
            target = "extractedEducation",
            source = "resume.extractedEducation"
    )

    // AI
    @Mapping(
            target = "aiMatchScore",
            source = "aiMatching.overallMatchScore"
    )
    @Mapping(
            target = "skillMatch",
            source = "aiMatching.skillMatch"
    )
    @Mapping(
            target = "experienceMatch",
            source = "aiMatching.experienceMatch"
    )
    @Mapping(
            target = "educationMatch",
            source = "aiMatching.educationMatch"
    )
    @Mapping(
            target = "certificationMatch",
            source = "aiMatching.certificationMatch"
    )
    @Mapping(
            target = "locationMatch",
            source = "aiMatching.locationMatch"
    )
    @Mapping(
            target = "roleMatch",
            source = "aiMatching.roleMatch"
    )
    @Mapping(
            target = "aiExplanation",
            source = "aiMatching.explanation"
    )
    CandidateReviewDto toDto(
            Application application,
            User user,
            Candidate candidate,
            Job job,
            Resume resume,
            AICandidateMatching aiMatching
    );
}