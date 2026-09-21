import React, { useMemo, useState } from "react";
import RecruiterSidebar from "./RecruiterSidebar";
import RecruiterTopbar from "./RecruiterTopbar";
import "./RecruiterInterviews.css";

const initialInterviews = [
  {
    id: 1,
    candidate: "Rahul Verma",
    email: "rahul.verma@gmail.com",
    position: "Java Backend Developer",
    interviewer: "HR Team",
    date: "18 Sep 2026",
    time: "10:30 AM",
    type: "Technical",
    mode: "Online",
    status: "Scheduled",
  },
  {
    id: 2,
    candidate: "Ananya Sharma",
    email: "ananya.sharma@gmail.com",
    position: "Frontend Developer",
    interviewer: "Technical Team",
    date: "18 Sep 2026",
    time: "02:00 PM",
    type: "Technical",
    mode: "Online",
    status: "Scheduled",
  },
  {
    id: 3,
    candidate: "Arjun Reddy",
    email: "arjun.reddy@gmail.com",
    position: "Full Stack Developer",
    interviewer: "Hiring Manager",
    date: "19 Sep 2026",
    time: "11:00 AM",
    type: "HR",
    mode: "In Office",
    status: "Scheduled",
  },
  {
    id: 4,
    candidate: "Priya Nair",
    email: "priya.nair@gmail.com",
    position: "Python Developer",
    interviewer: "HR Team",
    date: "16 Sep 2026",
    time: "03:30 PM",
    type: "HR",
    mode: "Online",
    status: "Completed",
  },
  {
    id: 5,
    candidate: "Kiran Kumar",
    email: "kiran.kumar@gmail.com",
    position: "Software Engineer",
    interviewer: "Technical Team",
    date: "15 Sep 2026",
    time: "11:30 AM",
    type: "Technical",
    mode: "Online",
    status: "Cancelled",
  },
];

function RecruiterInterviews() {
  const [interviews, setInterviews] = useState(initialInterviews);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);

  const [newInterview, setNewInterview] = useState({
    candidate: "",
    position: "",
    interviewer: "",
    date: "",
    time: "",
    type: "Technical",
    mode: "Online",
  });

  const filteredInterviews = useMemo(() => {
    return interviews.filter((interview) => {
      const text = search.toLowerCase();

      const matchesSearch =
        interview.candidate.toLowerCase().includes(text) ||
        interview.email.toLowerCase().includes(text) ||
        interview.position.toLowerCase().includes(text) ||
        interview.interviewer.toLowerCase().includes(text);

      const matchesStatus =
        statusFilter === "All" ||
        interview.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [interviews, search, statusFilter]);

  const handleInputChange = (e) => {
    setNewInterview({
      ...newInterview,
      [e.target.name]: e.target.value,
    });
  };

  const handleScheduleInterview = (e) => {
    e.preventDefault();

    if (
      !newInterview.candidate.trim() ||
      !newInterview.position.trim() ||
      !newInterview.date ||
      !newInterview.time
    ) {
      alert("Please fill in the required fields.");
      return;
    }

    const interview = {
      id: Date.now(),
      candidate: newInterview.candidate.trim(),
      email: "candidate@email.com",
      position: newInterview.position.trim(),
      interviewer:
        newInterview.interviewer.trim() || "HR Team",
      date: newInterview.date,
      time: newInterview.time,
      type: newInterview.type,
      mode: newInterview.mode,
      status: "Scheduled",
    };

    setInterviews((prev) => [interview, ...prev]);

    setNewInterview({
      candidate: "",
      position: "",
      interviewer: "",
      date: "",
      time: "",
      type: "Technical",
      mode: "Online",
    });

    setShowModal(false);
  };

  const handleJoin = (interview) => {
    alert(
      `Joining interview for ${interview.candidate}`
    );
  };

  const handleView = (interview) => {
    alert(
      `Interview Details\n\nCandidate: ${interview.candidate}\nPosition: ${interview.position}\nDate: ${interview.date}\nTime: ${interview.time}\nMode: ${interview.mode}`
    );
  };

  const handleCancel = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this interview?"
    );

    if (!confirmed) return;

    setInterviews((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: "Cancelled" }
          : item
      )
    );
  };

  return (
    <div className="recruiter-interviews-page">
      <RecruiterSidebar />
      <RecruiterTopbar />

      <main className="recruiter-interviews-main">
        <div className="interviews-header">
          <div>
            <h1>Interviews</h1>
            <p>
              Schedule and manage candidate interviews
            </p>
          </div>

          <button
            className="schedule-interview-btn"
            onClick={() => setShowModal(true)}
          >
            <span>+</span>
            Schedule Interview
          </button>
        </div>

        <section className="interviews-summary">
          <div className="interview-summary-card">
            <div className="interview-summary-icon">◷</div>
            <div>
              <span>Total Interviews</span>
              <strong>{interviews.length}</strong>
            </div>
          </div>

          <div className="interview-summary-card">
            <div className="interview-summary-icon">✓</div>
            <div>
              <span>Scheduled</span>
              <strong>
                {
                  interviews.filter(
                    (item) => item.status === "Scheduled"
                  ).length
                }
              </strong>
            </div>
          </div>

          <div className="interview-summary-card">
            <div className="interview-summary-icon">●</div>
            <div>
              <span>Completed</span>
              <strong>
                {
                  interviews.filter(
                    (item) => item.status === "Completed"
                  ).length
                }
              </strong>
            </div>
          </div>

          <div className="interview-summary-card">
            <div className="interview-summary-icon">!</div>
            <div>
              <span>Cancelled</span>
              <strong>
                {
                  interviews.filter(
                    (item) => item.status === "Cancelled"
                  ).length
                }
              </strong>
            </div>
          </div>
        </section>

        <section className="upcoming-interviews-card">
          <div className="upcoming-title">
            <div className="upcoming-icon">◷</div>

            <div>
              <h3>Upcoming Interviews</h3>
              <p>
                Candidate interviews scheduled for the upcoming days
              </p>
            </div>
          </div>

          <div className="upcoming-list">
            {interviews
              .filter(
                (interview) => interview.status === "Scheduled"
              )
              .slice(0, 3)
              .map((interview) => (
                <div
                  className="upcoming-item"
                  key={interview.id}
                >
                  <div className="upcoming-date">
                    <strong>
                      {interview.date.split(" ")[0]}
                    </strong>
                    <span>
                      {interview.date.split(" ")[1]}
                    </span>
                  </div>

                  <div className="upcoming-details">
                    <strong>{interview.candidate}</strong>
                    <span>{interview.position}</span>
                  </div>

                  <div className="upcoming-time">
                    <strong>{interview.time}</strong>
                    <span>{interview.mode}</span>
                  </div>

                  <button
                    className="upcoming-view-btn"
                    onClick={() => handleView(interview)}
                  >
                    View
                  </button>
                </div>
              ))}

            {interviews.filter(
              (interview) => interview.status === "Scheduled"
            ).length === 0 && (
              <div className="no-upcoming">
                No upcoming interviews.
              </div>
            )}
          </div>
        </section>

        <section className="interviews-table-card">
          <div className="interviews-toolbar">
            <div className="interviews-search">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Search candidate or position..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              className="interviews-filter"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
            >
              <option value="All">All Status</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="interviews-table-wrapper">
            <table className="interviews-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Position</th>
                  <th>Interviewer</th>
                  <th>Date & Time</th>
                  <th>Type</th>
                  <th>Mode</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredInterviews.length > 0 ? (
                  filteredInterviews.map((interview) => (
                    <tr key={interview.id}>
                      <td>
                        <div className="interview-candidate">
                          <div className="interview-avatar">
                            {interview.candidate.charAt(0)}
                          </div>

                          <div>
                            <strong>
                              {interview.candidate}
                            </strong>
                            <small>
                              {interview.email}
                            </small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="interview-position">
                          {interview.position}
                        </span>
                      </td>

                      <td>{interview.interviewer}</td>

                      <td>
                        <div className="interview-datetime">
                          <strong>{interview.date}</strong>
                          <span>{interview.time}</span>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`interview-type ${interview.type.toLowerCase()}`}
                        >
                          {interview.type}
                        </span>
                      </td>

                      <td>
                        <span className="interview-mode">
                          {interview.mode}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`interview-status ${interview.status
                            .toLowerCase()
                            .replace(" ", "-")}`}
                        >
                          {interview.status}
                        </span>
                      </td>

                      <td>
                        <div className="interview-actions">
                          <button
                            className="interview-view-btn"
                            onClick={() =>
                              handleView(interview)
                            }
                          >
                            View
                          </button>

                          {interview.status ===
                            "Scheduled" && (
                            <>
                              <button
                                className="join-interview-btn"
                                onClick={() =>
                                  handleJoin(interview)
                                }
                              >
                                Join
                              </button>

                              <button
                                className="cancel-interview-btn"
                                onClick={() =>
                                  handleCancel(interview.id)
                                }
                              >
                                Cancel
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="8"
                      className="interviews-empty"
                    >
                      <div>
                        <span>◷</span>
                        <h3>No interviews found</h3>
                        <p>
                          Try changing your search or status filter.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="interviews-footer">
            Showing{" "}
            <strong>{filteredInterviews.length}</strong> of{" "}
            <strong>{interviews.length}</strong> interviews
          </div>
        </section>
      </main>

      {showModal && (
        <div
          className="interview-modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <div
            className="interview-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="interview-modal-header">
              <div>
                <h2>Schedule Interview</h2>
                <p>
                  Create a new candidate interview.
                </p>
              </div>

              <button
                className="interview-modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleScheduleInterview}>
              <div className="interview-form-row">
                <div className="interview-form-group">
                  <label>
                    Candidate <span>*</span>
                  </label>

                  <input
                    type="text"
                    name="candidate"
                    value={newInterview.candidate}
                    onChange={handleInputChange}
                    placeholder="Candidate name"
                  />
                </div>

                <div className="interview-form-group">
                  <label>
                    Position <span>*</span>
                  </label>

                  <input
                    type="text"
                    name="position"
                    value={newInterview.position}
                    onChange={handleInputChange}
                    placeholder="Job position"
                  />
                </div>
              </div>

              <div className="interview-form-group">
                <label>Interviewer</label>

                <input
                  type="text"
                  name="interviewer"
                  value={newInterview.interviewer}
                  onChange={handleInputChange}
                  placeholder="Interviewer name or team"
                />
              </div>

              <div className="interview-form-row">
                <div className="interview-form-group">
                  <label>
                    Date <span>*</span>
                  </label>

                  <input
                    type="date"
                    name="date"
                    value={newInterview.date}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="interview-form-group">
                  <label>
                    Time <span>*</span>
                  </label>

                  <input
                    type="time"
                    name="time"
                    value={newInterview.time}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="interview-form-row">
                <div className="interview-form-group">
                  <label>Interview Type</label>

                  <select
                    name="type"
                    value={newInterview.type}
                    onChange={handleInputChange}
                  >
                    <option value="Technical">
                      Technical
                    </option>
                    <option value="HR">HR</option>
                  </select>
                </div>

                <div className="interview-form-group">
                  <label>Interview Mode</label>

                  <select
                    name="mode"
                    value={newInterview.mode}
                    onChange={handleInputChange}
                  >
                    <option value="Online">Online</option>
                    <option value="In Office">
                      In Office
                    </option>
                  </select>
                </div>
              </div>

              <div className="interview-modal-actions">
                <button
                  type="button"
                  className="interview-cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="interview-save-btn"
                >
                  Schedule Interview
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecruiterInterviews;