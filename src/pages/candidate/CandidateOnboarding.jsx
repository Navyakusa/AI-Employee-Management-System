
import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FileText,
  RefreshCw,
  UploadCloud,
  XCircle,
} from "lucide-react";

import CandidateSidebar from "./CandidateSidebar";
import CandidateNavbar from "./CandidateNavbar";

import {
  getMyOnboarding,
  getMyOnboardingDocuments,
  uploadOnboardingDocument,
} from "../../services/candidateService";

import { getErrorMessage } from "../../services/candidateHelpers";
import "./CandidateOnboarding.css";

const prettyDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

const statusClass = (status) =>
  String(status || "pending").toLowerCase().replaceAll("_", "-");

function CandidateOnboarding() {
  const [onboarding, setOnboarding] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [documentType, setDocumentType] = useState("resume");
  const [selectedFile, setSelectedFile] = useState(null);
  const [notice, setNotice] = useState("");
  const [uploadError, setUploadError] = useState("");

  const loadOnboarding = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const record = await getMyOnboarding();

      if (!record || !record.onboardingId) {
        setOnboarding(null);
        setDocuments([]);
        return;
      }

      setOnboarding(record);

      const docs = await getMyOnboardingDocuments(
        record.onboardingId
      );

      if (!Array.isArray(docs)) {
        throw new Error("The document response was not a valid list.");
      }

      setDocuments(docs);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to load your onboarding details and documents."
        )
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOnboarding();
  }, [loadOnboarding]);

  const handleUpload = async (event) => {
    event.preventDefault();

    setNotice("");
    setUploadError("");

    if (!selectedFile) {
      setUploadError("Please choose a document to upload.");
      return;
    }

    if (!onboarding?.onboardingId) {
      setUploadError(
        "Your onboarding record is not available yet."
      );
      return;
    }

    setUploading(true);

    try {
      await uploadOnboardingDocument(
        onboarding.onboardingId,
        documentType,
        selectedFile
      );

      setSelectedFile(null);

      const fileInput = document.getElementById(
        "candidate-onboarding-file"
      );

      if (fileInput) {
        fileInput.value = "";
      }

      setNotice(
        "Document uploaded successfully. It is waiting for HR verification."
      );

      await loadOnboarding();
    } catch (err) {
      setUploadError(
        getErrorMessage(
          err,
          "Document upload failed. Please try again."
        )
      );
    } finally {
      setUploading(false);
    }
  };

  const verifiedCount = documents.filter(
    (doc) =>
      String(doc.status || "").toUpperCase() === "VERIFIED"
  ).length;

  const status = String(onboarding?.status || "").toUpperCase();

  return (
    <div className="candidate-layout">
      <CandidateSidebar />

      <div className="candidate-main">
        <CandidateNavbar />

        <main className="candidate-dashboard-content candidate-onboarding-page">
          <header className="candidate-onboarding-header">
            <div>
              <p className="candidate-label">GETTING STARTED</p>
              <h1>My Onboarding</h1>
              <p>
                Track your onboarding progress and submit documents
                for HR verification.
              </p>
            </div>

            <button
              type="button"
              className="candidate-onboarding-refresh"
              onClick={loadOnboarding}
              disabled={loading}
            >
              <RefreshCw
                size={16}
                className={
                  loading ? "candidate-onboarding-spin" : ""
                }
              />
              Refresh
            </button>
          </header>

          {loading ? (
            <section className="candidate-onboarding-message">
              <RefreshCw
                size={24}
                className="candidate-onboarding-spin"
              />
              <h3>Loading onboarding details…</h3>
              <p>
                Please wait while we retrieve your latest status.
              </p>
            </section>
          ) : error ? (
            <section className="candidate-onboarding-message error">
              <XCircle size={26} />
              <h3>Unable to load onboarding</h3>
              <p>{error}</p>

              <button type="button" onClick={loadOnboarding}>
                Try again
              </button>
            </section>
          ) : !onboarding ? (
            <section className="candidate-onboarding-message">
              <ClipboardCheck size={30} />
              <h3>No onboarding record found</h3>
              <p>
                Your onboarding details will appear here once HR
                starts your onboarding.
              </p>
            </section>
          ) : (
            <>
              <section className="candidate-onboarding-overview">
                <div className="candidate-onboarding-overview-icon">
                  <ClipboardCheck size={25} />
                </div>

                <div className="candidate-onboarding-overview-main">
                  <span className="candidate-onboarding-eyebrow">
                    POSITION
                  </span>

                  <h2>
                    {onboarding.position || "Position not specified"}
                  </h2>

                  <p>
                    Onboarding ID: #{onboarding.onboardingId}
                    <span> • </span>
                    Offer ID: #{onboarding.offerId ?? "—"}
                  </p>
                </div>

                <span
                  className={`candidate-onboarding-status ${statusClass(
                    status
                  )}`}
                >
                  {status || "UNKNOWN"}
                </span>
              </section>

              <section className="candidate-onboarding-stats">
                <article>
                  <span>Started On</span>
                  <strong>{prettyDate(onboarding.startedAt)}</strong>
                </article>

                <article>
                  <span>Completed On</span>
                  <strong>{prettyDate(onboarding.completedAt)}</strong>
                </article>

                <article>
                  <span>Verified Documents</span>
                  <strong>
                    {verifiedCount} / {documents.length}
                  </strong>
                </article>
              </section>

              <section className="candidate-onboarding-section">
                <div className="candidate-onboarding-section-heading">
                  <div>
                    <h2>Required Documents</h2>
                    <p>
                      Upload your documents and check their
                      verification status.
                    </p>
                  </div>

                  <span>{documents.length} uploaded</span>
                </div>

                {documents.length > 0 ? (
                  <div className="candidate-onboarding-doc-list">
                    {documents.map((doc, index) => {
                      const docStatus = String(
                        doc.status || "PENDING"
                      ).toUpperCase();

                      return (
                        <article
                          className="candidate-onboarding-doc"
                          key={
                            doc.documentId ??
                            doc.id ??
                            `${doc.documentType}-${doc.fileName}-${index}`
                          }
                        >
                          <div className="candidate-onboarding-doc-icon">
                            <FileText size={20} />
                          </div>

                          <div className="candidate-onboarding-doc-info">
                            <strong>
                              {doc.fileName ||
                                doc.filename ||
                                doc.documentType ||
                                "Uploaded document"}
                            </strong>

                            <span>
                              {String(
                                doc.documentType || "Document"
                              ).replaceAll("_", " ")}
                              {" · Uploaded "}
                              {prettyDate(doc.uploadedAt)}
                            </span>

                            {doc.verifiedBy && (
                              <span>
                                Verified by: {doc.verifiedBy}
                              </span>
                            )}

                            {doc.rejectionReason && (
                              <p className="candidate-onboarding-rejection">
                                Reason: {doc.rejectionReason}
                              </p>
                            )}
                          </div>

                          <span
                            className={`candidate-onboarding-doc-status ${statusClass(
                              docStatus
                            )}`}
                          >
                            {docStatus === "VERIFIED" ? (
                              <CheckCircle2 size={14} />
                            ) : docStatus === "REJECTED" ? (
                              <XCircle size={14} />
                            ) : (
                              <Clock3 size={14} />
                            )}

                            {docStatus}
                          </span>
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <div className="candidate-onboarding-no-docs">
                    <FileText size={22} />
                    <p>No documents uploaded yet.</p>
                  </div>
                )}
              </section>

              {status !== "COMPLETED" && (
                <section className="candidate-onboarding-section candidate-onboarding-upload-section">
                  <div className="candidate-onboarding-section-heading">
                    <div>
                      <h2>Upload a Document</h2>
                      <p>
                        HR must verify uploaded documents before
                        onboarding can be completed.
                      </p>
                    </div>
                  </div>

                  <form
                    className="candidate-onboarding-upload-form"
                    onSubmit={handleUpload}
                  >
                    <label>
                      Document type

                      <select
                        value={documentType}
                        onChange={(event) =>
                          setDocumentType(event.target.value)
                        }
                      >
                        <option value="resume">Resume</option>
                        <option value="identity_proof">
                          Identity Proof
                        </option>
                        <option value="education_certificate">
                          Education Certificate
                        </option>
                        <option value="address_proof">
                          Address Proof
                        </option>
                        <option value="other">Other</option>
                      </select>
                    </label>

                    <label className="candidate-onboarding-file-label">
                      Choose file

                      <input
                        id="candidate-onboarding-file"
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                        onChange={(event) =>
                          setSelectedFile(
                            event.target.files?.[0] || null
                          )
                        }
                      />
                    </label>

                    <button
                      type="submit"
                      disabled={uploading || !selectedFile}
                    >
                      <UploadCloud size={17} />
                      {uploading
                        ? "Uploading…"
                        : "Upload Document"}
                    </button>
                  </form>

                  {notice && (
                    <p className="candidate-onboarding-notice success">
                      {notice}
                    </p>
                  )}

                  {uploadError && (
                    <p className="candidate-onboarding-notice error">
                      {uploadError}
                    </p>
                  )}
                </section>
              )}

              {status === "COMPLETED" && (
                <div className="candidate-onboarding-complete">
                  <CheckCircle2 size={21} />

                  <div>
                    <strong>Onboarding completed</strong>
                    <p>
                      Your onboarding is complete. Contact HR if you
                      need help with your employee records.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default CandidateOnboarding;
