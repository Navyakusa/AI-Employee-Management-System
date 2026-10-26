import React, { useCallback, useEffect, useMemo, useState } from "react";
import HRSidebar from "./HRSidebar";
import HRNavbar from "./HRNavbar";
import "./HRScreening.css";
import { fetchAIScreening } from "./hrApi";

const asArray = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.content)) return value.content;
  if (Array.isArray(value?.records)) return value.records;
  if (Array.isArray(value?.results)) return value.results;
  if (Array.isArray(value?.screenings)) return value.screenings;
  if (Array.isArray(value?.data)) return asArray(value.data);
  if (Array.isArray(value?.items)) return value.items;
  return [];
};

const first = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

function getCandidateName(row) {
  const candidate = row?.candidate || row?.candidateDetails || {};
  return first(
    row?.candidateName,
    row?.fullName,
    candidate?.fullName,
    candidate?.name,
    [candidate?.firstName, candidate?.lastName].filter(Boolean).join(" "),
    row?.name,
    `Candidate ${first(row?.candidateId, candidate?.id, "—")}`
  );
}

function getJobTitle(row) {
  const job = row?.job || row?.jobDetails || {};
  return first(row?.jobTitle, job?.title, job?.jobTitle, job?.name,
    row?.position, `Job ${first(row?.jobId, job?.id, "—")}`);
}

