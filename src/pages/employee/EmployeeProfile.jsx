import React from "react";
import {
  UserRound,
  Mail,
  Phone,
  Building2,
  BriefcaseBusiness,
  CalendarDays,
  MapPin,
  UserCheck,
  BadgeCheck,
  Hash,
  Pencil,
} from "lucide-react";
import EmployeeSidebar from "./EmployeeSidebar";
import EmployeeTopbar from "./EmployeeTopbar";
import "./EmployeeProfile.css";

function EmployeeProfile() {
  const employee = {
    employeeId: "EMP-2026-001",
    name: "Maheshwari",
    email: "maheshwari@example.com",
    phone: "+91 98765 43210",
    department: "Engineering",
    designation: "Software Engineer",
    joiningDate: "15 June 2026",
    reportingManager: "Manager Name",
    location: "Hyderabad",
    employmentType: "Full Time",
    status: "Active",
  };

  return (
    <div className="employee-profile-layout">

      <EmployeeSidebar />

      <EmployeeTopbar />

      <main className="employee-profile-main">

        {/* =========================
            PAGE HEADER
        ========================= */}

        <div className="employee-profile-header">

          <div>
            <span className="employee-page-label">
              EMPLOYEE WORKSPACE
            </span>

            <h1>My Profile</h1>

            <p>
              View your employee information and profile details.
            </p>
          </div>

          <button className="edit-profile-button">
            <Pencil size={16} />
            Edit Profile
          </button>

        </div>


        {/* =========================
            PROFILE HERO
        ========================= */}

        <section className="employee-profile-hero">

          <div className="profile-avatar-large">
            {employee.name.charAt(0)}
          </div>

          <div className="profile-hero-info">

            <h2>
              {employee.name}
            </h2>

            <p>
              {employee.designation}
            </p>

            <span>
              {employee.department}
            </span>

          </div>

          <div className="profile-active-badge">
            <BadgeCheck size={15} />
            {employee.status}
          </div>

        </section>


        {/* =========================
            EMPLOYEE INFORMATION
        ========================= */}

        <section className="employee-profile-card">

          <div className="profile-card-header">

            <div>
              <h2>Employee Information</h2>

              <p>
                Your employment and organizational details
              </p>
            </div>

            <UserRound size={21} />

          </div>


          <div className="profile-details-grid">

            {/* Employee ID */}
            <div className="profile-detail">

              <div className="profile-detail-icon">
                <Hash size={18} />
              </div>

              <div>
                <span>Employee ID</span>
                <strong>{employee.employeeId}</strong>
              </div>

            </div>


            {/* Name */}
            <div className="profile-detail">

              <div className="profile-detail-icon">
                <UserRound size={18} />
              </div>

              <div>
                <span>Name</span>
                <strong>{employee.name}</strong>
              </div>

            </div>


            {/* Email */}
            <div className="profile-detail">

              <div className="profile-detail-icon">
                <Mail size={18} />
              </div>

              <div>
                <span>Email</span>
                <strong>{employee.email}</strong>
              </div>

            </div>


            {/* Phone */}
            <div className="profile-detail">

              <div className="profile-detail-icon">
                <Phone size={18} />
              </div>

              <div>
                <span>Phone</span>
                <strong>{employee.phone}</strong>
              </div>

            </div>


            {/* Department */}
            <div className="profile-detail">

              <div className="profile-detail-icon">
                <Building2 size={18} />
              </div>

              <div>
                <span>Department</span>
                <strong>{employee.department}</strong>
              </div>

            </div>


            {/* Designation */}
            <div className="profile-detail">

              <div className="profile-detail-icon">
                <BriefcaseBusiness size={18} />
              </div>

              <div>
                <span>Designation</span>
                <strong>{employee.designation}</strong>
              </div>

            </div>


            {/* Joining Date */}
            <div className="profile-detail">

              <div className="profile-detail-icon">
                <CalendarDays size={18} />
              </div>

              <div>
                <span>Joining Date</span>
                <strong>{employee.joiningDate}</strong>
              </div>

            </div>


            {/* Reporting Manager */}
            <div className="profile-detail">

              <div className="profile-detail-icon">
                <UserCheck size={18} />
              </div>

              <div>
                <span>Reporting Manager</span>
                <strong>{employee.reportingManager}</strong>
              </div>

            </div>


            {/* Location */}
            <div className="profile-detail">

              <div className="profile-detail-icon">
                <MapPin size={18} />
              </div>

              <div>
                <span>Location</span>
                <strong>{employee.location}</strong>
              </div>

            </div>


            {/* Employment Type */}
            <div className="profile-detail">

              <div className="profile-detail-icon">
                <BriefcaseBusiness size={18} />
              </div>

              <div>
                <span>Employment Type</span>
                <strong>{employee.employmentType}</strong>
              </div>

            </div>


            {/* Status */}
            <div className="profile-detail">

              <div className="profile-detail-icon">
                <BadgeCheck size={18} />
              </div>

              <div>
                <span>Status</span>

                <strong className="profile-status">
                  <span></span>
                  {employee.status}
                </strong>

              </div>

            </div>

          </div>

        </section>


        {/* =========================
            CONTACT CARD
        ========================= */}

        <section className="profile-contact-card">

          <div className="profile-contact-icon">
            <Mail size={20} />
          </div>

          <div>

            <h3>Contact Information</h3>

            <p>
              For changes to your employee information,
              please contact your HR administrator.
            </p>

          </div>

        </section>

      </main>

    </div>
  );
}

export default EmployeeProfile;