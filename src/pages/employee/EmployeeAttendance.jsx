import React, { useState } from "react";
import {
  CalendarDays,
  Clock3,
  LogIn,
  LogOut,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import EmployeeSidebar from "./EmployeeSidebar";
import EmployeeTopbar from "./EmployeeTopbar";
import "./EmployeeAttendance.css";

function EmployeeAttendance() {
  const [checkedIn, setCheckedIn] = useState(true);

  const attendanceHistory = [
    {
      date: "16 Sep 2026",
      checkIn: "09:32 AM",
      checkOut: "--",
      workingHours: "4h 25m",
      status: "Present",
    },
    {
      date: "15 Sep 2026",
      checkIn: "09:18 AM",
      checkOut: "06:12 PM",
      workingHours: "8h 54m",
      status: "Present",
    },
    {
      date: "14 Sep 2026",
      checkIn: "09:47 AM",
      checkOut: "06:05 PM",
      workingHours: "8h 18m",
      status: "Late",
    },
    {
      date: "11 Sep 2026",
      checkIn: "09:21 AM",
      checkOut: "06:10 PM",
      workingHours: "8h 49m",
      status: "Present",
    },
    {
      date: "10 Sep 2026",
      checkIn: "09:10 AM",
      checkOut: "05:45 PM",
      workingHours: "8h 35m",
      status: "Early Departure",
    },
  ];

  const handleAttendance = () => {
    setCheckedIn((previous) => !previous);
  };

  return (
    <div className="employee-attendance-layout">

      <EmployeeSidebar />

      <EmployeeTopbar />

      <main className="employee-attendance-main">

        {/* =========================
            PAGE HEADER
        ========================= */}
        <div className="employee-attendance-header">

          <div>
            <span className="employee-page-label">
              EMPLOYEE WORKSPACE
            </span>

            <h1>Attendance</h1>

            <p>
              Track your daily attendance and working hours.
            </p>
          </div>

          <div className="employee-attendance-header-icon">
            <CalendarDays size={25} />
          </div>

        </div>


        {/* =========================
            SUMMARY CARDS
        ========================= */}
        <section className="employee-attendance-summary">

          {/* Today's Status */}
          <div className="attendance-summary-card">

            <div className="attendance-summary-icon purple">
              <CheckCircle2 size={21} />
            </div>

            <div>
              <span>Today's Status</span>
              <strong>
                {checkedIn ? "Present" : "Checked Out"}
              </strong>
              <small>16 Sep 2026</small>
            </div>

          </div>


          {/* Check In */}
          <div className="attendance-summary-card">

            <div className="attendance-summary-icon blue">
              <LogIn size={21} />
            </div>

            <div>
              <span>Check In</span>
              <strong>09:32 AM</strong>
              <small>Today's check in</small>
            </div>

          </div>


          {/* Working Hours */}
          <div className="attendance-summary-card">

            <div className="attendance-summary-icon green">
              <Clock3 size={21} />
            </div>

            <div>
              <span>Working Hours</span>
              <strong>
                {checkedIn ? "4h 25m" : "8h 39m"}
              </strong>
              <small>Today's total</small>
            </div>

          </div>


          {/* Monthly Attendance */}
          <div className="attendance-summary-card">

            <div className="attendance-summary-icon orange">
              <CalendarDays size={21} />
            </div>

            <div>
              <span>Monthly Attendance</span>
              <strong>94%</strong>
              <small>September 2026</small>
            </div>

          </div>

        </section>


        {/* =========================
            TODAY'S ATTENDANCE
        ========================= */}
        <section className="employee-attendance-today">

          <div className="attendance-section-heading">

            <div>
              <h2>Today's Attendance</h2>
              <p>
                Your attendance details for today
              </p>
            </div>

            <div className="attendance-live-status">
              <span></span>
              {checkedIn ? "Checked In" : "Checked Out"}
            </div>

          </div>


          <div className="attendance-today-details">

            {/* Check In */}
            <div className="attendance-time-box">

              <div className="attendance-time-icon">
                <LogIn size={20} />
              </div>

              <div>
                <span>Check In</span>
                <strong>09:32 AM</strong>
              </div>

            </div>


            {/* Check Out */}
            <div className="attendance-time-box">

              <div className="attendance-time-icon">
                <LogOut size={20} />
              </div>

              <div>
                <span>Check Out</span>
                <strong>
                  {checkedIn ? "--" : "06:11 PM"}
                </strong>
              </div>

            </div>


            {/* Working Hours */}
            <div className="attendance-time-box">

              <div className="attendance-time-icon">
                <Clock3 size={20} />
              </div>

              <div>
                <span>Working Hours</span>
                <strong>
                  {checkedIn ? "4h 25m" : "8h 39m"}
                </strong>
              </div>

            </div>

          </div>


          {/* Check In / Check Out Button */}
          <button
            type="button"
            className={
              checkedIn
                ? "attendance-action-button checkout"
                : "attendance-action-button checkin"
            }
            onClick={handleAttendance}
          >

            {checkedIn ? (
              <>
                <LogOut size={19} />
                Check Out
              </>
            ) : (
              <>
                <LogIn size={19} />
                Check In
              </>
            )}

          </button>

        </section>


        {/* =========================
            ATTENDANCE HISTORY
        ========================= */}
        <section className="employee-attendance-history">

          <div className="attendance-section-heading">

            <div>
              <h2>Attendance History</h2>
              <p>
                Your recent attendance records
              </p>
            </div>

            <button className="attendance-filter-button">
              <CalendarDays size={16} />
              September 2026
            </button>

          </div>


          <div className="attendance-table-wrapper">

            <table className="attendance-table">

              <thead>
                <tr>
                  <th>Date</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Working Hours</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>

                {attendanceHistory.map((record, index) => (

                  <tr key={index}>

                    <td>
                      <strong>{record.date}</strong>
                    </td>

                    <td>
                      {record.checkIn}
                    </td>

                    <td>
                      {record.checkOut}
                    </td>

                    <td>
                      {record.workingHours}
                    </td>

                    <td>

                      <span
                        className={`attendance-status-badge ${record.status
                          .toLowerCase()
                          .replace(" ", "-")}`}
                      >

                        {record.status === "Present" && (
                          <CheckCircle2 size={13} />
                        )}

                        {(record.status === "Late" ||
                          record.status === "Early Departure") && (
                          <AlertCircle size={13} />
                        )}

                        {record.status}

                      </span>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </section>

      </main>

    </div>
  );
}

export default EmployeeAttendance;