import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Filter,
  UserPlus,
  Pencil,
  Power,
  X,
  Users,
} from "lucide-react";

import { useSearchParams } from "react-router-dom";

import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";
import "./AdminUsers.css";

import apiClient from "../../services/apiClient";

function AdminUsers() {
  // ============================================================
  // USERS FROM BACKEND
  // ============================================================

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================================
  // FILTERS
  // ============================================================

  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [searchParams] = useSearchParams();

  const initialSearch = searchParams.get("search") || "";

  const [searchTerm, setSearchTerm] = useState(initialSearch);

  // ============================================================
  // MODAL
  // ============================================================

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Employee",
    department: "",
    status: "Active",
  });

  // ============================================================
  // FORMAT ROLE
  // Example:
  // SUPER_ADMIN -> Super Admin
  // HIRING_MANAGER -> Hiring Manager
  // ============================================================

  const formatRole = (role) => {
    if (!role) {
      return "";
    }

    return role
      .toString()
      .toLowerCase()
      .split("_")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1)
      )
      .join(" ");
  };

  // ============================================================
  // GET ALL USERS
  // GET /api/admin/users
  // ============================================================

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiClient.get(
        "/api/admin/users"
      );

      console.log(
        "Users backend response:",
        response.data
      );

      if (
        response.data?.success &&
        Array.isArray(response.data.data)
      ) {
        const formattedUsers =
          response.data.data.map((user) => ({
            id: user.userId ?? user.id,

            name:
              user.userName ??
              user.name ??
              "",

            email: user.email ?? "",

            role: formatRole(
              user.role?.roleName ??
                user.role?.name ??
                user.role
            ),

            department:
              user.department?.departmentName ??
              user.department?.name ??
              user.department ??
              "Not Assigned",

            status:
              typeof user.active === "boolean"
                ? user.active
                  ? "Active"
                  : "Inactive"
                : user.status ?? "Inactive",
          }));

        setUsers(formattedUsers);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error(
        "Failed to fetch users:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message ||
          "Failed to load users."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // LOAD USERS WHEN PAGE OPENS
  // ============================================================

  useEffect(() => {
    fetchUsers();
  }, []);

  // ============================================================
  // FILTER USERS
  // ============================================================

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchValue =
        searchTerm.toLowerCase();

      const matchesSearch =
        (user.name || "")
          .toLowerCase()
          .includes(searchValue) ||
        (user.email || "")
          .toLowerCase()
          .includes(searchValue) ||
        (user.department || "")
          .toLowerCase()
          .includes(searchValue);

      const matchesRole =
        roleFilter === "All" ||
        user.role === roleFilter;

      const matchesStatus =
        statusFilter === "All" ||
        user.status === statusFilter;

      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus
      );
    });
  }, [
    users,
    searchTerm,
    roleFilter,
    statusFilter,
  ]);

  // ============================================================
  // OPEN ADD USER MODAL
  // ============================================================

  const openAddModal = () => {
    setEditingUser(null);

    setFormData({
      name: "",
      email: "",
      role: "Employee",
      department: "",
      status: "Active",
    });

    setShowModal(true);
  };

  // ============================================================
  // OPEN EDIT USER MODAL
  // ============================================================

  const openEditModal = (user) => {
    setEditingUser(user);

    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      status: user.status,
    });

    setShowModal(true);
  };

  // ============================================================
  // CLOSE MODAL
  // ============================================================

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
  };

  // ============================================================
  // INPUT CHANGE
  // ============================================================

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ============================================================
  // TEMPORARY ADD / EDIT
  //
  // Backend POST and PUT are NOT connected yet.
  // This keeps your existing UI working without errors.
  // ============================================================

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.department.trim()
    ) {
      alert(
        "Please fill all required fields."
      );
      return;
    }

    if (editingUser) {
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === editingUser.id
            ? {
                ...user,
                ...formData,
              }
            : user
        )
      );
    } else {
      const temporaryUser = {
        id: `temp-${Date.now()}`,
        ...formData,
      };

      setUsers((prevUsers) => [
        ...prevUsers,
        temporaryUser,
      ]);
    }

    closeModal();
  };

  // ============================================================
  // TEMPORARY STATUS TOGGLE
  //
  // PATCH API will be connected next.
  // ============================================================

  const handleToggleUserStatus = (userId) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId
          ? {
              ...user,
              status:
                user.status === "Active"
                  ? "Inactive"
                  : "Active",
            }
          : user
      )
    );
  };

  // ============================================================
  // COUNTS
  // ============================================================

  const activeUsers = users.filter(
    (user) => user.status === "Active"
  ).length;

  const inactiveUsers = users.filter(
    (user) => user.status === "Inactive"
  ).length;

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="admin-users-layout">
      <AdminSidebar />

      <div className="admin-users-main">
        <AdminNavbar />

        <main className="admin-users-content">
          {/* HEADER */}

          <div className="admin-users-header">
            <div>
              <p className="admin-users-label">
                USER MANAGEMENT
              </p>

              <h1>Users</h1>

              <p>
                Manage platform users, roles,
                departments and account status.
              </p>
            </div>

            <button
              className="admin-add-user-button"
              onClick={openAddModal}
            >
              <UserPlus size={18} />
              Add User
            </button>
          </div>

          {/* SUMMARY CARDS */}

          <section className="admin-users-summary">
            <div className="admin-user-summary-card">
              <div className="admin-summary-icon">
                <Users size={21} />
              </div>

              <div>
                <span>Total Users</span>

                <strong>
                  {loading ? "..." : users.length}
                </strong>
              </div>
            </div>

            <div className="admin-user-summary-card">
              <div className="admin-summary-icon">
                <Power size={21} />
              </div>

              <div>
                <span>Active Users</span>

                <strong>
                  {loading ? "..." : activeUsers}
                </strong>
              </div>
            </div>

            <div className="admin-user-summary-card">
              <div className="admin-summary-icon">
                <Power size={21} />
              </div>

              <div>
                <span>Inactive Users</span>

                <strong>
                  {loading
                    ? "..."
                    : inactiveUsers}
                </strong>
              </div>
            </div>
          </section>

          {/* USERS PANEL */}

          <section className="admin-users-panel">
            {/* TOOLBAR */}

            <div className="admin-users-toolbar">
              <div className="admin-users-search">
                <Search size={18} />

                <input
                  type="text"
                  placeholder="Search by name, email or department..."
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="admin-users-filters">
                {/* ROLE FILTER */}

                <div className="admin-filter-group">
                  <Filter size={16} />

                  <select
                    value={roleFilter}
                    onChange={(e) =>
                      setRoleFilter(
                        e.target.value
                      )
                    }
                  >
                    <option value="All">
                      All Roles
                    </option>

                    <option value="Super Admin">
                      Super Admin
                    </option>

                    <option value="HR Manager">
                      HR Manager
                    </option>

                    <option value="Hr">
                      HR
                    </option>

                    <option value="Recruiter">
                      Recruiter
                    </option>

                    <option value="Hiring Manager">
                      Hiring Manager
                    </option>

                    <option value="Interviewer">
                      Interviewer
                    </option>

                    <option value="Employee">
                      Employee
                    </option>

                    <option value="Candidate">
                      Candidate
                    </option>
                  </select>
                </div>

                {/* STATUS FILTER */}

                <div className="admin-filter-group">
                  <select
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(
                        e.target.value
                      )
                    }
                  >
                    <option value="All">
                      All Status
                    </option>

                    <option value="Active">
                      Active
                    </option>

                    <option value="Inactive">
                      Inactive
                    </option>
                  </select>
                </div>
              </div>
            </div>

            {/* ERROR */}

            {error && (
              <div
                style={{
                  padding: "16px",
                  color: "#dc2626",
                }}
              >
                {error}
              </div>
            )}

            {/* TABLE */}

            <div className="admin-users-table-wrapper">
              <table className="admin-users-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {/* LOADING */}

                  {loading ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="admin-no-users"
                      >
                        Loading users...
                      </td>
                    </tr>
                  ) : filteredUsers.length >
                    0 ? (
                    filteredUsers.map(
                      (user) => (
                        <tr key={user.id}>
                          {/* USER */}

                          <td>
                            <div className="admin-users-user-cell">
                              <div className="admin-users-avatar">
                                {(user.name ||
                                  "U")
                                  .split(" ")
                                  .filter(Boolean)
                                  .map(
                                    (word) =>
                                      word[0]
                                  )
                                  .join("")
                                  .slice(0, 2)
                                  .toUpperCase()}
                              </div>

                              <div>
                                <strong>
                                  {user.name}
                                </strong>

                                <span>
                                  {user.email}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* ROLE */}

                          <td>
                            <span className="admin-user-role">
                              {user.role ||
                                "Not Assigned"}
                            </span>
                          </td>

                          {/* DEPARTMENT */}

                          <td>
                            {user.department ||
                              "Not Assigned"}
                          </td>

                          {/* STATUS */}

                          <td>
                            <span
                              className={
                                user.status ===
                                "Active"
                                  ? "admin-user-status active"
                                  : "admin-user-status inactive"
                              }
                            >
                              {user.status}
                            </span>
                          </td>

                          {/* ACTIONS */}

                          <td>
                            <div className="admin-user-actions">
                              <button
                                className="admin-action-button"
                                title="Edit user"
                                onClick={() =>
                                  openEditModal(
                                    user
                                  )
                                }
                              >
                                <Pencil
                                  size={16}
                                />
                              </button>

                              <button
                                className={
                                  user.status ===
                                  "Active"
                                    ? "admin-action-button deactivate"
                                    : "admin-action-button activate"
                                }
                                title={
                                  user.status ===
                                  "Active"
                                    ? "Deactivate user"
                                    : "Activate user"
                                }
                                onClick={() =>
                                  handleToggleUserStatus(
                                    user.id
                                  )
                                }
                              >
                                <Power
                                  size={16}
                                />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    )
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        className="admin-no-users"
                      >
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>

      {/* ======================================================
          ADD / EDIT USER MODAL
      ====================================================== */}

      {showModal && (
        <div className="admin-user-modal-overlay">
          <div className="admin-user-modal">
            {/* MODAL HEADER */}

            <div className="admin-user-modal-header">
              <div>
                <h2>
                  {editingUser
                    ? "Edit User"
                    : "Add New User"}
                </h2>

                <p>
                  {editingUser
                    ? "Update user information and access."
                    : "Create a new platform user."}
                </p>
              </div>

              <button
                type="button"
                className="admin-modal-close"
                onClick={closeModal}
              >
                <X size={20} />
              </button>
            </div>

            {/* FORM */}

            <form
              className="admin-user-form"
              onSubmit={handleSubmit}
            >
              {/* FULL NAME */}

              <div className="admin-user-form-group">
                <label>
                  Full Name
                  <span>*</span>
                </label>

                <input
                  type="text"
                  name="name"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={
                    handleInputChange
                  }
                />
              </div>

              {/* EMAIL */}

              <div className="admin-user-form-group">
                <label>
                  Email
                  <span>*</span>
                </label>

                <input
                  type="email"
                  name="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={
                    handleInputChange
                  }
                />
              </div>

              <div className="admin-user-form-row">
                {/* ROLE */}

                <div className="admin-user-form-group">
                  <label>Role</label>

                  <select
                    name="role"
                    value={formData.role}
                    onChange={
                      handleInputChange
                    }
                  >
                    <option value="Super Admin">
                      Super Admin
                    </option>

                    <option value="HR Manager">
                      HR Manager
                    </option>

                    <option value="Recruiter">
                      Recruiter
                    </option>

                    <option value="Hiring Manager">
                      Hiring Manager
                    </option>

                    <option value="Interviewer">
                      Interviewer
                    </option>

                    <option value="Employee">
                      Employee
                    </option>
                  </select>
                </div>

                {/* STATUS */}

                <div className="admin-user-form-group">
                  <label>Status</label>

                  <select
                    name="status"
                    value={formData.status}
                    onChange={
                      handleInputChange
                    }
                  >
                    <option value="Active">
                      Active
                    </option>

                    <option value="Inactive">
                      Inactive
                    </option>
                  </select>
                </div>
              </div>

              {/* DEPARTMENT */}

              <div className="admin-user-form-group">
                <label>
                  Department
                  <span>*</span>
                </label>

                <input
                  type="text"
                  name="department"
                  placeholder="Example: Engineering"
                  value={
                    formData.department
                  }
                  onChange={
                    handleInputChange
                  }
                />
              </div>

              {/* BUTTONS */}

              <div className="admin-user-form-actions">
                <button
                  type="button"
                  className="admin-cancel-button"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="admin-save-user-button"
                >
                  {editingUser
                    ? "Save Changes"
                    : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;