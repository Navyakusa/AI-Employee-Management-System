import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Building2,
  BarChart3,
  ClipboardList,
  Settings,
  LogOut,
} from "lucide-react";

function AdminSidebar() {
const menuItems = [
  {
    name: "Dashboard",
    path: "/super-admin/dashboard",
    icon: <LayoutDashboard size={19} />,
  },
  {
    name: "Users",
    path: "/super-admin/users",
    icon: <Users size={19} />,
  },
  {
  name: "Roles",
  path: "/super-admin/roles",
  icon: <ShieldCheck size={19} />,
},
  {
  name: "Departments",
  path: "/super-admin/departments",
  icon: <Building2 size={19} />,
},
  {
    name: "Reports",
    path: "/super-admin/reports",
    icon: <BarChart3 size={19} />,
  },
  {
    name: "Audit Logs",
    path: "/super-admin/audit-logs",
    icon: <ClipboardList size={19} />,
  },

];

  return (
    <aside className="admin-sidebar">

      <div className="admin-sidebar-brand">
        <div className="admin-brand-icon">
          AI
        </div>

        <div>
          <h2>TalentAI</h2>
          <span>Super Admin</span>
        </div>
      </div>

      <nav className="admin-sidebar-menu">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              isActive
                ? "admin-sidebar-link active"
                : "admin-sidebar-link"
            }
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>



    </aside>
  );
}

export default AdminSidebar;