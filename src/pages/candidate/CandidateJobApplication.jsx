import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  FileText,
  IndianRupee,
  Link2,
  MapPin,
  Upload,
  UserRound,
} from "lucide-react";

import CandidateSidebar from "./CandidateSidebar";
import CandidateNavbar from "./CandidateNavbar";

import "./CandidateDashboard.css";

function CandidateJobApplication() {
  const navigate = useNavigate();
  const { jobId } = useParams();

  const loggedInUser = JSON.parse(
    localStorage.getItem("loggedInUser") || "{}"
  );

  // Temporary job data.
  // Backend integration will replace this later.
  const jobs = [
    {
      id: 101,
      title: "Java Backend Developer",
      company: "Anasol Technologies",
      location: "Hyderabad",
      type: "Full Time",
    },
    {
      id: 102,
      title: "Full Stack Developer",
      company: "TechNova Solutions",
      location: "Bengaluru",
      type: "Full Time",
    },
    {
      id: 103,
      title: "Software Engineer",
      company: "CloudMatrix",
      location: "Hyderabad",
      type: "Full Time",
    },
    {
      id: 104,
      title: "React Developer",
      company: "Nexa Technologies",
      location: "Pune",
      type: "Full Time",
    },
    {
      id: 105,
      title: "Spring Boot Developer",
      company: "DigitalCore",
      location: "Chennai",
      type: "Full Time",
    },
    {
      id: 106,
      title: "Junior Java Developer",
      company: "Innovate Systems",
      location: "Hyderabad",
      type: "Full Time",
    },
  ];

  const selectedJob = useMemo(
    () =>
      jobs.find(
        (job) => String(job.id) === String(jobId)
      ) || jobs[0],
    [jobId]
  );

  const [formData, setFormData] = useState({
    fullName: loggedInUser?.userName || "",
    email: loggedInUser?.email || "",
    phone: "",
    currentLocation: "",
    linkedIn: "",
    portfolio: "",
    expectedSalary: "",
    noticePeriod: "",
    coverLetter: "",
  });

  const [resume, setResume] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((previous) => ({
        ...previous,
        [name]: "",
      }));
    }
  };

  const handleResumeChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      setErrors((previous) => ({
        ...previous,
        resume:
          "Please upload a PDF, DOC or DOCX file.",
      }));
      return;
    }

    setResume(file);

    setErrors((previous) => ({
      ...previous,
      resume: "",
    }));
  };

  const validateForm = () => {
    const validationErrors = {};

    if (!formData.fullName.trim()) {
      validationErrors.fullName =
        "Full name is required.";
    }

    if (!formData.email.trim()) {
      validationErrors.email =
        "Email address is required.";
    }

    if (!formData.phone.trim()) {
      validationErrors.phone =
        "Phone number is required.";
    }

    if (!formData.currentLocation.trim()) {
      validationErrors.currentLocation =
        "Current location is required.";
    }

    if (!formData.expectedSalary.trim()) {
      validationErrors.expectedSalary =
        "Expected salary is required.";
    }

    if (!formData.noticePeriod) {
      validationErrors.noticePeriod =
        "Please select your notice period.";
    }

    if (!resume) {
      validationErrors.resume =
        "Please upload your resume.";
    }

    setErrors(validationErrors);

    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Backend API integration will be added later.
    console.log("Job ID:", selectedJob.id);
    console.log("Application:", formData);
    console.log("Resume:", resume);

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="candidate-layout">
        <CandidateSidebar />

        <div className="candidate-main">
          <CandidateNavbar />

          <main className="candidate-dashboard-content">
            <div className="candidate-application-success">
              <div className="candidate-success-icon">
                <CheckCircle2 size={34} />
              </div>

              <h1>Application Submitted</h1>

              <p>
                Your application for{" "}
                <strong>{selectedJob.title}</strong> at{" "}
                <strong>{selectedJob.company}</strong>{" "}
                has been submitted successfully.
              </p>

              <div className="candidate-success-actions">
                <button
                  type="button"
                  className="candidate-primary-button"
                  onClick={() =>
                    navigate("/candidate/applications")
                  }
                >
                  View My Applications
                </button>

                <button
                  type="button"
                  className="candidate-secondary-button"
                  onClick={() =>
                    navigate("/candidate/jobs")
                  }
                >
                  Browse More Jobs
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="candidate-layout">
      <CandidateSidebar />

      <div className="candidate-main">
        <CandidateNavbar />

        <main className="candidate-dashboard-content">
          {/* BACK */}

          <button
            type="button"
            className="candidate-application-back"
            onClick={() =>
              navigate(`/candidate/jobs/${selectedJob.id}`)
            }
          >
            <ArrowLeft size={17} />
            Back to Job Details
          </button>

          {/* HEADER */}

          <div className="candidate-application-page-header">
            <p className="candidate-label">
              JOB APPLICATION
            </p>

            <h1>Apply for {selectedJob.title}</h1>

            <p>
              Review your information and complete the
              details below to submit your application.
            </p>
          </div>

          <div className="candidate-application-layout">
            {/* FORM */}

            <form
              className="candidate-application-form"
              onSubmit={handleSubmit}
              noValidate
            >
              {/* PERSONAL INFORMATION */}

              <section className="candidate-application-section">
                <div className="candidate-application-section-header">
                  <div className="candidate-form-section-icon">
                    <UserRound size={20} />
                  </div>

                  <div>
                    <h2>Candidate Information</h2>
                    <p>
                      Confirm your contact information.
                    </p>
                  </div>
                </div>

                <div className="candidate-form-grid">
                  <div className="candidate-form-group">
                    <label>Full Name *</label>

                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                    />

                    {errors.fullName && (
                      <span className="candidate-form-error">
                        {errors.fullName}
                      </span>
                    )}
                  </div>

                  <div className="candidate-form-group">
                    <label>Email Address *</label>

                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                    />

                    {errors.email && (
                      <span className="candidate-form-error">
                        {errors.email}
                      </span>
                    )}
                  </div>

                  <div className="candidate-form-group">
                    <label>Phone Number *</label>

                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                    />

                    {errors.phone && (
                      <span className="candidate-form-error">
                        {errors.phone}
                      </span>
                    )}
                  </div>

                  <div className="candidate-form-group">
                    <label>Current Location *</label>

                    <input
                      type="text"
                      name="currentLocation"
                      value={formData.currentLocation}
                      onChange={handleChange}
                      placeholder="Example: Hyderabad"
                    />

                    {errors.currentLocation && (
                      <span className="candidate-form-error">
                        {errors.currentLocation}
                      </span>
                    )}
                  </div>
                </div>
              </section>

              {/* PROFESSIONAL INFORMATION */}

              <section className="candidate-application-section">
                <div className="candidate-application-section-header">
                  <div className="candidate-form-section-icon">
                    <BriefcaseBusiness size={20} />
                  </div>

                  <div>
                    <h2>Professional Information</h2>
                    <p>
                      Provide job-specific professional
                      details.
                    </p>
                  </div>
                </div>

                <div className="candidate-form-grid">
                  <div className="candidate-form-group">
                    <label>LinkedIn Profile</label>

                    <div className="candidate-input-with-icon">
                      <Link2 size={16} />

                      <input
                        type="url"
                        name="linkedIn"
                        value={formData.linkedIn}
                        onChange={handleChange}
                        placeholder="LinkedIn profile URL"
                      />
                    </div>
                  </div>

                  <div className="candidate-form-group">
                    <label>Portfolio / Website</label>

                    <div className="candidate-input-with-icon">
                      <Link2 size={16} />

                      <input
                        type="url"
                        name="portfolio"
                        value={formData.portfolio}
                        onChange={handleChange}
                        placeholder="Portfolio URL"
                      />
                    </div>
                  </div>

                  <div className="candidate-form-group">
                    <label>Expected Salary *</label>

                    <div className="candidate-input-with-icon">
                      <IndianRupee size={16} />

                      <input
                        type="text"
                        name="expectedSalary"
                        value={formData.expectedSalary}
                        onChange={handleChange}
                        placeholder="Example: 6,00,000"
                      />
                    </div>

                    {errors.expectedSalary && (
                      <span className="candidate-form-error">
                        {errors.expectedSalary}
                      </span>
                    )}
                  </div>

                  <div className="candidate-form-group">
                    <label>Notice Period *</label>

                    <select
                      name="noticePeriod"
                      value={formData.noticePeriod}
                      onChange={handleChange}
                    >
                      <option value="">
                        Select notice period
                      </option>
                      <option value="Immediate">
                        Immediate
                      </option>
                      <option value="15 Days">
                        15 Days
                      </option>
                      <option value="30 Days">
                        30 Days
                      </option>
                      <option value="60 Days">
                        60 Days
                      </option>
                      <option value="90 Days">
                        90 Days
                      </option>
                    </select>

                    {errors.noticePeriod && (
                      <span className="candidate-form-error">
                        {errors.noticePeriod}
                      </span>
                    )}
                  </div>
                </div>
              </section>

              {/* RESUME */}

              <section className="candidate-application-section">
                <div className="candidate-application-section-header">
                  <div className="candidate-form-section-icon">
                    <FileText size={20} />
                  </div>

                  <div>
                    <h2>Resume</h2>
                    <p>
                      Upload the resume you want to use
                      for this application.
                    </p>
                  </div>
                </div>

                <label className="candidate-resume-upload">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeChange}
                  />

                  <div className="candidate-resume-upload-icon">
                    <Upload size={23} />
                  </div>

                  {resume ? (
                    <>
                      <strong>{resume.name}</strong>
                      <span>
                        Resume selected successfully
                      </span>
                    </>
                  ) : (
                    <>
                      <strong>
                        Upload your resume
                      </strong>

                      <span>
                        PDF, DOC or DOCX
                      </span>
                    </>
                  )}
                </label>

                {errors.resume && (
                  <span className="candidate-form-error">
                    {errors.resume}
                  </span>
                )}
              </section>

              {/* COVER LETTER */}

              <section className="candidate-application-section">
                <div className="candidate-application-section-header">
                  <div className="candidate-form-section-icon">
                    <FileText size={20} />
                  </div>

                  <div>
                    <h2>Additional Information</h2>
                    <p>
                      Tell the hiring team why you're
                      interested in this opportunity.
                    </p>
                  </div>
                </div>

                <div className="candidate-form-group">
                  <label>Cover Letter</label>

                  <textarea
                    name="coverLetter"
                    value={formData.coverLetter}
                    onChange={handleChange}
                    rows="6"
                    placeholder="Write a short note about your experience and interest in this position..."
                  />

                  <span className="candidate-field-help">
                    Optional
                  </span>
                </div>
              </section>

              {/* SUBMIT */}

              <div className="candidate-application-submit">
                <button
                  type="button"
                  className="candidate-secondary-button"
                  onClick={() =>
                    navigate(
                      `/candidate/jobs/${selectedJob.id}`
                    )
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="candidate-primary-button"
                >
                  Submit Application
                  <CheckCircle2 size={17} />
                </button>
              </div>
            </form>

            {/* JOB SUMMARY */}

            <aside className="candidate-application-job-summary">
              <p className="candidate-application-summary-label">
                APPLYING FOR
              </p>

              <div className="candidate-application-company-icon">
                <Building2 size={24} />
              </div>

              <h2>{selectedJob.title}</h2>

              <p className="candidate-application-company">
                {selectedJob.company}
              </p>

              <div className="candidate-application-summary-meta">
                <span>
                  <MapPin size={15} />
                  {selectedJob.location}
                </span>

                <span>
                  <BriefcaseBusiness size={15} />
                  {selectedJob.type}
                </span>
              </div>

              <div className="candidate-application-note">
                <CheckCircle2 size={17} />

                <p>
                  Review your information carefully before
                  submitting your application.
                </p>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}

export default CandidateJobApplication;