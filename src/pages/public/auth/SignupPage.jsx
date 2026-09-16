import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "../../../services/apiClient";
import "./SignupPage.css";

function SignupPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // ==============================
  // HANDLE INPUT
  // ==============================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError("");
    setSuccess("");
  };

  // ==============================
  // HANDLE SIGNUP
  // ==============================
  const handleSignup = async (e) => {
    e.preventDefault();

    const userName = formData.userName.trim();
    const email = formData.email.trim().toLowerCase();
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;

    // EMPTY FIELD CHECK
    if (!userName || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    // PASSWORD LENGTH
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    // PASSWORD MATCH
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      // ==============================
      // CALL SPRING BOOT SIGNUP API
<<<<<<< Updated upstream
      const response = await apiClient.post(
          "/auth/signup",
          {
            userName,
            email,
            password,
            role: "CANDIDATE",
            department: "Candidate",
          }
      );
=======
      // ==============================
      const response = await apiClient.post("/auth/signup", {
        userName,
        email,
        password,

        // Backend currently requires this field.
        // It is NOT shown to the user.
        department: "Engineering",

        // Account created as Employee.
        // Role is selected on the Login page.
        role: "EMPLOYEE",
      });
>>>>>>> Stashed changes

      const apiResponse = response.data;

      if (!apiResponse.success) {
        setError(
          apiResponse.message || "Unable to create account."
        );
        return;
      }

      // ==============================
      // SUCCESS
      // ==============================
      setSuccess(
        "Account created successfully!"
      );

      // Go to login after successful registration
      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (error) {
      console.error("Signup error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to create account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-card">

        <h1>Create Account</h1>

        <p className="signup-subtitle">
          Create your TalentAI account
        </p>

        <form onSubmit={handleSignup}>

          {/* FULL NAME */}
          <div className="form-group">
            <label htmlFor="userName">
              Full Name
            </label>

            <input
              type="text"
              id="userName"
              name="userName"
              placeholder="Enter your full name"
              value={formData.userName}
              onChange={handleChange}
            />
          </div>

          {/* EMAIL */}
          <div className="form-group">
            <label htmlFor="email">
              Email
            </label>

            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          {/* PASSWORD */}
          <div className="form-group">
            <label htmlFor="password">
              Password
            </label>

            <input
              type="password"
              id="password"
              name="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          {/* CONFIRM PASSWORD */}
          <div className="form-group">
            <label htmlFor="confirmPassword">
              Confirm Password
            </label>

            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>

          {/* ERROR */}
          {error && (
            <div className="signup-error">
              {error}
            </div>
          )}

          {/* SUCCESS */}
          {success && (
            <div className="signup-success">
              ✓ {success}
              <br />
              Redirecting to login...
            </div>
          )}

          {/* CREATE ACCOUNT */}
          <button
            type="submit"
            className="signup-button"
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>

        </form>

        <p className="login-text">
          Already have an account?{" "}

          <Link to="/login">
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}

export default SignupPage;