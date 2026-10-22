import React, { useEffect, useState } from "react";
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
import {
  getEmployeeProfile,
  getAttendanceForEmployee,
  checkIn,
  checkOut,
} from "../../services/employeeService";
import "./EmployeeAttendance.css";

// Today's date as "YYYY-MM-DD" in the user's LOCAL time zone
// (toISOString() is UTC and gave yesterday's date before 05:30 IST).
function todayIso() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// A day can have several records (re-check-ins). Use the one still open
// (checked in, not out), otherwise the latest one of the day, so the
// check-out is saved on the right record.
function pickTodayRecord(list) {
  const todays = list.filter((r) => r.attendanceDate === todayIso());
  const open = todays.filter((r) => r.checkInTime && !r.checkOutTime);
  const byNewest = (a, b) => (Number(b.id) || 0) - (Number(a.id) || 0);
  return open.sort(byNewest)[0] || todays.sort(byNewest)[0] || null;
}

function nowTimeLocal() {
  return new Date().toTimeString().slice(0, 8);
}

// Office hours: 10:00 AM to 6:00 PM. If an employee never checks out, the
// day is counted up to OFFICE_END_TIME (6 PM) automatically.
const OFFICE_END_TIME = "18:00:00";

// Local Date for "YYYY-MM-DD" + "HH:MM[:SS]"; null if malformed.
function toLocalDateTime(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;
  const [y, mo, d] = String(dateStr).slice(0, 10).split("-").map(Number);
  const [h, mi, s] = String(timeStr).split(":").map((part) => parseInt(part, 10));
  if ([y, mo, d, h, mi].some((n) => Number.isNaN(n))) return null;
  return new Date(y, mo - 1, d, h, mi, Number.isFinite(s) ? s : 0, 0);
}

