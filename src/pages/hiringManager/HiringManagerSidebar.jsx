import { useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  BriefcaseBusiness,
  Users,
  FileText,
  CalendarDays,
  CheckCircle2,
} from "lucide-react";

function HiringManagerSidebar() {
  const navigate = useNavigate();

  return (
    <aside className="hiring-manager-sidebar">

      <div className="hiring-manager-brand">
        <div className="hiring-manager-brand-icon">
          AI
        </div>

        <div>
          <h2>TalentAI</h2>
          <span>Hiring Manager</span>
        </div>
      </div>

      <nav className="hiring-manager-nav">

        <button
          onClick={() =>
            navigate("/hiring-manager/dashboard")
          }
        >
          <LayoutDashboard size={19} />
          Dashboard
        </button>

        <button
  onClick={() =>
    navigate("/hiring-manager/jobs")
  }
>
  <BriefcaseBusiness size={19} />
  Assigned Jobs
</button>

        <button
  onClick={() =>
    navigate(
      "/hiring-manager/shortlisted-candidates"
    )
  }
>
  <Users size={19} />
  Shortlisted Candidates
</button>


        <button
  onClick={() =>
    navigate("/hiring-manager/interviews")
  }
>
  <CalendarDays size={19} />
  Interviews
</button>

        <button
  onClick={() =>
    navigate("/hiring-manager/decisions")
  }
>
  <CheckCircle2 size={19} />
  Candidate Decisions
</button>

      </nav>
    </aside>
  );
}

export default HiringManagerSidebar;