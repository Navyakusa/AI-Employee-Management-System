import React, { useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../../../services/apiClient";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const enteredEmail = email.trim().toLowerCase();

    if (!enteredEmail) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await apiClient.post(
        "/auth/forgot-password",
        {
          email: enteredEmail,
        }
      );

      const result = response.data;

      if (!result?.success) {
        setError(
          result?.message ||
            "Unable to process forgot password request."
        );
        return;
      }

      setSuccess(
        result?.message ||
          "Password reset link has been sent to your email."
      );
    } catch (error) {
      console.error("Forgot password error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to send reset link. Please try again."
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
            Reset your
            <span> password securely.</span>
          </h2>

          <p>
            Enter your registered email address and
            we'll send you a secure password reset link.
          </p>

          <div className="login-features">

            <div className="feature-item">
              <div className="feature-icon">
                ✓
              </div>

              <div>
                <h4>Secure Reset</h4>

                <p>
                  Reset your password using a secure link
                </p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">
                ✓
              </div>

              <div>
                <h4>Email Verification</h4>

                <p>
                  Reset instructions are sent to your
                  registered email
                </p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon">
                ✓
              </div>

              <div>
                <h4>Protected Account</h4>

                <p>
                  Your account remains protected throughout
                  the reset process
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
              🔐
            </div>

            <h2>Forgot Password?</h2>

            <p>
              Enter your registered email address
            </p>

          </div>


          <form onSubmit={handleSubmit}>

            <div className="form-group">

              <label htmlFor="email">
                Email Address
              </label>

              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                  setSuccess("");
                }}
                autoComplete="email"
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
                ? "Sending..."
                : "Send Reset Link"}

              {!loading && <span>→</span>}
            </button>

          </form>


          <div className="signup-section">
            <p>Remember your password?</p>

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

export default ForgotPasswordPage;