import axiosInstance from "./axiosInstance";

/**
 * Employee service layer.
 * -----------------------------------------------------------------
 * Confirmed against the Swagger spec + expanded schemas (17 Sep 2026).
 * Every endpoint wraps its payload as:
 *   { success, message, data, timestamp }
 * so every caller should read response.data.data for the real value.
 *
 * NOT included here (no backend support / not yet confirmed):
 *   - Cancelling/withdrawing a pending leave request (no endpoint)
 *   - Replacing a document in one call (upload + delete only — do both)
 *   - Performance DTOs not yet confirmed, so no performance functions yet
 */

// ================= PROFILE =================
export const getEmployeeProfile = () => axiosInstance.get("/profile/get");
// CONFIRMED from ProfileController.java source: this endpoint uses
// @RequestParam for all 5 fields (userName, email, phone, department,
// location) — NOT @RequestBody. All 5 are required with no defaults, so
// every call must include all of them, even the ones the user isn't
// editing (pull those from the already-loaded profile).
export const updateEmployeeProfile = (params) =>
  axiosInstance.put("/profile/update", null, { params });

// ================= NOTIFICATIONS =================
export const getMyNotifications = () => axiosInstance.get("/notifications/my");
export const getUnreadNotificationCount = () =>
  axiosInstance.get("/notifications/unread-count");
export const markNotificationAsRead = (notificationId) =>
  axiosInstance.put(`/notifications/${notificationId}/read`);
export const markAllNotificationsAsRead = () =>
  axiosInstance.put("/notifications/read-all");

// ================= DASHBOARD =================
// EmployeeDashboardDto: employeeId, employeeCode, name, email, department,
// designation, manager, location, employmentType, employeeStatus,
// attendanceStatus, checkInTime, checkOutTime, workingHours,
// unreadNotificationCount, notifications[]
export const getEmployeeDashboardSummary = () =>
  axiosInstance.get("/employee-dashboard/summary");

// ================= ATTENDANCE =================
// Attendance: id, employeeId, attendanceDate, checkInTime, checkOutTime, status, remarks
//
// CONFIRMED from AttendanceController.java source (not just Swagger's list):
// - POST /attendance takes a full Attendance object in the body and saves
//   EXACTLY what it's given — it does NOT derive employeeId/checkInTime
//   from the logged-in user's JWT. The caller must supply them.
// - There is NO "get my today's status" endpoint. GET /attendance/status
//   is actually "filter all attendance records by a given status value"
//   (?status=PRESENT), a required query param — not per-employee at all.
// - The only per-employee read is GET /attendance/employee/{employeeId},
//   which returns ALL of that employee's records; "today's record" has
//   to be found by filtering this list client-side for today's date.
//
// SECURITY NOTE: because the client supplies employeeId and checkInTime,
// this is currently spoofable (any employee could POST another
// employee's id, or a fake time). Worth raising with the backend team —
// ideally the controller should derive both from the authenticated user
// and server clock instead of trusting the request body.
export const getAttendanceForEmployee = (employeeId) =>
  axiosInstance.get(`/attendance/employee/${employeeId}`);
export const getAttendanceStatistics = () =>
  axiosInstance.get("/attendance/statistics");

export const getMyMonthlyAttendanceStatistics = (month) =>
  axiosInstance.get("/attendance/my/statistics", {
    params: { month },
  });

  
// payload must include: { employeeId, attendanceDate, checkInTime, status }
export const checkIn = (payload) => axiosInstance.post("/attendance", payload);
// payload must include at least: { checkOutTime }
export const checkOut = (attendanceId, payload) =>
  axiosInstance.put(`/attendance/${attendanceId}`, payload);

