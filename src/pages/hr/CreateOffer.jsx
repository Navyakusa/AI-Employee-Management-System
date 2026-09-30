import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import HRSidebar from "./HRSidebar";
import { createOffer } from "./hrApi";
import "./HROffers.css";

function CreateOffer() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    candidateId: "",
    candidateName: "",
    position: "",
    salary: "",
    joiningDate: "",
    location: "",
    employmentType: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      const payload = {
        candidateId: Number(formData.candidateId),
        candidateName: formData.candidateName,
        position: formData.position,
        salary: Number(formData.salary),
        joiningDate: formData.joiningDate,
        location: formData.location,
        employmentType: formData.employmentType,
        status: "PENDING",
      };

      console.log("Creating offer:", payload);

      await createOffer(payload);

      alert("Offer created successfully!");

      navigate("/hr/offers");
    } catch (err) {
      console.error("Create offer failed:", err);

      setError(
        err?.message || "Failed to create offer."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hr-page-layout">
      <HRSidebar />

      <main className="hr-page-content">
        <div className="hr-page">

          <div className="offers-header">
            <div>
              <h1>Create Offer</h1>
              <p>Create a new candidate employment offer</p>
            </div>
          </div>

          {error && (
            <div
              style={{
                padding: "12px",
                marginBottom: "16px",
                background: "#fff1f2",
                color: "#be123c",
                borderRadius: "8px",
              }}
            >
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="offers-card"
            style={{ padding: "24px" }}
          >

            <div style={{ marginBottom: "16px" }}>
              <label>Candidate ID</label>

              <input
                type="number"
                name="candidateId"
                value={formData.candidateId}
                onChange={handleChange}
                required
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label>Candidate Name</label>

              <input
                type="text"
                name="candidateName"
                value={formData.candidateName}
                onChange={handleChange}
                required
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label>Position</label>

              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                required
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label>Salary</label>

              <input
                type="number"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                required
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label>Joining Date</label>

              <input
                type="date"
                name="joiningDate"
                value={formData.joiningDate}
                onChange={handleChange}
                required
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label>Location</label>

              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label>Employment Type</label>

              <select
                name="employmentType"
                value={formData.employmentType}
                onChange={handleChange}
                required
              >
                <option value="">
                  Select employment type
                </option>

                <option value="FULL_TIME">
                  Full Time
                </option>

                <option value="PART_TIME">
                  Part Time
                </option>

                <option value="INTERN">
                  Intern
                </option>
              </select>
            </div>

            <button
              type="submit"
              className="create-offer-btn"
              disabled={loading}
            >
              {loading
                ? "Creating..."
                : "Create Offer"}
            </button>

          </form>
        </div>
      </main>
    </div>
  );
}

export default CreateOffer;