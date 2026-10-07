import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import {
  getEmployeeDashboardSummary,
  getEmployeeProfile,
  getAttendanceForEmployee,
  checkIn,
  checkOut,
  getMyLeaves,
  getMyLeaveSummary,
  getMyPerformanceSummary,
} from "../../services/employeeService";
import "./EmployeeDashboard.css";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function nowTimeLocal() {
  return new Date().toTimeString().slice(0, 8);
}

// Same as EmployeeAttendance.jsx — the backend has no workingHours field,
// so it's computed here from checkInTime/checkOutTime (or checkInTime to
// "now" if still checked in).
function formatWorkingHours(checkInTime, checkOutTime, now) {
  if (!checkInTime) return "--";

  const [ch, cm, cs] = checkInTime.split(":").map(Number);
  const start = new Date();
  start.setHours(ch, cm, cs || 0, 0);

  let end;
  if (checkOutTime) {
    const [oh, om, os] = checkOutTime.split(":").map(Number);
    end = new Date();
    end.setHours(oh, om, os || 0, 0);
  } else {
    end = now;
  }

  let diffMs = end - start;
  if (diffMs < 0) diffMs = 0;

  const totalMinutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

function EmployeeDashboard() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [leavePreview, setLeavePreview] = useState([]);
  const [leaveSummary, setLeaveSummary] = useState(null);
  const [performanceSummary, setPerformanceSummary] = useState(null);
  const [now, setNow] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [attendanceBusy, setAttendanceBusy] = useState(false);

  const fetchDashboard = async () => {
    try {
      const response = await getEmployeeDashboardSummary();
      const data = response.data?.data || {};
      setSummary(data);
    } catch (err) {
      console.error("Failed to load dashboard summary", err);
    }
  };

  const fetchLeavePreview = async () => {
    try {
      const response = await getMyLeaves();
      const list = response.data?.data || [];
      // Show the 2 most recent — adjust if your backend already sorts
      // this differently or paginates it.
      setLeavePreview(list.slice(0, 2));
    } catch (err) {
      console.error("Failed to load leave preview", err);
    }
  };

  const fetchLeaveSummary = async () => {
    try {
      const response = await getMyLeaveSummary();
      setLeaveSummary(response.data?.data || null);
    } catch (err) {
      console.error("Failed to load leave summary", err);
    }
  };

  const fetchPerformanceSummary = async () => {
    try {
      const response = await getMyPerformanceSummary();
      setPerformanceSummary(response.data?.data || null);
    } catch (err) {
      console.error("Failed to load performance summary", err);
    }
  };

  useEffect(() => {
    Promise.all([
      fetchDashboard(),
      fetchLeavePreview(),
      fetchLeaveSummary(),
      fetchPerformanceSummary(),
    ]).finally(() => setLoading(false));
  }, []);

  // FIXED: don't guess "checked in" from the status text (e.g. it might
  // be "PRESENT" rather than something containing "in"). checkInTime
  // being set with no checkOutTime yet is the reliable signal.
  const checkedIn = Boolean(summary?.checkInTime) && !summary?.checkOutTime;

  useEffect(() => {
    if (!checkedIn) return;
    const interval = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(interval);
  }, [checkedIn]);

  const liveWorkingHours = summary
    ? formatWorkingHours(summary.checkInTime, summary.checkOutTime, now)
    : "--";

  const handleAttendance = async () => {
    setAttendanceBusy(true);

    try {
      // CONFIRMED from AttendanceController.java: there is no per-employee
      // "today" endpoint. GET /attendance/status is a filter-by-status-value
      // endpoint, not "my status" — so today's record has to be found by
      // fetching this employee's full history and filtering client-side.
      const profileRes = await getEmployeeProfile();
      const profileData = profileRes.data?.data || {};
      const employeeId = profileData.id || profileData.employeeId;

      if (!employeeId) {
        throw new Error("Could not resolve numeric employee id from /profile/get.");
      }

      if (checkedIn) {
        const historyRes = await getAttendanceForEmployee(employeeId);
        const list = historyRes.data?.data || [];
        const todayRecords = list.filter(
  (r) => r.attendanceDate === todayIso()
);

// Prefer an active check-in record.
// If none exists, use the latest today's record.
const activeTodayRecord = todayRecords.find(
  (r) => r.checkInTime && !r.checkOutTime
);

const latestTodayRecord = [...todayRecords].sort((a, b) =>
  String(b.checkInTime || "").localeCompare(
    String(a.checkInTime || "")
  )
)[0];

const todayRecord =
  activeTodayRecord || latestTodayRecord || null;

setToday(todayRecord);

        if (todayRecord?.id) {
          await checkOut(todayRecord.id, { checkOutTime: nowTimeLocal() });
        } else {
          console.warn("No today's attendance record found — cannot check out.");
        }
      } else {
        // POST /attendance saves EXACTLY what's sent — it does not derive
        // employeeId/checkInTime from the JWT, so all of this must be
        // supplied here.
        await checkIn({
          employeeId,
          attendanceDate: todayIso(),
          checkInTime: nowTimeLocal(),
          status: "PRESENT",
        });
      }

      await fetchDashboard();
    } catch (err) {
      console.error("Attendance action failed", err);
      alert("Could not update attendance. Please try again.");
    } finally {
      setAttendanceBusy(false);
    }
  };

  if (loading || !summary) {
    return (
      <div className="employee-dashboard-layout">
        <EmployeeSidebar />
        <EmployeeTopbar />
        <main className="employee-dashboard-main">
          <p>Loading dashboard...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="employee-dashboard-layout">
      <EmployeeSidebar />

      <EmployeeTopbar />

      <main className="employee-dashboard-main">

        {/* Header */}
        <header className="employee-dashboard-header">
          <div>
            <h1>Employee Dashboard</h1>
            <p>Welcome back, {summary.name} 👋</p>
          </div>

          <div className="employee-header-profile">
            <div className="employee-header-avatar">
              {summary.name ? summary.name.charAt(0) : "E"}
            </div>

            <div>
              <strong>{summary.name}</strong>
              <span>{summary.designation}</span>
            </div>
          </div>
        </header>

        {/* Welcome Card */}
        <section className="employee-welcome-card">
          <div>
            <span className="employee-welcome-label">
              Welcome back
            </span>

            <h2>{summary.name}</h2>

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

          <div
            className="employee-summary-card"
            onClick={() => navigate("/employee/attendance")}
            style={{ cursor: "pointer" }}
            title="Go to Attendance"
          >
            <div className="employee-summary-icon purple">
              <CalendarDays size={22} />
            </div>

            <div>
              <span>Attendance</span>
              <h3>{summary.attendanceStatus || "--"}</h3>
              <p>Today</p>
            </div>
          </div>

          <div className="employee-summary-card">
            <div className="employee-summary-icon blue">
              <Clock3 size={22} />
            </div>

            <div>
              <span>Working Hours</span>
              <h3>{liveWorkingHours}</h3>
              <p>Today's total</p>
            </div>
          </div>

          <div
            className="employee-summary-card"
            onClick={() => navigate("/employee/leave")}
            style={{ cursor: "pointer" }}
            title="Go to Leave"
          >
            <div className="employee-summary-icon green">
              <FileText size={22} />
            </div>

            <div>
              <span>Leave Balance</span>
              <h3>
                {leaveSummary?.leaveBalance != null
                  ? `${leaveSummary.leaveBalance} Days`
                  : "--"}
              </h3>
              <p>See Leave page</p>
            </div>
          </div>

          <div
            className="employee-summary-card"
            onClick={() => navigate("/employee/performance")}
            style={{ cursor: "pointer" }}
            title="Go to Performance"
          >
            <div className="employee-summary-icon orange">
              <CheckCircle2 size={22} />
            </div>

            <div>
              <span>Performance</span>
              <h3>
                {performanceSummary?.overallScore != null
                  ? `${performanceSummary.overallScore} / 10`
                  : "--"}
              </h3>
              <p>See Performance page</p>
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
              <span>{summary.attendanceStatus || "Not checked in"}</span>
            </div>

            <div className="attendance-details">

              <div>
                <span>Check In</span>
                <strong>{summary.checkInTime || "--"}</strong>
              </div>

              <div>
                <span>Check Out</span>
                <strong>{summary.checkOutTime || "--"}</strong>
              </div>

              <div>
                <span>Working Hours</span>
                <strong>{liveWorkingHours}</strong>
              </div>

            </div>

            <button
              className={
                checkedIn
                  ? "attendance-button checkout"
                  : "attendance-button checkin"
              }
              onClick={handleAttendance}
              disabled={attendanceBusy}
            >
              {checkedIn ? (
                <>
                  <LogOut size={18} />
                  {attendanceBusy ? "Checking Out..." : "Check Out"}
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  {attendanceBusy ? "Checking In..." : "Check In"}
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
                <strong>{summary.employeeCode || summary.employeeId}</strong>
              </div>

              <div className="employee-info-row">
                <span>Department</span>
                <strong>{summary.department}</strong>
              </div>

              <div className="employee-info-row">
                <span>Designation</span>
                <strong>{summary.designation}</strong>
              </div>

              <div className="employee-info-row">
                <span>Reporting Manager</span>
                <strong>{summary.manager}</strong>
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

            {leavePreview.length === 0 ? (
              <p style={{ color: "#9ca3af", fontSize: "13px" }}>
                No leave requests yet.
              </p>
            ) : (
              leavePreview.map((leave) => (
                <div className="employee-leave-item" key={leave.id}>
                  <div>
                    <strong>{leave.leaveType}</strong>
                    <span>
                      {leave.fromDate} - {leave.toDate}
                    </span>
                  </div>

                  <span
                    className={`status-badge ${
                      leave.status?.toLowerCase() === "approved"
                        ? "approved"
                        : "pending"
                    }`}
                  >
                    {leave.status}
                  </span>
                </div>
              ))
            )}

          </div>

          {/* Notifications */}
          <div
            className="employee-dashboard-card"
            onClick={() => navigate("/employee/notifications")}
            style={{ cursor: "pointer" }}
            title="Go to Notifications"
          >

            <div className="employee-card-header">
              <div>
                <h2>Notifications</h2>
                <p>Recent updates</p>
              </div>

              <Bell size={22} />
            </div>

            {(!summary.notifications || summary.notifications.length === 0) ? (
              <p style={{ color: "#9ca3af", fontSize: "13px" }}>
                No recent notifications.
              </p>
            ) : (
              summary.notifications.slice(0, 3).map((notification, index) => (
                <div className="employee-notification-item" key={index}>
                  <div className="notification-icon">
                    <CheckCircle2 size={18} />
                  </div>

                  <div>
                    <strong>
                      {notification.title || "Notification"}
                    </strong>
                    <span>
                      {notification.message || notification.description}
                    </span>
                  </div>
                </div>
              ))
            )}

          </div>

        </section>

      </main>
    </div>
  );
}

export default EmployeeDashboard;