// The Attendance entity has no workingHours field at all — it's computed
// here on the frontend, on the record's OWN date:
//   checked out                -> check-out minus check-in
//   not checked out, past day  -> check-in up to 6 PM that day
//   not checked out, today     -> check-in up to now, stopping at 6 PM
function formatWorkingHours(checkInTime, checkOutTime, now, attendanceDate) {
  if (!checkInTime) return "--";

  const day = attendanceDate || todayIso();
  const start = toLocalDateTime(day, checkInTime);
  if (!start) return "--";

  let end;
  if (checkOutTime) {
    end = toLocalDateTime(day, checkOutTime);
    if (!end) return "--";
  } else {
    const officeEnd = toLocalDateTime(day, OFFICE_END_TIME);
    end = now < officeEnd ? now : officeEnd;
  }

  const totalMinutes = Math.floor(Math.max(0, end - start) / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

function EmployeeAttendance() {
  const [employeeId, setEmployeeId] = useState(null);
  const [today, setToday] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [now, setNow] = useState(new Date());
  const [showMonthFilter, setShowMonthFilter] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(""); // "YYYY-MM", empty = show all

  const fetchAll = async () => {
    setError("");

    try {
      const profileRes = await getEmployeeProfile();
      const profileData = profileRes.data?.data || {};
      const id = profileData.id || profileData.employeeId;

      if (!id) {
        setError(
          "Could not determine your numeric employee id from /profile/get."
        );
        setLoading(false);
        return;
      }

      setEmployeeId(id);

      const historyRes = await getAttendanceForEmployee(id);
      const list = historyRes.data?.data || [];

      setHistory(list);

      setToday(pickTodayRecord(list));
    } catch (err) {
      console.error("Failed to load attendance data", err);
      setError("Failed to load attendance data. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const checkedIn = Boolean(today?.checkInTime && !today?.checkOutTime);

  // Tick every 30s so "Working Hours" keeps counting up live while checked in.
  useEffect(() => {
    if (!checkedIn) return;
    const interval = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(interval);
  }, [checkedIn]);

  const handleAttendance = async () => {
    setBusy(true);
    setError("");

    try {
      if (checkedIn) {
        if (!today?.id) {
          throw new Error("No attendance record id available for checkout.");
        }

        // Send the WHOLE record, not just checkOutTime: the backend's
        // PUT /attendance/{id} copies every field, so a partial body
        // wiped employeeId/date/check-in and the record vanished.
        await checkOut(today.id, { ...today, checkOutTime: nowTimeLocal() });
      } else {
        await checkIn({
          employeeId,
          attendanceDate: todayIso(),
          checkInTime: nowTimeLocal(),
          status: "PRESENT",
        });
      }

      await fetchAll();
    } catch (err) {
      console.error("Attendance action failed", err);
      setError("Could not update attendance. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const todaysWorkingHours = today
    ? formatWorkingHours(today.checkInTime, today.checkOutTime, now, today.attendanceDate)
    : "--";

  const filteredHistory = selectedMonth
    ? history.filter((r) => r.attendanceDate.startsWith(selectedMonth))
    : history;

  const sortedHistory = [...filteredHistory].sort((a, b) =>
    a.attendanceDate < b.attendanceDate ? 1 : -1
  );

  if (loading) {
    return (
      <div className="employee-attendance-layout">
        <EmployeeSidebar />
        <EmployeeTopbar />
        <main className="employee-attendance-main">
          <p>Loading attendance...</p>
        </main>
      </div>
    );
  }

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

          <div style={{ position: "relative" }}>
            <button
              type="button"
              className="employee-attendance-header-icon"
              style={{ border: "none", cursor: "pointer" }}
              onClick={() => setShowMonthFilter((prev) => !prev)}
              title="Filter attendance history by month"
            >
              <CalendarDays size={25} />
            </button>

            {showMonthFilter && (
              <div
                style={{
                  position: "absolute",
                  top: "60px",
                  right: 0,
                  background: "white",
                  border: "1px solid #e4e7ec",
                  borderRadius: "10px",
                  boxShadow: "0 10px 30px rgba(16,24,40,0.15)",
                  padding: "16px",
                  zIndex: 50,
                  width: "220px",
                }}
              >
                <label
                  style={{
                    display: "block",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#344054",
                    marginBottom: "8px",
                  }}
                >
                  Filter history by month
                </label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    border: "1px solid #d0d5dd",
                    borderRadius: "8px",
                    padding: "8px 10px",
                    fontSize: "13px",
                    marginBottom: "10px",
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMonth("");
                    setShowMonthFilter(false);
                  }}
                  style={{
                    width: "100%",
                    border: "1px solid #d0d5dd",
                    background: "white",
                    color: "#475467",
                    borderRadius: "8px",
                    padding: "8px",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Clear filter
                </button>
              </div>
            )}
          </div>

        </div>

        {error && (
          <div
            style={{
              background: "#fef3f2",
              border: "1px solid #fda29b",
              color: "#b42318",
              borderRadius: "8px",
              padding: "12px 16px",
              marginBottom: "20px",
              fontSize: "13px",
            }}
          >
            {error}
          </div>
        )}


        {/* =========================
            SUMMARY CARDS
        ========================= */}
        <section className="employee-attendance-summary">

          <div className="attendance-summary-card">
            <div className="attendance-summary-icon purple">
              <CheckCircle2 size={21} />
            </div>
            <div>
              <span>Today's Status</span>
              <strong>{today?.status || (checkedIn ? "Present" : "Not Checked In")}</strong>
              <small>{today?.attendanceDate || todayIso()}</small>
            </div>
          </div>

          <div className="attendance-summary-card">
            <div className="attendance-summary-icon blue">
              <LogIn size={21} />
            </div>
            <div>
              <span>Check In</span>
              <strong>{today?.checkInTime || "--"}</strong>
              <small>Today's check in</small>
            </div>
          </div>

          <div className="attendance-summary-card">
            <div className="attendance-summary-icon green">
              <Clock3 size={21} />
            </div>
            <div>
              <span>Working Hours</span>
              <strong>{todaysWorkingHours}</strong>
              <small>Today's total</small>
            </div>
          </div>

          <div className="attendance-summary-card">
            <div className="attendance-summary-icon orange">
              <CalendarDays size={21} />
            </div>
            <div>
              <span>Monthly Attendance</span>
              {/* Available via GET /attendance/statistics — not wired
                  yet since its response shape isn't confirmed. */}
              <strong>--</strong>
              <small>This month</small>
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
              <p>Your attendance details for today</p>
            </div>

            <div className="attendance-live-status">
              <span></span>
              {checkedIn ? "Checked In" : today?.checkOutTime ? "Checked Out" : "Not Checked In"}
            </div>
          </div>

          <div className="attendance-today-details">

            <div className="attendance-time-box">
              <div className="attendance-time-icon"><LogIn size={20} /></div>
              <div>
                <span>Check In</span>
                <strong>{today?.checkInTime || "--"}</strong>
              </div>
            </div>

            <div className="attendance-time-box">
              <div className="attendance-time-icon"><LogOut size={20} /></div>
              <div>
                <span>Check Out</span>
                <strong>{today?.checkOutTime || "--"}</strong>
              </div>
            </div>

            <div className="attendance-time-box">
              <div className="attendance-time-icon"><Clock3 size={20} /></div>
              <div>
                <span>Working Hours</span>
                <strong>{todaysWorkingHours}</strong>
              </div>
            </div>

          </div>

          <button
            type="button"
            className={
              checkedIn
                ? "attendance-action-button checkout"
                : "attendance-action-button checkin"
            }
            onClick={handleAttendance}
            disabled={busy || Boolean(today?.checkOutTime)}
          >
            {checkedIn ? (
              <>
                <LogOut size={19} />
                {busy ? "Checking Out..." : "Check Out"}
              </>
            ) : (
              <>
                <LogIn size={19} />
                {busy ? "Checking In..." : "Check In"}
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
                {selectedMonth
                  ? `Showing records for ${selectedMonth}`
                  : "Your recent attendance records"}
              </p>
            </div>
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
                {sortedHistory.length === 0 ? (
                  <tr>
                    <td colSpan={5}>No attendance records for this period.</td>
                  </tr>
                ) : (
                  sortedHistory.map((record) => (
                    <tr key={record.id}>
                      <td><strong>{record.attendanceDate}</strong></td>
                      <td>{record.checkInTime || "--"}</td>
                      <td>{record.checkOutTime || "--"}</td>
                      <td>
                        {formatWorkingHours(record.checkInTime, record.checkOutTime, now, record.attendanceDate)}
                      </td>
                      <td>
                        <span
                          className={`attendance-status-badge ${(record.status || "")
                            .toLowerCase()
                            .replace(" ", "-")}`}
                        >
                          {record.status === "Present" && <CheckCircle2 size={13} />}
                          {(record.status === "Late" ||
                            record.status === "Early Departure") && (
                            <AlertCircle size={13} />
                          )}
                          {record.status || "--"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </section>

      </main>

    </div>
  );
}

export default EmployeeAttendance;
