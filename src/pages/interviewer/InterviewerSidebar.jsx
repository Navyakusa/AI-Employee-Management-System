import { useNavigate, useLocation } from "react-router-dom";

import {
  LayoutDashboard,
  CalendarDays,
  Users,
  ClipboardCheck,
} from "lucide-react";

function InterviewerSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="interviewer-sidebar">

      {/* BRAND */}

      <div className="interviewer-brand">

        <div className="interviewer-brand-icon">
          AI
        </div>

        <div>
          <h2>TalentAI</h2>
          <span>Interviewer</span>
        </div>

      </div>

      {/* NAVIGATION */}

      <nav className="interviewer-nav">

        {/* DASHBOARD */}

        <button
          type="button"
          className={
            location.pathname ===
            "/interviewer/dashboard"
              ? "active"
              : ""
          }
          onClick={() =>
            navigate("/interviewer/dashboard")
          }
        >
          <LayoutDashboard size={19} />
          Dashboard
        </button>

        {/* MY INTERVIEWS */}

        <button
          type="button"
          className={
            location.pathname.startsWith(
              "/interviewer/interviews"
            )
              ? "active"
              : ""
          }
          onClick={() =>
            navigate("/interviewer/interviews")
          }
        >
          <CalendarDays size={19} />
          My Interviews
        </button>

        {/* CANDIDATES */}

        <button
          type="button"
          className={
            location.pathname.startsWith(
              "/interviewer/candidates"
            )
              ? "active"
              : ""
          }
          onClick={() =>
            navigate("/interviewer/candidates")
          }
        >
          <Users size={19} />
          Candidates
        </button>

        {/* EVALUATIONS */}

        <button
  onClick={() =>
    navigate("/interviewer/evaluations")
  }
>
  <ClipboardCheck size={19} />
  Evaluations
</button>

      </nav>

    </aside>
  );
}

export default InterviewerSidebar;