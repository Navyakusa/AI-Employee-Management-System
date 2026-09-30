import { useEffect, useMemo, useState } from "react";

import {
  ShieldCheck,
  Plus,
  Pencil,
  Trash2,
  Users,
  X,
} from "lucide-react";

import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";

import apiClient from "../../services/apiClient";

import "./AdminRoles.css";

function AdminRoles() {
  // ==============================
  // STATE
  // ==============================
  const [roles, setRoles] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [editingRole, setEditingRole] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "Active",
  });

  // ==============================
  // MAP BACKEND ROLE TO UI ROLE
  // ==============================
  const mapBackendRole = (role) => ({
    id: role.roleId,
    name: role.roleName || "",
    description: role.description || "",
    users: role.assignedUsers ?? 0,
    status: role.active ? "Active" : "Inactive",
  });

  // ==============================
  // FETCH ALL ROLES
  // GET /api/roles/all
  // ==============================
  const fetchRoles = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiClient.get("/roles/all");

      const data = response.data;

      if (Array.isArray(data)) {
        const mappedRoles = data.map(mapBackendRole);

        setRoles(mappedRoles);
      } else {
        setRoles([]);
        setError("Unable to load roles.");
      }
    } catch (error) {
      console.error("Error fetching roles:", error);

      if (error.response?.status === 401) {
        setError(
          "Your session has expired. Please login again."
        );
      } else if (error.response?.status === 403) {
        setError(
          "You are not authorized to access roles."
        );
      } else {
        setError(
          error.response?.data?.message ||
            "Unable to load roles."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // LOAD ROLES WHEN PAGE OPENS
  // ==============================
  useEffect(() => {
    fetchRoles();
  }, []);

  // ==============================
  // FILTER ROLES
  // ==============================
  const filteredRoles = useMemo(() => {
    const value = searchTerm.toLowerCase().trim();

    if (!value) {
      return roles;
    }

    return roles.filter(
      (role) =>
        role.name
          .toLowerCase()
          .includes(value) ||
        role.description
          .toLowerCase()
          .includes(value)
    );
  }, [roles, searchTerm]);

  // ==============================
  // OPEN CREATE MODAL
  // ==============================
  const openCreateModal = () => {
    setEditingRole(null);

    setFormData({
      name: "",
      description: "",
      status: "Active",
    });

    setShowModal(true);
  };

  // ==============================
  // OPEN EDIT MODAL
  // ==============================
  const openEditModal = (role) => {
    setEditingRole(role);

    setFormData({
      name: role.name,
      description: role.description,
      status: role.status,
    });

    setShowModal(true);
  };

  // ==============================
  // CLOSE MODAL
  // ==============================
  const closeModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);

    setEditingRole(null);

    setFormData({
      name: "",
      description: "",
      status: "Active",
    });
  };

  // ==============================
  // HANDLE FORM INPUT
  // ==============================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==============================
  // CREATE / UPDATE ROLE
  // ==============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Role name is required.");
      return;
    }

    const payload = {
      roleName: formData.name.trim(),
      description: formData.description.trim(),
      active: formData.status === "Active",
    };

    try {
      setSaving(true);

      // ==============================
      // UPDATE EXISTING ROLE
      // PUT /api/roles/{id}
      // ==============================
      if (editingRole) {
        const response = await apiClient.put(
          `/roles/${editingRole.id}`,
          payload
        );

        const updatedRole = mapBackendRole(
          response.data
        );

        setRoles((previousRoles) =>
          previousRoles.map((role) =>
            role.id === editingRole.id
              ? updatedRole
              : role
          )
        );
      } else {
        // ==============================
        // CREATE NEW ROLE
        // POST /api/roles/create
        // ==============================
        const response = await apiClient.post(
          "/roles/create",
          payload
        );

        const createdRole = mapBackendRole(
          response.data
        );

        setRoles((previousRoles) => [
          createdRole,
          ...previousRoles,
        ]);
      }

      setShowModal(false);

      setEditingRole(null);

      setFormData({
        name: "",
        description: "",
        status: "Active",
      });
    } catch (error) {
      console.error(
        editingRole
          ? "Error updating role:"
          : "Error creating role:",
        error
      );

      if (error.response?.status === 401) {
        alert(
          "Your session has expired. Please login again."
        );
      } else if (error.response?.status === 403) {
        alert(
          "You are not authorized to perform this action."
        );
      } else {
        alert(
          error.response?.data?.message ||
            (editingRole
              ? "Unable to update role."
              : "Unable to create role.")
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // ==============================
  // DELETE ROLE
  // DELETE /api/roles/{id}
  // ==============================
  const deleteRole = async (role) => {
    if (
      role.name
        .trim()
        .toUpperCase()
        .replace(/\s+/g, "_") ===
      "SUPER_ADMIN"
    ) {
      alert(
        "Super Admin role cannot be deleted."
      );
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete ${role.name}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await apiClient.delete(
        `/roles/${role.id}`
      );

      setRoles((previousRoles) =>
        previousRoles.filter(
          (item) => item.id !== role.id
        )
      );
    } catch (error) {
      console.error(
        "Error deleting role:",
        error
      );

      if (error.response?.status === 401) {
        alert(
          "Your session has expired. Please login again."
        );
      } else if (error.response?.status === 403) {
        alert(
          "You are not authorized to delete this role."
        );
      } else {
        alert(
          error.response?.data?.message ||
            "Unable to delete role."
        );
      }
    }
  };

  // ==============================
  // ROLE STATISTICS
  // ==============================
  const activeRoles = roles.filter(
    (role) => role.status === "Active"
  ).length;

  const assignedUsers = roles.reduce(
    (total, role) =>
      total + Number(role.users || 0),
    0
  );

  // ==============================
  // UI
  // ==============================
  return (
    <div className="admin-roles-layout">
      <AdminSidebar />

      <div className="admin-roles-main">
        <AdminNavbar />

        <main className="admin-roles-content">
          <div className="admin-roles-header">
            <div>
              <p>ACCESS MANAGEMENT</p>

              <h1>Roles</h1>

              <span>
                Manage platform roles and access levels.
              </span>
            </div>

            <button
              className="admin-add-role-button"
              onClick={openCreateModal}
            >
              <Plus size={18} />

              Add Role
            </button>
          </div>

          {/* ==============================
              ROLE STATISTICS
          ============================== */}
          <div className="admin-role-stats">
            <div className="admin-role-stat-card">
              <div className="admin-role-stat-icon">
                <ShieldCheck size={22} />
              </div>

              <div>
                <span>Total Roles</span>

                <strong>{roles.length}</strong>
              </div>
            </div>

            <div className="admin-role-stat-card">
              <div className="admin-role-stat-icon">
                <ShieldCheck size={22} />
              </div>

              <div>
                <span>Active Roles</span>

                <strong>{activeRoles}</strong>
              </div>
            </div>

            <div className="admin-role-stat-card">
              <div className="admin-role-stat-icon">
                <Users size={22} />
              </div>

              <div>
                <span>Assigned Users</span>

                <strong>{assignedUsers}</strong>
              </div>
            </div>
          </div>

          {/* ==============================
              ROLES TABLE
          ============================== */}
          <section className="admin-roles-card">
            <div className="admin-roles-toolbar">
              <input
                type="text"
                placeholder="Search roles..."
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(
                    e.target.value
                  )
                }
              />
            </div>

            {/* ERROR */}
            {error && (
              <div className="admin-role-empty">
                {error}
              </div>
            )}

            <div className="admin-roles-table-wrapper">
              <table className="admin-roles-table">
                <thead>
                  <tr>
                    <th>Role</th>

                    <th>Description</th>

                    <th>Users</th>

                    <th>Status</th>

                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="admin-role-empty"
                      >
                        Loading roles...
                      </td>
                    </tr>
                  ) : filteredRoles.length >
                    0 ? (
                    filteredRoles.map(
                      (role) => (
                        <tr key={role.id}>
                          <td>
                            <div className="admin-role-name">
                              <div className="admin-role-avatar">
                                <ShieldCheck
                                  size={18}
                                />
                              </div>

                              <strong>
                                {role.name}
                              </strong>
                            </div>
                          </td>

                          <td>
                            <span className="admin-role-description">
                              {
                                role.description
                              }
                            </span>
                          </td>

                          <td>
                            {role.users}
                          </td>

                          <td>
                            <span
                              className={`admin-role-status ${
                                role.status ===
                                "Active"
                                  ? "active"
                                  : "inactive"
                              }`}
                            >
                              {role.status}
                            </span>
                          </td>

                          <td>
                            <div className="admin-role-actions">
                              <button
                                title="Edit role"
                                onClick={() =>
                                  openEditModal(
                                    role
                                  )
                                }
                              >
                                <Pencil
                                  size={16}
                                />
                              </button>

                              <button
                                title="Delete role"
                                className="delete"
                                onClick={() =>
                                  deleteRole(
                                    role
                                  )
                                }
                              >
                                <Trash2
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
                        className="admin-role-empty"
                      >
                        No roles found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>

      {/* ==============================
          ADD / EDIT ROLE MODAL
      ============================== */}
      {showModal && (
        <div className="admin-role-modal-overlay">
          <div className="admin-role-modal">
            <div className="admin-role-modal-header">
              <div>
                <h2>
                  {editingRole
                    ? "Edit Role"
                    : "Add Role"}
                </h2>

                <p>
                  Configure role details and status.
                </p>
              </div>

              <button
                className="admin-role-modal-close"
                onClick={closeModal}
                disabled={saving}
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="admin-role-form-group">
                <label>Role Name</label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter role name"
                  disabled={saving}
                />
              </div>

              <div className="admin-role-form-group">
                <label>Description</label>

                <textarea
                  name="description"
                  value={
                    formData.description
                  }
                  onChange={handleChange}
                  placeholder="Enter role description"
                  rows="4"
                  disabled={saving}
                />
              </div>

              <div className="admin-role-form-group">
                <label>Status</label>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  disabled={saving}
                >
                  <option value="Active">
                    Active
                  </option>

                  <option value="Inactive">
                    Inactive
                  </option>
                </select>
              </div>

              <div className="admin-role-modal-actions">
                <button
                  type="button"
                  className="cancel"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save"
                  disabled={saving}
                >
                  {saving
                    ? editingRole
                      ? "Updating..."
                      : "Creating..."
                    : editingRole
                      ? "Update Role"
                      : "Create Role"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminRoles;