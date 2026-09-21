import React, { useState } from "react";
import {
  CalendarDays,
  Clock3,
  FileText,
  UserRound,
  CheckCircle2,
  Bell,
  LogIn,
  LogOut,
} from "lucide-react";

import EmployeeTopbar from "./EmployeeTopbar";
import EmployeeSidebar from "./EmployeeSidebar";
import "./EmployeeDashboard.css";

function EmployeeDashboard() {
  const [checkedIn, setCheckedIn] = useState(true);

  const employee = {
    name: "Maheshwari",
    employeeId: "EMP001",
    designation: "Software Engineer",
    department: "Engineering",
    manager: "HR Manager",
  };

  const handleAttendance = () => {
    setCheckedIn((prev) => !prev);
  };

  return (
    <div className="employee-dashboard-layout">
      <EmployeeSidebar />

      <EmployeeTopbar /> 
      
      <main className="employee-dashboard-main">

        {/* Header */}
        <header className="employee-dashboard-header">
          <div>
            <h1>Employee Dashboard</h1>
            <p>Welcome back, {employee.name} 👋</p>
          </div>

          <div className="employee-header-profile">
            <div className="employee-header-avatar">
              {employee.name.charAt(0)}
            </div>

            <div>
              <strong>{employee.name}</strong>
              <span>{employee.designation}</span>
            </div>
          </div>
        </header>

        {/* Welcome Card */}
        <section className="employee-welcome-card">
          <div>
            <span className="employee-welcome-label">
              Welcome back
            </span>

            <h2>{employee.name}</h2>

            <p>
              Here's an overview of your work information,
              attendance and recent activities.
            </p>
          </div>

          <div className="employee-welcome-icon">
            <UserRound size={42} />
          </div>
        </section>

        {/* Summary Cards */}
        <section className="employee-summary-grid">

          <div className="employee-summary-card">
            <div className="employee-summary-icon purple">
              <CalendarDays size={22} />
            </div>

            <div>
              <span>Attendance</span>
              <h3>Present</h3>
              <p>Today</p>
            </div>
          </div>

          <div className="employee-summary-card">
            <div className="employee-summary-icon blue">
              <Clock3 size={22} />
            </div>

            <div>
              <span>Working Hours</span>
              <h3>8h 39m</h3>
              <p>Today's total</p>
            </div>
          </div>

          <div className="employee-summary-card">
            <div className="employee-summary-icon green">
              <FileText size={22} />
            </div>

            <div>
              <span>Leave Balance</span>
              <h3>12 Days</h3>
              <p>Available</p>
            </div>
          </div>

          <div className="employee-summary-card">
            <div className="employee-summary-icon orange">
              <CheckCircle2 size={22} />
            </div>

            <div>
              <span>Performance</span>
              <h3>8.2 / 10</h3>
              <p>Overall score</p>
            </div>
          </div>

        </section>

        {/* Main Grid */}
        <section className="employee-dashboard-content">

          {/* Attendance */}
          <div className="employee-dashboard-card attendance-card">

            <div className="employee-card-header">
              <div>
                <h2>Today's Attendance</h2>
                <p>Track your working hours</p>
              </div>

              <CalendarDays size={22} />
            </div>

            <div className="attendance-status">
              <div className="attendance-status-dot"></div>
              <span>{checkedIn ? "Checked In" : "Checked Out"}</span>
            </div>

            <div className="attendance-details">

              <div>
                <span>Check In</span>
                <strong>09:32 AM</strong>
              </div>

              <div>
                <span>Check Out</span>
                <strong>{checkedIn ? "--" : "06:41 PM"}</strong>
              </div>

              <div>
                <span>Working Hours</span>
                <strong>{checkedIn ? "4h 25m" : "8h 39m"}</strong>
              </div>

            </div>

            <button
              className={
                checkedIn
                  ? "attendance-button checkout"
                  : "attendance-button checkin"
              }
              onClick={handleAttendance}
            >
              {checkedIn ? (
                <>
                  <LogOut size={18} />
                  Check Out
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  Check In
                </>
              )}
            </button>

          </div>

          {/* Employee Information */}
          <div className="employee-dashboard-card">

            <div className="employee-card-header">
              <div>
                <h2>My Information</h2>
                <p>Your current employee details</p>
              </div>

              <UserRound size={22} />
            </div>

            <div className="employee-info-list">

              <div className="employee-info-row">
                <span>Employee ID</span>
                <strong>{employee.employeeId}</strong>
              </div>

              <div className="employee-info-row">
                <span>Department</span>
                <strong>{employee.department}</strong>
              </div>

              <div className="employee-info-row">
                <span>Designation</span>
                <strong>{employee.designation}</strong>
              </div>

              <div className="employee-info-row">
                <span>Reporting Manager</span>
                <strong>{employee.manager}</strong>
              </div>

            </div>

          </div>

        </section>

        {/* Bottom Section */}
        <section className="employee-bottom-grid">

          {/* Leave */}
          <div className="employee-dashboard-card">

            <div className="employee-card-header">
              <div>
                <h2>Recent Leave Requests</h2>
                <p>Your latest leave activity</p>
              </div>

              <FileText size={22} />
            </div>

            <div className="employee-leave-item">
              <div>
                <strong>Casual Leave</strong>
                <span>20 Sep - 21 Sep</span>
              </div>

              <span className="status-badge pending">
                Pending
              </span>
            </div>

            <div className="employee-leave-item">
              <div>
                <strong>Sick Leave</strong>
                <span>05 Sep</span>
              </div>

              <span className="status-badge approved">
                Approved
              </span>
            </div>

          </div>

          {/* Notifications */}
          <div className="employee-dashboard-card">

            <div className="employee-card-header">
              <div>
                <h2>Notifications</h2>
                <p>Recent updates</p>
              </div>

              <Bell size={22} />
            </div>

            <div className="employee-notification-item">
              <div className="notification-icon">
                <CheckCircle2 size={18} />
              </div>

              <div>
                <strong>Leave request approved</strong>
                <span>Your leave request was approved.</span>
              </div>
            </div>

            <div className="employee-notification-item">
              <div className="notification-icon">
                <FileText size={18} />
              </div>

              <div>
                <strong>New document available</strong>
                <span>A new employee document is available.</span>
              </div>
            </div>

          </div>

        </section>

      </main>
    </div>
  );
}

export default EmployeeDashboard;