import { useEffect, useState } from "react";
import {
  Building2,
  Plus,
  Pencil,
  Trash2,
  Users,
  X,
} from "lucide-react";

import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";
import { useAdmin } from "../../context/AdminContext";

import "./AdminDepartments.css";
import apiClient from "../../services/apiClient";

function AdminDepartments() {
  const { users } = useAdmin();

  const defaultDepartments = [
    {
      id: 1,
      name: "Engineering",
      manager: "Kiran Kumar",
      employees: 12,
      status: "Active",
    },
    {
      id: 2,
      name: "Human Resources",
      manager: "Anjali Reddy",
      employees: 5,
      status: "Active",
    },
    {
      id: 3,
      name: "Design",
      manager: "Priya Singh",
      employees: 4,
      status: "Active",
    },
    {
      id: 4,
      name: "Analytics",
      manager: "Rahul Sharma",
      employees: 3,
      status: "Inactive",
    },
  ];

  // ============================================================
  // DEPARTMENTS FROM BACKEND
  // ============================================================

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [editingDepartment, setEditingDepartment] =
    useState(null);

  const [formData, setFormData] = useState({
    name: "",
    manager: "",
    status: "Active",
  });

  // ============================================================
  // GET ALL DEPARTMENTS
  // GET /api/departments/all
  // ============================================================

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiClient.get(
        "/api/departments/all"
      );

      console.log(
        "Departments backend response:",
        response.data
      );

      const data = response.data;

      if (Array.isArray(data)) {
        setDepartments(data);
      } else if (Array.isArray(data?.data)) {
        setDepartments(data.data);
      } else {
        setDepartments([]);
      }
    } catch (error) {
      console.error(
        "Failed to fetch departments:",
        error.response?.data || error.message
      );

      setError(
        error.response?.data?.message ||
          "Failed to load departments."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // LOAD DEPARTMENTS WHEN PAGE OPENS
  // ============================================================

  useEffect(() => {
    fetchDepartments();
  }, []);

  // ============================================================
  // FILTER DEPARTMENTS
  // ============================================================

 const [filteredDepartments, setFilteredDepartments] =
  useState([]);

useEffect(() => {
  const searchDepartments = async () => {
    const value = searchTerm.trim();

    if (!value) {
      setFilteredDepartments(departments);
      return;
    }

    try {
      const response = await apiClient.get(
        "/api/departments/search",
        {
          params: {
            name: value,
          },
        }
      );

      console.log(
        "Search Departments Response:",
        response.data
      );

      const data = response.data;

      if (Array.isArray(data)) {
        setFilteredDepartments(data);
      } else if (Array.isArray(data?.data)) {
        setFilteredDepartments(data.data);
      } else {
        setFilteredDepartments([]);
      }
    } catch (error) {
      console.error(
        "Search Departments Error:",
        error.response?.data ||
          error.message
      );

      setFilteredDepartments([]);
    }
  };

  searchDepartments();
}, [searchTerm, departments]);

  // ============================================================
  // OPEN CREATE MODAL
  // ============================================================

  const openCreateModal = () => {
    setEditingDepartment(null);

    setFormData({
      name: "",
      manager: "",
      status: "Active",
    });

    setShowModal(true);
  };

  // ============================================================
  // OPEN EDIT MODAL
  // ============================================================

  const openEditModal = (department) => {
    setEditingDepartment(department);

    setFormData({
      name: department.name,
      manager: department.manager,
      status: department.status,
    });

    setShowModal(true);
  };

  // ============================================================
  // CLOSE MODAL
  // ============================================================

  const closeModal = () => {
    setShowModal(false);
    setEditingDepartment(null);

    setFormData({
      name: "",
      manager: "",
      status: "Active",
    });
  };

  // ============================================================
  // INPUT CHANGE
  // ============================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ============================================================
  // ADD / EDIT
  // TEMPORARY FRONTEND LOGIC
  // WILL CONNECT POST + PUT NEXT
  // ============================================================

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!formData.name.trim()) {
    alert("Department name is required.");
    return;
  }

  // ==========================================================
  // EDIT DEPARTMENT
  // Keep existing temporary frontend logic for now
  // ==========================================================

  if (editingDepartment) {
  try {
    const requestBody = {
      id: editingDepartment.id,
      name: formData.name.trim(),
      manager: formData.manager.trim(),
      status: formData.status,
    };

    console.log(
      "Update Department Request:",
      requestBody
    );

    const response = await apiClient.put(
      `/api/departments/${editingDepartment.id}`,
      requestBody
    );

    console.log(
      "Update Department Response:",
      response.data
    );

    if (response.data) {
      alert("Department updated successfully.");

      closeModal();

      await fetchDepartments();
    }
  } catch (error) {
    console.error(
      "Update Department Error:",
      error.response?.data ||
        error.message
    );

    alert(
      error.response?.data?.message ||
        "Failed to update department."
    );
  }

  return;
}

  // ==========================================================
  // CREATE DEPARTMENT
  // POST /api/departments/create
  // ==========================================================

  try {
    const requestBody = {
      name: formData.name.trim(),
      manager: formData.manager.trim(),
      status: formData.status,
    };

    console.log(
      "Create Department Request:",
      requestBody
    );

    const response = await apiClient.post(
      "/api/departments/create",
      requestBody
    );

    console.log(
      "Create Department Response:",
      response.data
    );

    if (response.data) {
      alert("Department created successfully.");

      closeModal();

      // Reload latest departments from backend
      await fetchDepartments();
    }
  } catch (error) {
    console.error(
      "Create Department Error:",
      error.response?.data ||
        error.message
    );

    alert(
      error.response?.data?.message ||
        "Failed to create department."
    );
  }
};
  // ============================================================
  // DELETE
  // TEMPORARY FRONTEND LOGIC
  // WILL CONNECT DELETE API NEXT
  // ============================================================

  const deleteDepartment = async (department) => {
  const confirmed = window.confirm(
    `Are you sure you want to delete ${department.name}?`
  );

  if (!confirmed) {
    return;
  }

  try {
    const response = await apiClient.delete(
      `/api/departments/${department.id}`
    );

    console.log(
      "Delete Department Response:",
      response.data
    );

    alert("Department deleted successfully.");

    await fetchDepartments();
  } catch (error) {
    console.error(
      "Delete Department Error:",
      error.response?.data || error.message
    );

    alert(
      error.response?.data?.message ||
        "Failed to delete department."
    );
  }
};
  // ============================================================
  // COUNTS
  // ============================================================

  const activeDepartments =
    departments.filter(
      (department) =>
        department.status === "Active"
    ).length;

  const getEmployeeCount = (departmentName) => {
    return users.filter(
      (user) =>
        user.department?.toLowerCase() ===
        departmentName.toLowerCase()
    ).length;
  };

  const totalEmployees = departments.reduce(
    (total, department) =>
      total +
      getEmployeeCount(department.name),
    0
  );

  return (
    <div className="admin-departments-layout">
      <AdminSidebar />

      <div className="admin-departments-main">
        <AdminNavbar />

        <main className="admin-departments-content">
          <div className="admin-departments-header">
            <div>
              <p>ORGANIZATION</p>

              <h1>Departments</h1>

              <span>
                Manage organization departments
                and department managers.
              </span>
            </div>

            <button
              className="admin-add-department-button"
              onClick={openCreateModal}
            >
              <Plus size={18} />
              Add Department
            </button>
          </div>

          <div className="admin-department-stats">
            <div className="admin-department-stat-card">
              <div className="admin-department-stat-icon">
                <Building2 size={22} />
              </div>

              <div>
                <span>Total Departments</span>

                <strong>
                  {loading
                    ? "..."
                    : departments.length}
                </strong>
              </div>
            </div>

            <div className="admin-department-stat-card">
              <div className="admin-department-stat-icon">
                <Building2 size={22} />
              </div>

              <div>
                <span>Active Departments</span>

                <strong>
                  {loading
                    ? "..."
                    : activeDepartments}
                </strong>
              </div>
            </div>

            <div className="admin-department-stat-card">
              <div className="admin-department-stat-icon">
                <Users size={22} />
              </div>

              <div>
                <span>Total Employees</span>

                <strong>
                  {loading
                    ? "..."
                    : totalEmployees}
                </strong>
              </div>
            </div>
          </div>

          <section className="admin-departments-card">
            <div className="admin-departments-toolbar">
              <input
                type="text"
                placeholder="Search departments..."
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
              />
            </div>

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

            <div className="admin-departments-table-wrapper">
              <table className="admin-departments-table">
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Manager</th>
                    <th>Employees</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="admin-department-empty"
                      >
                        Loading departments...
                      </td>
                    </tr>
                  ) : filteredDepartments.length >
                    0 ? (
                    filteredDepartments.map(
                      (department) => (
                        <tr key={department.id}>
                          <td>
                            <div className="admin-department-name">
                              <div className="admin-department-avatar">
                                <Building2
                                  size={18}
                                />
                              </div>

                              <strong>
                                {department.name}
                              </strong>
                            </div>
                          </td>

                          <td>
                            {department.manager ||
                              "Not Assigned"}
                          </td>

                          <td>
                            {getEmployeeCount(
                              department.name
                            )}
                          </td>

                          <td>
                            <span
                              className={`admin-department-status ${
                                department.status ===
                                "Active"
                                  ? "active"
                                  : "inactive"
                              }`}
                            >
                              {
                                department.status
                              }
                            </span>
                          </td>

                          <td>
                            <div className="admin-department-actions">
                              <button
                                title="Edit department"
                                onClick={() =>
                                  openEditModal(
                                    department
                                  )
                                }
                              >
                                <Pencil
                                  size={16}
                                />
                              </button>

                              <button
                                title="Delete department"
                                className="delete"
                                onClick={() =>
                                  deleteDepartment(
                                    department
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
                        className="admin-department-empty"
                      >
                        No departments found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>

      {showModal && (
        <div className="admin-department-modal-overlay">
          <div className="admin-department-modal">
            <div className="admin-department-modal-header">
              <div>
                <h2>
                  {editingDepartment
                    ? "Edit Department"
                    : "Add Department"}
                </h2>

                <p>
                  Configure department details.
                </p>
              </div>

              <button
                className="admin-department-modal-close"
                onClick={closeModal}
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="admin-department-form-group">
                <label>
                  Department Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter department name"
                />
              </div>

              <div className="admin-department-form-group">
                <label>
                  Department Manager
                </label>

                <input
                  type="text"
                  name="manager"
                  value={formData.manager}
                  onChange={handleChange}
                  placeholder="Enter manager name"
                />
              </div>

              <div className="admin-department-form-group">
                <label>Status</label>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="Active">
                    Active
                  </option>

                  <option value="Inactive">
                    Inactive
                  </option>
                </select>
              </div>

              <div className="admin-department-modal-actions">
                <button
                  type="button"
                  className="cancel"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save"
                >
                  {editingDepartment
                    ? "Update Department"
                    : "Create Department"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDepartments;