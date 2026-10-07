import { useEffect, useState } from "react";
import {
  Search,
  Filter,
  Eye,
  Pencil,
  Users,
  UserCheck,
  UserPlus,
  UserMinus,
  X,
} from "lucide-react";

import HRSidebar from "./HRSidebar";
import HRNavbar from "./HRNavbar";
import {
  fetchEmployees,
  fetchEmployeeById,
  fetchEmployeeStatistics,
  searchEmployees,
  fetchEmployeesByStatus,
  createEmployee,
  updateEmployee,
} from "./hrApi";
import "./HREmployees.css";

const emptyForm = {
  employeeId: "",
  name: "",
  email: "",
  phone: "",
  department: "",
  designation: "",
  joiningDate: "",
  manager: "",
  location: "",
  employmentType: "Full Time",
  status: "ACTIVE",
};

function formatStatus(status) {
  if (!status) return "";

  return String(status)
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function normalizeEmployee(employee) {
  return {
    ...employee,
    databaseId: employee.id,
    id: employee.employeeId || employee.id || "-",
    status: employee.status || "ACTIVE",
    joiningDate: employee.joiningDate || "",
    employmentType: employee.employmentType || "-",
  };
}

function HREmployees() {
  const [employees, setEmployees] = useState([]);
  const [statistics, setStatistics] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    newEmployees: 0,
    onLeave: 0,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showViewEmployee, setShowViewEmployee] = useState(false);
  const [showEditEmployee, setShowEditEmployee] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadEmployees = async (searchValue = searchTerm, statusValue = statusFilter) => {
    try {
      setLoading(true);
      setError("");

      let data;

      if (searchValue.trim()) {
        data = await searchEmployees(searchValue.trim());
      } else if (statusValue !== "All") {
        data = await fetchEmployeesByStatus(statusValue);
      } else {
        data = await fetchEmployees();
      }

      let employeeList = Array.isArray(data) ? data : [];

      // The backend has separate search and status endpoints, not one combined endpoint.
      // When both filters are selected, apply the second filter on the already searched data.
      if (searchValue.trim() && statusValue !== "All") {
        employeeList = employeeList.filter(
          (employee) =>
            String(employee.status || "").toUpperCase() === statusValue
        );
      }

      setEmployees(employeeList.map(normalizeEmployee));
    } catch (err) {
      console.error("Failed to load employees:", err);
      setError(err.message || "Failed to load employees.");
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const data = await fetchEmployeeStatistics();

      setStatistics({
        totalEmployees: Number(data?.totalEmployees || 0),
        activeEmployees: Number(data?.activeEmployees || 0),
        newEmployees: Number(data?.newEmployees || 0),
        onLeave: Number(data?.onLeave || 0),
      });
    } catch (err) {
      console.error("Failed to load employee statistics:", err);
    }
  };

  useEffect(() => {
    loadEmployees("", "All");
    loadStatistics();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadEmployees(searchTerm, statusFilter);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const openAddEmployee = () => {
    setFormData({ ...emptyForm });
    setFormError("");
    setSuccessMessage("");
    setShowAddEmployee(true);
  };

  const closeAddEmployee = () => {
    if (saving) return;

    setShowAddEmployee(false);
    setFormData({ ...emptyForm });
    setFormError("");
  };

  const handleCreateEmployee = async (event) => {
    event.preventDefault();
    setFormError("");
    setSuccessMessage("");

    const requiredFields = [
      "employeeId",
      "name",
      "email",
      "department",
      "designation",
      "joiningDate",
      "manager",
      "location",
    ];

    const missingField = requiredFields.find(
      (field) => !String(formData[field] || "").trim()
    );

    if (missingField) {
      setFormError("Please fill in all required fields.");
      return;
    }

    try {
      setSaving(true);

      await createEmployee({
        employeeId: formData.employeeId.trim(),
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        department: formData.department.trim(),
        designation: formData.designation.trim(),
        joiningDate: formData.joiningDate,
        manager: formData.manager.trim(),
        location: formData.location.trim(),
        employmentType: formData.employmentType,
        status: formData.status,
      });

      await Promise.all([
        loadEmployees(searchTerm, statusFilter),
        loadStatistics(),
      ]);

      setShowAddEmployee(false);
      setFormData({ ...emptyForm });
      setSuccessMessage("Employee added successfully.");
    } catch (err) {
      console.error("Failed to create employee:", err);
      setFormError(err.message || "Failed to create employee.");
    } finally {
      setSaving(false);
    }
  };

  const openViewEmployee = async (employee) => {
    if (!employee.databaseId) {
      setError("This employee does not have a database ID.");
      return;
    }

    try {
      setDetailsLoading(true);
      setError("");
      const data = await fetchEmployeeById(employee.databaseId);
      setSelectedEmployee(normalizeEmployee(data));
      setShowViewEmployee(true);
    } catch (err) {
      console.error("Failed to load employee:", err);
      setError(err.message || "Failed to load employee details.");
    } finally {
      setDetailsLoading(false);
    }
  };

  const openEditEmployee = async (employee) => {
    if (!employee.databaseId) {
      setError("This employee does not have a database ID.");
      return;
    }

    try {
      setDetailsLoading(true);
      setError("");
      const data = await fetchEmployeeById(employee.databaseId);
      const normalized = normalizeEmployee(data);

      setSelectedEmployee(normalized);
      setFormData({
        employeeId: normalized.employeeId || "",
        name: normalized.name || "",
        email: normalized.email || "",
        phone: normalized.phone || "",
        department: normalized.department || "",
        designation: normalized.designation || "",
        joiningDate: normalized.joiningDate || "",
        manager: normalized.manager || "",
        location: normalized.location || "",
        employmentType: normalized.employmentType || "Full Time",
        status: normalized.status || "ACTIVE",
      });
      setFormError("");
      setShowEditEmployee(true);
    } catch (err) {
      console.error("Failed to load employee for editing:", err);
      setError(err.message || "Failed to load employee for editing.");
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeEditEmployee = () => {
    if (saving) return;

    setShowEditEmployee(false);
    setSelectedEmployee(null);
    setFormData({ ...emptyForm });
    setFormError("");
  };

  const handleUpdateEmployee = async (event) => {
    event.preventDefault();
    setFormError("");

    if (!selectedEmployee?.databaseId) {
      setFormError("Employee ID is missing.");
      return;
    }

    try {
      setSaving(true);

      await updateEmployee(selectedEmployee.databaseId, {
        employeeId: formData.employeeId.trim(),
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        department: formData.department.trim(),
        designation: formData.designation.trim(),
        joiningDate: formData.joiningDate,
        manager: formData.manager.trim(),
        location: formData.location.trim(),
        employmentType: formData.employmentType,
        status: formData.status,
      });

      await Promise.all([
        loadEmployees(searchTerm, statusFilter),
        loadStatistics(),
      ]);

      setShowEditEmployee(false);
      setSelectedEmployee(null);
      setFormData({ ...emptyForm });
      setSuccessMessage("Employee updated successfully.");
    } catch (err) {
      console.error("Failed to update employee:", err);
      setFormError(err.message || "Failed to update employee.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="employees-layout">
      <HRSidebar />

      <HRNavbar />

      <main className="employees-page employees-page-with-navbar">
        <div className="employees-header">
          <div>
            <h1>Employees</h1>
            <p>Manage employee records and workforce information</p>
          </div>

          <button
            type="button"
            className="add-employee-btn"
            onClick={openAddEmployee}
          >
            <UserPlus size={18} />
            Add Employee
          </button>
        </div>

        {successMessage && (
          <div className="employee-success-message">{successMessage}</div>
        )}

        <div className="employee-stats">
          <div className="employee-stat-card">
            <div className="employee-stat-icon purple"><Users size={21} /></div>
            <div><span>Total Employees</span><strong>{statistics.totalEmployees}</strong><small>All employees</small></div>
          </div>
          <div className="employee-stat-card">
            <div className="employee-stat-icon green"><UserCheck size={21} /></div>
            <div><span>Active Employees</span><strong>{statistics.activeEmployees}</strong><small>Currently active</small></div>
          </div>
          <div className="employee-stat-card">
            <div className="employee-stat-icon blue"><UserPlus size={21} /></div>
            <div><span>New Employees</span><strong>{statistics.newEmployees}</strong><small>This month</small></div>
          </div>
          <div className="employee-stat-card">
            <div className="employee-stat-icon orange"><UserMinus size={21} /></div>
            <div><span>On Leave</span><strong>{statistics.onLeave}</strong><small>Currently on leave</small></div>
          </div>
        </div>

        <div className="employees-card">
          <div className="employees-toolbar">
            <div className="employee-search">
              <Search size={19} />
              <input
                type="text"
                placeholder="Search employee, ID, department..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>

            <div className="employee-filter">
              <Filter size={18} />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="All">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="ON_LEAVE">On Leave</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          {error && <div className="employee-error-message">{error}</div>}

          <div className="employees-table-wrapper">
            <table className="employees-table">
              <thead>
                <tr>
                  <th>Employee</th><th>Employee ID</th><th>Department</th><th>Designation</th>
                  <th>Joining Date</th><th>Manager</th><th>Location</th><th>Employment</th>
                  <th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="10" className="employee-empty">Loading employees...</td></tr>
                ) : employees.length > 0 ? (
                  employees.map((employee) => {
                    const displayStatus = formatStatus(employee.status);
                    const statusClass = String(employee.status || "").toLowerCase().replace("_", "-");

                    return (
                      <tr key={employee.databaseId || employee.id}>
                        <td>
                          <div className="employee-name-cell">
                            <div className="employee-avatar">{String(employee.name || "?").charAt(0).toUpperCase()}</div>
                            <div><strong>{employee.name}</strong><span>{employee.email}</span></div>
                          </div>
                        </td>
                        <td className="employee-id">{employee.id}</td>
                        <td>{employee.department}</td>
                        <td className="designation">{employee.designation}</td>
                        <td>{employee.joiningDate}</td>
                        <td>{employee.manager}</td>
                        <td>{employee.location}</td>
                        <td>{employee.employmentType}</td>
                        <td>
                          <span className={`employee-status ${statusClass}`}>
                            <span className="status-dot"></span>{displayStatus}
                          </span>
                        </td>
                        <td>
                          <div className="employee-actions">
                            <button
                              type="button"
                              className="employee-action-btn"
                              title="View Employee"
                              onClick={() => openViewEmployee(employee)}
                              disabled={detailsLoading}
                            ><Eye size={17} /></button>
                            <button
                              type="button"
                              className="employee-action-btn"
                              title="Edit Employee"
                              onClick={() => openEditEmployee(employee)}
                              disabled={detailsLoading}
                            ><Pencil size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr><td colSpan="10" className="employee-empty">No employees found.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="employees-footer">
            Showing <strong>{employees.length}</strong> employees
          </div>
        </div>
      </main>

      {showAddEmployee && (
        <div className="employee-modal-overlay" onMouseDown={closeAddEmployee}>
          <div className="employee-modal" onMouseDown={(event) => event.stopPropagation()}>
            <ModalHeader title="Add Employee" subtitle="Create a new employee record" onClose={closeAddEmployee} disabled={saving} />
            <EmployeeForm
              formData={formData}
              onChange={handleInputChange}
              onSubmit={handleCreateEmployee}
              onCancel={closeAddEmployee}
              error={formError}
              saving={saving}
              submitText="Save Employee"
            />
          </div>
        </div>
      )}

      {showEditEmployee && (
        <div className="employee-modal-overlay" onMouseDown={closeEditEmployee}>
          <div className="employee-modal" onMouseDown={(event) => event.stopPropagation()}>
            <ModalHeader title="Edit Employee" subtitle="Update employee information" onClose={closeEditEmployee} disabled={saving} />
            <EmployeeForm
              formData={formData}
              onChange={handleInputChange}
              onSubmit={handleUpdateEmployee}
              onCancel={closeEditEmployee}
              error={formError}
              saving={saving}
              submitText="Update Employee"
            />
          </div>
        </div>
      )}

      {showViewEmployee && selectedEmployee && (
        <div className="employee-modal-overlay" onMouseDown={() => setShowViewEmployee(false)}>
          <div className="employee-modal employee-view-modal" onMouseDown={(event) => event.stopPropagation()}>
            <ModalHeader title="Employee Details" subtitle="Data loaded from GET /api/employees/{id}" onClose={() => setShowViewEmployee(false)} />
            <div className="employee-details-grid">
              {[
                ["Employee ID", selectedEmployee.employeeId],
                ["Name", selectedEmployee.name],
                ["Email", selectedEmployee.email],
                ["Phone", selectedEmployee.phone],
                ["Department", selectedEmployee.department],
                ["Designation", selectedEmployee.designation],
                ["Joining Date", selectedEmployee.joiningDate],
                ["Manager", selectedEmployee.manager],
                ["Location", selectedEmployee.location],
                ["Employment Type", selectedEmployee.employmentType],
                ["Status", formatStatus(selectedEmployee.status)],
              ].map(([label, value]) => (
                <div className="employee-detail-item" key={label}>
                  <span>{label}</span>
                  <strong>{value || "-"}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ModalHeader({ title, subtitle, onClose, disabled }) {
  return (
    <div className="employee-modal-header">
      <div><h2>{title}</h2><p>{subtitle}</p></div>
      <button type="button" className="employee-modal-close" onClick={onClose} disabled={disabled}><X size={20} /></button>
    </div>
  );
}

function EmployeeForm({ formData, onChange, onSubmit, onCancel, error, saving, submitText }) {
  return (
    <form onSubmit={onSubmit}>
      <div className="employee-form-grid">
        <label>Employee ID <span>*</span><input name="employeeId" value={formData.employeeId} onChange={onChange} placeholder="EMP-007" required /></label>
        <label>Name <span>*</span><input name="name" value={formData.name} onChange={onChange} placeholder="Employee name" required /></label>
        <label>Email <span>*</span><input type="email" name="email" value={formData.email} onChange={onChange} placeholder="employee@talentai.com" required /></label>
        <label>Phone<input name="phone" value={formData.phone} onChange={onChange} placeholder="+91 98765 43210" /></label>
        <label>Department <span>*</span><input name="department" value={formData.department} onChange={onChange} placeholder="Engineering" required /></label>
        <label>Designation <span>*</span><input name="designation" value={formData.designation} onChange={onChange} placeholder="Frontend Developer" required /></label>
        <label>Joining Date <span>*</span><input type="date" name="joiningDate" value={formData.joiningDate} onChange={onChange} required /></label>
        <label>Manager <span>*</span><input name="manager" value={formData.manager} onChange={onChange} placeholder="Manager name" required /></label>
        <label>Location <span>*</span><input name="location" value={formData.location} onChange={onChange} placeholder="Hyderabad" required /></label>
        <label>Employment Type<select name="employmentType" value={formData.employmentType} onChange={onChange}><option>Full Time</option><option>Part Time</option><option>Contract</option><option>Intern</option></select></label>
        <label>Status<select name="status" value={formData.status} onChange={onChange}><option value="ACTIVE">Active</option><option value="ON_LEAVE">On Leave</option><option value="INACTIVE">Inactive</option></select></label>
      </div>
      {error && <div className="employee-form-error">{error}</div>}
      <div className="employee-form-actions">
        <button type="button" className="employee-cancel-btn" onClick={onCancel} disabled={saving}>Cancel</button>
        <button type="submit" className="employee-save-btn" disabled={saving}>{saving ? "Saving..." : submitText}</button>
      </div>
    </form>
  );
}

export default HREmployees;
