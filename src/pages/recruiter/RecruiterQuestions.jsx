import React, { useMemo, useState } from "react";
import RecruiterSidebar from "./RecruiterSidebar";
import RecruiterTopbar from "./RecruiterTopbar";
import "./RecruiterQuestions.css";

const initialQuestions = [
  {
    id: 1,
    question: "Explain the difference between Spring and Spring Boot.",
    category: "Technical",
    position: "Java Backend Developer",
    difficulty: "Medium",
    type: "Technical",
    status: "Active",
  },
  {
    id: 2,
    question: "What are the main advantages of React Hooks?",
    category: "Technical",
    position: "Frontend Developer",
    difficulty: "Medium",
    type: "Technical",
    status: "Active",
  },
  {
    id: 3,
    question: "Describe a challenging project you worked on.",
    category: "Behavioral",
    position: "All Positions",
    difficulty: "Easy",
    type: "Behavioral",
    status: "Active",
  },
  {
    id: 4,
    question: "How do you handle tight deadlines?",
    category: "Behavioral",
    position: "All Positions",
    difficulty: "Easy",
    type: "Behavioral",
    status: "Active",
  },
  {
    id: 5,
    question: "Write a Python function to find duplicate elements.",
    category: "Coding",
    position: "Python Developer",
    difficulty: "Hard",
    type: "Coding",
    status: "Inactive",
  },
];

function RecruiterQuestions() {
  const [questions, setQuestions] = useState(initialQuestions);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);

  const [newQuestion, setNewQuestion] = useState({
    question: "",
    category: "Technical",
    position: "All Positions",
    difficulty: "Medium",
  });

  const filteredQuestions = useMemo(() => {
    return questions.filter((item) => {
      const text = search.toLowerCase();

      const matchesSearch =
        item.question.toLowerCase().includes(text) ||
        item.position.toLowerCase().includes(text) ||
        item.category.toLowerCase().includes(text);

      const matchesCategory =
        categoryFilter === "All" ||
        item.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [questions, search, categoryFilter]);

  const handleInputChange = (e) => {
    setNewQuestion({
      ...newQuestion,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddQuestion = (e) => {
    e.preventDefault();

    if (!newQuestion.question.trim()) {
      alert("Please enter a screening question.");
      return;
    }

    const question = {
      id: Date.now(),
      question: newQuestion.question.trim(),
      category: newQuestion.category,
      position: newQuestion.position,
      difficulty: newQuestion.difficulty,
      type: newQuestion.category,
      status: "Active",
    };

    setQuestions((prev) => [question, ...prev]);

    setNewQuestion({
      question: "",
      category: "Technical",
      position: "All Positions",
      difficulty: "Medium",
    });

    setShowModal(false);
  };

  const handleToggleStatus = (id) => {
    setQuestions((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status:
                item.status === "Active"
                  ? "Inactive"
                  : "Active",
            }
          : item
      )
    );
  };

  const handleDelete = (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this question?"
    );

    if (!confirmed) return;

    setQuestions((prev) =>
      prev.filter((item) => item.id !== id)
    );
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
            onClick={() => setShowModal(true)}
          >
            <span>+</span>
            Add Question
          </button>
        </div>

        <section className="questions-summary">
          <div className="question-summary-card">
            <div className="question-summary-icon">?</div>
            <div>
              <span>Total Questions</span>
              <strong>{questions.length}</strong>
            </div>
          </div>

          <div className="question-summary-card">
            <div className="question-summary-icon">✓</div>
            <div>
              <span>Active</span>
              <strong>
                {
                  questions.filter(
                    (item) => item.status === "Active"
                  ).length
                }
              </strong>
            </div>
          </div>

          <div className="question-summary-card">
            <div className="question-summary-icon">T</div>
            <div>
              <span>Technical</span>
              <strong>
                {
                  questions.filter(
                    (item) => item.category === "Technical"
                  ).length
                }
              </strong>
            </div>
          </div>

          <div className="question-summary-card">
            <div className="question-summary-icon">B</div>
            <div>
              <span>Behavioral</span>
              <strong>
                {
                  questions.filter(
                    (item) => item.category === "Behavioral"
                  ).length
                }
              </strong>
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
              <option value="Technical">Technical</option>
              <option value="Behavioral">Behavioral</option>
              <option value="Coding">Coding</option>
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
                {filteredQuestions.length > 0 ? (
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
                          className={`question-category ${item.category.toLowerCase()}`}
                        >
                          {item.category}
                        </span>
                      </td>

                      <td>
                        <span className="question-position">
                          {item.position}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`question-difficulty ${item.difficulty.toLowerCase()}`}
                        >
                          {item.difficulty}
                        </span>
                      </td>

                      <td>
                        <button
                          className={`question-status ${
                            item.status === "Active"
                              ? "active"
                              : "inactive"
                          }`}
                          onClick={() =>
                            handleToggleStatus(item.id)
                          }
                        >
                          {item.status}
                        </button>
                      </td>

                      <td>
                        <div className="question-actions">
                          <button
                            className="edit-question-btn"
                            onClick={() =>
                              alert(
                                "Question editing can be connected next."
                              )
                            }
                          >
                            Edit
                          </button>

                          <button
                            className="delete-question-btn"
                            onClick={() =>
                              handleDelete(item.id)
                            }
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
          onClick={() => setShowModal(false)}
        >
          <div
            className="question-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="question-modal-header">
              <div>
                <h2>Add Screening Question</h2>
                <p>Create a new question for candidate screening.</p>
              </div>

              <button
                className="modal-close-btn"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddQuestion}>
              <div className="question-form-group full-width">
                <label>Question</label>

                <textarea
                  name="question"
                  value={newQuestion.question}
                  onChange={handleInputChange}
                  placeholder="Enter your screening question..."
                  rows="4"
                />
              </div>

              <div className="question-form-row">
                <div className="question-form-group">
                  <label>Category</label>

                  <select
                    name="category"
                    value={newQuestion.category}
                    onChange={handleInputChange}
                  >
                    <option value="Technical">Technical</option>
                    <option value="Behavioral">Behavioral</option>
                    <option value="Coding">Coding</option>
                  </select>
                </div>

                <div className="question-form-group">
                  <label>Difficulty</label>

                  <select
                    name="difficulty"
                    value={newQuestion.difficulty}
                    onChange={handleInputChange}
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="question-form-group full-width">
                <label>Position</label>

                <select
                  name="position"
                  value={newQuestion.position}
                  onChange={handleInputChange}
                >
                  <option value="All Positions">
                    All Positions
                  </option>
                  <option value="Java Backend Developer">
                    Java Backend Developer
                  </option>
                  <option value="Frontend Developer">
                    Frontend Developer
                  </option>
                  <option value="Full Stack Developer">
                    Full Stack Developer
                  </option>
                  <option value="Python Developer">
                    Python Developer
                  </option>
                  <option value="Software Engineer">
                    Software Engineer
                  </option>
                </select>
              </div>

              <div className="question-modal-actions">
                <button
                  type="button"
                  className="cancel-question-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-question-btn"
                >
                  Save Question
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