import {
  BriefcaseBusiness,
  Users,
  CalendarDays,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";

import HiringManagerSidebar from "./HiringManagerSidebar";
import HiringManagerNavbar from "./HiringManagerNavbar";

import "./HiringManagerDashboard.css";

function HiringManagerDashboard() {
  return (
    <div className="hiring-manager-layout">

      <HiringManagerSidebar />

      <div className="hiring-manager-main">

        <HiringManagerNavbar />

        <main className="hiring-manager-dashboard-content">

          {/* HEADER */}
          <div className="hiring-manager-dashboard-header">

            <div>
              <p className="hiring-manager-label">
                HIRING MANAGER
              </p>

              <h1>Dashboard</h1>

              <p>
                Manage assigned jobs, shortlisted candidates,
                interviews and hiring decisions.
              </p>
            </div>

          </div>

          {/* DASHBOARD CARDS */}
          <section className="hiring-manager-stats">

            {/* ASSIGNED JOBS */}
            <div className="hiring-manager-stat-card">

              <div className="hiring-manager-stat-top">

                <div className="hiring-manager-stat-icon">
                  <BriefcaseBusiness size={22} />
                </div>

                <ArrowUpRight size={18} />

              </div>

              <span>
                Assigned Jobs
              </span>

              <strong>
                0
              </strong>

              <p>
                Jobs assigned to you
              </p>

            </div>

            {/* SHORTLISTED CANDIDATES */}
            <div className="hiring-manager-stat-card">

              <div className="hiring-manager-stat-top">

                <div className="hiring-manager-stat-icon">
                  <Users size={22} />
                </div>

                <ArrowUpRight size={18} />

              </div>

              <span>
                Shortlisted Candidates
              </span>

              <strong>
                0
              </strong>

              <p>
                Candidates ready for review
              </p>

            </div>

            {/* UPCOMING INTERVIEWS */}
            <div className="hiring-manager-stat-card">

              <div className="hiring-manager-stat-top">

                <div className="hiring-manager-stat-icon">
                  <CalendarDays size={22} />
                </div>

                <ArrowUpRight size={18} />

              </div>

              <span>
                Upcoming Interviews
              </span>

              <strong>
                0
              </strong>

              <p>
                Scheduled interviews
              </p>

            </div>

            {/* PENDING DECISIONS */}
            <div className="hiring-manager-stat-card">

              <div className="hiring-manager-stat-top">

                <div className="hiring-manager-stat-icon">
                  <CheckCircle2 size={22} />
                </div>

                <ArrowUpRight size={18} />

              </div>

              <span>
                Pending Decisions
              </span>

              <strong>
                0
              </strong>

              <p>
                Candidates awaiting decision
              </p>

            </div>

          </section>

          {/* BOTTOM SECTION */}
          <section className="hiring-manager-dashboard-grid">

            {/* ASSIGNED JOBS */}
            <div className="hiring-manager-panel">

              <div className="hiring-manager-panel-header">
                <div>
                  <h2>
                    Assigned Jobs
                  </h2>

                  <p>
                    Your recently assigned jobs
                  </p>
                </div>

                <button>
                  View All
                </button>
              </div>

              <div className="hiring-manager-empty">
                No assigned jobs available.
              </div>

            </div>

            {/* RECENT CANDIDATES */}
            <div className="hiring-manager-panel">

              <div className="hiring-manager-panel-header">
                <div>
                  <h2>
                    Recent Candidates
                  </h2>

                  <p>
                    Recently shortlisted candidates
                  </p>
                </div>
              </div>

              <div className="hiring-manager-empty">
                No candidates available.
              </div>

            </div>

          </section>

        </main>

      </div>

    </div>
  );
}

export default HiringManagerDashboard;