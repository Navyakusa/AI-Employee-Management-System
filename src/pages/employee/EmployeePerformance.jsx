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

function EmployeePerformance() {
  const [summary, setSummary] = useState(null); // PerformanceSummaryDto
  const [reviews, setReviews] = useState([]); // PerformanceResponseDto[]
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);

  const fetchAll = async () => {
    try {
      const [summaryRes, reviewsRes] = await Promise.all([
        getMyPerformanceSummary(),
        getMyPerformanceReviews(),
      ]);

      setSummary(summaryRes.data?.data || null);
      setReviews(reviewsRes.data?.data || []);
    } catch (err) {
      console.error("Failed to load performance data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="employee-performance-layout">
        <EmployeeSidebar />
        <EmployeeTopbar />
        <main className="employee-performance-main">
          <p>Loading performance data...</p>
        </main>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="employee-performance-layout">
        <EmployeeSidebar />
        <EmployeeTopbar />
        <main className="employee-performance-main">
          <p>No performance data available yet.</p>
        </main>
      </div>
    );
  }

  // overallScore/score fields are doubles — assuming a 0–10 scale to
  // match the existing UI's "/ 10" labels and star rating. If your
  // backend actually scores out of 100 or 5, adjust the *10 / /2 math
  // below (progress bar width, star count) accordingly.
  const skills = summary.skills || [];

  return (
    <div className="employee-performance-layout">

      <EmployeeSidebar />

      <EmployeeTopbar />

      <main className="employee-performance-main">

        {/* =========================
            PAGE HEADER
        ========================= */}
        <div className="employee-performance-header">
          <div>
            <span className="employee-page-label">EMPLOYEE WORKSPACE</span>
            <h1>Performance</h1>
            <p>View your performance reviews and evaluation history.</p>
          </div>
          <button
            type="button"
            className="employee-performance-header-icon"
            style={{ border: "none", cursor: "pointer" }}
            onClick={fetchAll}
            title="Refresh performance data"
          >
            <ChartNoAxesColumn size={25} />
          </button>
        </div>


        {/* =========================
            OVERALL PERFORMANCE (PerformanceSummaryDto)
        ========================= */}
        <section className="employee-performance-overview">

          <div className="performance-overview-left">
            <span className="performance-overview-label">OVERALL PERFORMANCE</span>

            <div className="performance-score">
              {summary.overallScore}
              <span>/ 10</span>
            </div>

            <div className="performance-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={18}
                  fill={star <= Math.round(summary.overallScore / 2) ? "currentColor" : "none"}
                />
              ))}
            </div>

            <p>{summary.totalReviews} review{summary.totalReviews === 1 ? "" : "s"} on record</p>
          </div>

          <div className="performance-overview-right">
            <div className="overview-detail">
              <CalendarDays size={18} />
              <div>
                <span>Review Date</span>
                <strong>{summary.reviewDate}</strong>
              </div>
            </div>

            <div className="overview-detail">
              <CheckCircle2 size={18} />
              <div>
                <span>Review Status</span>
                <strong>{summary.reviewStatus}</strong>
              </div>
            </div>

            <div className="overview-detail">
              <TrendingUp size={18} />
              <div>
                <span>Previous Score</span>
                <strong>{summary.previousScore} / 10</strong>
              </div>
            </div>
          </div>

        </section>


        {/* =========================
            PERFORMANCE METRICS (skills[] from summary)
        ========================= */}
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
              <p style={{ color: "#98a2b3", fontSize: "13px" }}>
                No skill breakdown available for this review yet.
              </p>
            ) : (
              skills.map((skill) => (
                <div className="performance-metric" key={skill.id}>
                  <div className="performance-metric-top">
                    <span>{skill.skillName}</span>
                    <strong>{skill.score} / 10</strong>
                  </div>
                  <div className="performance-progress">
                    <div
                      className="performance-progress-fill"
                      style={{ width: `${skill.score * 10}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>


        {/* =========================
            REVIEW HISTORY (getMyPerformanceReviews)
        ========================= */}
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
              <p style={{ color: "#98a2b3", fontSize: "13px", padding: "0 24px 20px" }}>
                No past reviews yet.
              </p>
            ) : (
              reviews.map((review) => (
                <div className="performance-history-row" key={review.id}>
                  <div className="performance-history-icon">
                    <ChartNoAxesColumn size={19} />
                  </div>

                  <div className="performance-history-info">
                    <h3>{review.reviewPeriod}</h3>
                    <p>Reviewed on {review.reviewDate}</p>
                  </div>

                  <div className="performance-history-score">
                    <strong>{review.overallScore}</strong>
                    <span>/ 10</span>
                  </div>

                  <span className="performance-completed-badge">
                    <CheckCircle2 size={13} />
                    {review.status}
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


        {/* =========================
            PERFORMANCE INFORMATION
        ========================= */}
        <section className="performance-info-box">
          <div className="performance-info-icon">
            <Star size={20} />
          </div>
          <div>
            <h3>About Performance Reviews</h3>
            <p>
              Performance evaluations are maintained as historical
              records so you can review your previous evaluations
              and track changes in your performance over time.
            </p>
          </div>
        </section>

      </main>


      {/* =========================
          REVIEW MODAL (full PerformanceResponseDto, incl. reviewer + comments)
      ========================= */}
      {selectedReview && (
        <div className="performance-modal-overlay">
          <div className="performance-modal">

            <div className="performance-modal-header">
              <div>
                <h2>{selectedReview.reviewPeriod}</h2>
                <p>Reviewed on {selectedReview.reviewDate}</p>
              </div>
              <button type="button" onClick={() => setSelectedReview(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="performance-modal-score">
              <span>Overall Score</span>
              <strong>
                {selectedReview.overallScore}
                <small>/ 10</small>
              </strong>
            </div>

            <div className="performance-modal-status">
              <CheckCircle2 size={16} />
              {selectedReview.status}
            </div>

            {selectedReview.reviewer && (
              <p style={{ textAlign: "center", color: "#667085", fontSize: "12px", margin: "0 0 10px" }}>
                Reviewed by {selectedReview.reviewer}
              </p>
            )}

            {selectedReview.comments && (
              <p style={{ padding: "0 22px 18px", color: "#475467", fontSize: "13px", lineHeight: 1.5 }}>
                {selectedReview.comments}
              </p>
            )}

            <div className="performance-modal-footer">
              <button type="button" onClick={() => setSelectedReview(null)}>
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
