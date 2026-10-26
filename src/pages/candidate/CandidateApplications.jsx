
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import CandidateSidebar from "./CandidateSidebar";
import CandidateNavbar from "./CandidateNavbar";

import {
  getMyApplicationsWithJobs,
  getMyInterviewsWithJobs,
} from "../../services/candidateService";
import {
  APPLICATION_STATUS_FILTERS,
  getErrorMessage,
} from "../../services/candidateHelpers";

import "./CandidateDashboard.css";

function CandidateApplications() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadApplications = async () => {
  setLoading(true);
  setError("");

  try {
    const [applicationList, interviews] = await Promise.all([
      getMyApplicationsWithJobs(),
      getMyInterviewsWithJobs().catch(() => []),
    ]);

    const updatedApplications = applicationList.map((application) => {
      const hasUpcomingInterview = interviews.some(
        (interview) =>
          String(interview.applicationId) === String(application.id) &&
          interview.status === "Upcoming"
      );

      return {
        ...application,
        displayStatus: hasUpcomingInterview
          ? "Interview"
          : application.status,
      };
    });

    setApplications(updatedApplications);
  } catch (err) {
    setError(
      getErrorMessage(err, "Unable to load your applications.")
    );
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    loadApplications();
  }, []);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  const filteredApplications = useMemo(() => {
    return applications.filter((application) => {
      const searchValue = search.toLowerCase().trim();

      const matchesSearch =
        !searchValue ||
        application.jobTitle
          .toLowerCase()
          .includes(searchValue) ||
        application.company
          .toLowerCase()
          .includes(searchValue);

      const matchesStatus =
  status === "All" ||
  (application.displayStatus || application.status) === status;

      return matchesSearch && matchesStatus;
    });
  }, [applications, search, status]);

  const getStatusClass = (value) =>
    value.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="candidate-layout">
      <CandidateSidebar />

      <div className="candidate-main">
        <CandidateNavbar />

        <main className="candidate-dashboard-content">
          <div className="candidate-applications-header">
            <div>
              <p className="candidate-label">
                APPLICATION TRACKING
              </p>

              <h1>My Applications</h1>

              <p>
                Track your submitted applications and
                monitor their recruitment progress.
              </p>
            </div>

            <div className="candidate-applications-total">
              <BriefcaseBusiness size={20} />

              <div>
                <strong>{applications.length}</strong>
                <span>Total Applications</span>
              </div>
            </div>
          </div>

          {/* FILTERS */}

          <section className="candidate-applications-filters">
            <div className="candidate-applications-search">
              <Search size={18} />

              <input
                type="text"
                value={search}
                placeholder="Search job or company..."
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />
            </div>

            <div className="candidate-applications-status-filter">
              <SlidersHorizontal size={17} />

              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value)
                }
              >
                <option value="All">All Status</option>

                {APPLICATION_STATUS_FILTERS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </section>

          {/* APPLICATION LIST */}

          <div className="candidate-applications-results">
            <div>
              <h2>Applications</h2>

              <p>
                {filteredApplications.length} application
                {filteredApplications.length !== 1
                  ? "s"
                  : ""}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="candidate-applications-empty">
              <BriefcaseBusiness size={30} />

              <h3>Loading your applications...</h3>

              <p>Please wait a moment.</p>
            </div>
          ) : error ? (
            <div className="candidate-applications-empty">
              <BriefcaseBusiness size={30} />

              <h3>Unable to load applications</h3>

              <p>{error}</p>

              <button type="button" onClick={loadApplications}>
                Try Again
              </button>
            </div>
          ) : filteredApplications.length > 0 ? (
            <div className="candidate-applications-list">
              {filteredApplications.map(
                (application) => (
                  <article
                    key={application.id}
                    className="candidate-application-list-card"
                  >
                    <div className="candidate-application-company-logo">
                      <Building2 size={23} />
                    </div>

                    <div className="candidate-application-list-content">
                      <div className="candidate-application-list-top">
                        <div>
                          <h3>
                            {application.jobTitle}
                          </h3>

                          <p>
                            {application.company}
                          </p>
                        </div>

                        <span
  className={`candidate-my-application-status ${getStatusClass(
    application.displayStatus || application.status
  )}`}
>
  {application.displayStatus || application.status}
</span>
                      </div>

                      <div className="candidate-application-list-meta">
                        <span>
                          <BriefcaseBusiness size={14} />
                          {application.type}
                        </span>

                        <span>
                          <Building2 size={14} />
                          {application.location}
                        </span>

                        {application.appliedDate && (
                          <span>
                            <CalendarDays size={14} />
                            Applied {application.appliedDate}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="candidate-application-details-button"
                      onClick={() =>
                        navigate(
                          `/candidate/applications/${application.id}`
                        )
                      }
                    >
                      View Details
                      <ArrowRight size={15} />
                    </button>
                  </article>
                )
              )}
            </div>
          ) : (
            <div className="candidate-applications-empty">
              <BriefcaseBusiness size={30} />

              <h3>No applications found</h3>

              <p>
                {applications.length === 0
                  ? "You haven't applied to any jobs yet."
                  : "No applications match your current search or filter."}
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatus("All");
                }}
              >
                Clear Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default CandidateApplications;