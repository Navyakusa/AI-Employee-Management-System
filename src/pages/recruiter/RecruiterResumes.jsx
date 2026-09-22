import React, { useEffect, useMemo, useState } from "react";
import RecruiterSidebar from "./RecruiterSidebar";
import RecruiterTopbar from "./RecruiterTopbar";
import apiClient from "../../services/apiClient";

import "./RecruiterResumes.css";

function RecruiterResumes() {
  const [showUploadModal, setShowUploadModal] = useState(false);
const [uploadCandidateId, setUploadCandidateId] = useState("");
const [uploadFile, setUploadFile] = useState(null);
const [uploading, setUploading] = useState(false);
const [uploadError, setUploadError] = useState("");
const [uploadSuccess, setUploadSuccess] = useState("");
  const [resumes, setResumes] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadingId, setDownloadingId] = useState(null);

  // =========================================================
  // FETCH RESUME MANAGEMENT DATA
  // GET /api/resumes/management
  // =========================================================

  // =========================================================
// FETCH RESUME MANAGEMENT DATA
// GET /api/resumes/management
// =========================================================

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

  // =========================================================
  // FORMAT STATUS
  // =========================================================

  const formatStatus = (status) => {
    if (!status) {
      return "Not Available";
    }

    return status
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  // =========================================================
  // STATUS CSS CLASS
  // =========================================================

  const getStatusClass = (status) => {
    if (!status) {
      return "";
    }

    return status
      .toLowerCase()
      .replace(/_/g, "-")
      .replace(/\s+/g, "-");
  };

  // =========================================================
  // FORMAT UPLOAD DATE
  // =========================================================

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "—";
    }

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

  // =========================================================
  // SKILLS
  // =========================================================

  const getSkills = (skills) => {
    if (!skills) {
      return [];
    }

    return skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);
  };

  // =========================================================
  // SUMMARY
  // =========================================================

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

  // =========================================================
  // SEARCH + FILTER
  // =========================================================

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
        skills
          .toLowerCase()
          .includes(searchText);

      const matchesStatus =
        statusFilter === "All" ||
        resume.status?.toUpperCase() ===
          statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [resumes, search, statusFilter]);

  // =========================================================
  // VIEW RESUME
  // =========================================================

  const handleView = async (resume) => {
    try {
      setError("");

      const response = await apiClient.get(
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
        window.URL.revokeObjectURL(fileURL);
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
      } else if (err.response?.status === 403) {
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

  // =========================================================
  // DOWNLOAD RESUME
  // =========================================================

  const handleDownload = async (resume) => {
    try {
      setError("");
      setDownloadingId(resume.resumeId);

      const response = await apiClient.get(
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

      // Backend normally provides filename through
      // Content-Disposition. Until we parse that header,
      // use candidate name + resume ID.
      const candidateName =
        resume.candidateName ||
        "candidate";

      link.download =
        `${candidateName
          .replace(/\s+/g, "_")}_Resume.pdf`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.setTimeout(() => {
        window.URL.revokeObjectURL(blobURL);
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
      } else if (err.response?.status === 403) {
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

  // =========================================================
  // UPLOAD
  // =========================================================

  // =========================================================
// UPLOAD RESUME
// POST /api/resumes/upload
// =========================================================

const handleUploadResume = async (e) => {
  e.preventDefault();

  setUploadError("");
  setUploadSuccess("");

  if (!uploadCandidateId) {
    setUploadError("Please enter a candidate ID.");
    return;
  }

  if (!uploadFile) {
    setUploadError("Please select a resume file.");
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
    allowedExtensions.some((extension) =>
      fileName.endsWith(extension)
    );

  if (
    !allowedTypes.includes(uploadFile.type) &&
    !hasAllowedExtension
  ) {
    setUploadError(
      "Please select a PDF, DOC, or DOCX file."
    );
    return;
  }

  try {
    setUploading(true);

    const formData = new FormData();

    formData.append(
      "candidateId",
      uploadCandidateId
    );

    formData.append(
      "file",
      uploadFile
    );

    const response = await apiClient.post(
  "/resumes/upload",
  formData,
  {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  }
);

    const result = response.data;

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

    // Refresh Resume Management table
    await fetchResumes();

    setUploadCandidateId("");
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
    } else if (err.response?.status === 403) {
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

  return (
    <div className="recruiter-resumes-page">
      <RecruiterSidebar />
      <RecruiterTopbar />

      <main className="recruiter-resumes-main">
        {/* HEADER */}

        <div className="resumes-header">
          <div>
            <h1>Resume Management</h1>

            <p>
              View, search and manage candidate resumes
            </p>
          </div>

          <button
  className="upload-resume-btn"
  onClick={() => {
    setUploadError("");
    setUploadSuccess("");
    setUploadCandidateId("");
    setUploadFile(null);
    setShowUploadModal(true);
  }}
>
  <span>+</span>
  Upload Resume
</button>
        </div>

        {/* ERROR */}

        {error && (
          <div
            role="alert"
            style={{
              padding: "12px 16px",
              marginBottom: "18px",
              background: "#fef2f2",
              color: "#dc2626",
              border: "1px solid #fecaca",
              borderRadius: "8px",
              fontSize: "13px",
            }}
          >
            {error}
          </div>
        )}

        {/* SUMMARY */}

        <section className="resume-summary">
          <div className="resume-summary-card">
            <div className="summary-icon">
              📄
            </div>

            <div>
              <span>Total Resumes</span>

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
              <span>Shortlisted</span>

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
              <span>Under Screening</span>

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
              <span>High Match</span>

              <strong>
                {loading
                  ? "..."
                  : highMatchCount}
              </strong>
            </div>
          </div>
        </section>

        {/* TABLE */}

        <section className="resume-table-card">
          <div className="resume-table-toolbar">
            <div className="resume-search">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Search candidate, position or skills..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
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
                  <th>Candidate</th>
                  <th>Position</th>
                  <th>Experience</th>
                  <th>Skills</th>
                  <th>Uploaded</th>
                  <th>AI Match</th>
                  <th>Status</th>
                  <th>Actions</th>
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
                    (resume) => (
                      <tr
                        key={resume.resumeId}
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
                            ).length >
                            0 ? (
                              getSkills(
                                resume.skills
                              ).map(
                                (skill) => (
                                  <span
                                    key={skill}
                                  >
                                    {skill}
                                  </span>
                                )
                              )
                            ) : (
                              <span>—</span>
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
                        <span>📄</span>

                        <h3>
                          No resumes found
                        </h3>

                        <p>
                          Try changing your
                          search or filter.
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
          {showUploadModal && (
  <div className="resume-upload-overlay">
    <div className="resume-upload-modal">

      <div className="resume-upload-modal-header">
        <div>
          <h2>Upload Resume</h2>
          <p>Upload and process a candidate resume.</p>
        </div>

        <button
          type="button"
          className="resume-upload-close"
          disabled={uploading}
          onClick={() => setShowUploadModal(false)}
        >
          ×
        </button>
      </div>

      <form onSubmit={handleUploadResume}>

        {uploadError && (
          <div className="resume-upload-error">
            {uploadError}
          </div>
        )}

        {uploadSuccess && (
          <div className="resume-upload-success">
            {uploadSuccess}
          </div>
        )}

        <div className="resume-upload-field">
          <label>
            Candidate ID <span>*</span>
          </label>

          <input
            type="number"
            min="1"
            placeholder="Enter candidate ID"
            value={uploadCandidateId}
            disabled={uploading}
            onChange={(e) =>
              setUploadCandidateId(e.target.value)
            }
          />

          <small>
            Enter the candidate ID associated with this resume.
          </small>
        </div>

        <div className="resume-upload-field">
          <label>
            Resume File <span>*</span>
          </label>

          <div className="resume-file-input">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              disabled={uploading}
              onChange={(e) =>
                setUploadFile(e.target.files?.[0] || null)
              }
            />
          </div>

          {uploadFile && (
            <div className="resume-selected-file">
              <span>📄</span>

              <div>
                <strong>{uploadFile.name}</strong>
                <small>
                  {(uploadFile.size / 1024).toFixed(1)} KB
                </small>
              </div>
            </div>
          )}
        </div>

        <div className="resume-upload-actions">

          <button
            type="button"
            className="resume-upload-cancel"
            disabled={uploading}
            onClick={() => setShowUploadModal(false)}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="resume-upload-submit"
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Upload Resume"}
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