import React from "react";
import {
  UserRound,
  Mail,
  Phone,
  Building2,
  Briefcase,
  MapPin,
  CalendarDays,
  ShieldCheck,
} from "lucide-react";

import RecruiterSidebar from "./RecruiterSidebar";
import RecruiterTopbar from "./RecruiterTopbar";

import "./RecruiterProfile.css";

function RecruiterProfile() {
  const recruiter = {
    name: "Recruiter",
    email: "recruiter@gmail.com",
    phone: "+91 98765 43210",
    department: "Recruitment",
    designation: "Recruiter",
    employeeId: "REC001",
    joiningDate: "15 June 2026",
    location: "Hyderabad",
    employmentType: "Full Time",
    status: "Active",
  };

  return (
    <div className="recruiter-profile-page">

      {/* SIDEBAR */}
      <RecruiterSidebar />

      {/* TOPBAR */}
      <RecruiterTopbar />

      {/* MAIN CONTENT */}
      <main className="recruiter-profile-main">

        {/* PAGE HEADER */}
        <div className="recruiter-profile-header">

          <div>
            <span className="recruiter-profile-label">
              RECRUITMENT WORKSPACE
            </span>

            <h1>My Profile</h1>

            <p>
              View your recruiter account information.
            </p>
          </div>

        </div>

        {/* PROFILE CARD */}
        <section className="recruiter-profile-card">

          {/* PROFILE HEADER */}
          <div className="recruiter-profile-card-header">

            <div className="recruiter-large-avatar">
              R
            </div>

            <div className="recruiter-profile-title">

              <h2>{recruiter.name}</h2>

              <p>{recruiter.designation}</p>

              <span className="recruiter-status">
                <span className="status-dot"></span>
                {recruiter.status}
              </span>

            </div>

          </div>

          {/* INFORMATION */}
          <div className="recruiter-profile-section">

            <div className="recruiter-section-title">
              <UserRound size={18} />
              <div>
                <h3>Personal Information</h3>
                <p>Your basic account information.</p>
              </div>
            </div>

            <div className="recruiter-info-grid">

              {/* NAME */}
              <div className="recruiter-info-item">
                <span className="info-label">
                  Full Name
                </span>

                <div className="info-value">
                  <UserRound size={16} />
                  {recruiter.name}
                </div>
              </div>

              {/* EMAIL */}
              <div className="recruiter-info-item">
                <span className="info-label">
                  Email Address
                </span>

                <div className="info-value">
                  <Mail size={16} />
                  {recruiter.email}
                </div>
              </div>

              {/* PHONE */}
              <div className="recruiter-info-item">
                <span className="info-label">
                  Phone Number
                </span>

                <div className="info-value">
                  <Phone size={16} />
                  {recruiter.phone}
                </div>
              </div>

              {/* LOCATION */}
              <div className="recruiter-info-item">
                <span className="info-label">
                  Location
                </span>

                <div className="info-value">
                  <MapPin size={16} />
                  {recruiter.location}
                </div>
              </div>

            </div>

          </div>

          {/* WORK INFORMATION */}
          <div className="recruiter-profile-section">

            <div className="recruiter-section-title">
              <Briefcase size={18} />

              <div>
                <h3>Work Information</h3>
                <p>Your recruiter employment details.</p>
              </div>
            </div>

            <div className="recruiter-info-grid">

              {/* EMPLOYEE ID */}
              <div className="recruiter-info-item">
                <span className="info-label">
                  Recruiter ID
                </span>

                <div className="info-value">
                  <ShieldCheck size={16} />
                  {recruiter.employeeId}
                </div>
              </div>

              {/* DEPARTMENT */}
              <div className="recruiter-info-item">
                <span className="info-label">
                  Department
                </span>

                <div className="info-value">
                  <Building2 size={16} />
                  {recruiter.department}
                </div>
              </div>

              {/* DESIGNATION */}
              <div className="recruiter-info-item">
                <span className="info-label">
                  Designation
                </span>

                <div className="info-value">
                  <Briefcase size={16} />
                  {recruiter.designation}
                </div>
              </div>

              {/* JOINING DATE */}
              <div className="recruiter-info-item">
                <span className="info-label">
                  Joining Date
                </span>

                <div className="info-value">
                  <CalendarDays size={16} />
                  {recruiter.joiningDate}
                </div>
              </div>

              {/* EMPLOYMENT TYPE */}
              <div className="recruiter-info-item">
                <span className="info-label">
                  Employment Type
                </span>

                <div className="info-value">
                  {recruiter.employmentType}
                </div>
              </div>

              {/* STATUS */}
              <div className="recruiter-info-item">
                <span className="info-label">
                  Account Status
                </span>

                <div className="info-value status-value">
                  <span className="status-dot"></span>
                  {recruiter.status}
                </div>
              </div>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default RecruiterProfile;