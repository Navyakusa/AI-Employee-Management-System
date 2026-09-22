import { useEffect, useRef, useState } from "react";
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
  UserRound,
} from "lucide-react";

import CandidateSidebar from "./CandidateSidebar";
import CandidateNavbar from "./CandidateNavbar";

import {
  applyToJob,
  getJobById,
  getMyApplications,
  getMyProfile,
  updateMyProfile,
} from "../../services/candidateService";
import {
  fromApiProfile,
  getErrorMessage,
  mapJob,
  toApiProfile,
} from "../../services/candidateHelpers";

import "./CandidateDashboard.css";

const NOTICE_PERIOD_OPTIONS = [
  "Immediate",
  "15 Days",
  "30 Days",
  "60 Days",
  "90 Days",
];

// Profile may say "30 days"; the dropdown says "30 Days".
const matchNoticePeriod = (value) =>
  NOTICE_PERIOD_OPTIONS.find(
    (option) =>
      option.toLowerCase() === String(value ?? "").trim().toLowerCase()
  ) || String(value ?? "").trim();

function CandidateJobApplication() {
  const navigate = useNavigate();
  const { jobId } = useParams();

  const [selectedJob, setSelectedJob] = useState(null);
  const [profile, setProfile] = useState(null);
  const [alreadyApplied, setAlreadyApplied] = useState(false);


  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Temporary job data.
  // Backend integration will replace this later.
  const jobs = [
    {
      id: 101,
      title: "Java Backend Developer",
      company: "TalentAI",
      location: "Hyderabad",
      type: "Full Time",
    },
    {
      id: 102,
      title: "Full Stack Developer",
      company: "TalentAI",
      location: "Bengaluru",
      type: "Full Time",
    },
    {
      id: 103,
      title: "Software Engineer",
      company: "TalentAI",
      location: "Hyderabad",
      type: "Full Time",
    },
    {
      id: 104,
      title: "React Developer",
      company: "TalentAI",
      location: "Pune",
      type: "Full Time",
    },
    {
      id: 105,
      title: "Spring Boot Developer",
      company: "TalentAI",
      location: "Chennai",
      type: "Full Time",
    },
    {
      id: 106,
      title: "Junior Java Developer",
      company: "TalentAI",
      location: "Hyderabad",
      type: "Full Time",
    },
  ];

  selectedJob = useMemo(
    () =>
      jobs.find(
        (job) => String(job.id) === String(jobId)
      ) || jobs[0],
    [jobId]
  );


  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    currentLocation: "",
    linkedIn: "",
    portfolio: "",
    expectedSalary: "",
    noticePeriod: "",
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // The form exactly as first shown, to tell if the user changed anything.
  const initialFormRef = useRef(null);

  // Load the job, the candidate's profile (to pre-fill the form) and
  // the candidate's applications (to detect a duplicate).
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setLoadError("");

      try {
        const [jobData, profileData, applications] =
          await Promise.all([
            getJobById(jobId).catch((err) => {
              if (err?.response?.status === 404) return null;
              throw err;
            }),
            getMyProfile(),
            getMyApplications(),
          ]);

        if (cancelled) return;

        const mappedProfile = fromApiProfile(profileData);

        setSelectedJob(jobData ? mapJob(jobData) : null);
        setProfile(mappedProfile);

        const initialForm = {
          fullName: mappedProfile.fullName,
          email: mappedProfile.email,
          phone: mappedProfile.phone,
          currentLocation: mappedProfile.location,
          linkedIn: mappedProfile.linkedin,
          portfolio: mappedProfile.portfolio,
          expectedSalary: mappedProfile.expectedSalary,
          noticePeriod: matchNoticePeriod(
            mappedProfile.noticePeriod
          ),
        };

        initialFormRef.current = initialForm;
        setFormData(initialForm);

        setAlreadyApplied(
          applications.some(
            (application) =>
              String(application.jobId) === String(jobId) &&
              String(application.status).toUpperCase() !==
                "WITHDRAWN"
          )
        );
      } catch (err) {
        if (!cancelled) {
          setLoadError(
            getErrorMessage(
              err,
              "Unable to load the application form."
            )
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [jobId]);

  const noticeOptions =
    formData.noticePeriod &&
    !NOTICE_PERIOD_OPTIONS.includes(formData.noticePeriod)
      ? [...NOTICE_PERIOD_OPTIONS, formData.noticePeriod]
      : NOTICE_PERIOD_OPTIONS;

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

  const validateForm = () => {
    const validationErrors = {};

    if (!formData.fullName.trim()) {
      validationErrors.fullName = "Full name is required.";
    }

    if (!formData.phone.trim()) {
      validationErrors.phone = "Phone number is required.";
    }

    if (!formData.currentLocation.trim()) {
      validationErrors.currentLocation =
        "Current location is required.";
    }

    if (!String(formData.expectedSalary).trim()) {
      validationErrors.expectedSalary =
        "Expected salary is required.";
    }

    if (!formData.noticePeriod) {
      validationErrors.noticePeriod =
        "Please select your notice period.";
    }

    setErrors(validationErrors);

    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (alreadyApplied || !validateForm()) {
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      // The apply API only takes the job id and uses the candidate's
      // profile as the application data. So the details typed here are
      // saved to the profile first (only if something changed).
      const updatedProfile = {
        ...profile,
        fullName: formData.fullName,
        phone: formData.phone,
        location: formData.currentLocation,
        linkedin: formData.linkedIn,
        portfolio: formData.portfolio,
        expectedSalary: formData.expectedSalary,
        noticePeriod: formData.noticePeriod,
      };

      if (
        JSON.stringify(formData) !==
        JSON.stringify(initialFormRef.current)
      ) {
        await updateMyProfile(toApiProfile(updatedProfile));
      }

      await applyToJob(selectedJob.id);

      setSubmitted(true);
    } catch (err) {
      setSubmitError(
        getErrorMessage(
          err,
          "Unable to submit your application. Please try again."
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || loadError || !selectedJob) {
    return (
      <div className="candidate-layout">
        <CandidateSidebar />

        <div className="candidate-main">
          <CandidateNavbar />

          <main className="candidate-dashboard-content">
            <div className="candidate-job-not-found">
              <BriefcaseBusiness size={34} />

              <h2>
                {loading
                  ? "Loading application form..."
                  : loadError
                  ? "Unable to load the form"
                  : "Job not found"}
              </h2>

              <p>
                {loading
                  ? "Please wait a moment."
                  : loadError ||
                    "The job you are trying to apply for is not available."}
              </p>

              {!loading && (
                <button
                  type="button"
                  onClick={() => navigate("/candidate/jobs")}
                >
                  Back to Jobs
                </button>
              )}
            </div>
          </main>
        </div>
      </div>
    );
  }

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

          {alreadyApplied && (
            <div className="candidate-application-note">
              <CheckCircle2 size={17} />

              <p>
                You have already applied for this job. You can
                track it in My Applications.
              </p>
            </div>
          )}

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
                      readOnly
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

                      {noticeOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
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
                      The resume saved on your profile is used
                      for this application.
                    </p>
                  </div>
                </div>

                <div className="candidate-resume-upload">
                  <div className="candidate-resume-upload-icon">
                    <FileText size={23} />
                  </div>

                  {profile?.resume ? (
                    <>
                      <strong>{profile.resume}</strong>
                      <span>Resume on your profile</span>
                    </>
                  ) : (
                    <>
                      <strong>
                        No resume on your profile yet
                      </strong>

                      <span>
                        You can still apply, or upload one from
                        your profile first.
                      </span>
                    </>
                  )}
                </div>
              </section>

              {/* SUBMIT */}

              {submitError && (
                <span className="candidate-form-error">
                  {submitError}
                </span>
              )}

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
                  disabled={submitting || alreadyApplied}
                >
                  {submitting
                    ? "Submitting..."
                    : "Submit Application"}
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