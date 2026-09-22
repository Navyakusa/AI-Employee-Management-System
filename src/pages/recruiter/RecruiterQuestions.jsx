
import React, { useEffect, useMemo, useState } from "react";
import RecruiterSidebar from "./RecruiterSidebar";
import RecruiterTopbar from "./RecruiterTopbar";
import apiClient from "../../services/apiClient";
import "./RecruiterQuestions.css";

const initialQuestionForm = {
  question: "",
  category: "TECHNICAL",
  jobId: "",
  difficulty: "MEDIUM",
  active: true,
};

function RecruiterQuestions() {
  const [questions, setQuestions] = useState([]);
  const [jobs, setJobs] = useState([]);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [showModal, setShowModal] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState(null);

  const [newQuestion, setNewQuestion] = useState({
    ...initialQuestionForm,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [modalError, setModalError] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // =========================================================
  // ERROR MESSAGE
  // =========================================================
  const getErrorMessage = (err, fallback) => {
    if (err.response?.status === 401) {
      return "Your session has expired. Please login again.";
    }

    if (err.response?.status === 403) {
      return "You are not authorized to perform this action.";
    }

    return (
      err.response?.data?.message ||
      err.message ||
      fallback
    );
  };

  // =========================================================
  // FETCH ALL SCREENING QUESTIONS
  // =========================================================
  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiClient.get(
        "/screening-questions"
      );

      const result = response.data;

      if (!result?.success) {
        throw new Error(
          result?.message ||
            "Unable to fetch screening questions."
        );
      }

      setQuestions(
        Array.isArray(result.data) ? result.data : []
      );
    } catch (err) {
      console.error("Screening questions fetch error:", err);

      setError(
        getErrorMessage(
          err,
          "Unable to load screening questions."
        )
      );

      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FETCH JOBS FOR POSITION DROPDOWN
  // =========================================================
  const fetchJobs = async () => {
    try {
      const response = await apiClient.get("/jobs/all");

      const result = response.data;

      const jobList = Array.isArray(result)
        ? result
        : Array.isArray(result?.data)
          ? result.data
          : [];

      setJobs(jobList);
    } catch (err) {
      console.error("Jobs fetch error:", err);

      setJobs([]);

      setError((previousError) =>
        previousError ||
        getErrorMessage(
          err,
          "Unable to load jobs for the position dropdown."
        )
      );
    }
  };

  // =========================================================
  // LOAD DATA ON PAGE OPEN
  // =========================================================
  useEffect(() => {
    fetchQuestions();
    fetchJobs();
  }, []);

  // =========================================================
  // FORMAT BACKEND VALUES
  // =========================================================
  const formatValue = (value) => {
    if (!value) {
      return "Not Available";
    }

    return String(value)
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  // =========================================================
  // SEARCH + CATEGORY FILTER
  // =========================================================
  const filteredQuestions = useMemo(() => {
    const text = search.trim().toLowerCase();

    return questions.filter((item) => {
      const questionText = String(
        item.question || ""
      ).toLowerCase();

      const positionText = String(
        item.position || ""
      ).toLowerCase();

      const categoryText = String(
        item.category || ""
      ).toLowerCase();

      const matchesSearch =
        !text ||
        questionText.includes(text) ||
        positionText.includes(text) ||
        categoryText.includes(text);

      const matchesCategory =
        categoryFilter === "All" ||
        item.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [questions, search, categoryFilter]);

  // =========================================================
  // SUMMARY COUNTS
  // =========================================================
  const totalQuestions = questions.length;

  const activeQuestions = questions.filter(
    (item) => item.active === true
  ).length;

  const technicalQuestions = questions.filter(
    (item) => item.category === "TECHNICAL"
  ).length;

  const behavioralQuestions = questions.filter(
    (item) => item.category === "BEHAVIORAL"
  ).length;

  // =========================================================
  // HANDLE FORM INPUT
  // =========================================================
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setNewQuestion((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =========================================================
  // OPEN ADD QUESTION MODAL
  // =========================================================
  const handleOpenAddModal = () => {
    setEditingQuestionId(null);

    setNewQuestion({
      ...initialQuestionForm,
    });

    setModalError("");
    setShowModal(true);
  };

  // =========================================================
  // OPEN EDIT QUESTION MODAL
  // =========================================================
  const handleEditQuestion = (question) => {
    setEditingQuestionId(question.id);

    setNewQuestion({
      question: question.question || "",
      category: question.category || "TECHNICAL",
      jobId:
        question.jobId !== null &&
        question.jobId !== undefined
          ? String(question.jobId)
          : "",
      difficulty: question.difficulty || "MEDIUM",
      active: question.active === true,
    });

    setModalError("");
    setShowModal(true);
  };

  // =========================================================
  // CLOSE MODAL
  // =========================================================
  const handleCloseModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);
    setEditingQuestionId(null);
    setModalError("");

    setNewQuestion({
      ...initialQuestionForm,
    });
  };

  // =========================================================
  // BUILD BACKEND REQUEST BODY
  // =========================================================
  const buildQuestionPayload = (form) => {
    return {
      question: form.question.trim(),
      category: form.category,
      jobId: Number(form.jobId),
      difficulty: form.difficulty,
      active: form.active,
    };
  };

  // =========================================================
  // ADD OR UPDATE QUESTION
  // =========================================================
  const handleSaveQuestion = async (e) => {
    e.preventDefault();

    setModalError("");

    if (!newQuestion.question.trim()) {
      setModalError(
        "Please enter a screening question."
      );
      return;
    }

    if (!newQuestion.jobId) {
      setModalError(
        "Please select a position."
      );
      return;
    }

    const selectedJobId = Number(newQuestion.jobId);

    if (
      !Number.isInteger(selectedJobId) ||
      selectedJobId <= 0
    ) {
      setModalError(
        "Please select a valid position."
      );
      return;
    }

    const payload = buildQuestionPayload(newQuestion);

    try {
      setSaving(true);

      let response;

      if (editingQuestionId !== null) {
        response = await apiClient.put(
          `/screening-questions/${editingQuestionId}`,
          payload
        );
      } else {
        response = await apiClient.post(
          "/screening-questions",
          payload
        );
      }

      const result = response.data;

      if (!result?.success) {
        throw new Error(
          result?.message ||
            "Unable to save screening question."
        );
      }

      handleCloseModal();

      // Refresh questions from the database.
      await fetchQuestions();
    } catch (err) {
      console.error("Save screening question error:", err);

      setModalError(
        getErrorMessage(
          err,
          "Unable to save screening question."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // ACTIVATE / DEACTIVATE QUESTION
  // =========================================================
  const handleToggleStatus = async (question) => {
    if (actionLoadingId !== null) {
      return;
    }

    if (
      question.jobId === null ||
      question.jobId === undefined
    ) {
      setError(
        "This question has no associated job and cannot be updated."
      );
      return;
    }

    try {
      setActionLoadingId(question.id);
      setError("");

      const payload = {
        question: question.question,
        category: question.category,
        jobId: Number(question.jobId),
        difficulty: question.difficulty,
        active: !question.active,
      };

      const response = await apiClient.put(
        `/screening-questions/${question.id}`,
        payload
      );

      const result = response.data;

      if (!result?.success) {
        throw new Error(
          result?.message ||
            "Unable to update question status."
        );
      }

      await fetchQuestions();
    } catch (err) {
      console.error("Question status update error:", err);

      setError(
        getErrorMessage(
          err,
          "Unable to update question status."
        )
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  // =========================================================
  // DELETE QUESTION
  // =========================================================
  const handleDelete = async (id) => {
    if (actionLoadingId !== null) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this question?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionLoadingId(id);
      setError("");

      const response = await apiClient.delete(
        `/screening-questions/${id}`
      );

      const result = response.data;

      if (result?.success === false) {
        throw new Error(
          result.message ||
            "Unable to delete screening question."
        );
      }

      await fetchQuestions();
    } catch (err) {
      console.error("Delete screening question error:", err);

      setError(
        getErrorMessage(
          err,
          "Unable to delete screening question."
        )
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="recruiter-questions-page">
      <RecruiterSidebar />
      <RecruiterTopbar />

      <main className="recruiter-questions-main">
        <div className="questions-header">
          <div>
            <h1>Screening Questions</h1>

            <p>
              Create and manage questions used during candidate screening
            </p>
          </div>

          <button
            className="add-question-btn"
            onClick={handleOpenAddModal}
          >
            <span>+</span>
            Add Question
          </button>
        </div>

        {error && (
          <div
            role="alert"
            style={{
              marginBottom: "16px",
              padding: "12px 16px",
              borderRadius: "8px",
              background: "#fff1f1",
              color: "#d92d20",
              border: "1px solid #fecdca",
            }}
          >
            {error}
          </div>
        )}

        <section className="questions-summary">
          <div className="question-summary-card">
            <div className="question-summary-icon">?</div>

            <div>
              <span>Total Questions</span>
              <strong>{totalQuestions}</strong>
            </div>
          </div>

          <div className="question-summary-card">
            <div className="question-summary-icon">✓</div>

            <div>
              <span>Active</span>
              <strong>{activeQuestions}</strong>
            </div>
          </div>

          <div className="question-summary-card">
            <div className="question-summary-icon">T</div>

            <div>
              <span>Technical</span>
              <strong>{technicalQuestions}</strong>
            </div>
          </div>

          <div className="question-summary-card">
            <div className="question-summary-icon">B</div>

            <div>
              <span>Behavioral</span>
              <strong>{behavioralQuestions}</strong>
            </div>
          </div>
        </section>

        <section className="questions-table-card">
          <div className="questions-toolbar">
            <div className="questions-search">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Search questions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              className="questions-filter"
              value={categoryFilter}
              onChange={(e) =>
                setCategoryFilter(e.target.value)
              }
            >
              <option value="All">All Categories</option>
              <option value="TECHNICAL">Technical</option>
              <option value="BEHAVIORAL">Behavioral</option>
              <option value="CODING">Coding</option>
            </select>
          </div>

          <div className="questions-table-wrapper">
            <table className="questions-table">
              <thead>
                <tr>
                  <th>Question</th>
                  <th>Category</th>
                  <th>Position</th>
                  <th>Difficulty</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="questions-empty"
                    >
                      <div>
                        <span>?</span>
                        <h3>Loading screening questions...</h3>
                      </div>
                    </td>
                  </tr>
                ) : filteredQuestions.length > 0 ? (
                  filteredQuestions.map((item, index) => (
                    <tr key={item.id}>
                      <td>
                        <div className="question-cell">
                          <div className="question-number">
                            {index + 1}
                          </div>

                          <span>{item.question}</span>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`question-category ${
                            item.category
                              ? item.category.toLowerCase()
                              : ""
                          }`}
                        >
                          {formatValue(item.category)}
                        </span>
                      </td>

                      <td>
                        <span className="question-position">
                          {item.position ||
                            jobs.find(
                              (job) =>
                                Number(job.id) ===
                                Number(item.jobId)
                            )?.title ||
                            `Job #${item.jobId}`}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`question-difficulty ${
                            item.difficulty
                              ? item.difficulty.toLowerCase()
                              : ""
                          }`}
                        >
                          {formatValue(item.difficulty)}
                        </span>
                      </td>

                      <td>
                        <button
                          className={`question-status ${
                            item.active ? "active" : "inactive"
                          }`}
                          onClick={() =>
                            handleToggleStatus(item)
                          }
                          disabled={actionLoadingId !== null}
                        >
                          {item.active ? "Active" : "Inactive"}
                        </button>
                      </td>

                      <td>
                        <div className="question-actions">
                          <button
                            className="edit-question-btn"
                            onClick={() =>
                              handleEditQuestion(item)
                            }
                            disabled={actionLoadingId !== null}
                          >
                            Edit
                          </button>

                          <button
                            className="delete-question-btn"
                            onClick={() =>
                              handleDelete(item.id)
                            }
                            disabled={actionLoadingId !== null}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="questions-empty"
                    >
                      <div>
                        <span>?</span>
                        <h3>No questions found</h3>

                        <p>
                          Try changing your search or category filter.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="questions-footer">
            Showing{" "}
            <strong>{filteredQuestions.length}</strong> of{" "}
            <strong>{questions.length}</strong> questions
          </div>
        </section>
      </main>

      {showModal && (
        <div
          className="question-modal-overlay"
          onClick={handleCloseModal}
        >
          <div
            className="question-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="question-modal-header">
              <div>
                <h2>
                  {editingQuestionId !== null
                    ? "Edit Screening Question"
                    : "Add Screening Question"}
                </h2>

                <p>
                  {editingQuestionId !== null
                    ? "Update the selected screening question."
                    : "Create a new question for candidate screening."}
                </p>
              </div>

              <button
                type="button"
                className="modal-close-btn"
                onClick={handleCloseModal}
                disabled={saving}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveQuestion}>
              <div className="question-form-group full-width">
                <label htmlFor="screeningQuestion">
                  Question
                </label>

                <textarea
                  id="screeningQuestion"
                  name="question"
                  value={newQuestion.question}
                  onChange={handleInputChange}
                  placeholder="Enter your screening question..."
                  rows="4"
                  disabled={saving}
                />
              </div>

              <div className="question-form-row">
                <div className="question-form-group">
                  <label htmlFor="questionCategory">
                    Category
                  </label>

                  <select
                    id="questionCategory"
                    name="category"
                    value={newQuestion.category}
                    onChange={handleInputChange}
                    disabled={saving}
                  >
                    <option value="TECHNICAL">
                      Technical
                    </option>
                    <option value="BEHAVIORAL">
                      Behavioral
                    </option>
                    <option value="CODING">
                      Coding
                    </option>
                  </select>
                </div>

                <div className="question-form-group">
                  <label htmlFor="questionDifficulty">
                    Difficulty
                  </label>

                  <select
                    id="questionDifficulty"
                    name="difficulty"
                    value={newQuestion.difficulty}
                    onChange={handleInputChange}
                    disabled={saving}
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>
              </div>

              <div className="question-form-group full-width">
                <label htmlFor="questionJobId">
                  Position
                </label>

                <select
                  id="questionJobId"
                  name="jobId"
                  value={newQuestion.jobId}
                  onChange={handleInputChange}
                  disabled={saving || jobs.length === 0}
                >
                  <option value="">
                    {jobs.length === 0
                      ? "No jobs available"
                      : "Select a position"}
                  </option>

                  {jobs.map((job) => (
                    <option
                      key={job.id}
                      value={String(job.id)}
                    >
                      {job.title} (Job #{job.id})
                    </option>
                  ))}
                </select>
              </div>

              {modalError && (
                <div
                  role="alert"
                  style={{
                    marginBottom: "16px",
                    padding: "12px 14px",
                    borderRadius: "8px",
                    background: "#fff1f1",
                    color: "#d92d20",
                    border: "1px solid #fecdca",
                    fontSize: "14px",
                  }}
                >
                  {modalError}
                </div>
              )}

              <div className="question-modal-actions">
                <button
                  type="button"
                  className="cancel-question-btn"
                  onClick={handleCloseModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-question-btn"
                  disabled={saving || jobs.length === 0}
                >
                  {saving
                    ? "Saving..."
                    : editingQuestionId !== null
                      ? "Update Question"
                      : "Save Question"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecruiterQuestions;