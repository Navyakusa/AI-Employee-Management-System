import { useMemo, useState } from "react";
import {
  Search,
  Filter,
  Eye,
  Pencil,
  Users,
  UserCheck,
  UserPlus,
  UserMinus,
} from "lucide-react";

import "./HREmployees.css";

const employeesData = [
  {
    id: "EMP-001",
    name: "Rahul Sharma",
    email: "rahul.sharma@talentai.com",
    phone: "+91 98765 43210",
    department: "Engineering",
    designation: "Senior Java Developer",
    joiningDate: "12 Jan 2024",
    manager: "Anil Kumar",
    location: "Hyderabad",
    employmentType: "Full Time",
    status: "Active",
  },
  {
    id: "EMP-002",
    name: "Priya Reddy",
    email: "priya.reddy@talentai.com",
    phone: "+91 98765 12345",
    department: "Engineering",
    designation: "Frontend Developer",
    joiningDate: "05 Mar 2024",
    manager: "Anil Kumar",
    location: "Hyderabad",
    employmentType: "Full Time",
    status: "Active",
  },
  {
    id: "EMP-003",
    name: "Arjun Kumar",
    email: "arjun.kumar@talentai.com",
    phone: "+91 91234 56789",
    department: "Design",
    designation: "UI/UX Designer",
    joiningDate: "18 Jun 2023",
    manager: "Meera Rao",
    location: "Bangalore",
    employmentType: "Full Time",
    status: "Active",
  },
  {
    id: "EMP-004",
    name: "Sneha Patel",
    email: "sneha.patel@talentai.com",
    phone: "+91 99887 66554",
    department: "Human Resources",
    designation: "HR Executive",
    joiningDate: "10 Aug 2024",
    manager: "Kavya Singh",
    location: "Hyderabad",
    employmentType: "Full Time",
    status: "On Leave",
  },
  {
    id: "EMP-005",
    name: "Vikram Singh",
    email: "vikram.singh@talentai.com",
    phone: "+91 90123 45678",
    department: "Engineering",
    designation: "Backend Developer",
    joiningDate: "22 Sep 2022",
    manager: "Anil Kumar",
    location: "Pune",
    employmentType: "Full Time",
    status: "Active",
  },
  {
    id: "EMP-006",
    name: "Meera Rao",
    email: "meera.rao@talentai.com",
    phone: "+91 90909 12345",
    department: "Finance",
    designation: "Finance Manager",
    joiningDate: "15 Feb 2021",
    manager: "Rajesh Verma",
    location: "Hyderabad",
    employmentType: "Full Time",
    status: "Active",
  },
];

function HREmployees() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredEmployees = useMemo(() => {
    return employeesData.filter((employee) => {
      const search = searchTerm.toLowerCase();

      const matchesSearch =
        employee.name.toLowerCase().includes(search) ||
        employee.id.toLowerCase().includes(search) ||
        employee.department.toLowerCase().includes(search) ||
        employee.designation.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "All" || employee.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  const totalEmployees = employeesData.length;

  const activeEmployees = employeesData.filter(
    (employee) => employee.status === "Active"
  ).length;

  const onLeaveEmployees = employeesData.filter(
    (employee) => employee.status === "On Leave"
  ).length;

  const newEmployees = 18;

  return (
    <div className="employees-page">
      <div className="employees-header">
        <div>
          <h1>Employees</h1>
          <p>Manage employee records and workforce information</p>
        </div>

        <button className="add-employee-btn">
          <UserPlus size={18} />
          Add Employee
        </button>
      </div>

      <div className="employee-stats">
        <div className="employee-stat-card">
          <div className="employee-stat-icon purple">
            <Users size={21} />
          </div>

          <div>
            <span>Total Employees</span>
            <strong>250</strong>
            <small>All employees</small>
          </div>
        </div>

        <div className="employee-stat-card">
          <div className="employee-stat-icon green">
            <UserCheck size={21} />
          </div>

          <div>
            <span>Active Employees</span>
            <strong>237</strong>
            <small>Currently active</small>
          </div>
        </div>

        <div className="employee-stat-card">
          <div className="employee-stat-icon blue">
            <UserPlus size={21} />
          </div>

          <div>
            <span>New Employees</span>
            <strong>{newEmployees}</strong>
            <small>This month</small>
          </div>
        </div>

        <div className="employee-stat-card">
          <div className="employee-stat-icon orange">
            <UserMinus size={21} />
          </div>

          <div>
            <span>On Leave</span>
            <strong>7</strong>
            <small>Currently on leave</small>
          </div>
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
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="employees-table-wrapper">
          <table className="employees-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Employee ID</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Joining Date</th>
                <th>Manager</th>
                <th>Location</th>
                <th>Employment</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee) => (
                  <tr key={employee.id}>
                    <td>
                      <div className="employee-name-cell">
                        <div className="employee-avatar">
                          {employee.name.charAt(0)}
                        </div>

                        <div>
                          <strong>{employee.name}</strong>
                          <span>{employee.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="employee-id">{employee.id}</td>

                    <td>{employee.department}</td>

                    <td className="designation">
                      {employee.designation}
                    </td>

                    <td>{employee.joiningDate}</td>

                    <td>{employee.manager}</td>

                    <td>{employee.location}</td>

                    <td>{employee.employmentType}</td>

                    <td>
                      <span
                        className={`employee-status ${employee.status
                          .toLowerCase()
                          .replace(" ", "-")}`}
                      >
                        <span className="status-dot"></span>
                        {employee.status}
                      </span>
                    </td>

                    <td>
                      <div className="employee-actions">
                        <button
                          className="employee-action-btn"
                          title="View Employee"
                        >
                          <Eye size={17} />
                        </button>

                        <button
                          className="employee-action-btn"
                          title="Edit Employee"
                        >
                          <Pencil size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="employee-empty">
                    No employees found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="employees-footer">
          Showing <strong>{filteredEmployees.length}</strong> of{" "}
          <strong>{employeesData.length}</strong> employees
        </div>
      </div>
    </div>
  );
}

export default HREmployees;