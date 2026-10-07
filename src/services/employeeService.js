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
