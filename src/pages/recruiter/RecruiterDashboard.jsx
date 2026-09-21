import React from "react";
import {
  Users,
  FileText,
  Brain,
  UserCheck,
  CalendarDays,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

import RecruiterSidebar from "./RecruiterSidebar";
import RecruiterTopbar from "./RecruiterTopbar";
import "./RecruiterDashboard.css";

function RecruiterDashboard() {
  const stats = [
    {
      title: "Total Candidates",
      value: "124",
      icon: Users,
      type: "blue",
    },
    {
      title: "AI Screened",
      value: "86",
      icon: Brain,
      type: "purple",
    },
    {
      title: "Shortlisted",
      value: "32",
      icon: UserCheck,
      type: "green",
    },
    {
      title: "Interviews",
      value: "12",
      icon: CalendarDays,
      type: "orange",
    },
  ];

  const pipeline = [
    {
      name: "Applied",
      count: 124,
    },
    {
      name: "AI Screened",
      count: 86,
    },
    {
      name: "Shortlisted",
      count: 32,
    },
    {
      name: "HR Screening",
      count: 18,
    },
    {
      name: "Interview",
      count: 12,
    },
    {
      name: "Selected",
      count: 5,
    },
  ];

  const recentCandidates = [
    {
      name: "Rahul Verma",
      role: "Java Backend Developer",
      score: "91%",
      status: "Shortlisted",
    },
    {
      name: "Ananya Sharma",
      role: "React Frontend Developer",
      score: "88%",
      status: "AI Screened",
    },
    {
      name: "Sneha Reddy",
      role: "QA Engineer",
      score: "84%",
      status: "Interview",
    },
    {
      name: "Arjun Kumar",
      role: "Python Developer",
      score: "81%",
      status: "AI Screened",
    },
  ];

  const upcomingInterviews = [
    {
      candidate: "Ananya Sharma",
      role: "React Frontend Developer",
      time: "11:00 AM",
      type: "Technical",
    },
    {
      candidate: "Rahul Verma",
      role: "Java Backend Developer",
      time: "02:30 PM",
      type: "Technical",
    },
    {
      candidate: "Sneha Reddy",
      role: "QA Engineer",
      time: "04:00 PM",
      type: "HR",
    },
  ];

  return (
    <div className="recruiter-dashboard-page">

      <RecruiterSidebar /> 

      <RecruiterTopbar />

      <main className="recruiter-dashboard-main">

        {/* ================= TOPBAR ================= */}

        <header className="recruiter-dashboard-topbar">

          <div className="recruiter-search">
            <input
              type="text"
              placeholder="Search candidates, jobs..."
            />
          </div>

          <div className="recruiter-user-area">

            <button className="recruiter-notification-btn">
              <AlertCircle size={20} />
              <span></span>
            </button>

            <div className="recruiter-user-avatar">
              R
            </div>

            <div className="recruiter-user-info">
              <strong>Recruiter</strong>
              <small>Recruiter</small>
            </div>

          </div>

        </header>

        {/* ================= CONTENT ================= */}

        <section className="recruiter-dashboard-content">

          <div className="recruiter-page-heading">

            <div>
              <span className="recruiter-eyebrow">
                RECRUITMENT WORKSPACE
              </span>

              <h1>Recruiter Dashboard</h1>

              <p>
                Manage candidates, screening, interviews and recruitment
                activities.
              </p>
            </div>

          </div>

          {/* ================= STAT CARDS ================= */}

          <div className="recruiter-stat-grid">

            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  className="recruiter-stat-card"
                  key={stat.title}
                >
                  <div
                    className={`recruiter-stat-icon ${stat.type}`}
                  >
                    <Icon size={21} />
                  </div>

                  <div>
                    <span>{stat.title}</span>
                    <strong>{stat.value}</strong>
                  </div>
                </div>
              );
            })}

          </div>

          {/* ================= PIPELINE ================= */}

          <section className="recruiter-card recruiter-pipeline-card">

            <div className="recruiter-card-header">

              <div>
                <h2>Candidate Pipeline</h2>
                <p>
                  Track candidates through the recruitment process.
                </p>
              </div>

              <button className="recruiter-view-btn">
                View Candidates
                <ArrowRight size={16} />
              </button>

            </div>

            <div className="recruiter-pipeline">

              {pipeline.map((stage, index) => (
                <React.Fragment key={stage.name}>

                  <div className="recruiter-pipeline-stage">

                    <div className="recruiter-pipeline-number">
                      {stage.count}
                    </div>

                    <span>{stage.name}</span>

                  </div>

                  {index < pipeline.length - 1 && (
                    <ArrowRight
                      className="recruiter-pipeline-arrow"
                      size={18}
                    />
                  )}

                </React.Fragment>
              ))}

            </div>

          </section>

          {/* ================= TWO COLUMNS ================= */}

          <div className="recruiter-dashboard-columns">

            {/* RECENT CANDIDATES */}

            <section className="recruiter-card">

              <div className="recruiter-card-header">

                <div>
                  <h2>Recent Candidates</h2>
                  <p>
                    Latest candidate activity.
                  </p>
                </div>

                <button className="recruiter-text-btn">
                  View All
                  <ArrowRight size={15} />
                </button>

              </div>

              <div className="recruiter-candidate-list">

                {recentCandidates.map((candidate) => (

                  <div
                    className="recruiter-candidate-row"
                    key={candidate.name}
                  >

                    <div className="recruiter-candidate-avatar">
                      {candidate.name.charAt(0)}
                    </div>

                    <div className="recruiter-candidate-details">

                      <strong>
                        {candidate.name}
                      </strong>

                      <span>
                        {candidate.role}
                      </span>

                    </div>

                    <div className="recruiter-match-score">
                      <strong>
                        {candidate.score}
                      </strong>

                      <span>AI Match</span>
                    </div>

                    <span
                      className={`recruiter-status ${
                        candidate.status
                          .toLowerCase()
                          .replace(" ", "-")
                      }`}
                    >
                      {candidate.status}
                    </span>

                  </div>

                ))}

              </div>

            </section>

            {/* UPCOMING INTERVIEWS */}

            <section className="recruiter-card">

              <div className="recruiter-card-header">

                <div>
                  <h2>Upcoming Interviews</h2>
                  <p>
                    Today's scheduled interviews.
                  </p>
                </div>

                <CalendarDays size={20} />

              </div>

              <div className="recruiter-interview-list">

                {upcomingInterviews.map((interview) => (

                  <div
                    className="recruiter-interview-row"
                    key={`${interview.candidate}-${interview.time}`}
                  >

                    <div className="recruiter-time">
                      <Clock size={15} />
                      <strong>
                        {interview.time}
                      </strong>
                    </div>

                    <div className="recruiter-interview-person">

                      <div className="recruiter-small-avatar">
                        {interview.candidate.charAt(0)}
                      </div>

                      <div>
                        <strong>
                          {interview.candidate}
                        </strong>

                        <span>
                          {interview.role}
                        </span>
                      </div>

                    </div>

                    <span className="recruiter-interview-type">
                      {interview.type}
                    </span>

                  </div>

                ))}

              </div>

            </section>

          </div>

          {/* ================= AI SCREENING ================= */}

          <section className="recruiter-card recruiter-ai-card">

            <div className="recruiter-ai-icon">
              <Brain size={25} />
            </div>

            <div className="recruiter-ai-content">

              <h2>AI Candidate Screening</h2>

              <p>
                Review AI-assisted candidate matching and screening
                results before making recruitment decisions.
              </p>

            </div>

            <button className="recruiter-ai-button">
              Open AI Screening
              <ArrowRight size={16} />
            </button>

          </section>

        </section>

      </main>

    </div>
  );
}

export default RecruiterDashboard;