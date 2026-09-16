import React, { useState } from "react";
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
import "./EmployeePerformance.css";

function EmployeePerformance() {
  const [selectedReview, setSelectedReview] = useState(null);

  const currentReview = {
    reviewPeriod: "2026 Annual Review",
    reviewDate: "15 Sep 2026",
    technicalSkills: 8.5,
    communication: 8,
    teamwork: 9,
    productivity: 8,
    leadership: 7.5,
    overall: 8.2,
  };

  const reviewHistory = [
    {
      period: "2026 Annual Review",
      date: "15 Sep 2026",
      overall: 8.2,
      status: "Completed",
    },
    {
      period: "2025 Annual Review",
      date: "20 Sep 2025",
      overall: 7.8,
      status: "Completed",
    },
    {
      period: "2024 Annual Review",
      date: "18 Sep 2024",
      overall: 7.4,
      status: "Completed",
    },
  ];

  const performanceMetrics = [
    {
      label: "Technical Skills",
      score: currentReview.technicalSkills,
    },
    {
      label: "Communication",
      score: currentReview.communication,
    },
    {
      label: "Teamwork",
      score: currentReview.teamwork,
    },
    {
      label: "Productivity",
      score: currentReview.productivity,
    },
    {
      label: "Leadership",
      score: currentReview.leadership,
    },
  ];

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
            <span className="employee-page-label">
              EMPLOYEE WORKSPACE
            </span>

            <h1>Performance</h1>

            <p>
              View your performance reviews and evaluation history.
            </p>
          </div>

          <div className="employee-performance-header-icon">
            <ChartNoAxesColumn size={25} />
          </div>

        </div>


        {/* =========================
            OVERALL PERFORMANCE
        ========================= */}
        <section className="employee-performance-overview">

          <div className="performance-overview-left">

            <span className="performance-overview-label">
              OVERALL PERFORMANCE
            </span>

            <div className="performance-score">
              {currentReview.overall}
              <span>/ 10</span>
            </div>

            <div className="performance-stars">

              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={18}
                  fill={
                    star <= Math.round(currentReview.overall / 2)
                      ? "currentColor"
                      : "none"
                  }
                />
              ))}

            </div>

            <p>
              {currentReview.reviewPeriod}
            </p>

          </div>


          <div className="performance-overview-right">

            <div className="overview-detail">
              <CalendarDays size={18} />

              <div>
                <span>Review Date</span>
                <strong>
                  {currentReview.reviewDate}
                </strong>
              </div>
            </div>


            <div className="overview-detail">
              <CheckCircle2 size={18} />

              <div>
                <span>Review Status</span>
                <strong>Completed</strong>
              </div>
            </div>


            <div className="overview-detail">
              <TrendingUp size={18} />

              <div>
                <span>Previous Score</span>
                <strong>7.8 / 10</strong>
              </div>
            </div>

          </div>

        </section>


        {/* =========================
            PERFORMANCE METRICS
        ========================= */}
        <section className="employee-performance-card">

          <div className="performance-card-header">

            <div>
              <h2>Performance Evaluation</h2>

              <p>
                Your latest performance evaluation
              </p>
            </div>

            <ChartNoAxesColumn size={21} />

          </div>


          <div className="performance-metrics">

            {performanceMetrics.map((metric) => (

              <div
                className="performance-metric"
                key={metric.label}
              >

                <div className="performance-metric-top">

                  <span>
                    {metric.label}
                  </span>

                  <strong>
                    {metric.score} / 10
                  </strong>

                </div>


                <div className="performance-progress">

                  <div
                    className="performance-progress-fill"
                    style={{
                      width: `${metric.score * 10}%`,
                    }}
                  />

                </div>

              </div>

            ))}

          </div>

        </section>


        {/* =========================
            REVIEW HISTORY
        ========================= */}
        <section className="employee-performance-card">

          <div className="performance-card-header">

            <div>
              <h2>Performance Review History</h2>

              <p>
                Previous performance evaluations
              </p>
            </div>

            <CalendarDays size={21} />

          </div>


          <div className="performance-history-list">

            {reviewHistory.map((review, index) => (

              <div
                className="performance-history-row"
                key={index}
              >

                <div className="performance-history-icon">
                  <ChartNoAxesColumn size={19} />
                </div>


                <div className="performance-history-info">

                  <h3>
                    {review.period}
                  </h3>

                  <p>
                    Reviewed on {review.date}
                  </p>

                </div>


                <div className="performance-history-score">

                  <strong>
                    {review.overall}
                  </strong>

                  <span>
                    / 10
                  </span>

                </div>


                <span className="performance-completed-badge">
                  <CheckCircle2 size={13} />
                  {review.status}
                </span>


                <button
                  type="button"
                  className="view-review-button"
                  onClick={() =>
                    setSelectedReview(review)
                  }
                >
                  View
                </button>

              </div>

            ))}

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
            <h3>
              About Performance Reviews
            </h3>

            <p>
              Performance evaluations are maintained as historical
              records so you can review your previous evaluations
              and track changes in your performance over time.
            </p>
          </div>

        </section>

      </main>


      {/* =========================
          REVIEW MODAL
      ========================= */}
      {selectedReview && (

        <div className="performance-modal-overlay">

          <div className="performance-modal">

            <div className="performance-modal-header">

              <div>
                <h2>
                  {selectedReview.period}
                </h2>

                <p>
                  Reviewed on {selectedReview.date}
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

              <span>
                Overall Score
              </span>

              <strong>
                {selectedReview.overall}
                <small>/ 10</small>
              </strong>

            </div>


            <div className="performance-modal-status">
              <CheckCircle2 size={16} />
              {selectedReview.status}
            </div>


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