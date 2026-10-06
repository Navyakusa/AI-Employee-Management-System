import { useLocation, useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  BriefcaseBusiness,
  Users,
  CalendarDays,
  CheckCircle2,
} from "lucide-react";
import "./HiringManagerSidebar.css";

function HiringManagerSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <aside className="hiring-manager-sidebar">

      {/* BRAND */}
      <div className="hiring-manager-brand">
        <div className="hiring-manager-brand-text">
          <span className="talent-text">Talent</span>
          <span className="ai-text">AI</span>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="hiring-manager-nav">

        <button
          className={
            isActive("/hiring-manager/dashboard")
              ? "active"
              : ""
          }
          onClick={() =>
            navigate("/hiring-manager/dashboard")
          }
        >
          <LayoutDashboard size={19} />
          <span>Dashboard</span>
        </button>

        <button
          className={
            isActive("/hiring-manager/jobs")
              ? "active"
              : ""
          }
          onClick={() =>
            navigate("/hiring-manager/jobs")
          }
        >
          <BriefcaseBusiness size={19} />
          <span>Assigned Jobs</span>
        </button>

        <button
          className={
            isActive("/hiring-manager/shortlisted-candidates")
              ? "active"
              : ""
          }
          onClick={() =>
            navigate("/hiring-manager/shortlisted-candidates")
          }
        >
          <Users size={19} />
          <span>Shortlisted Candidates</span>
        </button>

        <button
          className={
            isActive("/hiring-manager/interviews")
              ? "active"
              : ""
          }
          onClick={() =>
            navigate("/hiring-manager/interviews")
          }
        >
          <CalendarDays size={19} />
          <span>Interviews</span>
        </button>

        <button
          className={
            isActive("/hiring-manager/decisions")
              ? "active"
              : ""
          }
          onClick={() =>
            navigate("/hiring-manager/decisions")
          }
        >
          <CheckCircle2 size={19} />
          <span>Candidate Decisions</span>
        </button>

      </nav>
    </aside>
  );
}

export default HiringManagerSidebar;