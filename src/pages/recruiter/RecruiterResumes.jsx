import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import RecruiterSidebar from "./RecruiterSidebar";
import RecruiterTopbar from "./RecruiterTopbar";
import apiClient from "../../services/apiClient";

import "./RecruiterResumes.css";

// Change ONLY this path if your existing AI Screening route is different.
const AI_SCREENING_ROUTE = "/recruiter/screening";

function RecruiterResumes() {
  const navigate = useNavigate();

  // ============================================================
  // UPLOAD STATES
  // ============================================================

  const [showUploadModal, setShowUploadModal] = useState(false);

  // Candidate ID is still required by backend,
  // but recruiter will NOT type it manually.
  const [uploadCandidateId, setUploadCandidateId] = useState("");

  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");

  // ============================================================
  // NEW - CANDIDATE SEARCH STATES
  // ============================================================

  const [candidates, setCandidates] = useState([]);
  const [candidateSearch, setCandidateSearch] = useState("");
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [showCandidateResults, setShowCandidateResults] =
    useState(false);

  // ============================================================
  // RESUME MANAGEMENT STATES
  // ============================================================

  const [resumes, setResumes] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadingId, setDownloadingId] = useState(null);

  // ============================================================
  // GET /api/resumes/management
  // ============================================================

  const fetchResumes = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiClient.get(
        "/resumes/management"
      );

      console.log(
        "Resume management response:",
        response.data
      );

      const result = response.data;

      if (
        !result?.success ||
        !Array.isArray(result?.data)
      ) {
        throw new Error(
          result?.message ||
            "Invalid resume management response."
        );
      }

      setResumes(result.data);
    } catch (err) {
      console.error(
        "Error fetching resume management data:",
        err
      );

      if (err.response?.status === 401) {
        setError(
          "Your session has expired. Please log in again."
        );
      } else if (err.response?.status === 403) {
        setError(
          "You are not authorized to access resume management."
        );
      } else {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Unable to load resume management data."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchCandidates = async () => {
  try {
    setLoadingCandidates(true);
    setUploadError("");

    const response = await apiClient.get(
      "/candidates/all"
    );

    console.log(
      "Candidates for resume upload:",
      response.data
    );

    const result = response.data;

    // Backend /candidates/all returns a direct array
    if (Array.isArray(result)) {
      setCandidates(result);
    }
    // Keep support in case backend later uses ApiResponse
    else if (
      result?.success &&
      Array.isArray(result?.data)
    ) {
      setCandidates(result.data);
    } else {
      setCandidates([]);
      setUploadError(
        "No candidates are available."
      );
    }
  } catch (err) {
    console.error(
      "Unable to fetch candidates:",
      err
    );

    setCandidates([]);

    if (err.response?.status === 401) {
      setUploadError(
        "Your session has expired. Please log in again."
      );
    } else if (err.response?.status === 403) {
      setUploadError(
        "You are not authorized to load candidates."
      );
    } else {
      setUploadError(
        err.response?.data?.message ||
          "Unable to load candidates."
      );
    }
  } finally {
    setLoadingCandidates(false);
  }
};
  // ============================================================
  // FORMAT STATUS
  // ============================================================

  const formatStatus = (status) => {
    if (!status) return "Not Available";

    return status
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  // ============================================================
  // STATUS CLASS
  // ============================================================

  const getStatusClass = (status) => {
    if (!status) return "";

    return status
      .toLowerCase()
      .replace(/_/g, "-")
      .replace(/\s+/g, "-");
  };

  // ============================================================
  // DATE FORMAT
  // ============================================================

  const formatDate = (dateValue) => {
    if (!dateValue) return "—";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ============================================================
  // SKILLS
  // ============================================================

  const getSkills = (skills) => {
    if (!skills) return [];

    if (Array.isArray(skills)) {
      return skills
        .map(String)
        .map((skill) => skill.trim())
        .filter(Boolean);
    }

    return String(skills)
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);
  };

  // ============================================================
  // SUMMARY COUNTS
  // ============================================================

  const totalResumes = resumes.length;

  const shortlistedCount = resumes.filter(
    (resume) =>
      resume.status?.toUpperCase() ===
      "SHORTLISTED"
  ).length;

  const underScreeningCount = resumes.filter(
    (resume) => {
      const status =
        resume.status?.toUpperCase();

      return (
        status === "SCREENING" ||
        status === "AI_SCREENED" ||
        status === "UNDER_REVIEW"
      );
    }
  ).length;

  const highMatchCount = resumes.filter(
    (resume) =>
      resume.aiMatch !== null &&
      resume.aiMatch !== undefined &&
      Number(resume.aiMatch) >= 85
  ).length;

  // ============================================================
  // FILTER RESUMES
  // ============================================================

  const filteredResumes = useMemo(() => {
    const searchText = search
      .trim()
      .toLowerCase();

    return resumes.filter((resume) => {
      const candidateName =
        resume.candidateName || "";

      const email =
        resume.candidateEmail || "";

      const position =
        resume.position || "";

      const skills =
        resume.skills || "";

      const matchesSearch =
        candidateName
          .toLowerCase()
          .includes(searchText) ||
        email
          .toLowerCase()
          .includes(searchText) ||
        position
          .toLowerCase()
          .includes(searchText) ||
        String(skills)
          .toLowerCase()
          .includes(searchText);

      const matchesStatus =
        statusFilter === "All" ||
        resume.status?.toUpperCase() ===
          statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [resumes, search, statusFilter]);

  // ============================================================
  // NEW - FILTER CANDIDATES
  // ============================================================

  const filteredCandidates = useMemo(() => {
    const value = candidateSearch
      .trim()
      .toLowerCase();

    if (!value) {
      return candidates;
    }

    return candidates.filter(
      (candidate) => {
        const name = String(
          candidate.name || ""
        ).toLowerCase();

        const email = String(
          candidate.email || ""
        ).toLowerCase();

        return (
          name.includes(value) ||
          email.includes(value)
        );
      }
    );
  }, [candidates, candidateSearch]);

  // ============================================================
  // RUN AI SCREENING
  // ============================================================

  const handleRunAIScreening = (resume) => {
    const selectedCandidateId = Number(
      resume.candidateId
    );

    const selectedJobId = Number(
      resume.jobId
    );

    if (
      !Number.isInteger(
        selectedCandidateId
      ) ||
      selectedCandidateId <= 0 ||
      !Number.isInteger(selectedJobId) ||
      selectedJobId <= 0
    ) {
      setError(
        `Cannot start AI screening for ${
          resume.candidateName ||
          "this candidate"
        }. The Resume Management API must return the candidateId and jobId associated with this application.`
      );

      return;
    }

    navigate(AI_SCREENING_ROUTE, {
      state: {
        selectedApplication: {
          applicationId:
            resume.applicationId ?? null,

          candidateId:
            selectedCandidateId,

          candidateName:
            resume.candidateName ||
            "Unknown Candidate",

          candidateEmail:
            resume.candidateEmail || "",

          jobId:
            selectedJobId,

          jobTitle:
            resume.position ||
            `Job #${selectedJobId}`,

          resumeId:
            resume.resumeId ?? null,
        },
      },
    });
  };

  // ============================================================
  // VIEW RESUME
  // ============================================================

  const handleView = async (resume) => {
    try {
      setError("");

      const response =
        await apiClient.get(
          `/resumes/${resume.resumeId}/view`,
          {
            responseType: "blob",
          }
        );

      const fileURL =
        window.URL.createObjectURL(
          response.data
        );

      window.open(
        fileURL,
        "_blank",
        "noopener,noreferrer"
      );

      window.setTimeout(() => {
        window.URL.revokeObjectURL(
          fileURL
        );
      }, 60000);
    } catch (err) {
      console.error(
        "Resume view failed:",
        err
      );

      if (err.response?.status === 404) {
        setError(
          "Resume file not found on the server."
        );
      } else if (
        err.response?.status === 403
      ) {
        setError(
          "You are not authorized to view this resume."
        );
      } else {
        setError(
          err.response?.data?.message ||
            "Unable to view resume."
        );
      }
    }
  };

  // ============================================================
  // DOWNLOAD RESUME
  // ============================================================

  const handleDownload = async (resume) => {
    try {
      setError("");

      setDownloadingId(
        resume.resumeId
      );

      const response =
        await apiClient.get(
          `/resumes/${resume.resumeId}/download`,
          {
            responseType: "blob",
          }
        );

      const blobURL =
        window.URL.createObjectURL(
          response.data
        );

      const link =
        document.createElement("a");

      link.href = blobURL;

      const candidateName =
        resume.candidateName ||
        "candidate";

      link.download =
        `${candidateName.replace(
          /\s+/g,
          "_"
        )}_Resume.pdf`;

      document.body.appendChild(link);

      link.click();
      link.remove();

      window.setTimeout(() => {
        window.URL.revokeObjectURL(
          blobURL
        );
      }, 1000);
    } catch (err) {
      console.error(
        "Resume download failed:",
        err
      );

      if (err.response?.status === 404) {
        setError(
          `Resume file for ${
            resume.candidateName ||
            "this candidate"
          } is missing from the server.`
        );
      } else if (
        err.response?.status === 403
      ) {
        setError(
          "You are not authorized to download this resume."
        );
      } else {
        setError(
          "Unable to download resume."
        );
      }
    } finally {
      setDownloadingId(null);
    }
  };

  // ============================================================
  // NEW - SELECT CANDIDATE
  // ============================================================

  const handleCandidateSelect = (
    candidate
  ) => {
    setUploadCandidateId(
      String(candidate.id)
    );

    const displayName =
      candidate.name ||
      "Candidate";

    const displayEmail =
      candidate.email || "";

    setCandidateSearch(
      displayEmail
        ? `${displayName} — ${displayEmail}`
        : displayName
    );

    setShowCandidateResults(false);
    setUploadError("");
  };

  // ============================================================
  // UPLOAD RESUME
  // ============================================================

  const handleUploadResume = async (
    e
  ) => {
    e.preventDefault();

    setUploadError("");
    setUploadSuccess("");

    // Recruiter selects candidate instead of
    // manually entering candidate ID.
    if (!uploadCandidateId) {
      setUploadError(
        "Please select a candidate."
      );

      return;
    }

    if (!uploadFile) {
      setUploadError(
        "Please select a resume file."
      );

      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    const allowedExtensions = [
      ".pdf",
      ".doc",
      ".docx",
    ];

    const fileName =
      uploadFile.name.toLowerCase();

    const hasAllowedExtension =
      allowedExtensions.some(
        (extension) =>
          fileName.endsWith(extension)
      );

    if (
      !allowedTypes.includes(
        uploadFile.type
      ) &&
      !hasAllowedExtension
    ) {
      setUploadError(
        "Please select a PDF, DOC, or DOCX file."
      );

      return;
    }

    try {
      setUploading(true);

      const formData =
        new FormData();

      formData.append(
        "candidateId",
        uploadCandidateId
      );

      formData.append(
        "file",
        uploadFile
      );

      // Do NOT manually set multipart Content-Type.
      // Axios/browser will create the correct boundary.
      const response =
        await apiClient.post(
          "/resumes/upload",
          formData
        );

      const result =
        response.data;

      if (!result?.success) {
        throw new Error(
          result?.message ||
            "Unable to upload resume."
        );
      }

      setUploadSuccess(
        result.message ||
          "Resume uploaded and processed successfully."
      );

      await fetchResumes();

      setUploadCandidateId("");
      setCandidateSearch("");
      setCandidates([]);
      setShowCandidateResults(false);

      setUploadFile(null);

      setTimeout(() => {
        setShowUploadModal(false);
        setUploadSuccess("");
      }, 1200);
    } catch (err) {
      console.error(
        "Resume upload error:",
        err
      );

      if (err.response?.status === 401) {
        setUploadError(
          "Your session has expired. Please log in again."
        );
      } else if (
        err.response?.status === 403
      ) {
        setUploadError(
          "You are not authorized to upload resumes."
        );
      } else {
        setUploadError(
          err.response?.data?.message ||
            err.message ||
            "Unable to upload resume. Please try again."
        );
      }
    } finally {
      setUploading(false);
    }
  };

  // ============================================================
  // OPEN UPLOAD MODAL
  // ============================================================

  const handleOpenUploadModal = () => {
    setUploadError("");
    setUploadSuccess("");

    setUploadCandidateId("");
    setCandidateSearch("");
    setCandidates([]);
    setShowCandidateResults(false);

    setUploadFile(null);

    setShowUploadModal(true);

    fetchCandidates();
  };

  // ============================================================
  // CLOSE UPLOAD MODAL
  // ============================================================

  const handleCloseUploadModal = () => {
    if (uploading) {
      return;
    }

    setShowUploadModal(false);

    setUploadCandidateId("");
    setCandidateSearch("");
    setCandidates([]);
    setShowCandidateResults(false);

    setUploadFile(null);
    setUploadError("");
    setUploadSuccess("");
  };

  return (
    <div className="recruiter-resumes-page">
      <RecruiterSidebar />

      <RecruiterTopbar />

      <main className="recruiter-resumes-main">

        {/* ====================================================
            HEADER
        ==================================================== */}

        <div className="resumes-header">
          <div>
            <h1>
              Resume Management
            </h1>

            <p>
              View, search and manage candidate resumes
            </p>
          </div>

          <button
            className="upload-resume-btn"
            onClick={
              handleOpenUploadModal
            }
          >
            <span>+</span>
            Upload Resume
          </button>
        </div>


        {/* ====================================================
            ERROR
        ==================================================== */}

        {error && (
          <div
            role="alert"
            style={{
              padding: "12px 16px",
              marginBottom: "18px",
              background: "#fef2f2",
              color: "#dc2626",
              border:
                "1px solid #fecaca",
              borderRadius: "8px",
              fontSize: "13px",
            }}
          >
            {error}
          </div>
        )}


        {/* ====================================================
            SUMMARY
        ==================================================== */}

        <section className="resume-summary">

          <div className="resume-summary-card">
            <div className="summary-icon">
              📄
            </div>

            <div>
              <span>
                Total Resumes
              </span>

              <strong>
                {loading
                  ? "..."
                  : totalResumes}
              </strong>
            </div>
          </div>


          <div className="resume-summary-card">
            <div className="summary-icon">
              ✓
            </div>

            <div>
              <span>
                Shortlisted
              </span>

              <strong>
                {loading
                  ? "..."
                  : shortlistedCount}
              </strong>
            </div>
          </div>


          <div className="resume-summary-card">
            <div className="summary-icon">
              ◷
            </div>

            <div>
              <span>
                Under Screening
              </span>

              <strong>
                {loading
                  ? "..."
                  : underScreeningCount}
              </strong>
            </div>
          </div>


          <div className="resume-summary-card">
            <div className="summary-icon">
              ★
            </div>

            <div>
              <span>
                High Match
              </span>

              <strong>
                {loading
                  ? "..."
                  : highMatchCount}
              </strong>
            </div>
          </div>

        </section>


        {/* ====================================================
            TABLE
        ==================================================== */}

        <section className="resume-table-card">

          <div className="resume-table-toolbar">

            <div className="resume-search">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Search candidate, position or skills..."
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
              />
            </div>


            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
              className="resume-status-filter"
            >
              <option value="All">
                All Status
              </option>

              <option value="APPLIED">
                Applied
              </option>

              <option value="SCREENING">
                Screening
              </option>

              <option value="AI_SCREENED">
                AI Screened
              </option>

              <option value="SHORTLISTED">
                Shortlisted
              </option>

              <option value="INTERVIEW">
                Interview
              </option>

              <option value="SELECTED">
                Selected
              </option>

              <option value="REJECTED">
                Rejected
              </option>
            </select>

          </div>


          <div className="resume-table-wrapper">

            <table className="resume-table">

              <thead>
                <tr>
                  <th>
                    Candidate
                  </th>

                  <th>
                    Position
                  </th>

                  <th>
                    Experience
                  </th>

                  <th>
                    Skills
                  </th>

                  <th>
                    Uploaded
                  </th>

                  <th>
                    AI Match
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Actions
                  </th>
                </tr>
              </thead>


              <tbody>

                {loading ? (

                  <tr>
                    <td
                      colSpan="8"
                      className="empty-resumes"
                    >
                      <div>
                        <h3>
                          Loading resumes...
                        </h3>
                      </div>
                    </td>
                  </tr>

                ) : error &&
                  resumes.length === 0 ? (

                  <tr>
                    <td
                      colSpan="8"
                      className="empty-resumes"
                    >
                      <div>
                        <h3>
                          Unable to load resumes
                        </h3>
                      </div>
                    </td>
                  </tr>

                ) : filteredResumes.length >
                  0 ? (

                  filteredResumes.map(
                    (resume, index) => (

                      <tr
                        key={
                          resume.applicationId ??
                          `${resume.resumeId}-${resume.jobId ?? index}`
                        }
                      >

                        {/* CANDIDATE */}

                        <td>
                          <div className="candidate-cell">

                            <div className="candidate-avatar">
                              {resume.candidateName
                                ?.charAt(0)
                                ?.toUpperCase() ||
                                "C"}
                            </div>

                            <div>
                              <strong>
                                {resume.candidateName ||
                                  "Unknown Candidate"}
                              </strong>

                              <small>
                                {resume.candidateEmail ||
                                  "—"}
                              </small>
                            </div>

                          </div>
                        </td>


                        {/* POSITION */}

                        <td>
                          <span className="position-text">
                            {resume.position ||
                              "—"}
                          </span>
                        </td>


                        {/* EXPERIENCE */}

                        <td>
                          {resume.experience ||
                            "—"}
                        </td>


                        {/* SKILLS */}

                        <td>
                          <div className="skills-list">

                            {getSkills(
                              resume.skills
                            ).length > 0 ? (

                              getSkills(
                                resume.skills
                              ).map(
                                (
                                  skill,
                                  skillIndex
                                ) => (
                                  <span
                                    key={`${skill}-${skillIndex}`}
                                  >
                                    {skill}
                                  </span>
                                )
                              )

                            ) : (
                              <span>
                                —
                              </span>
                            )}

                          </div>
                        </td>


                        {/* UPLOADED */}

                        <td>
                          {formatDate(
                            resume.uploadedAt
                          )}
                        </td>


                        {/* AI MATCH */}

                        <td>

                          {resume.aiMatch !==
                            null &&
                          resume.aiMatch !==
                            undefined ? (

                            <div className="match-score">

                              <div className="score-circle">
                                {Number(
                                  resume.aiMatch
                                ).toFixed(
                                  Number(
                                    resume.aiMatch
                                  ) %
                                    1 ===
                                    0
                                    ? 0
                                    : 1
                                )}
                                %
                              </div>

                            </div>

                          ) : (

                            <span
                              style={{
                                color:
                                  "#94a3b8",
                                fontSize:
                                  "12px",
                              }}
                            >
                              Not Screened
                            </span>

                          )}

                        </td>


                        {/* STATUS */}

                        <td>
                          <span
                            className={`resume-status ${getStatusClass(
                              resume.status
                            )}`}
                          >
                            {formatStatus(
                              resume.status
                            )}
                          </span>
                        </td>


                        {/* ACTIONS */}

                        <td>
                          <div className="resume-actions">

                            <button
                              type="button"
                              className="view-btn"
                              onClick={() =>
                                handleView(
                                  resume
                                )
                              }
                            >
                              View
                            </button>


                            <button
                              type="button"
                              className="download-btn"
                              title={
                                downloadingId ===
                                resume.resumeId
                                  ? "Downloading..."
                                  : "Download Resume"
                              }
                              disabled={
                                downloadingId !==
                                null
                              }
                              onClick={() =>
                                handleDownload(
                                  resume
                                )
                              }
                            >
                              ↓
                            </button>


                            <button
                              type="button"
                              className="run-screening-btn"
                              title={`Run AI Screening for ${
                                resume.candidateName ||
                                "candidate"
                              }`}
                              onClick={() =>
                                handleRunAIScreening(
                                  resume
                                )
                              }
                            >
                              ✦ Run AI Screening
                            </button>

                          </div>
                        </td>

                      </tr>

                    )
                  )

                ) : (

                  <tr>
                    <td
                      colSpan="8"
                      className="empty-resumes"
                    >
                      <div>
                        <span>
                          📄
                        </span>

                        <h3>
                          No resumes found
                        </h3>

                        <p>
                          Try changing your search or filter.
                        </p>
                      </div>
                    </td>
                  </tr>

                )}

              </tbody>

            </table>

          </div>


          <div className="resume-table-footer">
            Showing{" "}
            <strong>
              {filteredResumes.length}
            </strong>{" "}
            of{" "}
            <strong>
              {resumes.length}
            </strong>{" "}
            resumes
          </div>


          {/* ==================================================
              UPLOAD MODAL
          ================================================== */}

          {showUploadModal && (

            <div className="resume-upload-overlay">

              <div className="resume-upload-modal">

                <div className="resume-upload-modal-header">

                  <div>
                    <h2>
                      Upload Resume
                    </h2>

                    <p>
                      Select a candidate and upload their resume.
                    </p>
                  </div>


                  <button
                    type="button"
                    className="resume-upload-close"
                    disabled={uploading}
                    onClick={
                      handleCloseUploadModal
                    }
                  >
                    ×
                  </button>

                </div>


                <form
                  onSubmit={
                    handleUploadResume
                  }
                >

                  {/* ERROR */}

                  {uploadError && (
                    <div className="resume-upload-error">
                      {uploadError}
                    </div>
                  )}


                  {/* SUCCESS */}

                  {uploadSuccess && (
                    <div className="resume-upload-success">
                      {uploadSuccess}
                    </div>
                  )}


                  {/* ==========================================
                      NEW - SELECT CANDIDATE
                  ========================================== */}

                  <div className="resume-upload-field">

                    <label>
                      Select Candidate{" "}
                      <span>*</span>
                    </label>


                    <div className="candidate-upload-search">

                      <input
                        type="text"
                        placeholder={
                          loadingCandidates
                            ? "Loading candidates..."
                            : "Search candidate by name or email"
                        }
                        value={
                          candidateSearch
                        }
                        disabled={
                          uploading ||
                          loadingCandidates
                        }
                        autoComplete="off"
                        onFocus={() =>
                          setShowCandidateResults(
                            true
                          )
                        }
                        onChange={(e) => {
                          setCandidateSearch(
                            e.target.value
                          );

                          // If recruiter edits text,
                          // previous candidate selection
                          // is cleared.
                          setUploadCandidateId(
                            ""
                          );

                          setShowCandidateResults(
                            true
                          );

                          setUploadError(
                            ""
                          );
                        }}
                      />


                      {/* CANDIDATE RESULTS */}

                      {showCandidateResults &&
                        !loadingCandidates && (

                          <div className="candidate-upload-results">

                            {filteredCandidates.length >
                            0 ? (

                              filteredCandidates.map(
                                (
                                  candidate
                                ) => (

                                  <button
                                    key={
                                      candidate.id
                                    }
                                    type="button"
                                    className="candidate-upload-option"
                                    onClick={() =>
                                      handleCandidateSelect(
                                        candidate
                                      )
                                    }
                                  >

                                    <div className="candidate-upload-avatar">
                                      {candidate.name
                                        ?.charAt(
                                          0
                                        )
                                        ?.toUpperCase() ||
                                        "C"}
                                    </div>


                                    <div>
                                      <strong>
                                        {candidate.name ||
                                          "Unknown Candidate"}
                                      </strong>

                                      <span>
                                        {candidate.email ||
                                          "Email not available"}
                                      </span>
                                    </div>

                                  </button>

                                )
                              )

                            ) : (

                              <div className="candidate-upload-no-results">
                                No candidates found.
                              </div>

                            )}

                          </div>

                        )}

                    </div>


                    {uploadCandidateId ? (

                      <small className="candidate-selected-message">
                        ✓ Candidate selected
                      </small>

                    ) : (

                      <small>
                        Search and select the candidate whose resume you want to upload.
                      </small>

                    )}

                  </div>


                  {/* ==========================================
                      RESUME FILE
                  ========================================== */}

                  <div className="resume-upload-field">

                    <label>
                      Resume File{" "}
                      <span>*</span>
                    </label>


                    <div className="resume-file-input">

                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        disabled={
                          uploading
                        }
                        onChange={(e) =>
                          setUploadFile(
                            e.target
                              .files?.[0] ||
                              null
                          )
                        }
                      />

                    </div>


                    {uploadFile && (

                      <div className="resume-selected-file">

                        <span>
                          📄
                        </span>

                        <div>
                          <strong>
                            {
                              uploadFile.name
                            }
                          </strong>

                          <small>
                            {(
                              uploadFile.size /
                              1024
                            ).toFixed(
                              1
                            )}{" "}
                            KB
                          </small>
                        </div>

                      </div>

                    )}

                  </div>


                  {/* ==========================================
                      ACTIONS
                  ========================================== */}

                  <div className="resume-upload-actions">

                    <button
                      type="button"
                      className="resume-upload-cancel"
                      disabled={
                        uploading
                      }
                      onClick={
                        handleCloseUploadModal
                      }
                    >
                      Cancel
                    </button>


                    <button
                      type="submit"
                      className="resume-upload-submit"
                      disabled={
                        uploading
                      }
                    >
                      {uploading
                        ? "Uploading..."
                        : "Upload Resume"}
                    </button>

                  </div>

                </form>

              </div>

            </div>

          )}

        </section>

      </main>

    </div>
  );
}

export default RecruiterResumes;