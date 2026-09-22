import { BrowserRouter, Routes, Route } from "react-router-dom";
import Chatbot from "./components/Chatbot";
// Recruiter pages
import RecruiterDashboard from "./pages/recruiter/RecruiterDashboard";
import RecruiterNotifications from "./pages/recruiter/RecruiterNotifications";
import RecruiterProfile from "./pages/recruiter/RecruiterProfile";
import RecruiterSettings from "./pages/recruiter/RecruiterSettings";
import RecruiterCandidates from "./pages/recruiter/RecruiterCandidates";
import RecruiterResumes from "./pages/recruiter/RecruiterResumes";
import RecruiterScreening from "./pages/recruiter/RecruiterScreening";
import RecruiterQuestions from "./pages/recruiter/RecruiterQuestions";
import RecruiterInterviews from "./pages/recruiter/RecruiterInterviews";
import CandidateDashboard from "./pages/candidate/CandidateDashboard";





// Employee Pages
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import EmployeeProfile from "./pages/employee/EmployeeProfile";
import EmployeeAttendance from "./pages/employee/EmployeeAttendance";
import EmployeeLeave from "./pages/employee/EmployeeLeave";
import EmployeeDocuments from "./pages/employee/EmployeeDocuments";
import EmployeePerformance from "./pages/employee/EmployeePerformance";
import EmployeeNotifications from "./pages/employee/EmployeeNotifications";
import EmployeeSettings from "./pages/employee/EmployeeSettings";
// HR Pages
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

// Public Pages
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




