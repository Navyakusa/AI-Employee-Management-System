import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Link as LinkIcon,
  Globe,
  Wallet,
  CalendarDays,
  FileText,
} from "lucide-react";

function ApplyJobPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  // ==========================================
  // PROTECT APPLY PAGE
  // ONLY LOGGED-IN CANDIDATES CAN ACCESS
  // ==========================================
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    const isCandidate =
      token &&
      role?.toUpperCase() === "CANDIDATE";

    if (!isCandidate) {
      navigate("/login", {
        replace: true,
        state: {
          from: `/apply/${jobId}`,
          jobId: jobId,
          applyingForJob: true,
        },
      });
    }
  }, [jobId, navigate]);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    education: "",
    experience: "",
    skills: "",
    linkedin: "",
    portfolio: "",
    expectedSalary: "",
    noticePeriod: "",
  });

  const [resume, setResume] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const jobs = {
    1: "Frontend Developer",
    2: "Java Developer",
    3: "HR Executive",
    4: "Backend Developer",
    5: "UI/UX Designer",
    6: "Data Analyst",
  };

  const jobTitle =
    jobs[jobId] || "Selected Position";

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleResumeChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    const maxSize = 5 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
      setResume(null);

      setErrors((prev) => ({
        ...prev,
        resume:
          "Only PDF, DOC and DOCX files are allowed.",
      }));

      return;
    }

    if (file.size > maxSize) {
      setResume(null);

      setErrors((prev) => ({
        ...prev,
        resume:
          "Resume size must be less than 5 MB.",
      }));

      return;
    }

    setResume(file);

    setErrors((prev) => ({
      ...prev,
      resume: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName =
        "Full name is required.";
    }

    if (!formData.email.trim()) {
      newErrors.email =
        "Email is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        formData.email
      )
    ) {
      newErrors.email =
        "Enter a valid email address.";
    }

    if (!formData.phone.trim()) {
      newErrors.phone =
        "Phone number is required.";
    }

    if (!formData.location.trim()) {
      newErrors.location =
        "Location is required.";
    }

    if (!formData.education.trim()) {
      newErrors.education =
        "Education is required.";
    }

    if (!formData.experience.trim()) {
      newErrors.experience =
        "Experience is required.";
    }

    if (!formData.skills.trim()) {
      newErrors.skills =
        "Skills are required.";
    }

    if (!resume) {
      newErrors.resume =
        "Please upload your resume.";
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors).length === 0
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const applicationData =
      new FormData();

    applicationData.append(
      "jobId",
      jobId
    );

    applicationData.append(
      "fullName",
      formData.fullName
    );

    applicationData.append(
      "email",
      formData.email
    );

    applicationData.append(
      "phone",
      formData.phone
    );

    applicationData.append(
      "location",
      formData.location
    );

    applicationData.append(
      "education",
      formData.education
    );

    applicationData.append(
      "experience",
      formData.experience
    );

    applicationData.append(
      "skills",
      formData.skills
    );

    applicationData.append(
      "linkedin",
      formData.linkedin
    );

    applicationData.append(
      "portfolio",
      formData.portfolio
    );

    applicationData.append(
      "expectedSalary",
      formData.expectedSalary
    );

    applicationData.append(
      "noticePeriod",
      formData.noticePeriod
    );

    applicationData.append(
      "resume",
      resume
    );

    console.log(
      "Application ready:",
      {
        jobId,
        ...formData,
        resume,
      }
    );

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <section className="application-success-page">
        <div className="container">
          <div className="application-success-card">

            <div className="success-icon">
              ✓
            </div>

            <h1>
              Application Submitted
            </h1>

            <p>
              Your application for{" "}
              <strong>
                {jobTitle}
              </strong>{" "}
              has been submitted successfully.
            </p>

            <p className="success-subtext">
              Our recruitment team will review
              your profile and contact you if
              your profile matches the position.
            </p>

            <div className="success-actions">

              <Link
                to="/jobs"
                className="success-primary-button"
              >
                Browse More Jobs
              </Link>

              <Link
                to="/"
                className="success-secondary-button"
              >
                Back to Home
              </Link>

            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="apply-job-page">

      <section className="apply-job-header">
        <div className="container">

          <Link
            to={`/jobs/${jobId}`}
            className="back-to-job"
          >
            <ArrowLeft size={17} />
            Back to Job Details
          </Link>

          <span className="section-label">
            JOB APPLICATION
          </span>

          <h1>
            Apply for {jobTitle}
          </h1>

          <p>
            Complete the application form below.
            Fields marked with * are required.
          </p>

        </div>
      </section>

      <section className="application-form-section">
        <div className="container application-layout">

          <form
            className="application-form"
            onSubmit={handleSubmit}
          >

            {/* =========================
                PERSONAL INFORMATION
            ========================= */}

            <div className="application-form-card">

              <div className="application-section-heading">
                <User size={21} />

                <div>
                  <h2>
                    Personal Information
                  </h2>

                  <p>
                    Tell us how we can
                    contact you.
                  </p>
                </div>
              </div>

              <div className="application-form-grid">

                <div className="form-group full-width">

                  <label htmlFor="fullName">
                    Full Name *
                  </label>

                  <div className="input-with-icon">

                    <User size={18} />

                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="      Enter your full name"
                      value={
                        formData.fullName
                      }
                      onChange={
                        handleChange
                      }
                    />

                  </div>

                  {errors.fullName && (
                    <span className="form-error">
                      {errors.fullName}
                    </span>
                  )}

                </div>

                <div className="form-group">

                  <label htmlFor="email">
                    Email Address *
                  </label>

                  <div className="input-with-icon">

                    <Mail size={18} />

                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="     example@email.com"
                      value={
                        formData.email
                      }
                      onChange={
                        handleChange
                      }
                    />

                  </div>

                  {errors.email && (
                    <span className="form-error">
                      {errors.email}
                    </span>
                  )}

                </div>

                <div className="form-group">

                  <label htmlFor="phone">
                    Phone Number *
                  </label>

                  <div className="input-with-icon">

                    <Phone size={18} />

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="    +91 xxxxxxxxxx"
                      value={
                        formData.phone
                      }
                      onChange={
                        handleChange
                      }
                    />

                  </div>

                  {errors.phone && (
                    <span className="form-error">
                      {errors.phone}
                    </span>
                  )}

                </div>

                <div className="form-group full-width">

                  <label htmlFor="location">
                    Current Location *
                  </label>

                  <div className="input-with-icon">

                    <MapPin size={18} />

                    <input
                      id="location"
                      name="location"
                      type="text"
                      placeholder="       Hyderabad, Telangana"
                      value={
                        formData.location
                      }
                      onChange={
                        handleChange
                      }
                    />

                  </div>

                  {errors.location && (
                    <span className="form-error">
                      {errors.location}
                    </span>
                  )}

                </div>

              </div>
            </div>

            {/* =========================
                PROFESSIONAL INFORMATION
            ========================= */}

            <div className="application-form-card">

              <div className="application-section-heading">

                <GraduationCap size={22} />

                <div>
                  <h2>
                    Professional Information
                  </h2>

                  <p>
                    Share your education,
                    experience and skills.
                  </p>
                </div>

              </div>

              <div className="application-form-grid">

                <div className="form-group">

                  <label htmlFor="education">
                    Highest Education *
                  </label>

                  <div className="input-with-icon">

                    <GraduationCap
                      size={18}
                    />

                    <input
                      id="education"
                      name="education"
                      type="text"
                      placeholder="      B.Tech Computer Science"
                      value={
                        formData.education
                      }
                      onChange={
                        handleChange
                      }
                    />

                  </div>

                  {errors.education && (
                    <span className="form-error">
                      {errors.education}
                    </span>
                  )}

                </div>

                <div className="form-group">

                  <label htmlFor="experience">
                    Experience *
                  </label>

                  <div className="input-with-icon">

                    <Briefcase size={18} />

                    <input
                      id="experience"
                      name="experience"
                      type="text"
                      placeholder="      Example: 2 Years"
                      value={
                        formData.experience
                      }
                      onChange={
                        handleChange
                      }
                    />

                  </div>

                  {errors.experience && (
                    <span className="form-error">
                      {errors.experience}
                    </span>
                  )}

                </div>

                <div className="form-group full-width">

                  <label htmlFor="skills">
                    Skills *
                  </label>

                  <textarea
                    id="skills"
                    name="skills"
                    rows="4"
                    placeholder="Example: React, JavaScript, HTML, CSS, REST API"
                    value={
                      formData.skills
                    }
                    onChange={
                      handleChange
                    }
                  />

                  <small>
                    Separate multiple skills
                    using commas.
                  </small>

                  {errors.skills && (
                    <span className="form-error">
                      {errors.skills}
                    </span>
                  )}

                </div>

              </div>
            </div>

            {/* =========================
                CAREER DETAILS
            ========================= */}

            <div className="application-form-card">

              <div className="application-section-heading">

                <Globe size={22} />

                <div>
                  <h2>
                    Career Details
                  </h2>

                  <p>
                    Additional information
                    about your profile.
                  </p>
                </div>

              </div>

              <div className="application-form-grid">

                <div className="form-group">

                  <label htmlFor="linkedin">
                    LinkedIn Profile
                  </label>

                  <div className="input-with-icon">

                    <LinkIcon size={18} />

                    <input
                      id="linkedin"
                      name="linkedin"
                      type="url"
                      placeholder="     https://linkedin.com/in/..."
                      value={
                        formData.linkedin
                      }
                      onChange={
                        handleChange
                      }
                    />

                  </div>
                </div>

                <div className="form-group">

                  <label htmlFor="portfolio">
                    Portfolio / GitHub
                  </label>

                  <div className="input-with-icon">

                    <Globe size={18} />

                    <input
                      id="portfolio"
                      name="portfolio"
                      type="url"
                      placeholder="     https://..."
                      value={
                        formData.portfolio
                      }
                      onChange={
                        handleChange
                      }
                    />

                  </div>
                </div>

                <div className="form-group">

                  <label htmlFor="expectedSalary">
                    Expected Salary
                  </label>

                  <div className="input-with-icon">

                    <Wallet size={18} />

                    <input
                      id="expectedSalary"
                      name="expectedSalary"
                      type="text"
                      placeholder="      Example: ₹6,00,000"
                      value={
                        formData.expectedSalary
                      }
                      onChange={
                        handleChange
                      }
                    />

                  </div>
                </div>

                <div className="form-group">

                  <label htmlFor="noticePeriod">
                    Notice Period
                  </label>

                  <div className="input-with-icon">

                    <CalendarDays
                      size={18}
                    />

                    <select
                      id="noticePeriod"
                      name="noticePeriod"
                      value={
                        formData.noticePeriod
                      }
                      onChange={
                        handleChange
                      }
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

                  </div>
                </div>

              </div>
            </div>

            {/* =========================
                RESUME UPLOAD
            ========================= */}

            <div className="application-form-card">

              <div className="application-section-heading">

                <FileText size={22} />

                <div>
                  <h2>
                    Resume Upload
                  </h2>

                  <p>
                    Upload your latest resume
                    for AI screening.
                  </p>
                </div>

              </div>

              <div className="resume-upload-area">

                <input
                  id="resume"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={
                    handleResumeChange
                  }
                />

                <label htmlFor="resume">

                  <Upload size={32} />

                  <strong>
                    Click to upload your
                    resume
                  </strong>

                  <span>
                    PDF, DOC or DOCX —
                    maximum 5 MB
                  </span>

                </label>

              </div>

              {resume && (
                <div className="selected-resume">

                  <FileText size={18} />

                  <div>
                    <strong>
                      {resume.name}
                    </strong>

                    <span>
                      {(
                        resume.size /
                        1024 /
                        1024
                      ).toFixed(2)}{" "}
                      MB
                    </span>
                  </div>

                </div>
              )}

              {errors.resume && (
                <span className="form-error">
                  {errors.resume}
                </span>
              )}

            </div>

            <button
              type="submit"
              className="submit-application-button"
            >
              Submit Application
            </button>

          </form>

          {/* =========================
              SIDEBAR
          ========================= */}

          <aside className="application-sidebar">

            <div className="application-summary-card">

              <span>
                YOU ARE APPLYING FOR
              </span>

              <h3>
                {jobTitle}
              </h3>

              <p>
                Job ID: #{jobId}
              </p>

              <div className="application-info-message">

                <FileText size={20} />

                <p>
                  Your resume will later
                  be processed by the AI
                  screening module to
                  extract skills,
                  education and
                  experience.
                </p>

              </div>

              <div className="application-privacy">

                <strong>
                  Your information is
                  secure
                </strong>

                <p>
                  The information
                  provided here will only
                  be used for recruitment
                  purposes.
                </p>

              </div>

            </div>

          </aside>

        </div>
      </section>

    </div>
  );
}

export default ApplyJobPage;