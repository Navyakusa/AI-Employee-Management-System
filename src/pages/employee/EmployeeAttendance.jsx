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
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function nowTimeLocal() {
  return new Date().toTimeString().slice(0, 8);
}

/*
 * Calculate working hours.
 *
 * Rules:
 *
 * 1. No check-in:
 *      "--"
 *
 * 2. Today + employee is checked in:
 *      Check-in → current time
 *
 * 3. Today + employee has checked out:
 *      Check-in → actual checkout
 *
 * 4. Previous day + checkout exists:
 *      Check-in → actual checkout
 *
 * 5. Previous day + no checkout:
 *      Check-in → 6:00 PM
 *
 * The attendance date is always used when creating
 * the start/end Date objects so that previous days
 * are not accidentally calculated using today's date.
 */
function formatWorkingHours(
  attendanceDate,
  checkInTime,
  checkOutTime,
  now
) {
  if (!checkInTime || !attendanceDate) {
    return "--";
  }

  const [ch, cm, cs = 0] = String(checkInTime)
    .split(":")
    .map(Number);

  if (
    Number.isNaN(ch) ||
    Number.isNaN(cm) ||
    Number.isNaN(cs)
  ) {
    return "--";
  }

  /*
   * Create the check-in Date using the actual
   * attendance date.
   */
  const start = new Date(`${attendanceDate}T00:00:00`);

  start.setHours(ch, cm, cs, 0);

  let end;

  /*
   * If checkout exists, use the actual checkout time.
   */
  if (checkOutTime) {
    const [oh, om, os = 0] = String(checkOutTime)
      .split(":")
      .map(Number);

    if (
      Number.isNaN(oh) ||
      Number.isNaN(om) ||
      Number.isNaN(os)
    ) {
      return "--";
    }

    end = new Date(`${attendanceDate}T00:00:00`);

    end.setHours(oh, om, os, 0);
  } else {
    /*
     * No checkout.
     *
     * If this is today's attendance:
     * calculate live hours until current time.
     *
     * If this is a previous day:
     * use 6:00 PM as the end of the working day.
     */
    const currentDate = todayIso();

    if (attendanceDate === currentDate) {
      end = now;
    } else {
      end = new Date(`${attendanceDate}T18:00:00`);
    }
  }

  let diffMs = end.getTime() - start.getTime();

  /*
   * Prevent negative working hours.
   */
  if (diffMs < 0) {
    diffMs = 0;
  }

  const totalMinutes = Math.floor(diffMs / 60000);

  const hours = Math.floor(totalMinutes / 60);

  const minutes = totalMinutes % 60;

  return `${hours}h ${minutes}m`;
}

/*
 * Normalize attendance status so the UI can handle:
 *
 * PRESENT
 * Present
 * present
 * LATE
 * Late
 * etc.
 */
function normalizeStatus(status) {
  return String(status || "")
    .trim()
    .toUpperCase();
}

/*
 * Return the CSS class for the status badge.
 */
function getStatusClass(status) {
  const normalized = normalizeStatus(status);

  if (normalized === "PRESENT") {
    return "present";
  }

  if (normalized === "LATE") {
    return "late";
  }

  if (
    normalized === "EARLY DEPARTURE" ||
    normalized === "EARLY_DEPARTURE"
  ) {
    return "early-departure";
  }

  if (normalized === "ABSENT") {
    return "absent";
  }

  return "";
}

/*
 * Return the icon for the status.
 */