// Super Admin Pages
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
import HiringManagerInterviewFeedback from "./pages/hiringManager/HiringManagerInterviewFeedback";
import HiringManagerCandidateDecisionDetails from "./pages/hiringManager/HiringManagerCandidateDecisionDetails";
import HiringManagerNotifications from "./pages/hiringManager/HiringManagerNotifications";
import HiringManagerProfile from "./pages/hiringManager/HiringManagerProfile";
import HiringManagerSettings from "./pages/hiringManager/HiringManagerSettings";
import InterviewerDashboard from "./pages/interviewer/InterviewerDashboard";
import InterviewerInterviews from "./pages/interviewer/InterviewerInterviews";
import InterviewerInterviewDetails from "./pages/interviewer/InterviewerInterviewDetails";
import InterviewerCandidateDetails from "./pages/interviewer/InterviewerCandidateDetails";
import InterviewerEvaluations from "./pages/interviewer/InterviewerEvaluations";
import InterviewerEvaluationForm from "./pages/interviewer/InterviewerEvaluationForm";
import InterviewerEvaluationView from "./pages/interviewer/InterviewerEvaluationView";
import InterviewerCandidates from "./pages/interviewer/InterviewerCandidates";
import InterviewerNotifications from "./pages/interviewer/InterviewerNotifications";
import InterviewerProfile from "./pages/interviewer/InterviewerProfile";
import InterviewerSettings from "./pages/interviewer/InterviewerSettings";
import CandidateJobs from "./pages/candidate/CandidateJobs";
import CandidateJobDetails from "./pages/candidate/CandidateJobDetails";
import CandidateJobApplication from "./pages/candidate/CandidateJobApplication";
import CandidateApplications from "./pages/candidate/CandidateApplications";
import CandidateApplicationDetails from "./pages/candidate/CandidateApplicationDetails";
import CandidateInterviews from "./pages/candidate/CandidateInterviews";
import CandidateInterviewDetails from "./pages/candidate/CandidateInterviewDetails";
import CandidateOffers from "./pages/candidate/CandidateOffers";
import CandidateOfferDetails from "./pages/candidate/CandidateOfferDetails";
import CandidateProfile from "./pages/candidate/CandidateProfile";
import CandidateNotifications from "./pages/candidate/CandidateNotifications";
import CandidateSettings from "./pages/candidate/CandidateSettings";
import RecruiterCandidateDetails from "./pages/recruiter/RecruiterCandidateDetails";
function App() {
  return (
    <BrowserRouter>
      <Routes>

        /* ================= PUBLIC ROUTES ================= */

        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/:jobId" element={<JobDetailsPage />} />
          <Route path="/apply/:jobId" element={<ApplyJobPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Route>

        <Route path="/hr/dashboard" element={<HRDashboard />} />
        <Route path="/hr/jobs" element={<HRJobs />} />
        <Route path="/hr/jobs/create" element={<CreateJob />} />

        /* new AI feature routes */
        <Route path="/hr/candidates" element={<HRCandidates />} />
        <Route path="/hr/ai-screening" element={<HRScreening />} />
        <Route path="/hr/analytics" element={<HRAnalytics />} />
        <Route path="/hr/interviews" element={<HRInterviews />} />
        
        /*================Recruiter dashboard=================*/

        <Route
  path="/recruiter/dashboard"
  element={<RecruiterDashboard />}
/>
  
  <Route
  path="/recruiter/notifications"
  element={<RecruiterNotifications />}
/>

<Route
  path="/recruiter/profile"
  element={<RecruiterProfile />}
/> 

<Route
  path="/recruiter/settings"
  element={<RecruiterSettings />}
/>

<Route
  path="/recruiter/candidates"
  element={<RecruiterCandidates />}
/>
<Route
  path="/recruiter/resumes"
  element={<RecruiterResumes />}
/>
<Route
  path="/recruiter/screening"
  element={<RecruiterScreening />}
/>
<Route
  path="/recruiter/questions"
  element={<RecruiterQuestions />}
/>

<Route
  path="/recruiter/interviews"
  element={<RecruiterInterviews />}
/>





        
        <Route
          path="/employee/dashboard"
          element={<EmployeeDashboard />}
        />

        <Route
          path="/employee/profile"
          element={<EmployeeProfile />}
        />

        <Route
          path="/employee/attendance"
          element={<EmployeeAttendance />}
        />

        <Route
          path="/employee/leave"
          element={<EmployeeLeave />}
        />

        <Route
          path="/employee/documents"
          element={<EmployeeDocuments />}
        />

        <Route
          path="/employee/performance"
          element={<EmployeePerformance />}
        />

        <Route
          path="/employee/notifications"
          element={<EmployeeNotifications />}
        />

        <Route
  path="/employee/settings"
  element={<EmployeeSettings />}
/>


       
        <Route
          path="/hr/dashboard"
          element={<HRDashboard />}
        />

        <Route
          path="/hr/jobs"
          element={<HRJobs />}
        />

        <Route
          path="/hr/jobs/create"
          element={<CreateJob />}
        />

        <Route
          path="/hr/candidates"
          element={<HRCandidates />}
        />

        <Route
          path="/hr/ai-screening"
          element={<HRScreening />}
        />

        <Route
          path="/hr/analytics"
          element={<HRAnalytics />}
        />

        <Route
          path="/hr/interviews"
          element={<HRInterviews />}
        />

        <Route
          path="/hr/offers"
          element={<HROffers />}
        />

        <Route
          path="/hr/employees"
          element={<HREmployees />}
        />

        <Route
          path="/hr/profile"
          element={<HRProfile />}
        />

        <Route
          path="/hr/settings"
          element={<HRSettings />}
        />


       

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
  path="/hiring-manager/shortlisted-candidates/:applicationId"
  element={<HiringManagerCandidateReview />}
/>
<Route
  path="/hiring-manager/interviews/:interviewId"
  element={<HiringManagerInterviewDetails />}
/>
<Route
  path="/hiring-manager/interviews/:interviewId/feedback"
  element={<HiringManagerInterviewFeedback />}
/>
<Route
  path="/hiring-manager/decisions/:candidateId"
  element={<HiringManagerCandidateDecisionDetails />}
/>
<Route
  path="/hiring-manager/notifications"
  element={<HiringManagerNotifications />}
/>
<Route
  path="/hiring-manager/profile"
  element={<HiringManagerProfile />}
/>
<Route
  path="/hiring-manager/settings"
  element={<HiringManagerSettings />}
/>
<Route
  path="/interviewer/dashboard"
  element={<InterviewerDashboard />}
/>
<Route
  path="/interviewer/interviews"
  element={<InterviewerInterviews />}
/>
<Route
  path="/interviewer/interviews/:interviewId"
  element={<InterviewerInterviewDetails />}
/>
<Route
  path="/interviewer/candidates/:candidateId"
  element={<InterviewerCandidateDetails />}
/>
<Route
  path="/interviewer/evaluations"
  element={<InterviewerEvaluations />}
/>
<Route
  path="/interviewer/evaluations/:interviewId"
  element={<InterviewerEvaluationForm />}
/>
<Route
  path="/interviewer/evaluations/:interviewId/view"
  element={<InterviewerEvaluationView />}
/>
<Route
  path="/interviewer/candidates"
  element={<InterviewerCandidates />}
/>
<Route
  path="/interviewer/notifications"
  element={<InterviewerNotifications />}
/>
<Route
  path="/interviewer/profile"
  element={<InterviewerProfile />}
/>
<Route
  path="/interviewer/settings"
  element={<InterviewerSettings />}
/>
<Route
  path="/candidate/dashboard"
  element={<CandidateDashboard />}
/>
<Route
  path="/candidate/jobs"
  element={<CandidateJobs />}
/>
<Route
  path="/candidate/jobs/:jobId"
  element={<CandidateJobDetails />}
/>
<Route
  path="/candidate/jobs/:jobId/apply"
  element={<CandidateJobApplication />}
/>
<Route
  path="/candidate/applications"
  element={<CandidateApplications />}
/>
<Route
  path="/candidate/applications/:applicationId"
  element={<CandidateApplicationDetails />}
/>
<Route
  path="/candidate/interviews"
  element={<CandidateInterviews />}
/>
<Route
  path="/candidate/interviews/:interviewId"
  element={<CandidateInterviewDetails />}
/>
<Route
  path="/candidate/offers"
  element={<CandidateOffers />}
/>
<Route
  path="/candidate/offers/:offerId"
  element={<CandidateOfferDetails />}
/>
<Route
  path="/candidate/profile"
  element={<CandidateProfile />}
/>
<Route
  path="/candidate/notifications"
  element={<CandidateNotifications />}
/>
<Route
  path="/candidate/settings"
  element={<CandidateSettings />}
/>
<Route
  path="/recruiter/candidates/:id"
  element={<RecruiterCandidateDetails />}
/>
        {/* Not Found */}

        <Route path="*" element={<NotFoundPage />} />

      </Routes>

      <Chatbot />
    </BrowserRouter>
  );
}

export default App;