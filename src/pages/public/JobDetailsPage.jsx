import { Link, useNavigate, useParams } from "react-router-dom";
import {
  MapPin,
  Briefcase,
  Building2,
  GraduationCap,
  CalendarDays,
  Users,
  Wallet,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

function JobDetailsPage() {
  const navigate = useNavigate();
  const { jobId } = useParams();

  const jobs = [
    {
      id: "1",
      title: "Frontend Developer",
      department: "Engineering",
      location: "Hyderabad",
      type: "Full Time",
      experience: "1 - 3 Years",
      salary: "₹4,00,000 - ₹7,00,000",
      education: "B.Tech / B.E / MCA / Equivalent",
      openings: 3,
      closingDate: "30 September 2026",
      requiredSkills: [
        "React",
        "JavaScript",
        "HTML",
        "CSS",
        "REST APIs",
        "Git",
      ],
      preferredSkills: [
        "Vite",
        "React Router",
        "Axios",
        "Responsive Design",
      ],
      description:
        "We are looking for a Frontend Developer who can build responsive, user-friendly and scalable web interfaces using modern React technologies.",
      responsibilities: [
        "Build reusable React components.",
        "Develop responsive and accessible user interfaces.",
        "Integrate frontend applications with REST APIs.",
        "Work closely with backend developers and designers.",
        "Fix UI bugs and improve application performance.",
        "Participate in code reviews and follow Git workflows.",
      ],
    },
    {
      id: "2",
      title: "Java Developer",
      department: "Engineering",
      location: "Bangalore",
      type: "Full Time",
      experience: "2 - 4 Years",
      salary: "₹6,00,000 - ₹10,00,000",
      education: "B.Tech / B.E / MCA / Equivalent",
      openings: 2,
      closingDate: "5 October 2026",
      requiredSkills: [
        "Java",
        "Spring Boot",
        "Spring MVC",
        "PostgreSQL",
        "REST APIs",
        "Git",
      ],
      preferredSkills: [
        "Hibernate",
        "JPA",
        "Docker",
        "Microservices",
      ],
      description:
        "We are looking for a Java Developer to develop scalable backend services and APIs using Spring Boot and modern backend development practices.",
      responsibilities: [
        "Develop REST APIs using Spring Boot.",
        "Work with relational databases.",
        "Implement business logic and validations.",
        "Write clean and maintainable Java code.",
        "Collaborate with frontend developers.",
        "Participate in testing and deployment activities.",
      ],
    },
  ];

  const job = jobs.find((item) => item.id === jobId);

  // =========================================================
  // APPLY NOW - CHECK CANDIDATE LOGIN
  // =========================================================
 const handleApplyNow = () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const isCandidate =
    token &&
    role?.toUpperCase() === "CANDIDATE";

  // Already logged in as Candidate
  if (isCandidate) {
    navigate(`/apply/${job.id}`);
    return;
  }

  // Remember which job the candidate wants to apply for
  sessionStorage.setItem(
    "pendingApplication",
    `/apply/${job.id}`
  );

  // Go to normal login page
  navigate("/login");
};

  if (!job) {
    return (
      <section className="job-not-found">
        <div className="container">
          <h1>Job Not Found</h1>

          <p>
            The position you are looking for does not exist
            or may no longer be available.
          </p>

          <Link to="/jobs" className="btn btn-primary">
            <ArrowLeft size={18} />
            Back to Jobs
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div className="job-details-page">

      <section className="job-details-header">
        <div className="container">

          <Link to="/jobs" className="back-to-jobs">
            <ArrowLeft size={17} />
            Back to Jobs
          </Link>

          <div className="job-details-title-section">

            <div>
              <span className="section-label">
                {job.department}
              </span>

              <h1>{job.title}</h1>

              <div className="job-details-meta">

                <span>
                  <MapPin size={17} />
                  {job.location}
                </span>

                <span>
                  <Briefcase size={17} />
                  {job.type}
                </span>

                <span>
                  <Briefcase size={17} />
                  {job.experience}
                </span>

              </div>
            </div>

            {/* APPLY NOW */}
            <button
              type="button"
              className="apply-now-button"
              onClick={handleApplyNow}
            >
              Apply Now
              <ArrowRight size={18} />
            </button>

          </div>
        </div>
      </section>


      <section className="job-details-content">
        <div className="container job-details-layout">

          <main className="job-details-main">

            <div className="job-details-card">
              <h2>About the Role</h2>

              <p className="job-description">
                {job.description}
              </p>
            </div>


            <div className="job-details-card">
              <h2>Responsibilities</h2>

              <ul className="job-details-list">
                {job.responsibilities.map(
                  (responsibility) => (
                    <li key={responsibility}>
                      <CheckCircle2 size={18} />

                      <span>
                        {responsibility}
                      </span>
                    </li>
                  )
                )}
              </ul>
            </div>


            <div className="job-details-card">
              <h2>Required Skills</h2>

              <div className="job-detail-skills">
                {job.requiredSkills.map((skill) => (
                  <span key={skill}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>


            <div className="job-details-card">
              <h2>Preferred Skills</h2>

              <div className="job-detail-skills preferred">
                {job.preferredSkills.map((skill) => (
                  <span key={skill}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>

          </main>


          <aside className="job-details-sidebar">

            <div className="job-summary-card">
              <h3>Job Overview</h3>

              <div className="job-summary-item">
                <Building2 size={20} />

                <div>
                  <span>Department</span>
                  <strong>
                    {job.department}
                  </strong>
                </div>
              </div>

              <div className="job-summary-item">
                <MapPin size={20} />

                <div>
                  <span>Location</span>
                  <strong>
                    {job.location}
                  </strong>
                </div>
              </div>

              <div className="job-summary-item">
                <Briefcase size={20} />

                <div>
                  <span>Experience</span>
                  <strong>
                    {job.experience}
                  </strong>
                </div>
              </div>

              <div className="job-summary-item">
                <Wallet size={20} />

                <div>
                  <span>Salary Range</span>
                  <strong>
                    {job.salary}
                  </strong>
                </div>
              </div>

              <div className="job-summary-item">
                <GraduationCap size={20} />

                <div>
                  <span>Education</span>
                  <strong>
                    {job.education}
                  </strong>
                </div>
              </div>

              <div className="job-summary-item">
                <Users size={20} />

                <div>
                  <span>Openings</span>
                  <strong>
                    {job.openings}
                  </strong>
                </div>
              </div>

              <div className="job-summary-item">
                <CalendarDays size={20} />

                <div>
                  <span>Closing Date</span>
                  <strong>
                    {job.closingDate}
                  </strong>
                </div>
              </div>

              {/* APPLY FOR THIS JOB */}
              <button
                type="button"
                className="sidebar-apply-button"
                onClick={handleApplyNow}
              >
                Apply for this Job
                <ArrowRight size={18} />
              </button>

            </div>

          </aside>

        </div>
      </section>

    </div>
  );
}

export default JobDetailsPage;