function getStatusIcon(status) {
  const normalized = normalizeStatus(status);

  if (normalized === "PRESENT") {
    return <CheckCircle2 size={13} />;
  }

  if (
    normalized === "LATE" ||
    normalized === "EARLY DEPARTURE" ||
    normalized === "EARLY_DEPARTURE"
  ) {
    return <AlertCircle size={13} />;
  }

  return null;
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
  const [selectedMonth, setSelectedMonth] = useState("");

  /*
   * Fetch employee profile + attendance records.
   */
  const fetchAll = async () => {
    setError("");

    try {
      /*
       * Get employee profile.
       */
      const profileRes = await getEmployeeProfile();

      const profileData =
        profileRes.data?.data || {};

      const id =
        profileData.id ||
        profileData.employeeId;

      if (!id) {
        setError(
          "Could not determine your numeric employee id from /profile/get."
        );

        setLoading(false);

        return;
      }

      setEmployeeId(id);

      /*
       * Get employee attendance history.
       */
      const historyRes =
        await getAttendanceForEmployee(id);

      const list =
        historyRes.data?.data || [];

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


      /*
       * Reset current time after API response.
       *
       * This makes sure working hours are calculated
       * using the actual current time when the data
       * arrives.
       */
      setNow(new Date());
    } catch (err) {
      console.error(
        "Failed to load attendance data",
        err
      );

      setError(
        "Failed to load attendance data. See console for details."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * Initial load.
   */
  useEffect(() => {
    fetchAll();
  }, []);

  /*
   * Employee is currently checked in when:
   *
   * check-in exists
   * AND
   * check-out does not exist.
   */
  const checkedIn = Boolean(
    today?.checkInTime &&
      !today?.checkOutTime
  );

  /*
   * Keep the current working hours live.
   *
   * Every 30 seconds:
   * - update current time
   * - refresh attendance if currently checked in
   */
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());

      if (checkedIn) {
        fetchAll();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [checkedIn]);

  /*
   * Handle Check In / Check Out.
   */
  const handleAttendance = async () => {
    setBusy(true);
    setError("");

    try {
      if (checkedIn) {
        /*
         * CHECK OUT
         */
        if (!today?.id) {
          throw new Error(
            "No attendance record id available for checkout."
          );
        }

        await checkOut(today.id, {
          checkOutTime: nowTimeLocal(),
        });
      } else {
        /*
         * CHECK IN
         */
        await checkIn({
          employeeId,
          attendanceDate: todayIso(),
          checkInTime: nowTimeLocal(),
          status: "PRESENT",
        });
      }

      /*
       * Reload data after check-in/check-out.
       */
      await fetchAll();
    } catch (err) {
      console.error(
        "Attendance action failed",
        err
      );

      setError(
        "Could not update attendance. Please try again."
      );
    } finally {
      setBusy(false);
    }
  };

  /*
   * Today's working hours.
   */
  const todaysWorkingHours = today
    ? formatWorkingHours(
        today.attendanceDate,
        today.checkInTime,
        today.checkOutTime,
        now
      )
    : "--";

  /*
   * Apply month filter.
   */
  const filteredHistory = selectedMonth
    ? history.filter((record) =>
        String(record.attendanceDate || "")
          .startsWith(selectedMonth)
      )
    : history;

  /*
   * Sort newest attendance first.
   */
  const sortedHistory = [...filteredHistory].sort(
    (a, b) =>
      String(b.attendanceDate || "").localeCompare(
        String(a.attendanceDate || "")
      )
  );

  /*
   * Loading screen.
   */
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

      {/* SIDEBAR */}
      <EmployeeSidebar />

      {/* TOPBAR */}
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
              Track your daily attendance and
              working hours.
            </p>
          </div>

          {/* MONTH FILTER */}
          <div
            style={{
              position: "relative",
            }}
          >

            <button
              type="button"
              className="employee-attendance-header-icon"
              style={{
                border: "none",
                cursor: "pointer",
              }}
              onClick={() =>
                setShowMonthFilter(
                  (prev) => !prev
                )
              }
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
                  border:
                    "1px solid #e4e7ec",
                  borderRadius: "10px",
                  boxShadow:
                    "0 10px 30px rgba(16,24,40,0.15)",
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
                  onChange={(e) =>
                    setSelectedMonth(
                      e.target.value
                    )
                  }
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    border:
                      "1px solid #d0d5dd",
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
                    border:
                      "1px solid #d0d5dd",
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

        {/* ERROR */}
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

          {/* TODAY'S STATUS */}
          <div className="attendance-summary-card">

            <div className="attendance-summary-icon purple">
              <CheckCircle2 size={21} />
            </div>

            <div>

              <span>Today's Status</span>

              <strong>
                {today?.status ||
                  (checkedIn
                    ? "Present"
                    : "Not Checked In")}
              </strong>

              <small>
                {today?.attendanceDate ||
                  todayIso()}
              </small>

            </div>

          </div>

          {/* CHECK IN */}
          <div className="attendance-summary-card">

            <div className="attendance-summary-icon blue">
              <LogIn size={21} />
            </div>

            <div>

              <span>Check In</span>

              <strong>
                {today?.checkInTime || "--"}
              </strong>

              <small>
                Today's check in
              </small>

            </div>

          </div>

          {/* WORKING HOURS */}
          <div className="attendance-summary-card">

            <div className="attendance-summary-icon green">
              <Clock3 size={21} />
            </div>

            <div>

              <span>Working Hours</span>

              <strong>
                {todaysWorkingHours}
              </strong>

              <small>
                Today's total
              </small>

            </div>

          </div>

          {/* MONTHLY ATTENDANCE */}
          <div className="attendance-summary-card">

            <div className="attendance-summary-icon orange">
              <CalendarDays size={21} />
            </div>

            <div>

              <span>Monthly Attendance</span>

              <strong>--</strong>

              <small>
                This month
              </small>

            </div>

          </div>

        </section>

        {/* =========================
            TODAY'S ATTENDANCE
        ========================= */}

        <section className="employee-attendance-today">

          <div className="attendance-section-heading">

            <div>

              <h2>
                Today's Attendance
              </h2>

              <p>
                Your attendance details for today
              </p>

            </div>

            <div className="attendance-live-status">

              <span></span>

              {checkedIn
                ? "Checked In"
                : today?.checkOutTime
                ? "Checked Out"
                : "Not Checked In"}

            </div>

          </div>

          <div className="attendance-today-details">

            {/* CHECK IN */}
            <div className="attendance-time-box">

              <div className="attendance-time-icon">
                <LogIn size={20} />
              </div>

              <div>

                <span>
                  Check In
                </span>

                <strong>
                  {today?.checkInTime || "--"}
                </strong>

              </div>

            </div>

            {/* CHECK OUT */}
            <div className="attendance-time-box">

              <div className="attendance-time-icon">
                <LogOut size={20} />
              </div>

              <div>

                <span>
                  Check Out
                </span>

                <strong>
                  {today?.checkOutTime || "--"}
                </strong>

              </div>

            </div>

            {/* WORKING HOURS */}
            <div className="attendance-time-box">

              <div className="attendance-time-icon">
                <Clock3 size={20} />
              </div>

              <div>

                <span>
                  Working Hours
                </span>

                <strong>
                  {todaysWorkingHours}
                </strong>

              </div>

            </div>

          </div>

          {/* CHECK IN / CHECK OUT BUTTON */}
          <button
            type="button"
            className={
              checkedIn
                ? "attendance-action-button checkout"
                : "attendance-action-button checkin"
            }
            onClick={handleAttendance}
            disabled={
              busy ||
              Boolean(today?.checkOutTime)
            }
          >

            {checkedIn ? (
              <>
                <LogOut size={19} />

                {busy
                  ? "Checking Out..."
                  : "Check Out"}
              </>
            ) : (
              <>
                <LogIn size={19} />

                {busy
                  ? "Checking In..."
                  : "Check In"}
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

              <h2>
                Attendance History
              </h2>

              <p>
                {selectedMonth
                  ? `Showing records for ${selectedMonth}`
                  : "Your recent attendance records"}
              </p>

            </div>

          </div>

          <div className="attendance-table-wrapper">

            <table className="attendance-table">

              {/* TABLE HEADER */}
              <thead>

                <tr>

                  <th>
                    Date
                  </th>

                  <th>
                    Check In
                  </th>

                  <th>
                    Check Out
                  </th>

                  <th>
                    Working Hours
                  </th>

                  <th>
                    Status
                  </th>

                </tr>

              </thead>

              {/* TABLE BODY */}
              <tbody>

                {sortedHistory.length === 0 ? (

                  <tr>

                    <td colSpan={5}>
                      No attendance records
                      for this period.
                    </td>

                  </tr>

                ) : (

                  sortedHistory.map(
                    (record) => {

                      const normalizedStatus =
                        normalizeStatus(
                          record.status
                        );

                      return (

                        <tr key={record.id}>

                          {/* DATE */}
                          <td>
                            <strong>
                              {record.attendanceDate}
                            </strong>
                          </td>

                          {/* CHECK IN */}
                          <td>
                            {record.checkInTime ||
                              "--"}
                          </td>

                          {/* CHECK OUT */}
                          <td>
                            {record.checkOutTime ||
                              "--"}
                          </td>

                          {/* WORKING HOURS */}
                          <td>
                            {formatWorkingHours(
                              record.attendanceDate,
                              record.checkInTime,
                              record.checkOutTime,
                              now
                            )}
                          </td>

                          {/* STATUS */}
                          <td>

                            <span
                              className={`attendance-status-badge ${getStatusClass(
                                record.status
                              )}`}
                            >

                              {getStatusIcon(
                                record.status
                              )}

                              {normalizedStatus
                                ? normalizedStatus
                                : "--"}

                            </span>

                          </td>

                        </tr>

                      );
                    }
                  )

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