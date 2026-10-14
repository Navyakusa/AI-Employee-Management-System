
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import HRSidebar from "./HRSidebar";
import HRNavbar from "./HRNavbar";

import {
  Check,
  X,
  RefreshCw,
  FileText,
  Users,
  AlertCircle,
} from "lucide-react";

import "./HROnboarding.css";

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";

// Add the logged-in user's JWT to requests.
function tokenHeaders() {
  const token = localStorage.getItem("token");

  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
}

// Send a request and safely parse the response.
async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/json",
      ...tokenHeaders(),
      ...(options.headers || {}),
    },
  });

  const raw = await response.text();

  let body = null;

  try {
    body = raw ? JSON.parse(raw) : null;
  } catch {
    body = raw;
  }

  if (!response.ok) {
    throw new Error(
      body?.message ||
        body?.error ||
        (typeof body === "string" && body
          ? body
          : `Request failed (${response.status})`)
    );
  }

  // Support both wrapped and unwrapped backend responses.
  return body?.data ?? body;
}

function statusClass(status) {
  const value = String(status || "PENDING").toUpperCase();

  if (value === "VERIFIED" || value === "COMPLETED") {
    return "verified";
  }

  if (value === "REJECTED") {
    return "rejected";
  }

  if (
    value === "STARTED" ||
    value === "PENDING" ||
    value === "HR_VERIFICATION"
  ) {
    return "pending";
  }

  return "neutral";
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString();
}

