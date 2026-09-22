import { Link, NavLink } from "react-router-dom";

function Navbar() {
  return (
    <header className="navbar">
      <div className="container navbar-content">

        <Link to="/" className="logo">
          TalentAI
        </Link>

        <nav className="nav-links">
          <NavLink to="/">Home</NavLink>

          <NavLink to="/jobs">
            Jobs
          </NavLink>

          <NavLink to="/about">
            About
          </NavLink>

          <NavLink to="/contact">
            Contact
          </NavLink>
        </nav>

        <div className="nav-actions">
          <Link
            to="/login"
            className="login-link"
          >
            Login
          </Link>
          
        </div>
        

      </div>
    </header>
  );
}

export default Navbar;