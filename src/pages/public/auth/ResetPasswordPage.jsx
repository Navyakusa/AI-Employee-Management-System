import React, { useState } from "react";
import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import apiClient from "../../../services/apiClient";

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Backend reset link should contain:
  // /reset-password?token=xxxx
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setError(
        "Password reset token is missing or invalid."
      );
      return;
    }

    if (!formData.newPassword) {
      setError("Please enter a new password.");
      return;
    }

    if (formData.newPassword.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    if (
      formData.newPassword !==
      formData.confirmPassword
    ) {
      setError(
        "New password and confirm password do not match."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await apiClient.post(
  "/auth/reset-password",
  {
    token,
    newPassword: formData.newPassword,
  },
  {
    headers: {
      Authorization: undefined,
    },
  }
);

      const result = response.data;

      if (!result?.success) {
        setError(
          result?.message ||
            "Unable to reset password."
        );
        return;
      }

      setSuccess(
        result?.message ||
          "Password reset successfully."
      );

      setTimeout(() => {
        navigate("/login", {
          replace: true,
        });
      }, 2000);

    } catch (error) {
      console.error(
        "Reset password error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Reset link is invalid or expired. Please request a new one."
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

          <p>
            AI-Powered Recruitment Platform
          </p>
        </div>


        <div className="login-left-content">

          <h2>
            Create a
            <span> new password.</span>
          </h2>

          <p>
            Choose a new password for your TalentAI
            account.
          </p>


          <div className="login-features">

            <div className="feature-item">
              <div className="feature-icon">
                ✓
              </div>

              <div>
                <h4>New Password</h4>

                <p>
                  Create a secure password for your account
                </p>
              </div>
            </div>


            <div className="feature-item">
              <div className="feature-icon">
                ✓
              </div>

              <div>
                <h4>Secure Account</h4>

                <p>
                  Your new password replaces your old
                  password
                </p>
              </div>
            </div>


            <div className="feature-item">
              <div className="feature-icon">
                ✓
              </div>

              <div>
                <h4>Login Again</h4>

                <p>
                  Continue to login after resetting your
                  password
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>


      {/* RIGHT SIDE */}
      <div className="login-right">

        <div className="login-card">

          <div className="login-header">

            <div className="login-icon">
              🔑
            </div>

            <h2>Reset Password</h2>

            <p>
              Enter and confirm your new password
            </p>

          </div>


          {!token ? (

            <>
              <div className="login-error">
                Password reset token is missing.
                Please request a new password reset link.
              </div>

              <div className="signup-section">
                <Link
                  to="/forgot-password"
                  className="signup-link"
                >
                  Request New Reset Link
                </Link>
              </div>
            </>

          ) : (

            <form onSubmit={handleSubmit}>

              {/* NEW PASSWORD */}

              <div className="form-group">

                <label htmlFor="newPassword">
                  New Password
                </label>

                <div className="password-wrapper">

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    id="newPassword"
                    name="newPassword"
                    placeholder="Enter new password"
                    value={
                      formData.newPassword
                    }
                    onChange={handleChange}
                    autoComplete="new-password"
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


              {/* CONFIRM PASSWORD */}

              <div className="form-group">

                <label htmlFor="confirmPassword">
                  Confirm Password
                </label>

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm new password"
                  value={
                    formData.confirmPassword
                  }
                  onChange={handleChange}
                  autoComplete="new-password"
                />

              </div>


              {error && (
                <div className="login-error">
                  {error}
                </div>
              )}


              {success && (
                <div
                  style={{
                    padding: "12px",
                    marginBottom: "15px",
                    borderRadius: "8px",
                    background: "#ecfdf5",
                    color: "#047857",
                    fontSize: "14px",
                  }}
                >
                  {success}
                </div>
              )}


              <button
                type="submit"
                className="login-button"
                disabled={loading}
              >
                {loading
                  ? "Resetting..."
                  : "Reset Password"}

                {!loading && <span>→</span>}
              </button>

            </form>
          )}


          <div className="signup-section">

            <p>
              Remember your password?
            </p>

            <Link
              to="/login"
              className="signup-link"
            >
              Back to Login
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

export default ResetPasswordPage;