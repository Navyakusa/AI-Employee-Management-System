import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "../../../services/apiClient";

function LoginPage() {
  const navigate = useNavigate();

  // Must match backend/database role values
  const [role, setRole] = useState("HR");

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

  const handleRoleChange = (e) => {
    setRole(e.target.value);
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

    if (!role) {
      setError("Please select a role.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Send email, password AND selected role
      const response = await apiClient.post("/auth/login", {
        email: enteredEmail,
        password: enteredPassword,
        role: role,
      });

      const result = response.data;

      if (!result.success) {
        setError(result.message || "Invalid email or password.");
        return;
      }

      const userData = result.data;

      if (!userData) {
        setError("User data was not received from backend.");
        return;
      }

      if (!userData.token) {
        setError("Login token was not received from backend.");
        return;
      }

      if (!userData.role) {
        setError("User role was not received from backend.");
        return;
      }

      // Extra frontend validation
      // Backend already validates this, but this gives extra safety
      if (userData.role !== role) {
        setError(
            `You are not authorized to login as ${role}.`
        );
        return;
      }

      // Save JWT
      localStorage.setItem("token", userData.token);

      // Always save backend role, not dropdown role
      localStorage.setItem("role", userData.role);

      // Save logged-in user
      localStorage.setItem(
          "loggedInUser",
          JSON.stringify({
            userId: userData.userId,
            userName: userData.userName,
            email: userData.email,
            role: userData.role,
          })
      );

      // Navigate using role returned by backend
      switch (userData.role) {
        case "HR":
          navigate("/hr/dashboard");
          break;

        case "SUPER_ADMIN":
          navigate("/super-admin/dashboard");
          break;

        case "RECRUITER":
          navigate("/recruiter/dashboard");
          break;

        case "HIRING_MANAGER":
          navigate("/hiring-manager/dashboard");
          break;

        case "INTERVIEWER":
          navigate("/interviewer/dashboard");
          break;

        case "EMPLOYEE":
          navigate("/employee/dashboard");
          break;

        case "EMPLOYER":
          navigate("/employer/dashboard");
          break;

        case "CANDIDATE":
          navigate("/candidate/dashboard");
          break;

        default:
          setError(
              `No dashboard configured for role: ${userData.role}`
          );
          break;
      }
    } catch (error) {
      console.error("Login error:", error);

      setError(
          error.response?.data?.message ||
          "Unable to connect to the server. Please try again."
      );
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
              <span> talent smarter.</span>
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
                    onChange={handleRoleChange}
                    className="role-select"
                >
                  <option value="HR">HR</option>

                  <option value="HIRING_MANAGER">
                    Hiring Manager
                  </option>

                  <option value="SUPER_ADMIN">
                    Super Admin
                  </option>

                  <option value="RECRUITER">
                    Recruiter
                  </option>

                  <option value="INTERVIEWER">
                    Interviewer
                  </option>

                  <option value="EMPLOYEE">
                    Employee
                  </option>

                  <option value="EMPLOYER">
                    Employer
                  </option>

                  <option value="CANDIDATE">
                    Candidate
                  </option>
                </select>
              </div>

              {/* EMAIL */}
              <div className="form-group">
                <label htmlFor="username">
                  Username / Email
                </label>

                <input
                    type="email"
                    id="username"
                    name="username"
                    placeholder="Enter your email"
                    value={formData.username}
                    onChange={handleChange}
                    autoComplete="email"
                />
              </div>

              {/* PASSWORD */}
              <div className="form-group">
                <label htmlFor="password">
                  Password
                </label>

                <div className="password-wrapper">
                  <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      autoComplete="current-password"
                  />

                  <button
                      type="button"
                      className="show-password"
                      onClick={() =>
                          setShowPassword((prev) => !prev)
                      }
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

                <Link
                    to="/forgot-password"
                    className="forgot-password"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* ERROR */}
              {error && (
                  <div className="login-error">
                    {error}
                  </div>
              )}

              {/* LOGIN BUTTON */}
              <button
                  type="submit"
                  className="login-button"
                  disabled={loading}
              >
                {loading
                    ? "Logging in..."
                    : "Login"}

                {!loading && <span>→</span>}
              </button>
            </form>

            <div className="divider">
              <span>or</span>
            </div>

            <div className="signup-section">
              <p>Don't have an account?</p>

              <Link
                  to="/signup"
                  className="signup-link"
              >
                Create an Account
              </Link>
            </div>

            <Link
                to="/"
                className="back-home"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
  );
}

export default LoginPage;