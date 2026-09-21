import React, { useEffect, useState } from "react";
import {
  UserRound,
  Mail,
  Phone,
  Building2,
  BriefcaseBusiness,
  CalendarDays,
  MapPin,
  UserCheck,
  BadgeCheck,
  Hash,
  Pencil,
  X,
} from "lucide-react";
import EmployeeSidebar from "./EmployeeSidebar";
import EmployeeTopbar from "./EmployeeTopbar";
import {
  getEmployeeProfile,
  updateEmployeeProfile,
} from "../../services/employeeService";
// This file lives at src/pages/employee/EmployeeProfile.jsx, so
// services at src/services/ is two levels up.
import "./EmployeeProfile.css";

function EmployeeProfile() {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ phone: "", location: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        const response = await getEmployeeProfile();

        // Confirmed shape: every endpoint wraps its payload as
        // { success, message, data, timestamp }.
        const data = response.data?.data || {};

        if (!isMounted) return;

        // Mapped directly against the confirmed Employee schema:
        // id, employeeId, name, email, department, designation,
        // joiningDate, manager, location, employmentType, status.
        // NOTE: this schema has no "phone" field. If /profile/get really
        // returns this shape, the Phone row below will always show "--"
        // until a phone field is added on the backend — that's not a
        // bug in this component.
        setEmployee({
          employeeId: data.employeeId || "--",
          name: data.name || "--",
          email: data.email || "--",
          phone: data.phone || "--",
          department: data.department || "--",
          designation: data.designation || "--",
          joiningDate: data.joiningDate || "--",
          reportingManager: data.manager || "--",
          location: data.location || "--",
          employmentType: data.employmentType || "--",
          status: data.status || "Active",
        });
      } catch (err) {
        console.error("Failed to load profile", err);
        if (isMounted) {
          setError("Unable to load your profile right now.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const openEditModal = () => {
    setEditForm({
      phone: employee.phone === "--" ? "" : employee.phone,
      location: employee.location === "--" ? "" : employee.location,
    });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // The confirmed Employee schema has NO "phone" field — only
      // "location" is real. Sending "phone" was the most likely reason
      // the save was failing, so it's dropped from the request here.
      // Phone stays editable in the UI as a local-only field until the
      // backend adds real support for it (needs a new column + field on
      // whatever entity/DTO backs PUT /profile/update).
      await updateEmployeeProfile({
        location: editForm.location,
      });

      setEmployee((prev) => ({
        ...prev,
        phone: editForm.phone || prev.phone,
        location: editForm.location || prev.location,
      }));

      setShowEditModal(false);
    } catch (err) {
      console.error("Failed to update profile", err);
      // Surface the REAL backend error instead of a generic message, so
      // if this still fails we know exactly why on the first try.
      const backendMessage =
        err.response?.data?.message || err.response?.data?.error || err.message;
      alert(`Could not save your changes: ${backendMessage}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="employee-profile-layout">
        <EmployeeSidebar />
        <EmployeeTopbar />
        <main className="employee-profile-main">
          <p>Loading profile...</p>
        </main>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="employee-profile-layout">
        <EmployeeSidebar />
        <EmployeeTopbar />
        <main className="employee-profile-main">
          <p>{error || "Profile not found."}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="employee-profile-layout">

      <EmployeeSidebar />

      <EmployeeTopbar />

      <main className="employee-profile-main">

        {/* =========================
            PAGE HEADER
        ========================= */}

        <div className="employee-profile-header">

          <div>
            <span className="employee-page-label">
              EMPLOYEE WORKSPACE
            </span>

            <h1>My Profile</h1>

            <p>
              View your employee information and profile details.
            </p>
          </div>

          <button className="edit-profile-button" onClick={openEditModal}>
            <Pencil size={16} />
            Edit Profile
          </button>

        </div>


        {/* =========================
            PROFILE HERO
        ========================= */}

        <section className="employee-profile-hero">

          <div className="profile-avatar-large">
            {employee.name.charAt(0)}
          </div>

          <div className="profile-hero-info">

            <h2>
              {employee.name}
            </h2>

            <p>
              {employee.designation}
            </p>

            <span>
              {employee.department}
            </span>

          </div>

          <div className="profile-active-badge">
            <BadgeCheck size={15} />
            {employee.status}
          </div>

        </section>


        {/* =========================
            EMPLOYEE INFORMATION
        ========================= */}

        <section className="employee-profile-card">

          <div className="profile-card-header">

            <div>
              <h2>Employee Information</h2>

              <p>
                Your employment and organizational details
              </p>
            </div>

            <UserRound size={21} />

          </div>


          <div className="profile-details-grid">

            {/* Employee ID */}
            <div className="profile-detail">

              <div className="profile-detail-icon">
                <Hash size={18} />
              </div>

              <div>
                <span>Employee ID</span>
                <strong>{employee.employeeId}</strong>
              </div>

            </div>


            {/* Name */}
            <div className="profile-detail">

              <div className="profile-detail-icon">
                <UserRound size={18} />
              </div>

              <div>
                <span>Name</span>
                <strong>{employee.name}</strong>
              </div>

            </div>


            {/* Email */}
            <div className="profile-detail">

              <div className="profile-detail-icon">
                <Mail size={18} />
              </div>

              <div>
                <span>Email</span>
                <strong>{employee.email}</strong>
              </div>

            </div>


            {/* Phone */}
            <div className="profile-detail">

              <div className="profile-detail-icon">
                <Phone size={18} />
              </div>

              <div>
                <span>Phone</span>
                <strong>{employee.phone}</strong>
              </div>

            </div>


            {/* Department */}
            <div className="profile-detail">

              <div className="profile-detail-icon">
                <Building2 size={18} />
              </div>

              <div>
                <span>Department</span>
                <strong>{employee.department}</strong>
              </div>

            </div>


            {/* Designation */}
            <div className="profile-detail">

              <div className="profile-detail-icon">
                <BriefcaseBusiness size={18} />
              </div>

              <div>
                <span>Designation</span>
                <strong>{employee.designation}</strong>
              </div>

            </div>


            {/* Joining Date */}
            <div className="profile-detail">

              <div className="profile-detail-icon">
                <CalendarDays size={18} />
              </div>

              <div>
                <span>Joining Date</span>
                <strong>{employee.joiningDate}</strong>
              </div>

            </div>


            {/* Reporting Manager */}
            <div className="profile-detail">

              <div className="profile-detail-icon">
                <UserCheck size={18} />
              </div>

              <div>
                <span>Reporting Manager</span>
                <strong>{employee.reportingManager}</strong>
              </div>

            </div>


            {/* Location */}
            <div className="profile-detail">

              <div className="profile-detail-icon">
                <MapPin size={18} />
              </div>

              <div>
                <span>Location</span>
                <strong>{employee.location}</strong>
              </div>

            </div>


            {/* Employment Type */}
            <div className="profile-detail">

              <div className="profile-detail-icon">
                <BriefcaseBusiness size={18} />
              </div>

              <div>
                <span>Employment Type</span>
                <strong>{employee.employmentType}</strong>
              </div>

            </div>


            {/* Status */}
            <div className="profile-detail">

              <div className="profile-detail-icon">
                <BadgeCheck size={18} />
              </div>

              <div>
                <span>Status</span>

                <strong className="profile-status">
                  <span></span>
                  {employee.status}
                </strong>

              </div>

            </div>

          </div>

        </section>


        {/* =========================
            CONTACT CARD
        ========================= */}

        <section className="profile-contact-card">

          <div className="profile-contact-icon">
            <Mail size={20} />
          </div>

          <div>

            <h3>Contact Information</h3>

            <p>
              For changes to your employee information,
              please contact your HR administrator.
            </p>

          </div>

        </section>

      </main>


      {/* =========================
          EDIT PROFILE MODAL
          (only phone + location are editable here — everything else
          on this page is HR-managed data, matching the "contact your
          HR administrator" note above)
      ========================= */}
      {showEditModal && (
        <div className="document-modal-overlay">
          <div className="document-modal">

            <div className="document-modal-header">
              <div>
                <h2>Edit Profile</h2>
                <p>Update your contact details</p>
              </div>

              <button type="button" onClick={() => setShowEditModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ padding: "22px" }}>

              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "7px",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#344054",
                  }}
                >
                  Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={editForm.phone}
                  onChange={handleEditChange}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    border: "1px solid #d0d5dd",
                    borderRadius: "8px",
                    padding: "11px 12px",
                    fontSize: "13px",
                  }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "7px",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#344054",
                  }}
                >
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={editForm.location}
                  onChange={handleEditChange}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    border: "1px solid #d0d5dd",
                    borderRadius: "8px",
                    padding: "11px 12px",
                    fontSize: "13px",
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  style={{
                    border: "1px solid #d0d5dd",
                    background: "white",
                    color: "#475467",
                    borderRadius: "8px",
                    padding: "10px 17px",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    border: "none",
                    background: "#3158d9",
                    color: "white",
                    borderRadius: "8px",
                    padding: "10px 17px",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    opacity: saving ? 0.7 : 1,
                  }}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

export default EmployeeProfile;
