import { useEffect, useMemo, useState } from "react";

import {
  ClipboardList,
  Search,
  User,
  ShieldCheck,
  Building2,
  BriefcaseBusiness,
  CalendarCheck,
  RefreshCw,
} from "lucide-react";

import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";

import "./AdminAuditLogs.css";

function AdminAuditLogs() {
  // ==============================
  // STATE
  // ==============================

  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");

  // ==============================
  // FETCH AUDIT LOGS
  // ==============================

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      setError("");

      // Get JWT token stored after login
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Login token not found. Please login again.");
        setLoading(false);
        return;
      }

      const response = await fetch(
  "http://localhost:8080/api/audit-logs/all",
  {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  }
);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch audit logs. Status: ${response.status}`
        );
      }

      const result = await response.json();

      console.log("Audit Logs API Response:", result);

      console.log("FULL AUDIT RESPONSE:", result);

if (Array.isArray(result)) {
  // Backend returned List<AuditLog> directly
  setAuditLogs(result);
} else if (result.success && Array.isArray(result.data)) {
  // Backend returned ApiResponse<List<AuditLog>>
  setAuditLogs(result.data);
} else if (Array.isArray(result.data)) {
  setAuditLogs(result.data);
} else {
  setAuditLogs([]);
}
    } catch (error) {
      console.error("Audit Logs Error:", error);

      setError("Unable to load audit logs.");
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // LOAD AUDIT LOGS
  // ==============================

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  // ==============================
  // SEARCH + FILTER
  // ==============================

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const search = searchTerm.toLowerCase().trim();

      const action = (log.action || "").toLowerCase();

      const details = (
        log.description ||
        log.details ||
        ""
      ).toLowerCase();

      const module = (log.module || "").toLowerCase();

      const performedBy = (
        log.userName ||
        log.performedBy ||
        ""
      ).toLowerCase();

      // Search
      const matchesSearch =
        !search ||
        action.includes(search) ||
        details.includes(search) ||
        module.includes(search) ||
        performedBy.includes(search);

      // Action filter
      const matchesAction =
        actionFilter === "All" ||
        action.includes(actionFilter.toLowerCase());

      // Date filter
      let matchesDate = true;

      if (dateFilter) {
        if (!log.dateTime
        ) {
          matchesDate = false;
        } else {
          const logDate = log.dateTime.split("T")[0];

          matchesDate = logDate === dateFilter;
        }
      }

      return matchesSearch && matchesAction && matchesDate;
    });
  }, [
    auditLogs,
    searchTerm,
    actionFilter,
    dateFilter,
  ]);

  // ==============================
  // MODULE ICON
  // ==============================

  const getIcon = (module) => {
    const value = (module || "").toUpperCase();

    if (value === "USER" || value === "USERS") {
      return <User size={17} />;
    }

    if (value === "ROLE" || value === "ROLES") {
      return <ShieldCheck size={17} />;
    }

    if (
      value === "DEPARTMENT" ||
      value === "DEPARTMENTS"
    ) {
      return <Building2 size={17} />;
    }

    if (value === "JOB" || value === "JOBS") {
      return <BriefcaseBusiness size={17} />;
    }

    if (
      value === "INTERVIEW" ||
      value === "INTERVIEWS"
    ) {
      return <CalendarCheck size={17} />;
    }

    return <ClipboardList size={17} />;
  };

  // ==============================
  // ACTION CSS CLASS
  // ==============================

  const getActionClass = (action) => {
    const value = (action || "").toLowerCase();

    if (
      value.includes("create") ||
      value.includes("add")
    ) {
      return "create";
    }

    if (
      value.includes("update") ||
      value.includes("edit")
    ) {
      return "update";
    }

    if (
      value.includes("status") ||
      value.includes("activate") ||
      value.includes("deactivate")
    ) {
      return "status";
    }

    if (
      value.includes("delete") ||
      value.includes("remove")
    ) {
      return "delete";
    }

    return "update";
  };

  // ==============================
  // FORMAT TEXT
  // ==============================

  const formatLabel = (value) => {
    if (!value) {
      return "—";
    }

    return value
      .replaceAll("_", " ")
      .replaceAll("-", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  // ==============================
  // FORMAT DATE
  // ==============================

  const formatDateTime = (timestamp) => {
    if (!timestamp) {
      return "—";
    }

    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
      return timestamp;
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ==============================
  // RESET FILTERS
  // ==============================

  const resetFilters = () => {
    setSearchTerm("");
    setActionFilter("All");
    setDateFilter("");
  };

  // ==============================
  // UI
  // ==============================

  return (
    <div className="admin-audit-layout">
      <AdminSidebar />

      <div className="admin-audit-main">
        <AdminNavbar />

        <main className="admin-audit-content">

          {/* HEADER */}

          <div className="admin-audit-header">
            <p>SYSTEM ACTIVITY</p>

            <h1>Audit Logs</h1>

            <span>
              Track administrative actions performed across
              the platform.
            </span>
          </div>

          {/* AUDIT LOG CARD */}

          <section className="admin-audit-card">

            {/* TOOLBAR */}

            <div className="admin-audit-toolbar">

              {/* SEARCH */}

              <div className="admin-audit-search">
                <Search size={17} />

                <input
                  type="text"
                  placeholder="Search audit logs..."
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(e.target.value)
                  }
                />
              </div>

              {/* FILTERS */}

              <div className="admin-audit-filters">

                <select
                  value={actionFilter}
                  onChange={(e) =>
                    setActionFilter(e.target.value)
                  }
                >
                  <option value="All">
                    All Actions
                  </option>

                  <option value="Create">
                    Create
                  </option>

                  <option value="Update">
                    Update
                  </option>

                  <option value="Status">
                    Status Change
                  </option>

                  <option value="Delete">
                    Delete
                  </option>
                </select>

                <input
                  type="date"
                  value={dateFilter}
                  onChange={(e) =>
                    setDateFilter(e.target.value)
                  }
                  className="admin-audit-date"
                />

                <button
                  type="button"
                  className="admin-audit-clear-filter"
                  onClick={resetFilters}
                >
                  Reset Filters
                </button>

                <button
                  type="button"
                  className="admin-audit-clear-filter"
                  onClick={fetchAuditLogs}
                  disabled={loading}
                >
                  <RefreshCw size={15} />

                  {loading
                    ? "Loading..."
                    : "Refresh"}
                </button>

              </div>
            </div>

            {/* LOADING */}

            {loading && (
              <div className="admin-audit-empty">
                Loading audit logs...
              </div>
            )}

            {/* ERROR */}

            {!loading && error && (
              <div className="admin-audit-empty">
                {error}
              </div>
            )}

            {/* TABLE */}

            {!loading && !error && (
              <div className="admin-audit-table-wrapper">

                <table className="admin-audit-table">

                  <thead>
                    <tr>
                      <th>Module</th>
                      <th>Action</th>
                      <th>Details</th>
                      <th>Performed By</th>
                      <th>Date & Time</th>
                    </tr>
                  </thead>

                  <tbody>

                    {filteredLogs.length > 0 ? (
                      filteredLogs.map((log, index) => (

                        <tr
                          key={
                            log.id ||
                            log.auditLogId ||
                            index
                          }
                        >

                          {/* MODULE */}

                          <td>
                            <div className="admin-audit-module">

                              <div className="admin-audit-icon">
                                {getIcon(log.module)}
                              </div>

                              <strong>
                                {formatLabel(log.module)}
                              </strong>

                            </div>
                          </td>

                          {/* ACTION */}

                          <td>
                            <span
                              className={`admin-audit-action ${getActionClass(
                                log.action
                              )}`}
                            >
                              {formatLabel(log.action)}
                            </span>
                          </td>

                          {/* DETAILS */}

                          <td>
                            {log.description ||
                              log.details ||
                              "—"}
                          </td>

                          {/* PERFORMED BY */}

                          <td>
                            {log.userName ||
                              log.performedBy ||
                              "System"}
                          </td>

                          {/* DATE */}

                          <td>
                            {formatDateTime(
                              log.dateTime
                            )}
                          </td>

                        </tr>

                      ))
                    ) : (

                      <tr>
                        <td
                          colSpan="5"
                          className="admin-audit-empty"
                        >
                          No audit logs found.
                        </td>
                      </tr>

                    )}

                  </tbody>
                </table>

              </div>
            )}

          </section>
        </main>
      </div>
    </div>
  );
}

export default AdminAuditLogs;