function getScore(row) {
  const value = first(row?.screeningScore, row?.score, row?.matchScore,
    row?.aiMatch, row?.matchPercentage, row?.percentage);
  if (value === undefined) return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function getResult(row) {
  return String(first(row?.screeningResult, row?.result, row?.status, row?.decision, "PENDING"))
    .replaceAll("_", " ");
}

function getSkills(row) {
  const value = first(row?.extractedSkills, row?.skills, row?.candidateSkills, row?.resumeAnalysis?.skills);
  if (Array.isArray(value)) return value.map((item) => typeof item === "string" ? item : item?.name).filter(Boolean);
  if (typeof value === "string") return value.split(/[,;|]/).map((item) => item.trim()).filter(Boolean);
  return [];
}

function getEducation(row) {
  const value = first(row?.education, row?.extractedEducation, row?.resumeAnalysis?.education);
  if (Array.isArray(value)) return value.map((item) => typeof item === "string" ? item : first(item?.degree, item?.qualification, item?.institution)).filter(Boolean).join(", ");
  if (typeof value === "object" && value !== null) return first(value?.degree, value?.qualification, value?.institution, JSON.stringify(value));
  return value || "—";
}

function getDate(row) {
  const value = first(row?.screenedAt, row?.screeningDate, row?.createdAt, row?.createdDate, row?.updatedAt);
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString();
}

function resultClass(result) {
  const value = result.toLowerCase();
  if (value.includes("qualified") && !value.includes("not qualified")) return "qualified";
  if (value.includes("recommend")) return "recommended";
  if (value.includes("not qualified") || value.includes("rejected") || value.includes("fail")) return "not-qualified";
  return "needs-review";
}

export default function HRScreening() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadScreeningRecords = useCallback(async (quiet = false) => {
    try {
      if (quiet) setRefreshing(true);
      else setLoading(true);
      setError("");

      // Existing helper calls GET /api/dashboard/ai-screening and unwraps
      // the standard { success: true, data: ... } API envelope.
      const response = await fetchAIScreening();
      console.log("AI Screening records response:", response);

      const list = asArray(response);
      setRecords(list);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to load AI screening records:", err);
      setError(err?.message || "Unable to load AI screening records.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadScreeningRecords();
    // Refresh completed records periodically so new automatic screenings appear.
    const timer = window.setInterval(() => loadScreeningRecords(true), 30000);
    return () => window.clearInterval(timer);
  }, [loadScreeningRecords]);

  const visibleRecords = useMemo(() => {
    const query = search.trim().toLowerCase();
    return records.filter((row) => {
      const result = getResult(row);
      const matchesFilter = filter === "ALL" ||
        (filter === "HIGH_MATCH" && getScore(row) !== null && getScore(row) >= 75) ||
        (filter === "RECOMMENDED" && result.toLowerCase().includes("recommend")) ||
        (filter === "NEEDS_REVIEW" && (result.toLowerCase().includes("pending") || result.toLowerCase().includes("review"))) ||
        (filter === "NOT_QUALIFIED" && result.toLowerCase().includes("not qualified"));
      const haystack = [
        getCandidateName(row), getJobTitle(row), row?.candidateId, row?.jobId,
        result, getSkills(row).join(" "), getEducation(row)
      ].join(" ").toLowerCase();
      return matchesFilter && (!query || haystack.includes(query));
    });
  }, [records, search, filter]);

  const totalScreened = records.length;
  const highMatch = records.filter((row) => (getScore(row) ?? -1) >= 75).length;
  const recommended = records.filter((row) => getResult(row).toLowerCase().includes("recommend")).length;
  const needsReview = records.filter((row) => {
    const result = getResult(row).toLowerCase();
    return result.includes("pending") || result.includes("review");
  }).length;

  return (
    <div className="hr-screening-layout">
      <HRSidebar />
      <HRNavbar />
      <main className="hr-screening-main">
        <header className="screening-header">
          <div>
            <h1>AI Screening</h1>
            <p>Review AI-powered candidate screening and matching results.</p>
          </div>
          <button className="refresh-screenings" type="button" onClick={() => loadScreeningRecords(true)} disabled={refreshing}>
            {refreshing ? "Refreshing…" : "↻ Refresh Results"}
          </button>
        </header>

        {error && <div className="error-message">{error}</div>}

        <section className="screening-stats" aria-label="Screening summary">
          <div className="stat-card"><span className="stat-icon">👥</span><div><span className="stat-label">Total Screened</span><strong>{loading ? "…" : totalScreened}</strong></div></div>
          <div className="stat-card"><span className="stat-icon">★</span><div><span className="stat-label">High Match</span><strong>{loading ? "…" : highMatch}</strong></div></div>
          <div className="stat-card"><span className="stat-icon">✓</span><div><span className="stat-label">Recommended</span><strong>{loading ? "…" : recommended}</strong></div></div>
          <div className="stat-card"><span className="stat-icon">◷</span><div><span className="stat-label">Needs Review</span><strong>{loading ? "…" : needsReview}</strong></div></div>
        </section>

        <section className="screening-info-banner">
          <span className="banner-icon">✦</span>
          <div><h2>AI Candidate Screening</h2><p>Screening results are loaded from the backend. When a candidate applies and the backend completes screening, the result will appear here automatically.</p></div>
        </section>

        <section className="screening-results-card">
          <div className="results-toolbar">
            <input
              type="search"
              aria-label="Search screening results"
              placeholder="Search candidates, jobs or skills (optional)…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <select aria-label="Filter screening results" value={filter} onChange={(event) => setFilter(event.target.value)}>
              <option value="ALL">All Results</option>
              <option value="HIGH_MATCH">High Match (75%+)</option>
              <option value="RECOMMENDED">Recommended</option>
              <option value="NEEDS_REVIEW">Needs Review</option>
              <option value="NOT_QUALIFIED">Not Qualified</option>
            </select>
          </div>

          <div className="screening-table-wrap">
            <table className="screening-table">
              <thead><tr>
                <th>Candidate</th><th>Candidate ID</th><th>Position</th><th>Job ID</th><th>Skills</th><th>Education</th><th>AI Match</th><th>Result</th><th>Screened</th>
              </tr></thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="9" className="table-message">Loading screening results from the backend…</td></tr>
                ) : visibleRecords.length ? visibleRecords.map((row, index) => {
                  const score = getScore(row);
                  const result = getResult(row);
                  const skills = getSkills(row);
                  return <tr key={first(row?.id, row?.screeningId, `${row?.candidateId}-${row?.jobId}-${index}`)}>
                    <td><strong>{getCandidateName(row)}</strong><small>Screening ID: {first(row?.screeningId, row?.id, "—")}</small></td>
                    <td>{first(row?.candidateId, row?.candidate?.id, "—")}</td>
                    <td>{getJobTitle(row)}</td>
                    <td>{first(row?.jobId, row?.job?.id, "—")}</td>
                    <td><div className="skill-tags">{skills.length ? skills.slice(0, 8).map((skill, i) => <span key={`${skill}-${i}`}>{skill}</span>) : <span className="muted-value">—</span>}{skills.length > 8 && <span>+{skills.length - 8} more</span>}</div></td>
                    <td>{getEducation(row)}</td>
                    <td><strong className={`match-score ${score !== null && score < 50 ? "low" : score !== null && score >= 75 ? "high" : ""}`}>{score === null ? "—" : `${score.toFixed(2)}%`}</strong></td>
                    <td><span className={`result-pill ${resultClass(result)}`}>{result}</span><small className="recommendation-text">{first(row?.recommendation, row?.aiRecommendation, "")}</small></td>
                    <td>{getDate(row)}</td>
                  </tr>;
                }) : (
                  <tr><td colSpan="9" className="empty-results">
                    <div className="empty-icon">✦</div>
                    <h3>{records.length ? "No matching results" : "No screening records returned"}</h3>
                    <p>{records.length ? "Try changing your search or filter." : "This page checks the existing backend screening-results endpoint. If Swagger shows screening ID 153 but this list is empty, the GET endpoint must return saved screening records; the POST screening response alone cannot populate a historical list."}</p>
                    {!records.length && <button type="button" className="refresh-screenings" onClick={() => loadScreeningRecords(true)}>Check Again</button>}
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="results-footer">
            <span>{visibleRecords.length} result{visibleRecords.length === 1 ? "" : "s"}</span>
            <span>{lastUpdated ? `Last checked ${lastUpdated.toLocaleTimeString()}` : "Waiting for results"}</span>
          </div>
        </section>
      </main>
    </div>
  );
}
