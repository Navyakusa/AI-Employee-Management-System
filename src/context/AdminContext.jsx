import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const AdminContext = createContext();

// ============================================================
// DEFAULT USERS
// ============================================================

const defaultUsers = [
  {
    id: 1,
    name: "Rahul Sharma",
    email: "rahul@example.com",
    role: "Employee",
    department: "Engineering",
    status: "Active",
  },
  {
    id: 2,
    name: "Anjali Reddy",
    email: "anjali@example.com",
    role: "Recruiter",
    department: "Human Resources",
    status: "Active",
  },
  {
    id: 3,
    name: "Kiran Kumar",
    email: "kiran@example.com",
    role: "Hiring Manager",
    department: "Engineering",
    status: "Active",
  },
  {
    id: 4,
    name: "Priya Singh",
    email: "priya@example.com",
    role: "Interviewer",
    department: "Engineering",
    status: "Inactive",
  },
];

// ============================================================
// DEFAULT ACTIVITIES
// ============================================================

const defaultActivities = [
  {
    id: 1,
    message: "New recruiter account created",
    time: "1 hour ago",
  },
  {
    id: 2,
    message: "Engineering department updated",
    time: "2 hours ago",
  },
  {
    id: 3,
    message: "New HR Manager added",
    time: "3 hours ago",
  },
];

// ============================================================
// DEFAULT AUDIT LOGS
// ============================================================

const defaultAuditLogs = [];

// ============================================================
// SAFE LOCAL STORAGE READER
// ============================================================

function getStoredData(key, fallback) {
  try {
    const storedValue = localStorage.getItem(key);

    // Nothing stored yet
    if (!storedValue) {
      return fallback;
    }

    const parsedValue = JSON.parse(storedValue);

    // Make sure null/undefined does not replace defaults
    if (parsedValue === null || parsedValue === undefined) {
      return fallback;
    }

    return parsedValue;
  } catch (error) {
    console.error(
      `Failed to read ${key} from localStorage:`,
      error
    );

    // Remove corrupted localStorage value
    try {
      localStorage.removeItem(key);
    } catch (removeError) {
      console.error(
        `Failed to remove corrupted ${key}:`,
        removeError
      );
    }

    return fallback;
  }
}

// ============================================================
// ADMIN PROVIDER
// ============================================================

export function AdminProvider({ children }) {
  // ==========================================================
  // USERS
  // ==========================================================

  const [users, setUsers] = useState(() =>
    getStoredData(
      "adminUsers",
      defaultUsers
    )
  );

  // ==========================================================
  // ACTIVITIES
  // ==========================================================

  const [activities, setActivities] = useState(() =>
    getStoredData(
      "adminActivities",
      defaultActivities
    )
  );

  // ==========================================================
  // AUDIT LOGS
  // ==========================================================

  const [auditLogs, setAuditLogs] = useState(() =>
    getStoredData(
      "adminAuditLogs",
      defaultAuditLogs
    )
  );

  // ==========================================================
  // SAVE USERS
  // ==========================================================

  useEffect(() => {
    try {
      localStorage.setItem(
        "adminUsers",
        JSON.stringify(users)
      );
    } catch (error) {
      console.error(
        "Failed to save adminUsers:",
        error
      );
    }
  }, [users]);

  // ==========================================================
  // SAVE ACTIVITIES
  // ==========================================================

  useEffect(() => {
    try {
      localStorage.setItem(
        "adminActivities",
        JSON.stringify(activities)
      );
    } catch (error) {
      console.error(
        "Failed to save adminActivities:",
        error
      );
    }
  }, [activities]);

  // ==========================================================
  // SAVE AUDIT LOGS
  // ==========================================================

  useEffect(() => {
    try {
      localStorage.setItem(
        "adminAuditLogs",
        JSON.stringify(auditLogs)
      );
    } catch (error) {
      console.error(
        "Failed to save adminAuditLogs:",
        error
      );
    }
  }, [auditLogs]);

  // ==========================================================
  // ADD ACTIVITY
  // ==========================================================

  const addActivity = (message) => {
    const activity = {
      id: Date.now(),
      message,
      time: "Just now",
    };

    setActivities((prev) => [
      activity,
      ...prev,
    ]);
  };

  // ==========================================================
  // ADD AUDIT LOG
  // ==========================================================

  const addAuditLog = ({
    module,
    action,
    type,
    details,
    performedBy = "Super Admin",
  }) => {
    const now = new Date();

    const newLog = {
      id: Date.now(),
      module,
      action,
      type,
      details,
      performedBy,
      timestamp: now.toISOString(),
      date: now.toLocaleString(),
    };

    setAuditLogs((prev) => [
      newLog,
      ...prev,
    ]);
  };

  // ==========================================================
  // ADD USER
  // ==========================================================

  const addUser = (userData) => {
    const newUser = {
      id: Date.now(),
      ...userData,
    };

    setUsers((prev) => [
      newUser,
      ...prev,
    ]);

    addActivity(
      `New ${userData.role} account created`
    );

    addAuditLog({
      module: "Users",
      action: "User Created",
      type: "Create",
      details: `${userData.name} (${userData.email}) was created`,
    });
  };

  // ==========================================================
  // UPDATE USER
  // ==========================================================

  const updateUser = (id, updatedData) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id
          ? {
              ...user,
              ...updatedData,
            }
          : user
      )
    );

    addActivity(
      `${updatedData.name} account updated`
    );

    addAuditLog({
      module: "Users",
      action: "User Updated",
      type: "Update",
      details: `${updatedData.name} account details were updated`,
    });
  };

  // ==========================================================
  // TOGGLE USER STATUS
  // ==========================================================

  const toggleUserStatus = (id) => {
    const selectedUser = users.find(
      (user) => user.id === id
    );

    if (!selectedUser) {
      return;
    }

    const newStatus =
      selectedUser.status === "Active"
        ? "Inactive"
        : "Active";

    setUsers((prev) =>
      prev.map((user) =>
        user.id === id
          ? {
              ...user,
              status: newStatus,
            }
          : user
      )
    );

    addActivity(
      `${selectedUser.name} account ${newStatus.toLowerCase()}`
    );

    addAuditLog({
      module: "Users",
      action: "Status Changed",
      type: "Status",
      details: `${selectedUser.name} status changed to ${newStatus}`,
    });
  };

  // ==========================================================
  // PROVIDER
  // ==========================================================

  return (
    <AdminContext.Provider
      value={{
        users,
        activities,
        auditLogs,
        addUser,
        updateUser,
        toggleUserStatus,
        addAuditLog,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

// ============================================================
// useAdmin HOOK
// ============================================================

export function useAdmin() {
  return useContext(AdminContext);
}