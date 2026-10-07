
import React, { useEffect, useState } from "react";
import {
  ChartNoAxesColumn,
  Star,
  CheckCircle2,
  CalendarDays,
  TrendingUp,
  X,
} from "lucide-react";

import EmployeeSidebar from "./EmployeeSidebar";
import EmployeeTopbar from "./EmployeeTopbar";

import {
  getMyPerformanceReviews,
  getMyPerformanceSummary,
} from "../../services/employeeService";

import "./EmployeePerformance.css";

// Handle both wrapped and direct backend responses
const unwrapResponse = (response) => {
  const body = response?.data;
  return body?.data !== undefined ? body.data : body;
};

const formatDate = (date) => {
  if (!date) return "—";

  const parsed = new Date(date);

  return Number.isNaN(parsed.getTime())
    ? String(date)
    : parsed.toLocaleDateString("en-IN");
};

const displayValue = (value) => {
  return value === null || value === undefined || value === ""
    ? "—"
    : value;
};

function EmployeePerformance() {
  const [summary, setSummary] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedReview, setSelectedReview] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    setError("");

    try {
      const [summaryResult, reviewsResult] =
        await Promise.allSettled([
          getMyPerformanceSummary(),
          getMyPerformanceReviews(),
        ]);

      if (summaryResult.status === "rejected") {
        throw summaryResult.reason;
      }

      const summaryData = unwrapResponse(summaryResult.value);

      if (!summaryData || typeof summaryData !== "object") {
        throw new Error("Invalid performance summary response.");
      }

      setSummary(summaryData);

      if (reviewsResult.status === "fulfilled") {
        const reviewsData = unwrapResponse(reviewsResult.value);

        setReviews(
          Array.isArray(reviewsData) ? reviewsData : []
        );
      } else {
        console.error(
          "Failed to load performance reviews:",
          reviewsResult.reason
        );

        setReviews([]);
        setError(
          "Performance summary loaded, but review history could not be loaded."
        );
      }
    } catch (err) {
      console.error("Failed to load performance data:", err);

      const status = err?.response?.status;

      if (status === 401) {
        setError("Session expired. Please log in again.");
      } else if (status === 403) {
        setError(
          "Access denied. Please verify that you are logged in with an Employee account."
        );
      } else {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load performance data."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const skills = Array.isArray(summary?.skills)
    ? summary.skills
    : [];

  const score = Number(summary?.overallScore ?? 0);

  // Existing UI assumes scores are out of 10.
  const starCount = Math.min(
    5,
    Math.max(0, Math.round(score / 2))
  );

  return (
    <div className="employee-performance-layout">
      <EmployeeSidebar />
      <EmployeeTopbar />

      <main className="employee-performance-main">
        <div className="employee-performance-header">
          <div>
            <span className="employee-page-label">
              EMPLOYEE WORKSPACE
            </span>
            <h1>Performance</h1>
            <p>
              View your performance reviews and evaluation history.
            </p>
          </div>

          <button
            type="button"
            className="employee-performance-header-icon"
            style={{ border: "none", cursor: "pointer" }}
            onClick={fetchAll}
            disabled={loading}
            title="Refresh performance data"
          >
            <ChartNoAxesColumn size={25} />
          </button>
        </div>

        {loading ? (
          <p>Loading performance data...</p>
        ) : (
          <>
            {error && (
              <div
                role="alert"
                style={{
                  padding: "14px",
                  marginBottom: "20px",
                  color: "#b42318",
                  background: "#fef3f2",
                  borderRadius: "8px",
                }}
              >
                {error}
                <button
                  type="button"
                  onClick={fetchAll}
                  style={{ marginLeft: "12px" }}
                >
                  Retry
                </button>
              </div>
            )}

            {summary && (
              <>
                {/* OVERALL PERFORMANCE */}
                <section className="employee-performance-overview">
                  <div className="performance-overview-left">
                    <span className="performance-overview-label">
                      OVERALL PERFORMANCE
                    </span>

                    <div className="performance-score">
                      {displayValue(summary.overallScore)}
                      <span>/ 10</span>
                    </div>

                    <div className="performance-stars">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={18}
                          fill={
                            star <= starCount
                              ? "currentColor"
                              : "none"
                          }
                        />
                      ))}
                    </div>

                    <p>
                      {summary.totalReviews ?? 0}{" "}
                      {(summary.totalReviews ?? 0) === 1
                        ? "review"
                        : "reviews"}{" "}
                      on record
                    </p>
                  </div>

                  <div className="performance-overview-right">
                    <div className="overview-detail">
                      <CalendarDays size={18} />
                      <div>
                        <span>Review Date</span>
                        <strong>
                          {formatDate(summary.reviewDate)}
                        </strong>
                      </div>
                    </div>

                    <div className="overview-detail">
                      <CheckCircle2 size={18} />
                      <div>
                        <span>Review Status</span>
                        <strong>
                          {displayValue(summary.reviewStatus)}
                        </strong>
                      </div>
                    </div>

                    <div className="overview-detail">
                      <TrendingUp size={18} />
                      <div>
                        <span>Previous Score</span>
                        <strong>
                          {summary.previousScore == null
                            ? "—"
                            : `${summary.previousScore} / 10`}
                        </strong>
                      </div>
                    </div>
                  </div>
                </section>

                {/* PERFORMANCE METRICS */}
                <section className="employee-performance-card">
                  <div className="performance-card-header">
                    <div>
                      <h2>Performance Evaluation</h2>
                      <p>Your latest performance evaluation</p>
                    </div>
                    <ChartNoAxesColumn size={21} />
                  </div>

                  <div className="performance-metrics">
                    {skills.length === 0 ? (
                      <p
                        style={{
                          color: "#98a2b3",
                          fontSize: "13px",
                        }}
                      >
                        No skill breakdown available yet.
                      </p>
                    ) : (
                      skills.map((skill, index) => (
                        <div
                          className="performance-metric"
                          key={skill.id ?? index}
                        >
                          <div className="performance-metric-top">
                            <span>
                              {skill.skillName ?? "Skill"}
                            </span>
                            <strong>
                              {displayValue(skill.score)} / 10
                            </strong>
                          </div>

                          <div className="performance-progress">
                            <div
                              className="performance-progress-fill"
                              style={{
                                width: `${
                                  Math.min(
                                    10,
                                    Math.max(
                                      0,
                                      Number(skill.score) || 0
                                    )
                                  ) * 10
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </section>

                {/* REVIEW HISTORY */}
                <section className="employee-performance-card">
                  <div className="performance-card-header">
                    <div>
                      <h2>Performance Review History</h2>
                      <p>Previous performance evaluations</p>
                    </div>
                    <CalendarDays size={21} />
                  </div>

                  <div className="performance-history-list">
                    {reviews.length === 0 ? (
                      <p
                        style={{
                          color: "#98a2b3",
                          fontSize: "13px",
                          padding: "0 24px 20px",
                        }}
                      >
                        No past reviews yet.
                      </p>
                    ) : (
                      reviews.map((review, index) => (
                        <div
                          className="performance-history-row"
                          key={review.id ?? index}
                        >
                          <div className="performance-history-icon">
                            <ChartNoAxesColumn size={19} />
                          </div>

                          <div className="performance-history-info">
                            <h3>
                              {displayValue(review.reviewPeriod)}
                            </h3>
                            <p>
                              Reviewed on{" "}
                              {formatDate(review.reviewDate)}
                            </p>
                          </div>

                          <div className="performance-history-score">
                            <strong>
                              {displayValue(review.overallScore)}
                            </strong>
                            <span>/ 10</span>
                          </div>

                          <span className="performance-completed-badge">
                            <CheckCircle2 size={13} />
                            {displayValue(review.status)}
                          </span>

                          <button
                            type="button"
                            className="view-review-button"
                            onClick={() => setSelectedReview(review)}
                          >
                            View
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </section>

                {/* INFORMATION */}
                <section className="performance-info-box">
                  <div className="performance-info-icon">
                    <Star size={20} />
                  </div>
                  <div>
                    <h3>About Performance Reviews</h3>
                    <p>
                      Performance evaluations are maintained as
                      historical records so you can review your
                      previous evaluations and track changes in
                      your performance over time.
                    </p>
                  </div>
                </section>
              </>
            )}

            {!summary && !error && (
              <p>No performance data available yet.</p>
            )}
          </>
        )}
      </main>

      {/* REVIEW DETAILS MODAL */}
      {selectedReview && (
        <div className="performance-modal-overlay">
          <div className="performance-modal">
            <div className="performance-modal-header">
              <div>
                <h2>
                  {displayValue(selectedReview.reviewPeriod)}
                </h2>
                <p>
                  Reviewed on{" "}
                  {formatDate(selectedReview.reviewDate)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedReview(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="performance-modal-score">
              <span>Overall Score</span>
              <strong>
                {displayValue(selectedReview.overallScore)}
                <small>/ 10</small>
              </strong>
            </div>

            <div className="performance-modal-status">
              <CheckCircle2 size={16} />
              {displayValue(selectedReview.status)}
            </div>

            {selectedReview.reviewer && (
              <p
                style={{
                  textAlign: "center",
                  color: "#667085",
                  fontSize: "12px",
                  margin: "0 0 10px",
                }}
              >
                Reviewed by {selectedReview.reviewer}
              </p>
            )}

            {selectedReview.comments && (
              <p
                style={{
                  padding: "0 22px 18px",
                  color: "#475467",
                  fontSize: "13px",
                  lineHeight: 1.5,
                }}
              >
                {selectedReview.comments}
              </p>
            )}

            <div className="performance-modal-footer">
              <button
                type="button"
                onClick={() => setSelectedReview(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployeePerformance;
