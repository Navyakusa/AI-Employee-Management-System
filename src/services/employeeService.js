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
export const updateEmployeeProfile = (data) =>
  axiosInstance.put("/profile/update", data);

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
