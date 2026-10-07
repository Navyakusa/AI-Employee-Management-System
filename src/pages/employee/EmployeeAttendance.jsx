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

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function nowTimeLocal() {
  return new Date().toTimeString().slice(0, 8);
}

// The Attendance entity has no workingHours field at all — it's computed
// here on the frontend from checkInTime/checkOutTime (or checkInTime to
// "now" if still checked in), since the backend doesn't provide it.
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
      setToday(todayRecord || null);
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

        await checkOut(today.id, { checkOutTime: nowTimeLocal() });
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
    ? formatWorkingHours(today.checkInTime, today.checkOutTime, now)
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
                        {formatWorkingHours(record.checkInTime, record.checkOutTime, now)}
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
