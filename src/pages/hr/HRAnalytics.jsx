import React, { useEffect, useMemo, useState } from "react";
import HRSidebar from "./HRSidebar";
import "./HRDashboard.css";
import "./HRJobs.css";
import "./HRAnalytics.css";
import { getAnalytics } from "./hrApi";

function formatLabel(value) {
  if (!value) return "Unknown";
  return String(value)
    .replaceAll("_", " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatPercent(value) {
  const number = Number(value ?? 0);
  if (Number.isNaN(number)) return "0%";
  return `${number.toFixed(number % 1 === 0 ? 0 : 2)}%`;
}

function formatMonth(value) {
  if (!value) return "Unknown";
  const date = new Date(`${value}-01T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

function DistributionList({ data, emptyMessage = "No data available." }) {
  const entries = Object.entries(data || {});
  const max = Math.max(...entries.map(([, value]) => Number(value) || 0), 1);

  if (!entries.length) {
    return <div className="analytics-empty">{emptyMessage}</div>;
  }

  return (
    <div className="analytics-distribution-list">
      {entries.map(([label, value]) => (
        <div className="analytics-distribution-row" key={label}>
          <div className="analytics-distribution-label">
            <span>{formatLabel(label)}</span>
            <strong>{value}</strong>
          </div>
          <div className="analytics-bar-track">
            <div
              className="analytics-bar"
              style={{ width: `${((Number(value) || 0) / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function TrendList({ data, emptyMessage = "No trend data available." }) {
  const entries = Object.entries(data || {});
  const max = Math.max(...entries.map(([, value]) => Number(value) || 0), 1);

  if (!entries.length) {
    return <div className="analytics-empty">{emptyMessage}</div>;
  }

  return (
    <div className="analytics-trend-list">
      {entries.map(([period, value]) => (
        <div className="analytics-trend-row" key={period}>
          <span>{formatMonth(period)}</span>
          <div className="analytics-trend-track">
            <div
              className="analytics-trend-bar"
              style={{ width: `${((Number(value) || 0) / max) * 100}%` }}
            />
          </div>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}

function HRAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    try {
      setLoading(true);
      setError("");

      const result = await getAnalytics();
      console.log("Analytics from backend:", result);
      setData(result || {});
    } catch (err) {
      console.error("Failed to load analytics:", err);
      setError(err?.message || "Failed to load analytics.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const jobsByDepartment = useMemo(
    () => Object.entries(data?.jobsByDepartment || {}),
    [data]
  );

  const applicationsPerJob = Number(data?.applicationsPerJob ?? 0);

  return (
    <div className="hr-dashboard">
      <HRSidebar />

      <main className="hr-main">
        <header className="hr-header">
          <div>
            <h1>Analytics</h1>
            <p>
              Recruitment and workforce insights from your backend data.
            </p>
          </div>

          <button
            className="create-job-button"
            onClick={load}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </header>

        {loading && (
          <div className="jobs-panel">
            <div className="no-jobs">Loading analytics...</div>
          </div>
        )}

        {!loading && error && (
          <div className="jobs-panel">
            <div className="no-jobs analytics-error">{error}</div>
          </div>
        )}

        {!loading && !error && data && (
          <>
            <section className="jobs-stats analytics-stat-grid">
              <div className="job-stat-card">
                <span>Total Users</span>
                <strong>{data.totalUsers ?? 0}</strong>
                <small>{data.activeUsers ?? 0} active</small>
              </div>

              <div className="job-stat-card">
                <span>Total Departments</span>
                <strong>{data.totalDepartments ?? 0}</strong>
                <small>Departments</small>
              </div>

              <div className="job-stat-card">
                <span>Total Jobs</span>
                <strong>{data.totalJobs ?? 0}</strong>
                <small>{data.jobStatusDistribution?.OPEN ?? 0} open</small>
              </div>

              <div className="job-stat-card">
                <span>Total Applications</span>
                <strong>{data.totalApplications ?? 0}</strong>
                <small>{formatPercent(data.applicationToInterviewRate)} to interview</small>
              </div>

              <div className="job-stat-card">
                <span>Total Interviews</span>
                <strong>{data.totalInterviews ?? 0}</strong>
                <small>{formatPercent(data.interviewCompletionRate)} completed</small>
              </div>
            </section>

            <section className="analytics-grid analytics-grid-two">
              <div className="jobs-panel">
                <div className="jobs-panel-header">
                  <h2>Application Status</h2>
                </div>
                <DistributionList data={data.applicationStatusDistribution} />
              </div>

              <div className="jobs-panel">
                <div className="jobs-panel-header">
                  <h2>Interview Status</h2>
                </div>
                <DistributionList data={data.interviewStatusDistribution} />
              </div>
            </section>

            <section className="analytics-grid analytics-grid-two">
              <div className="jobs-panel">
                <div className="jobs-panel-header">
                  <h2>Job Status</h2>
                </div>
                <DistributionList data={data.jobStatusDistribution} />
              </div>

              <div className="jobs-panel">
                <div className="jobs-panel-header">
                  <h2>Jobs by Department</h2>
                </div>
                <DistributionList data={data.jobsByDepartment} />
              </div>
            </section>

            <section className="jobs-panel">
              <div className="jobs-panel-header">
                <h2>Recruitment Rates</h2>
              </div>

              <div className="analytics-rate-grid">
                <div className="analytics-rate-card">
                  <span>Application → Interview</span>
                  <strong>{formatPercent(data.applicationToInterviewRate)}</strong>
                </div>
                <div className="analytics-rate-card">
                  <span>Selection Rate</span>
                  <strong>{formatPercent(data.selectionRate)}</strong>
                </div>
                <div className="analytics-rate-card">
                  <span>Rejection Rate</span>
                  <strong>{formatPercent(data.rejectionRate)}</strong>
                </div>
                <div className="analytics-rate-card">
                  <span>Withdrawal Rate</span>
                  <strong>{formatPercent(data.withdrawalRate)}</strong>
                </div>
                <div className="analytics-rate-card">
                  <span>Interview Completion</span>
                  <strong>{formatPercent(data.interviewCompletionRate)}</strong>
                </div>
                <div className="analytics-rate-card">
                  <span>Interview Cancellation</span>
                  <strong>{formatPercent(data.interviewCancellationRate)}</strong>
                </div>
                <div className="analytics-rate-card">
                  <span>Applications per Job</span>
                  <strong>{applicationsPerJob.toFixed(2)}</strong>
                </div>
              </div>
            </section>

            <section className="analytics-grid analytics-grid-three">
              <div className="jobs-panel">
                <div className="jobs-panel-header">
                  <h2>Application Trend</h2>
                </div>
                <TrendList data={data.applicationTrends} />
              </div>

              <div className="jobs-panel">
                <div className="jobs-panel-header">
                  <h2>Interview Trend</h2>
                </div>
                <TrendList data={data.interviewTrends} />
              </div>

              <div className="jobs-panel">
                <div className="jobs-panel-header">
                  <h2>Job Trend</h2>
                </div>
                <TrendList data={data.jobTrends} />
              </div>
            </section>

            <section className="jobs-panel">
              <div className="jobs-panel-header">
                <h2>Jobs by Department</h2>
              </div>

              {jobsByDepartment.length === 0 ? (
                <div className="analytics-empty">No department job data available.</div>
              ) : (
                <div className="job-table">
                  <div className="job-row job-heading analytics-row-grid-2">
                    <span>Department</span>
                    <span>Jobs</span>
                  </div>

                  {jobsByDepartment.map(([department, count]) => (
                    <div className="job-row analytics-row-grid-2" key={department}>
                      <span>{department}</span>
                      <span>{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default HRAnalytics;
