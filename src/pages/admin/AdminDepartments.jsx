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

  // ============================================================
  // STATES
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

  const [filteredDepartments, setFilteredDepartments] =
    useState([]);

  // ============================================================
  // GET ALL DEPARTMENTS
  // GET /api/departments/all
  // ============================================================

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiClient.get(
        "/departments/all"
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

      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // LOAD DEPARTMENTS
  // ============================================================

  useEffect(() => {
    fetchDepartments();
  }, []);

  // ============================================================
  // SEARCH DEPARTMENTS
  // ============================================================

  useEffect(() => {
    const searchDepartments = async () => {
      const value = searchTerm.trim();

      if (!value) {
        setFilteredDepartments(departments);
        return;
      }

      try {
        const response = await apiClient.get(
          "/departments/search",
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
      name: department.name || "",
      manager: department.manager || "",
      status: department.status || "Active",
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
  // HANDLE INPUT CHANGE
  // ============================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ============================================================
  // ADD / EDIT DEPARTMENT
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Department name is required.");
      return;
    }

    // ==========================================================
    // EDIT DEPARTMENT
    // PUT /api/departments/{id}
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
          `/departments/${editingDepartment.id}`,
          requestBody
        );

        console.log(
          "Update Department Response:",
          response.data
        );

        if (response.data) {
          alert(
            response.data?.message ||
              "Department updated successfully."
          );

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
        "/departments/create",
        requestBody
      );

      console.log(
        "Create Department Response:",
        response.data
      );

      if (response.data) {
        alert(
          response.data?.message ||
            "Department created successfully."
        );

        closeModal();

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
  // DELETE DEPARTMENT
  // DELETE /api/departments/{id}
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
        `/departments/${department.id}`
      );

      console.log(
        "Delete Department Response:",
        response.data
      );

      alert(
        response.data?.message ||
          "Department deleted successfully."
      );

      await fetchDepartments();
    } catch (error) {
      console.error(
        "Delete Department Error:",
        error.response?.data ||
          error.message
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
    if (!Array.isArray(users)) {
      return 0;
    }

    return users.filter((user) => {
      const userDepartment =
        typeof user.department === "string"
          ? user.department
          : user.department?.departmentName ||
            user.department?.name ||
            "";

      return (
        userDepartment.toLowerCase() ===
        departmentName.toLowerCase()
      );
    }).length;
  };

  const totalEmployees = departments.reduce(
    (total, department) =>
      total +
      getEmployeeCount(department.name),
    0
  );

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="admin-departments-layout">
      <AdminSidebar />

      <div className="admin-departments-main">
        <AdminNavbar />

        <main className="admin-departments-content">

          {/* ====================================================
              HEADER
          ==================================================== */}

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

          {/* ====================================================
              STATISTICS
          ==================================================== */}

          <div className="admin-department-stats">

            {/* TOTAL DEPARTMENTS */}

            <div className="admin-department-stat-card">
              <div className="admin-department-stat-icon">
                <Building2 size={22} />
              </div>

              <div>
                <span>
                  Total Departments
                </span>

                <strong>
                  {loading
                    ? "..."
                    : departments.length}
                </strong>
              </div>
            </div>

            {/* ACTIVE DEPARTMENTS */}

            <div className="admin-department-stat-card">
              <div className="admin-department-stat-icon">
                <Building2 size={22} />
              </div>

              <div>
                <span>
                  Active Departments
                </span>

                <strong>
                  {loading
                    ? "..."
                    : activeDepartments}
                </strong>
              </div>
            </div>

            {/* TOTAL EMPLOYEES */}

            <div className="admin-department-stat-card">
              <div className="admin-department-stat-icon">
                <Users size={22} />
              </div>

              <div>
                <span>
                  Total Employees
                </span>

                <strong>
                  {loading
                    ? "..."
                    : totalEmployees}
                </strong>
              </div>
            </div>
          </div>

          {/* ====================================================
              DEPARTMENT LIST
          ==================================================== */}

          <section className="admin-departments-card">

            {/* SEARCH */}

            <div className="admin-departments-toolbar">
              <input
                type="text"
                placeholder="Search departments..."
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

            <div className="admin-departments-table-wrapper">
              <table className="admin-departments-table">

                <thead>
                  <tr>
                    <th>
                      Department
                    </th>

                    <th>
                      Manager
                    </th>

                    <th>
                      Employees
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {/* LOADING */}

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

                    /* DEPARTMENT ROWS */

                    filteredDepartments.map(
                      (department) => (
                        <tr
                          key={
                            department.id
                          }
                        >

                          {/* DEPARTMENT */}

                          <td>
                            <div className="admin-department-name">

                              <div className="admin-department-avatar">
                                <Building2
                                  size={18}
                                />
                              </div>

                              <strong>
                                {
                                  department.name
                                }
                              </strong>

                            </div>
                          </td>

                          {/* MANAGER */}

                          <td>
                            {department.manager ||
                              "Not Assigned"}
                          </td>

                          {/* EMPLOYEE COUNT */}

                          <td>
                            {getEmployeeCount(
                              department.name
                            )}
                          </td>

                          {/* STATUS */}

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

                          {/* ACTIONS */}

                          <td>
                            <div className="admin-department-actions">

                              {/* EDIT */}

                              <button
                                type="button"
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

                              {/* DELETE */}

                              <button
                                type="button"
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

                    /* EMPTY */

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

      {/* ========================================================
          ADD / EDIT DEPARTMENT MODAL
      ======================================================== */}

      {showModal && (
        <div className="admin-department-modal-overlay">

          <div className="admin-department-modal">

            {/* MODAL HEADER */}

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
                type="button"
                className="admin-department-modal-close"
                onClick={closeModal}
              >
                <X size={19} />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
            >

              {/* DEPARTMENT NAME */}

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

              {/* MANAGER */}

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

              {/* STATUS */}

              <div className="admin-department-form-group">
                <label>
                  Status
                </label>

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

              {/* BUTTONS */}

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