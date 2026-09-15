import { BrowserRouter, Routes, Route } from "react-router-dom";

import HRDashboard from "./pages/hr/HRDashboard";
import HRJobs from "./pages/hr/HRJobs";
import CreateJob from "./pages/hr/CreateJob";
import HRCandidates from "./pages/hr/HRCandidates";
import HRScreening from "./pages/hr/HRScreening";
import HRAnalytics from "./pages/hr/HRAnalytics";
import HRInterviews from "./pages/hr/HRInterviews";
import HROffers from "./pages/hr/HROffers";
import HREmployees from "./pages/hr/HREmployees";
import HRProfile from "./pages/hr/HRProfile";
import HRSettings from "./pages/hr/HRSettings";

import PublicLayout from "./layouts/PublicLayout";
import HomePage from "./pages/public/HomePage";
import AboutPage from "./pages/public/AboutPage";
import JobsPage from "./pages/public/JobsPage";
import JobDetailsPage from "./pages/public/JobDetailsPage";
import ApplyJobPage from "./pages/public/ApplyJobPage";
import ContactPage from "./pages/public/ContactPage";
import NotFoundPage from "./pages/public/NotFoundPage";
import LoginPage from "./pages/public/auth/LoginPage";
import SignupPage from "./pages/public/auth/SignupPage";
import Chatbot from "./pages/public/Chatbot";


import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminProfile from "./pages/admin/AdminProfile";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminRoles from "./pages/admin/AdminRoles";
import AdminDepartments from "./pages/admin/AdminDepartments";
import AdminReports from "./pages/admin/AdminReports";
import AdminAuditLogs from "./pages/admin/AdminAuditLogs";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminOrganization from "./pages/admin/AdminOrganization";
import HiringManagerDashboard from "./pages/hiringManager/HiringManagerDashboard";
import HiringManagerJobs from "./pages/hiringManager/HiringManagerJobs";
import HiringManagerCandidates from "./pages/hiringManager/HiringManagerCandidates";
import HiringManagerResumeReview from "./pages/hiringManager/HiringManagerResumeReview";
import HiringManagerInterviews from "./pages/hiringManager/HiringManagerInterviews";
import HiringManagerDecisions from "./pages/hiringManager/HiringManagerDecisions";
import HiringManagerJobDetails from "./pages/hiringManager/HiringManagerJobDetails";
import HiringManagerCandidateReview from "./pages/hiringManager/HiringManagerCandidateReview";
import HiringManagerInterviewDetails from "./pages/hiringManager/HiringManagerInterviewDetails";
function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/:jobId" element={<JobDetailsPage />} />
          <Route path="/apply/:jobId" element={<ApplyJobPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/chatbot" element={<Chatbot />} />
        </Route>

        {/* HR Routes */}
        <Route path="/hr/dashboard" element={<HRDashboard />} />
        <Route path="/hr/jobs" element={<HRJobs />} />
        <Route path="/hr/jobs/create" element={<CreateJob />} />
        <Route path="/hr/candidates" element={<HRCandidates />} />
        <Route path="/hr/ai-screening" element={<HRScreening />} />
        <Route path="/hr/analytics" element={<HRAnalytics />} />
        <Route path="/hr/interviews" element={<HRInterviews />} />
        <Route path="/hr/offers" element={<HROffers />} />
        <Route path="/hr/employees" element={<HREmployees />} />

        <Route path="/hr/profile" element={<HRProfile />} />
        <Route path="/hr/settings" element={<HRSettings />} />

        {/* Super Admin Routes */}
        <Route
          path="/super-admin/dashboard"
          element={<AdminDashboard />}
        />
        <Route
          path="/super-admin/users"
          element={<AdminUsers />}
        />
        <Route
          path="/super-admin/profile"
          element={<AdminProfile />}
        />
        <Route
          path="/super-admin/settings"
          element={<AdminSettings />}
        />
        <Route
          path="/super-admin/roles"
          element={<AdminRoles />}
        />
        <Route
          path="/super-admin/departments"
          element={<AdminDepartments />}
        />
        <Route
          path="/super-admin/reports"
          element={<AdminReports />}
        />
        <Route
          path="/super-admin/audit-logs"
          element={<AdminAuditLogs />}
        />
        <Route
          path="/super-admin/notifications"
          element={<AdminNotifications />}
        />
        <Route
          path="/super-admin/organization"
          element={<AdminOrganization />}
        />
        <Route
  path="/hiring-manager/dashboard"
  element={<HiringManagerDashboard />}
/>
<Route
  path="/hiring-manager/jobs"
  element={<HiringManagerJobs />}
/>
<Route
  path="/hiring-manager/shortlisted-candidates"
  element={<HiringManagerCandidates />}
/>
<Route
  path="/hiring-manager/resume-review/:candidateId"
  element={<HiringManagerResumeReview />}
/>
<Route
  path="/hiring-manager/interviews"
  element={<HiringManagerInterviews />}
/>
<Route
  path="/hiring-manager/decisions"
  element={<HiringManagerDecisions />}
/>
<Route
  path="/hiring-manager/jobs/:jobId"
  element={<HiringManagerJobDetails />}
/>
<Route
  path="/hiring-manager/candidate-review/:candidateId"
  element={<HiringManagerCandidateReview />}
/>
<Route
  path="/hiring-manager/interviews/:interviewId"
  element={<HiringManagerInterviewDetails />}
/>
        {/* Not Found */}
        <Route path="*" element={<NotFoundPage />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;