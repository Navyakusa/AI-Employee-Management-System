import React, { useState } from "react";
import { jwtDecode } from "jwt-decode";
import {
  Link,
  useNavigate,
} from "react-router-dom";
import apiClient from "../../../services/apiClient";

function LoginPage() {
  const navigate = useNavigate();

  // =========================
  // FORM DATA
  // =========================
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] = useState("");

  const [loading, setLoading] =
    useState(false);

  // =========================
  // HANDLE INPUT CHANGE
  // =========================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError("");
  };

  // =========================
  // LOGIN
  // =========================
  const handleLogin = async (e) => {
    e.preventDefault();

    const enteredEmail = formData.username
      .trim()
      .toLowerCase();

    const enteredPassword =
      formData.password;

    // =========================
    // VALIDATION
    // =========================
    if (!enteredEmail || !enteredPassword) {
      setError(
        "Please enter your email and password."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      // =========================
      // CALL BACKEND LOGIN API
      // =========================
      // Role is NOT sent from frontend.
      // Backend identifies the user's role
      // using the authenticated user account.
      // =========================
      const response = await apiClient.post(
        "/auth/login",
        {
          email: enteredEmail,
          password: enteredPassword,
        }
      );

      const token = response.data?.data?.token;

if (!token) {
  setError("Login token was not received from backend.");
  return;
}

// Decode JWT
const decodedToken = jwtDecode(token);

console.log("Decoded JWT:", decodedToken);

const backendRole = decodedToken.role
  ?.trim()
  .toUpperCase();

if (!backendRole) {
  setError("User role was not found in the token.");
  return;
}
      // =========================
      // SAVE AUTH DATA
      // =========================
      localStorage.setItem("token", token);

      // =========================
      // ROLE BASED NAVIGATION
      // =========================
      // Backend determines the role.
      // Frontend only redirects according
      // to the role returned by backend.
      // =========================
      switch (backendRole) {
        case "HR":
case "HR_MANAGER":
  navigate("/hr/dashboard", {
    replace: true,
  });
  break;

        case "SUPER_ADMIN":
          navigate(
            "/super-admin/dashboard",
            {
              replace: true,
            }
          );
          break;

        case "RECRUITER":
          navigate(
            "/recruiter/dashboard",
            {
              replace: true,
            }
          );
          break;

        case "HIRING_MANAGER":
          navigate(
            "/hiring-manager/dashboard",
            {
              replace: true,
            }
          );
          break;

        case "INTERVIEWER":
          navigate(
            "/interviewer/dashboard",
            {
              replace: true,
            }
          );
          break;

        case "EMPLOYEE":
          navigate(
            "/employee/dashboard",
            {
              replace: true,
            }
          );
          break;

        case "CANDIDATE": {
          // =====================================
          // CHECK PENDING JOB APPLICATION
          // =====================================
          const pendingApplication =
            sessionStorage.getItem(
              "pendingApplication"
            );

          // =====================================
          // Candidate came from Apply Now
          // =====================================
          if (pendingApplication) {
            sessionStorage.removeItem(
              "pendingApplication"
            );

            navigate(
              pendingApplication,
              {
                replace: true,
              }
            );
          } else {
            // =====================================
            // NORMAL CANDIDATE LOGIN
            // =====================================
            navigate(
              "/candidate/dashboard",
              {
                replace: true,
              }
            );
          }

          break;
        }

        default:
          // =========================
          // UNKNOWN ROLE
          // =========================
          setError(
            `No dashboard configured for role: ${userData.role}`
          );

          // Remove authentication data because
          // there is no configured dashboard.
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          localStorage.removeItem(
            "loggedInUser"
          );

          break;
      }
    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      // =========================
      // ERROR HANDLING
      // =========================
      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        setError(
          error.response?.data?.message ||
            "Invalid email or password."
        );
      } else {
        setError(
          error.response?.data?.message ||
            "Unable to connect to the server. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* ================================
          LEFT SIDE
      ================================= */}

      <div className="login-left">
        <div className="login-brand">
          <h1>
            Talent<span>AI</span>
          </h1>

          <p>
            AI-Powered Recruitment Platform
          </p>
        </div>

        <div className="login-left-content">
          <h2>
            Manage your
            <span> talent smarter.</span>
          </h2>

          <p>
            AI-powered recruitment and employee
            management platform designed for modern
            organizations.
          </p>

          <div className="login-features">
            {/* FEATURE 1 */}

            <div className="feature-item">
              <div className="feature-icon">
                ✓
              </div>

              <div>
                <h4>
                  Smart Recruitment
                </h4>

                <p>
                  AI-powered candidate screening
                </p>
              </div>
            </div>

            {/* FEATURE 2 */}

            <div className="feature-item">
              <div className="feature-icon">
                ✓
              </div>

              <div>
                <h4>
                  Employee Management
                </h4>

                <p>
                  Manage your workforce efficiently
                </p>
              </div>
            </div>

            {/* FEATURE 3 */}

            <div className="feature-item">
              <div className="feature-icon">
                ✓
              </div>

              <div>
                <h4>
                  Role Based Access
                </h4>

                <p>
                  Secure access for every user
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================================
          RIGHT SIDE
      ================================= */}

      <div className="login-right">
        <div className="login-card">
          <div className="login-header">
            <div className="login-icon">
              👤
            </div>

            <h2>
              Welcome Back
            </h2>

            <p>
              Login to your TalentAI account
            </p>
          </div>

          {/* ================================
              LOGIN FORM
          ================================= */}

          <form onSubmit={handleLogin}>
            {/* ================================
                EMAIL
            ================================= */}

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

            {/* ================================
                PASSWORD
            ================================= */}

            <div className="form-group">
              <label htmlFor="password">
                Password
              </label>

              <div className="password-wrapper">
                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
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
                    setShowPassword(
                      (prev) => !prev
                    )
                  }
                >
                  {showPassword
                    ? "Hide"
                    : "Show"}
                </button>
              </div>
            </div>

            {/* ================================
                OPTIONS
            ================================= */}

            <div className="login-options">
              <label className="remember-me">
                <input type="checkbox" />

                <span>
                  Remember me
                </span>
              </label>

              <Link
                to="/forgot-password"
                className="forgot-password"
              >
                Forgot Password?
              </Link>
            </div>

            {/* ================================
                ERROR
            ================================= */}

            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            {/* ================================
                LOGIN BUTTON
            ================================= */}

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading
                ? "Logging in..."
                : "Login"}

              {!loading && (
                <span>→</span>
              )}
            </button>
          </form>

          {/* ================================
              DIVIDER
          ================================= */}

          <div className="divider">
            <span>or</span>
          </div>

          {/* ================================
              SIGNUP
          ================================= */}

          <div className="signup-section">
            <p>
              Don't have an account?
            </p>

            <Link
              to="/signup"
              className="signup-link"
            >
              Create an Account
            </Link>
          </div>

          {/* ================================
              BACK HOME
          ================================= */}

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