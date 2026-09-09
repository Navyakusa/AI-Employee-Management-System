import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function LoginPage() {
  const navigate = useNavigate();

  const [role, setRole] = useState("hr");

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const enteredEmail = formData.username.trim().toLowerCase();
    const enteredPassword = formData.password;

    if (!enteredEmail || !enteredPassword) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: enteredEmail,
          password: enteredPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.message || "Invalid email or password.");
        return;
      }

      const userData = result.data;

      if (!userData || !userData.token) {
        setError("Login token was not received from backend.");
        return;
      }

      // Save JWT
      localStorage.setItem("token", userData.token);

      // Save logged-in user
      localStorage.setItem(
        "loggedInUser",
        JSON.stringify({
          userId: userData.userId,
          userName: userData.userName,
          email: userData.email,
          backendRole: userData.role,
          selectedRole: role,
        })
      );

      localStorage.setItem("role", role);

      // Keep current selected-role navigation
      switch (role) {
        case "hr":
          navigate("/hr/dashboard");
          break;

        case "super-admin":
          navigate("/super-admin/dashboard");
          break;

        case "recruiter":
          navigate("/recruiter/dashboard");
          break;

        case "hiring-manager":
          navigate("/hiring-manager/dashboard");
          break;

        case "interviewer":
          navigate("/interviewer/dashboard");
          break;

        case "employee":
          navigate("/employee/dashboard");
          break;

        default:
          navigate("/");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* LEFT SIDE */}
      <div className="login-left">
        <div className="login-brand">
          <h1>
            Talent<span>AI</span>
          </h1>
          <p>AI-Powered Recruitment Platform</p>
        </div>

        <div className="login-left-content">
          <h2>
            Manage your
            <br />
            <span>talent smarter.</span>
          </h2>

          <p>
            AI-powered recruitment and employee management platform designed
            for modern organizations.
          </p>

          <div className="login-features">
            <div className="feature-item">
              <div className="feature-icon">✓</div>
              <div>
                <h4>Smart Recruitment</h4>
                <p>AI-powered candidate screening</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">✓</div>
              <div>
                <h4>Employee Management</h4>
                <p>Manage your workforce efficiently</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">✓</div>
              <div>
                <h4>Role Based Access</h4>
                <p>Secure access for every user</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="login-right">
        <div className="login-card">
          <div className="login-header">
            <div className="login-icon">👤</div>

            <h2>Welcome Back</h2>

            <p>Login to your TalentAI account</p>
          </div>

          <form onSubmit={handleLogin}>
            {/* ROLE */}
            <div className="form-group">
              <label htmlFor="role">Login As</label>

              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="role-select"
              >
                <option value="hr">HR</option>
                <option value="hiring-manager">Hiring Manager</option>
                <option value="super-admin">Super Admin</option>
                <option value="recruiter">Recruiter</option>
                <option value="interviewer">Interviewer</option>
                <option value="employee">Employee</option>
              </select>
            </div>

            {/* EMAIL */}
            <div className="form-group">
              <label htmlFor="username">Username / Email</label>

              <input
                type="email"
                id="username"
                name="username"
                placeholder="Enter your email"
                value={formData.username}
                onChange={handleChange}
              />
            </div>

            {/* PASSWORD */}
            <div className="form-group">
              <label htmlFor="password">Password</label>

              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />

                <button
                  type="button"
                  className="show-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* OPTIONS */}
            <div className="login-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>

              <Link to="/forgot-password" className="forgot-password">
                Forgot Password?
              </Link>
            </div>

            {/* ERROR */}
            {error && <div className="login-error">{error}</div>}

            {/* LOGIN */}
            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
              {!loading && <span>→</span>}
            </button>
          </form>

          <div className="divider">
            <span>or</span>
          </div>

          <div className="signup-section">
            <p>Don't have an account?</p>

            <Link to="/signup" className="signup-link">
              Create an Account
            </Link>
          </div>

          <Link to="/" className="back-home">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;