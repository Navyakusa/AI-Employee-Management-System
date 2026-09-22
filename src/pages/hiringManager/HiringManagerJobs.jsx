import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  BriefcaseBusiness,
  MapPin,
  Users,
  Clock3,
  Search,
} from "lucide-react";

import HiringManagerSidebar from "./HiringManagerSidebar";
import HiringManagerNavbar from "./HiringManagerNavbar";

import { getAssignedJobs } from "./HiringManagerApi";

import "./HiringManagerDashboard.css";


function HiringManagerJobs() {

  const navigate = useNavigate();


  // ============================================================
  // STATE
  // ============================================================

  const [jobs, setJobs] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [statusFilter, setStatusFilter] = useState("All");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  // ============================================================
  // LOAD ASSIGNED JOBS FROM BACKEND
  // ============================================================

  useEffect(() => {

    const loadAssignedJobs = async () => {

      try {

        setLoading(true);

        setError("");

        const response = await getAssignedJobs();

        console.log(
          "Hiring Manager assigned jobs response:",
          response
        );


        /*
        --------------------------------------------------------
        Handle different possible ApiResponse structures
        --------------------------------------------------------
        */

        let jobData = [];


        if (Array.isArray(response)) {

          jobData = response;

        } else if (Array.isArray(response?.data)) {

          jobData = response.data;

        } else if (Array.isArray(response?.content)) {

          jobData = response.content;

        } else if (Array.isArray(response?.data?.content)) {

          jobData = response.data.content;

        } else if (response?.data) {

          jobData = [response.data];

        }


        setJobs(jobData);

      } catch (err) {

        console.error(
          "Failed to load assigned jobs:",
          err
        );

        setError(
          err.message ||
          "Failed to load assigned jobs."
        );

      } finally {

        setLoading(false);

      }

    };


    loadAssignedJobs();

  }, []);


  // ============================================================
  // NORMALIZE BACKEND JOB DATA
  // ============================================================

  const normalizedJobs = jobs.map((job) => {

    return {

      ...job,

      id:
        job.id ??
        job.jobId,

      title:
        job.title ??
        job.jobTitle ??
        "Untitled Job",

      department:
        job.department ??
        "Not specified",

      location:
        job.location ??
        "Not specified",

      candidates:
        job.candidates ??
        job.candidateCount ??
        job.applicationCount ??
        0,

      status:
        job.status ??
        "OPEN",

      experience:
        job.experience ??
        job.experienceRequired ??
        "Not specified",

      employmentType:
        job.employmentType ??
        "Not specified",

      openings:
        job.openings ??
        job.numberOfOpenings ??
        0,

      postedDate:
        job.postedDate ??
        job.createdAt ??
        "",

      closingDate:
        job.closingDate ??
        job.applicationDeadline ??
        "",

      education:
        job.education ??
        job.educationRequired ??
        "Not specified",

      skills:
        job.skills ??
        job.requiredSkills ??
        [],

      description:
        job.description ??
        "No description available."

    };

  });


  // ============================================================
  // STATUS DISPLAY
  // ============================================================

  const getDisplayStatus = (status) => {

    if (!status) {
      return "Unknown";
    }

    const value =
      String(status).toUpperCase();


    if (
      value === "OPEN" ||
      value === "ACTIVE"
    ) {
      return "Active";
    }


    if (
      value === "CLOSED" ||
      value === "CLOSE"
    ) {
      return "Closed";
    }


    return status;

  };


  // ============================================================
  // SEARCH + FILTER
  // ============================================================

  const filteredJobs =
    normalizedJobs.filter((job) => {

      const search =
        searchTerm
          .trim()
          .toLowerCase();


      const title =
        String(job.title)
          .toLowerCase();

      const department =
        String(job.department)
          .toLowerCase();

      const location =
        String(job.location)
          .toLowerCase();


      const matchesSearch =
        title.includes(search) ||
        department.includes(search) ||
        location.includes(search);


      const displayStatus =
        getDisplayStatus(job.status);


      const matchesStatus =
        statusFilter === "All" ||
        displayStatus === statusFilter;


      return (
        matchesSearch &&
        matchesStatus
      );

    });


  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {

    return (

      <div className="hiring-manager-layout">

        <HiringManagerSidebar />

        <div className="hiring-manager-main">

          <HiringManagerNavbar />

          <main className="hiring-manager-dashboard-content">

            <div className="hiring-manager-dashboard-header">

              <p className="hiring-manager-label">
                RECRUITMENT
              </p>

              <h1>
                Assigned Jobs
              </h1>

              <p>
                View jobs assigned to you and review
                recruitment requirements.
              </p>

            </div>


            <div className="hiring-manager-no-jobs">

              <BriefcaseBusiness size={32} />

              <h3>
                Loading assigned jobs...
              </h3>

              <p>
                Please wait while we load your jobs.
              </p>

            </div>

          </main>

        </div>

      </div>

    );

  }


  // ============================================================
  // UI
  // ============================================================

  return (

    <div className="hiring-manager-layout">

      <HiringManagerSidebar />


      <div className="hiring-manager-main">

        <HiringManagerNavbar />


        <main className="hiring-manager-dashboard-content">


          {/* HEADER */}

          <div className="hiring-manager-dashboard-header">

            <p className="hiring-manager-label">
              RECRUITMENT
            </p>

            <h1>
              Assigned Jobs
            </h1>

            <p>
              View jobs assigned to you and review
              recruitment requirements.
            </p>

          </div>


          {/* ERROR */}

          {error && (

            <div
              style={{
                background: "#fee2e2",
                color: "#991b1b",
                padding: "14px 18px",
                borderRadius: "10px",
                marginBottom: "20px",
              }}
            >

              {error}

            </div>

          )}


          {/* JOBS SECTION */}

          <section className="hiring-manager-jobs-section">


            {/* TOOLBAR */}

            <div className="hiring-manager-jobs-toolbar">


              <div className="hiring-manager-jobs-search">

                <Search size={18} />

                <input
                  type="text"
                  placeholder="Search by job, department or location..."
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(e.target.value)
                  }
                />

              </div>


              <select
                className="hiring-manager-job-filter"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value)
                }
              >

                <option value="All">
                  All Status
                </option>

                <option value="Active">
                  Active
                </option>

                <option value="Closed">
                  Closed
                </option>

              </select>


            </div>


            {/* JOB CARDS */}

            <div className="hiring-manager-jobs-grid">


              {filteredJobs.map((job) => {

                const displayStatus =
                  getDisplayStatus(job.status);


                return (

                  <div
                    className="hiring-manager-job-card"
                    key={job.id}
                  >


                    {/* TOP */}

                    <div className="hiring-manager-job-card-top">

                      <div className="hiring-manager-job-icon">

                        <BriefcaseBusiness
                          size={22}
                        />

                      </div>


                      <span
                        className={`hiring-manager-job-status ${
                          displayStatus === "Active"
                            ? "active"
                            : "closed"
                        }`}
                      >

                        {displayStatus}

                      </span>

                    </div>


                    {/* TITLE */}

                    <h3>
                      {job.title}
                    </h3>


                    {/* DEPARTMENT */}

                    <p className="hiring-manager-job-department">

                      {job.department}

                    </p>


                    {/* JOB INFORMATION */}

                    <div className="hiring-manager-job-info">


                      <div>

                        <MapPin size={16} />

                        <span>
                          {job.location}
                        </span>

                      </div>


                      <div>

                        <Clock3 size={16} />

                        <span>
                          {job.experience}
                        </span>

                      </div>


                      <div>

                        <Users size={16} />

                        <span>
                          {job.candidates} Candidates
                        </span>

                      </div>


                    </div>


                    {/* VIEW JOB */}

                    <button
                      className="hiring-manager-view-job-button"
                      onClick={() =>
                        navigate(
                          `/hiring-manager/jobs/${job.id}`,
                          {
                            state: {
                              job,
                            },
                          }
                        )
                      }
                    >

                      View Job

                    </button>


                  </div>

                );

              })}


              {/* NO JOBS */}

              {filteredJobs.length === 0 && (

                <div className="hiring-manager-no-jobs">

                  <BriefcaseBusiness
                    size={32}
                  />

                  <h3>
                    No jobs found
                  </h3>

                  <p>

                    {error
                      ? "Unable to load jobs from the backend."
                      : "No assigned jobs match your current search or filter."
                    }

                  </p>

                </div>

              )}


            </div>


          </section>


        </main>

      </div>

    </div>

  );

}


export default HiringManagerJobs;