// ================= LEAVE =================
// LeaveRequestDto: leaveType, fromDate, toDate, reason
// LeaveResponseDto: id, employeeId, leaveType, fromDate, toDate, days,
//                    reason, appliedOn, status
// LeaveSummaryDto: leaveBalance, pendingRequests, approvedLeave, usedLeave
export const applyLeave = (data) => axiosInstance.post("/leaves", data);
export const getLeaveById = (leaveId) => axiosInstance.get(`/leaves/${leaveId}`);
export const getLeaveTypes = () => axiosInstance.get("/leaves/types");
export const getMyLeaves = () => axiosInstance.get("/leaves/my");
export const getMyLeaveSummary = () => axiosInstance.get("/leaves/my/summary");

// ================= DOCUMENTS =================
// DocumentSummaryDto: totalDocuments, verifiedDocuments, pendingDocuments, notUploadedDocuments
// EmployeeDocumentResponseDto fields NOT yet confirmed — field names below
// (documentType/documentName, fileName, uploadedOn, status) are a guess.
export const uploadEmployeeDocument = (formData) =>
  axiosInstance.post("/employee-documents/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const getEmployeeDocument = (documentId) =>
  axiosInstance.get(`/employee-documents/${documentId}`);
export const deleteEmployeeDocument = (documentId) =>
  axiosInstance.delete(`/employee-documents/${documentId}`);
export const getMyDocuments = () => axiosInstance.get("/employee-documents/my");
export const getMyDocumentSummary = () =>
  axiosInstance.get("/employee-documents/my/summary");

// ================= PERFORMANCE =================
// Endpoints exist; response DTOs not yet confirmed. Calls are here so the
// wiring is ready, but EmployeePerformance.jsx still renders mock data
// until PerformanceResponseDto / PerformanceSkillDto / PerformanceSummaryDto
// are confirmed.
export const getMyPerformanceReviews = () => axiosInstance.get("/performance/my");
export const getMyPerformanceReviewById = (performanceId) =>
  axiosInstance.get(`/performance/my/${performanceId}`);
export const getMyPerformanceSummary = () =>
  axiosInstance.get("/performance/my/summary");

// ================= SETTINGS =================
// EmployeeSettingsDto: employeeId, employeeName, email, designation,
//                       emailNotifications, systemNotifications, darkMode
// EmployeeSettingsUpdateDto: employeeName, email, designation,
//                             emailNotifications, systemNotifications, darkMode
export const getMyEmployeeSettings = () =>
  axiosInstance.get("/employee-settings/my");
export const updateMyEmployeeSettings = (data) =>
  axiosInstance.put("/employee-settings/my", data);

// ================= PASSWORD SECURITY =================
// Requires backend support for POST /auth/change-password.
export const changeEmployeePassword = (data) =>
  axiosInstance.post("/auth/change-password", data);
// =====================================================================
// PASTE THIS AT THE END OF YOUR OWN src/services/employeeService.js
// (do NOT replace the whole file — keep everything that is already in it)
//
// If your file ALREADY has a function named fetchEmployeeDocumentFile,
// delete the old one first, otherwise the app will fail with
// "Identifier 'fetchEmployeeDocumentFile' has already been declared".
// =====================================================================

// ================= DOCUMENT FILE (view / download) =================
// Backend (to be added by backend team): EmployeeDocumentController
//   GET /api/employee-documents/{id}/view      -> file shown inline (View)
//   GET /api/employee-documents/{id}/download  -> file as attachment (Download)
// The file is fetched as a Blob through axiosInstance so the JWT is sent.
export const fetchEmployeeDocumentFile = async (doc, mode = "view") => {
  const action = mode === "download" ? "download" : "view";
  const response = await axiosInstance.get(
    `/employee-documents/${doc.id}/${action}`,
    { responseType: "blob" }
  );
  const contentType = response.headers?.["content-type"] || response.data?.type || "";

  // A JSON body means the backend sent an ApiResponse error, not the file.
  if (contentType.includes("application/json")) {
    const error = new Error("The server returned an error instead of the file.");
    error.response = { status: response.status };
    throw error;
  }
  return { blob: response.data, contentType };
};
