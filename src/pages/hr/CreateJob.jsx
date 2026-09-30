import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateJob.css";

// IMPORTANT:
// This connects to your existing Spring Boot backend.
// Do NOT modify the backend.
import { createJob } from "./hrApi";


function CreateJob() {
  const navigate = useNavigate();

  const [jobData, setJobData] = useState({
    title: "",
    department: "",
    location: "",
    jobType: "",
    experience: "",
    salary: "",
    description: "",
    requiredSkills: "",
    preferredSkills: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  // ============================================================
  // HANDLE FORM INPUT
  // ============================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setJobData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };


  // ============================================================
  // GET LOGGED-IN HR / HIRING MANAGER ID
  // ============================================================

  const getHiringManagerId = () => {
  try {
    // Check both possible storage keys
    const savedUser =
      localStorage.getItem("loggedInUser") ||
      localStorage.getItem("user");

    if (!savedUser) {
      console.error("No logged-in user found in localStorage.");
      return null;
    }

    const user = JSON.parse(savedUser);

    console.log("Logged-in user:", user);

    return (
      user?.id ??
      user?.userId ??
      user?.employeeId ??
      user?.hiringManagerId ??
      null
    );
  } catch (error) {
    console.error(
      "Failed to read logged-in user:",
      error
    );

    return null;
  }
};


  // ============================================================
  // PARSE EXPERIENCE
  //
  // Examples:
  // "2-4 years" -> { min: 2, max: 4 }
  // "2 - 4"     -> { min: 2, max: 4 }
  // "3 years"   -> { min: 3, max: 3 }
  // ============================================================

  const parseExperience = (value) => {
    const numbers = value.match(/\d+(\.\d+)?/g);

    if (!numbers || numbers.length === 0) {
      return {
        min: 0,
        max: 0,
      };
    }

    const parsedNumbers = numbers.map(Number);

    if (parsedNumbers.length === 1) {
      return {
        min: parsedNumbers[0],
        max: parsedNumbers[0],
      };
    }

    return {
      min: parsedNumbers[0],
      max: parsedNumbers[1],
    };
  };


  // ============================================================
  // PARSE SALARY
  //
  // Examples:
  // "₹6 - ₹10 LPA"
  // "6 - 10 LPA"
  // "6 LPA"
  //
  // Backend expects actual numeric annual salary.
  //
  // 6 LPA  -> 600000
  // 10 LPA -> 1000000
  // ============================================================

  const parseSalary = (value) => {
    const numbers = value.match(/\d+(\.\d+)?/g);

    if (!numbers || numbers.length === 0) {
      return {
        min: 0,
        max: 0,
      };
    }

    const parsedNumbers = numbers.map(Number);

    const containsLPA =
      value.toLowerCase().includes("lpa");

    if (containsLPA) {
      const min = parsedNumbers[0] * 100000;

      const max =
        parsedNumbers.length > 1
          ? parsedNumbers[1] * 100000
          : min;

      return {
        min,
        max,
      };
    }

    // If the user enters a normal numeric salary
    const min = parsedNumbers[0];

    const max =
      parsedNumbers.length > 1
        ? parsedNumbers[1]
        : min;

    return {
      min,
      max,
    };
  };


  // ============================================================
  // CREATE JOB
  // ============================================================

  const handleCreateJob = async (e) => {
    e.preventDefault();

    setError("");


    // ----------------------------------------------------------
    // REQUIRED FRONTEND VALIDATION
    // ----------------------------------------------------------

    if (
      !jobData.title.trim() ||
      !jobData.department.trim() ||
      !jobData.location.trim() ||
      !jobData.jobType ||
      !jobData.description.trim()
    ) {
      setError(
        "Please fill in all required fields."
      );

      return;
    }


    // ----------------------------------------------------------
    // GET LOGGED-IN USER
    // ----------------------------------------------------------

    const hiringManagerId =
      getHiringManagerId();


    if (!hiringManagerId) {
      setError(
        "Unable to identify the logged-in HR manager. Please log in again."
      );

      console.error(
        "No hiringManagerId found in localStorage user."
      );

      return;
    }


    // ----------------------------------------------------------
    // CONVERT EXPERIENCE
    // ----------------------------------------------------------

    const experience =
      parseExperience(jobData.experience);


    // ----------------------------------------------------------
    // CONVERT SALARY
    // ----------------------------------------------------------

    const salary =
      parseSalary(jobData.salary);


    // ----------------------------------------------------------
    // PREPARE BACKEND REQUEST BODY
    //
    // This structure matches:
    // POST /api/jobs/create
    // ----------------------------------------------------------

    const backendJobData = {
      title: jobData.title.trim(),

      department:
        jobData.department.trim(),

      location:
        jobData.location.trim(),

      employmentType:
        jobData.jobType,

      experienceMin:
        experience.min,

      experienceMax:
        experience.max,

      salaryMin:
        salary.min,

      salaryMax:
        salary.max,

      requiredSkills:
        jobData.requiredSkills.trim(),

      preferredSkills:
        jobData.preferredSkills.trim(),

      education: "",

      description:
        jobData.description.trim(),

      responsibilities:
        jobData.description.trim(),

      openings: 1,

      status: "OPEN",

      closingDate: null,

      hiringManagerId:
        Number(hiringManagerId),
    };


    console.log(
      "Creating job with backend data:",
      backendJobData
    );


    // ----------------------------------------------------------
    // SEND TO SPRING BOOT
    // ----------------------------------------------------------

    try {
      setLoading(true);

      const createdJob =
        await createJob(backendJobData);


      console.log(
        "Job created successfully:",
        createdJob
      );


      alert(
        "Job created successfully!"
      );


      // --------------------------------------------------------
      // GO BACK TO JOBS
      // --------------------------------------------------------

      navigate("/hr/jobs");


    } catch (error) {
      console.error(
        "Create job error:",
        error
      );

      setError(
        error?.message ||
          "Failed to create job. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="hr-create-job-page">

      <main className="create-job-main">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="create-job-header">

          <div>

            <h1>
              Create Job
            </h1>

            <p>
              Create a new job opening for your organization.
            </p>

          </div>


          <button
            type="button"
            className="back-button"
            onClick={() =>
              navigate("/hr/jobs")
            }
          >
            ← Back to Jobs
          </button>

        </div>


        {/* =====================================================
            FORM CARD
        ====================================================== */}

        <div className="create-job-card">

          <form
            onSubmit={handleCreateJob}
          >

            {/* =================================================
                JOB INFORMATION
            ================================================== */}

            <div className="form-section">

              <h2>
                Job Information
              </h2>

              <p>
                Enter the basic information about this position.
              </p>

            </div>


            <div className="form-grid">

              {/* JOB TITLE */}

              <div className="job-form-group">

                <label>
                  Job Title *
                </label>

                <input
                  type="text"
                  name="title"
                  placeholder="e.g. Software Engineer"
                  value={jobData.title}
                  onChange={handleChange}
                  disabled={loading}
                />

              </div>


              {/* DEPARTMENT */}

              <div className="job-form-group">

                <label>
                  Department *
                </label>

                <input
                  type="text"
                  name="department"
                  placeholder="e.g. Engineering"
                  value={jobData.department}
                  onChange={handleChange}
                  disabled={loading}
                />

              </div>


              {/* LOCATION */}

              <div className="job-form-group">

                <label>
                  Location *
                </label>

                <input
                  type="text"
                  name="location"
                  placeholder="e.g. Hyderabad"
                  value={jobData.location}
                  onChange={handleChange}
                  disabled={loading}
                />

              </div>


              {/* JOB TYPE */}

              <div className="job-form-group">

                <label>
                  Job Type *
                </label>

                <select
                  name="jobType"
                  value={jobData.jobType}
                  onChange={handleChange}
                  disabled={loading}
                >

                  <option value="">
                    Select job type
                  </option>

                  <option value="Full Time">
                    Full Time
                  </option>

                  <option value="Part Time">
                    Part Time
                  </option>

                  <option value="Contract">
                    Contract
                  </option>

                  <option value="Internship">
                    Internship
                  </option>

                </select>

              </div>


              {/* EXPERIENCE */}

              <div className="job-form-group">

                <label>
                  Experience
                </label>

                <input
                  type="text"
                  name="experience"
                  placeholder="e.g. 2-4 years"
                  value={jobData.experience}
                  onChange={handleChange}
                  disabled={loading}
                />

              </div>


              {/* SALARY */}

              <div className="job-form-group">

                <label>
                  Salary
                </label>

                <input
                  type="text"
                  name="salary"
                  placeholder="e.g. ₹6 - ₹10 LPA"
                  value={jobData.salary}
                  onChange={handleChange}
                  disabled={loading}
                />

              </div>

            </div>


            {/* =================================================
                DESCRIPTION
            ================================================== */}

            <div className="job-form-group">

              <label>
                Job Description *
              </label>

              <textarea
                name="description"
                rows="6"
                placeholder="Describe the job responsibilities, requirements, and qualifications..."
                value={jobData.description}
                onChange={handleChange}
                disabled={loading}
              />

            </div>


            {/* =================================================
                SKILLS
            ================================================== */}

            <div className="form-grid">

              {/* REQUIRED SKILLS */}

              <div className="job-form-group">

                <label>
                  Required Skills
                </label>

                <input
                  type="text"
                  name="requiredSkills"
                  placeholder="e.g. Python, Django, PostgreSQL"
                  value={jobData.requiredSkills}
                  onChange={handleChange}
                  disabled={loading}
                />

              </div>


              {/* PREFERRED SKILLS */}

              <div className="job-form-group">

                <label>
                  Preferred Skills
                </label>

                <input
                  type="text"
                  name="preferredSkills"
                  placeholder="e.g. Docker, AWS"
                  value={jobData.preferredSkills}
                  onChange={handleChange}
                  disabled={loading}
                />

              </div>

            </div>


            {/* =================================================
                ERROR
            ================================================== */}

            {error && (

              <div className="create-job-error">
                {error}
              </div>

            )}


            {/* =================================================
                ACTION BUTTONS
            ================================================== */}

            <div className="create-job-actions">

              <button
                type="button"
                className="cancel-button"
                onClick={() =>
                  navigate("/hr/jobs")
                }
                disabled={loading}
              >
                Cancel
              </button>


              <button
                type="submit"
                className="submit-job-button"
                disabled={loading}
              >

                {loading
                  ? "Creating..."
                  : "Create Job →"}

              </button>

            </div>

          </form>

        </div>

      </main>

    </div>
  );
}


export default CreateJob;