export default function HROnboarding() {
  const [records, setRecords] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [documents, setDocuments] = useState([]);

  const [loadingRecords, setLoadingRecords] = useState(true);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [busyDocumentId, setBusyDocumentId] = useState(null);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [rejectingDocument, setRejectingDocument] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const selectedRecord = useMemo(
    () =>
      records.find(
        (item) =>
          String(item.onboardingId) === String(selectedId)
      ),
    [records, selectedId]
  );

  // Load onboarding records visible to HR.
  const loadRecords = useCallback(async () => {
    setLoadingRecords(true);
    setError("");

    try {
      const data = await requestJson(`${API_BASE}/onboarding`);

      const list = Array.isArray(data)
        ? data
        : data?.content || data?.items || [];

      setRecords(list);

      setSelectedId((current) => {
        if (
          current &&
          list.some(
            (item) =>
              String(item.onboardingId) === String(current)
          )
        ) {
          return current;
        }

        return list[0]?.onboardingId != null
          ? String(list[0].onboardingId)
          : "";
      });
    } catch (err) {
      setError(
        err.message || "Unable to load onboarding records."
      );
    } finally {
      setLoadingRecords(false);
    }
  }, []);

  // Load documents for the selected onboarding record.
  const loadDocuments = useCallback(async (onboardingId) => {
    if (!onboardingId) {
      setDocuments([]);
      setLoadingDocuments(false);
      return;
    }

    setLoadingDocuments(true);
    setError("");

    try {
      const data = await requestJson(
        `${API_BASE}/onboarding/${onboardingId}/documents`
      );

      setDocuments(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.message || "Unable to load onboarding documents."
      );
      setDocuments([]);
    } finally {
      setLoadingDocuments(false);
    }
  }, []);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  useEffect(() => {
    loadDocuments(selectedId);
  }, [selectedId, loadDocuments]);

  // Verify or reject a document through the existing backend API.
  async function updateDocument(
    document,
    status,
    reason = ""
  ) {
    if (!document?.id) {
      setError("Document ID is missing.");
      return;
    }

    const trimmedReason = reason.trim();

    if (status === "REJECTED" && !trimmedReason) {
      setError("Please enter a rejection reason.");
      return;
    }

    setBusyDocumentId(document.id);
    setError("");
    setNotice("");

    try {
      const updated = await requestJson(
        `${API_BASE}/onboarding/documents/${document.id}/verify`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
            rejectionReason:
              status === "REJECTED"
                ? trimmedReason
                : "",
          }),
        }
      );

      // Immediately update the displayed document status.
      setDocuments((current) =>
        current.map((item) =>
          item.id === document.id
            ? {
                ...item,
                ...(updated && typeof updated === "object"
                  ? updated
                  : {}),
                status: updated?.status || status,
                rejectionReason:
                  updated?.rejectionReason ??
                  (status === "REJECTED"
                    ? trimmedReason
                    : null),
              }
            : item
        )
      );

      setNotice(
        status === "VERIFIED"
          ? "Document verified successfully."
          : "Document rejected successfully."
      );

      setRejectingDocument(null);
      setRejectionReason("");

      // Fetch the saved backend state after verification.
      await loadDocuments(selectedId);
    } catch (err) {
      setError(
        err.message ||
          `Could not mark the document ${status.toLowerCase()}.`
      );
    } finally {
      setBusyDocumentId(null);
    }
  }

  function submitRejection(event) {
    event.preventDefault();

    if (!rejectionReason.trim()) {
      setError("A rejection reason is required.");
      return;
    }

    updateDocument(
      rejectingDocument,
      "REJECTED",
      rejectionReason
    );
  }

  async function refreshPage() {
    setNotice("");
    await loadRecords();

    if (selectedId) {
      await loadDocuments(selectedId);
    }
  }

  return (
    <div className="hr-page-layout hr-onboarding-layout">
      <HRSidebar />
      <HRNavbar />

      <main className="hr-page-content hr-onboarding-content">
        <div className="hr-onboarding-page">
          <header className="onboarding-header">
            <div>
              <p className="onboarding-eyebrow">
                PEOPLE OPERATIONS
              </p>

              <h1>Onboarding</h1>

              <p>
                Review candidate onboarding progress and verify
                submitted documents.
              </p>
            </div>

            <button
              type="button"
              className="onboarding-refresh"
              onClick={refreshPage}
              disabled={loadingRecords || loadingDocuments}
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </header>

          {error && (
            <div
              className="onboarding-alert onboarding-alert-error"
              role="alert"
            >
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {notice && (
            <div
              className="onboarding-alert onboarding-alert-success"
              role="status"
            >
              <Check size={18} />
              <span>{notice}</span>
            </div>
          )}

          <section className="onboarding-summary-grid">
            <article className="onboarding-summary-card">
              <span className="onboarding-summary-icon">
                <Users size={20} />
              </span>

              <div>
                <span>Onboarding records</span>
                <strong>{records.length}</strong>
              </div>
            </article>

            <article className="onboarding-summary-card">
              <span className="onboarding-summary-icon">
                <FileText size={20} />
              </span>

              <div>
                <span>Documents listed</span>
                <strong>{documents.length}</strong>
              </div>
            </article>

            <article className="onboarding-summary-card">
              <span className="onboarding-summary-icon">
                <Check size={20} />
              </span>

              <div>
                <span>Verified documents</span>
                <strong>
                  {
                    documents.filter(
                      (item) =>
                        String(item.status).toUpperCase() ===
                        "VERIFIED"
                    ).length
                  }
                </strong>
              </div>
            </article>
          </section>

          <section className="onboarding-panel">
            <div className="onboarding-panel-heading">
              <div>
                <h2>Candidate onboarding</h2>
                <p>
                  Select a record to review its uploaded documents.
                </p>
              </div>
            </div>

            {loadingRecords ? (
              <div className="onboarding-empty">
                Loading onboarding records…
              </div>
            ) : records.length === 0 ? (
              <div className="onboarding-empty">
                No onboarding records were returned by the backend.
              </div>
            ) : (
              <div className="onboarding-record-grid">
                {records.map((record) => (
                  <button
                    type="button"
                    key={record.onboardingId}
                    className={`onboarding-record ${
                      String(selectedId) ===
                      String(record.onboardingId)
                        ? "selected"
                        : ""
                    }`}
                    onClick={() => {
                      setSelectedId(
                        String(record.onboardingId)
                      );
                      setError("");
                      setNotice("");
                    }}
                  >
                    <div className="onboarding-record-top">
                      <strong>
                        {record.candidateName ||
                          `Candidate ${record.candidateId ?? ""}`}
                      </strong>

                      <span
                        className={`onboarding-status ${statusClass(
                          record.status
                        )}`}
                      >
                        {record.status || "STARTED"}
                      </span>
                    </div>

                    <span>
                      {record.position || "Position not specified"}
                    </span>

                    <small>
                      Onboarding #{record.onboardingId} · Offer #
                      {record.offerId ?? "—"}
                    </small>
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="onboarding-panel">
            <div className="onboarding-panel-heading">
              <div>
                <h2>Onboarding documents</h2>

                <p>
                  {selectedRecord
                    ? `${
                        selectedRecord.candidateName ||
                        `Candidate ${
                          selectedRecord.candidateId ?? ""
                        }`
                      } · Onboarding #${selectedRecord.onboardingId}`
                    : "Choose an onboarding record above."}
                </p>
              </div>
            </div>

            {loadingDocuments ? (
              <div className="onboarding-empty">
                Loading documents…
              </div>
            ) : documents.length === 0 ? (
              <div className="onboarding-empty">
                No documents have been uploaded for this onboarding
                record yet.
              </div>
            ) : (
              <div className="onboarding-table-wrap">
                <table className="onboarding-table">
                  <thead>
                    <tr>
                      <th>Document</th>
                      <th>Type</th>
                      <th>Uploaded</th>
                      <th>Status</th>
                      <th>Rejection reason</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {documents.map((document) => {
                      const status = String(
                        document.status || "PENDING"
                      ).toUpperCase();

                      const pending = status === "PENDING";
                      const busy =
                        busyDocumentId === document.id;

                      return (
                        <tr key={document.id}>
                          <td>
                            <div className="onboarding-file-name">
                              <FileText size={17} />
                              <span>
                                {document.fileName ||
                                  `Document #${document.id}`}
                              </span>
                            </div>

                            <small>
                              Document #{document.id}
                            </small>
                          </td>

                          <td>{document.documentType || "—"}</td>

                          <td>{formatDate(document.uploadedAt)}</td>

                          <td>
                            <span
                              className={`onboarding-status ${statusClass(
                                status
                              )}`}
                            >
                              {status}
                            </span>
                          </td>

                          <td>
                            {document.rejectionReason || "—"}
                          </td>

                          <td>
                            <div className="onboarding-actions">
                              {pending ? (
                                <>
                                  <button
                                    type="button"
                                    className="onboarding-action-verify"
                                    disabled={busy}
                                    onClick={() =>
                                      updateDocument(
                                        document,
                                        "VERIFIED"
                                      )
                                    }
                                  >
                                    <Check size={15} />
                                    {busy ? "Saving…" : "Verify"}
                                  </button>

                                  <button
                                    type="button"
                                    className="onboarding-action-reject"
                                    disabled={busy}
                                    onClick={() => {
                                      setRejectingDocument(document);
                                      setRejectionReason("");
                                      setError("");
                                      setNotice("");
                                    }}
                                  >
                                    <X size={15} />
                                    Reject
                                  </button>
                                </>
                              ) : (
                                <span className="onboarding-action-done">
                                  Reviewed
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>

      {rejectingDocument && (
        <div
          className="onboarding-modal-backdrop"
          role="presentation"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setRejectingDocument(null);
              setRejectionReason("");
            }
          }}
        >
          <form
            className="onboarding-reject-modal"
            onSubmit={submitRejection}
          >
            <div className="onboarding-modal-heading">
              <div>
                <h2>Reject document</h2>

                <p>
                  {rejectingDocument.fileName ||
                    `Document #${rejectingDocument.id}`}
                </p>
              </div>

              <button
                type="button"
                aria-label="Close"
                onClick={() => {
                  setRejectingDocument(null);
                  setRejectionReason("");
                }}
              >
                <X size={20} />
              </button>
            </div>

            <label htmlFor="onboarding-rejection-reason">
              Reason for rejection <span>*</span>
            </label>

            <textarea
              id="onboarding-rejection-reason"
              value={rejectionReason}
              onChange={(event) =>
                setRejectionReason(event.target.value)
              }
              placeholder="Explain what the candidate needs to correct…"
              rows={4}
              required
            />

            <p className="onboarding-modal-hint">
              A non-empty reason is required by the backend.
            </p>

            <div className="onboarding-modal-actions">
              <button
                type="button"
                className="onboarding-cancel"
                onClick={() => {
                  setRejectingDocument(null);
                  setRejectionReason("");
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="onboarding-confirm-reject"
                disabled={
                  !rejectionReason.trim() ||
                  busyDocumentId === rejectingDocument.id
                }
              >
                {busyDocumentId === rejectingDocument.id
                  ? "Submitting…"
                  : "Confirm rejection"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
