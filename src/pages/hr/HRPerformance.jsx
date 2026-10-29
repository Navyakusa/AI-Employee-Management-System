import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Loader2,
  MessageSquareText,
  Plus,
  RefreshCw,
  Search,
  Star,
  Users,
} from "lucide-react";

import HRSidebar from "./HRSidebar";
import HRNavbar from "./HRNavbar";
import apiClient from "../../services/apiClient";
import "./HRPerformance.css";

const today = () => new Date().toISOString().slice(0, 10);

const unwrapList = (response) => {
  const body = response?.data;

  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body)) return body;

  return [];
};

const getErrorMessage = (error) => {
  if (error.response?.status === 401) {
    return "Session expired. Please log in again.";
  }

  if (error.response?.status === 403) {
    return "You do not have permission to manage performance reviews.";
  }

  return (
    error.response?.data?.message ||
    error.message ||
    "Something went wrong."
  );
};

function HRPerformance() {
  const [employees, setEmployees] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");

  const [employeeId, setEmployeeId] = useState("7");
  const [reviewPeriod, setReviewPeriod] = useState("Q4 2026");
  const [reviewDate, setReviewDate] = useState(today());
  const [overallScore, setOverallScore] = useState("8");
  const [technicalScore, setTechnicalScore] = useState("8");
  const [communicationScore, setCommunicationScore] = useState("8");
  const [problemSolvingScore, setProblemSolvingScore] =
    useState("8");
  const [comments, setComments] = useState("");
  const [strengths, setStrengths] = useState("");
  const [improvementAreas, setImprovementAreas] = useState("");
  const [status, setStatus] = useState("COMPLETED");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [employeeResponse, reviewResponse] = await Promise.all([
        apiClient.get("/performance/employees"),
        apiClient.get("/performance/reviews"),
      ]);

      const employeeList = unwrapList(employeeResponse);
      const reviewList = unwrapList(reviewResponse);

      setEmployees(employeeList);
      setReviews(reviewList);

      if (
        employeeList.length &&
        !employeeList.some(
          (employee) => String(employee.id) === employeeId
        )
      ) {
        setEmployeeId(String(employeeList[0].id));
      }
    } catch (requestError) {
      console.error("Failed to load performance data:", requestError);
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const selectedEmployee = employees.find(
    (employee) => String(employee.id) === employeeId
  );

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return employees;

    return employees.filter((employee) =>
      [
        employee.name,
        employee.employeeId,
        employee.email,
        employee.department,
        employee.designation,
      ].some((value) =>
        String(value || "").toLowerCase().includes(query)
      )
    );
  }, [employees, search]);

  const selectedReviews = reviews.filter(
    (review) =>
      String(review.employeeId) === String(selectedEmployee?.id)
  );

  const activeEmployees = employees.filter(
    (employee) =>
      String(employee.status || "").toUpperCase() === "ACTIVE"
  ).length;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedEmployee) {
      setError("Please select an employee.");
      return;
    }

    if (!reviewPeriod.trim() || !reviewDate) {
      setError("Review period and review date are required.");
      return;
    }

    const scores = [
      overallScore,
      technicalScore,
      communicationScore,
      problemSolvingScore,
    ];

    if (
      scores.some(
        (score) =>
          score === "" ||
          !Number.isFinite(Number(score)) ||
          Number(score) < 0 ||
          Number(score) > 10
      )
    ) {
      setError("Please enter scores between 0 and 10.");
      return;
    }

    /*
      IMPORTANT:
      The employee endpoint provides:
      id: 7
      employeeId: "1"

      This implementation uses the numeric database ID.
      Confirm with the backend team that the POST API expects
      this numeric ID before submitting real reviews.
    */
    const payload = {
      employeeId: Number(selectedEmployee.id),
      reviewPeriod: reviewPeriod.trim(),
      reviewDate,
      overallScore: Number(overallScore),
      status,
      comments: comments.trim(),
      strengths: strengths.trim(),
      improvementAreas: improvementAreas.trim(),
      skills: [
        {
          skillName: "Technical Skills",
          score: Number(technicalScore),
        },
        {
          skillName: "Communication",
          score: Number(communicationScore),
        },
        {
          skillName: "Problem Solving",
          score: Number(problemSolvingScore),
        },
      ],
    };

    try {
      setSubmitting(true);

      const response = await apiClient.post(
        "/performance/reviews",
        payload
      );

      if (response.data?.success === false) {
        throw new Error(
          response.data.message || "Review was not saved."
        );
      }

      setSuccess(
        response.data?.message ||
          `Review saved for ${selectedEmployee.name}.`
      );

      setComments("");
      setStrengths("");
      setImprovementAreas("");

      const refreshedReviews = await apiClient.get(
        "/performance/reviews"
      );

      setReviews(unwrapList(refreshedReviews));
    } catch (submitError) {
      console.error("Failed to submit performance review:", submitError);
      setError(getErrorMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="hr-performance-layout">
      <HRSidebar />

      <div className="hr-performance-main">
        <HRNavbar />

        <main className="hr-performance-content">
          <header className="hr-performance-page-header">
            <div>
              <span className="hr-performance-eyebrow">
                HR WORKSPACE
              </span>
              <h1>Employee Performance</h1>
              <p>
                Evaluate employees, record feedback, and review
                saved evaluations.
              </p>
            </div>

            <button
              type="button"
              className="hr-performance-refresh"
              onClick={loadData}
              disabled={loading}
            >
              <RefreshCw size={17} />
              Refresh
            </button>
          </header>

          {error && (
            <div className="hr-performance-alert error" role="alert">
              <AlertCircle size={18} />
              <span>{error}</span>
              <button onClick={() => setError("")}>Dismiss</button>
            </div>
          )}

          {success && (
            <div className="hr-performance-alert success" role="status">
              <CheckCircle2 size={18} />
              <span>{success}</span>
              <button onClick={() => setSuccess("")}>Dismiss</button>
            </div>
          )}

          <section className="hr-performance-stats">
            <article className="hr-performance-stat">
              <Users size={23} />
              <div>
                <span>Employees</span>
                <strong>{loading ? "—" : employees.length}</strong>
              </div>
            </article>

            <article className="hr-performance-stat">
              <ClipboardList size={23} />
              <div>
                <span>Saved Reviews</span>
                <strong>{loading ? "—" : reviews.length}</strong>
              </div>
            </article>

            <article className="hr-performance-stat">
              <Activity size={23} />
              <div>
                <span>Active Employees</span>
                <strong>{loading ? "—" : activeEmployees}</strong>
              </div>
            </article>
          </section>

          <div className="hr-performance-columns">
            <section className="hr-performance-panel">
              <h2>
                <Plus size={19} />
                Create Evaluation
              </h2>

              <form
                className="hr-performance-form"
                onSubmit={handleSubmit}
              >
                <label className="hr-performance-field">
                  Employee
                  <select
                    value={employeeId}
                    onChange={(event) =>
                      setEmployeeId(event.target.value)
                    }
                    required
                  >
                    <option value="">Select an employee</option>

                    {employees.map((employee) => (
                      <option
                        key={employee.id}
                        value={String(employee.id)}
                      >
                        {employee.name} —{" "}
                        {employee.designation ||
                          employee.department ||
                          employee.employeeId}
                      </option>
                    ))}
                  </select>
                </label>

                {selectedEmployee && (
                  <div className="hr-performance-employee-summary">
                    <strong>{selectedEmployee.name}</strong>
                    <span>{selectedEmployee.email}</span>
                    <span>
                      {selectedEmployee.department || "No department"} ·
                      {" "}{selectedEmployee.status}
                    </span>
                    <small>
                      Database ID: {selectedEmployee.id}
                    </small>
                  </div>
                )}

                <label className="hr-performance-field">
                  Review period
                  <input
                    value={reviewPeriod}
                    onChange={(event) =>
                      setReviewPeriod(event.target.value)
                    }
                    placeholder="e.g. Q4 2026"
                    required
                  />
                </label>

                <label className="hr-performance-field">
                  Review date
                  <input
                    type="date"
                    value={reviewDate}
                    onChange={(event) =>
                      setReviewDate(event.target.value)
                    }
                    required
                  />
                </label>

                <label className="hr-performance-field">
                  Overall score (0–10)
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.5"
                    value={overallScore}
                    onChange={(event) =>
                      setOverallScore(event.target.value)
                    }
                    required
                  />
                </label>

                <h3>Skill evaluation</h3>

                <label className="hr-performance-field">
                  Technical skills
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.5"
                    value={technicalScore}
                    onChange={(event) =>
                      setTechnicalScore(event.target.value)
                    }
                    required
                  />
                </label>

                <label className="hr-performance-field">
                  Communication
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.5"
                    value={communicationScore}
                    onChange={(event) =>
                      setCommunicationScore(event.target.value)
                    }
                    required
                  />
                </label>

                <label className="hr-performance-field">
                  Problem solving
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.5"
                    value={problemSolvingScore}
                    onChange={(event) =>
                      setProblemSolvingScore(event.target.value)
                    }
                    required
                  />
                </label>

                <label className="hr-performance-field">
                  Review status
                  <select
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                  >
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="DRAFT">DRAFT</option>
                  </select>
                </label>

                <label className="hr-performance-field">
                  Strengths
                  <textarea
                    rows={2}
                    value={strengths}
                    onChange={(event) =>
                      setStrengths(event.target.value)
                    }
                    placeholder="Employee's strengths..."
                  />
                </label>

                <label className="hr-performance-field">
                  Areas for improvement
                  <textarea
                    rows={2}
                    value={improvementAreas}
                    onChange={(event) =>
                      setImprovementAreas(event.target.value)
                    }
                    placeholder="Areas to develop..."
                  />
                </label>

                <label className="hr-performance-field">
                  Comments / feedback
                  <textarea
                    rows={3}
                    value={comments}
                    onChange={(event) =>
                      setComments(event.target.value)
                    }
                    placeholder="Add performance feedback..."
                  />
                </label>

                <p className="hr-performance-note">
                  Confirm the accepted score range and status values
                  with your backend team before production use.
                </p>

                <button
                  className="hr-performance-submit"
                  type="submit"
                  disabled={submitting || loading || !employees.length}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={17} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={17} />
                      Submit Evaluation
                    </>
                  )}
                </button>
              </form>
            </section>

            <section className="hr-performance-panel">
              <h2>
                <Users size={19} />
                Employees
              </h2>

              <label className="hr-performance-search">
                <Search size={17} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search employees..."
                />
              </label>

              {loading ? (
                <p>Loading employees...</p>
              ) : (
                <div className="hr-performance-employee-list">
                  {filteredEmployees.map((employee) => (
                    <button
                      type="button"
                      key={employee.id}
                      className={
                        String(employee.id) === employeeId
                          ? "hr-performance-employee-row selected"
                          : "hr-performance-employee-row"
                      }
                      onClick={() =>
                        setEmployeeId(String(employee.id))
                      }
                    >
                      <span>
                        <strong>{employee.name}</strong>
                        <small>
                          {employee.designation ||
                            employee.department ||
                            "Role not specified"}
                        </small>
                        <small>
                          ID: {employee.id} · {employee.employeeId}
                        </small>
                      </span>
                    </button>
                  ))}

                  {!filteredEmployees.length && (
                    <p>No employees match your search.</p>
                  )}
                </div>
              )}
            </section>
          </div>

          <section className="hr-performance-panel">
            <h2>
              <CalendarDays size={19} />
              Performance Review History
            </h2>

            <p>
              {selectedEmployee
                ? `Reviews for ${selectedEmployee.name}`
                : "Saved evaluations"}
            </p>

            {loading ? (
              <p>Loading reviews...</p>
            ) : selectedReviews.length ? (
              <div className="hr-performance-table-wrap">
                <table className="hr-performance-table">
                  <thead>
                    <tr>
                      <th>Period</th>
                      <th>Review date</th>
                      <th>Score</th>
                      <th>Status</th>
                      <th>Reviewer</th>
                    </tr>
                  </thead>

                  <tbody>
                    {selectedReviews.map((review, index) => (
                      <tr key={review.id ?? index}>
                        <td>{review.reviewPeriod || "—"}</td>
                        <td>{review.reviewDate || "—"}</td>
                        <td>
                          <Star size={14} />
                          {" "}{review.overallScore ?? "—"}
                        </td>
                        <td>{review.status || "—"}</td>
                        <td>{review.reviewer || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="hr-performance-empty">
                <MessageSquareText size={27} />
                <strong>No performance reviews yet</strong>
                <span>
                  Saved reviews for this employee will appear here.
                </span>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

export default HRPerformance;