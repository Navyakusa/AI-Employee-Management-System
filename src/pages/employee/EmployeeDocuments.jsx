import React, { useEffect, useState } from "react";
import {
  FileText,
  Upload,
  Download,
  Eye,
  CheckCircle2,
  Clock3,
  XCircle,
  File,
  X,
} from "lucide-react";
import EmployeeSidebar from "./EmployeeSidebar";
import EmployeeTopbar from "./EmployeeTopbar";
import {
  getMyDocuments,
  getMyDocumentSummary,
  uploadEmployeeDocument,
  deleteEmployeeDocument,
} from "../../services/employeeService";
import "./EmployeeDocuments.css";

// Fixed document categories shown on screen, each matched to a
// documentType string sent to/received from the backend.
// IMPORTANT: these documentType values (IDENTITY, ADDRESS_PROOF, etc.)
// are a reasonable guess, not confirmed against the backend. If your
// backend expects specific enum values, ask for the exact list and
// swap these in — mismatched values will just never match on fetch.
const DOCUMENT_CATEGORIES = [
  {
    type: "IDENTITY",
    name: "Identity Document",
    description: "Government issued identity proof",
  },
  {
    type: "ADDRESS_PROOF",
    name: "Address Proof",
    description: "Valid address proof document",
  },
  {
    type: "EDUCATION_CERTIFICATE",
    name: "Education Certificate",
    description: "Highest qualification certificate",
  },
  {
    type: "EMPLOYMENT_DOCUMENTS",
    name: "Previous Employment Documents",
    description: "Previous employment related documents",
  },
  {
    type: "BANK_DETAILS",
    name: "Bank Details",
    description: "Bank account information document",
  },
];

function statusToBadgeClass(status) {
  if (!status) return "not-uploaded";
  const s = status.toLowerCase();
  if (s.includes("verif")) return "verified";
  if (s.includes("pend")) return "pending";
  return "not-uploaded";
}

function EmployeeDocuments() {
  const [documentsByType, setDocumentsByType] = useState({});
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [uploadingType, setUploadingType] = useState(null);

  const fetchAll = async () => {
    try {
      const [docsRes, summaryRes] = await Promise.all([
        getMyDocuments(),
        getMyDocumentSummary(),
      ]);

      const list = docsRes.data?.data || [];
      const byType = {};
      list.forEach((doc) => {
        byType[doc.documentType] = doc;
      });

      setDocumentsByType(byType);
      setSummary(summaryRes.data?.data || null);
    } catch (err) {
      console.error("Failed to load documents", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleFileUpload = async (event, categoryType) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadingType(categoryType);

    try {
      // No "update"/"replace" endpoint exists — delete the old record
      // first (if any), then upload the new file as a fresh one.
      const existing = documentsByType[categoryType];
      if (existing?.id) {
        await deleteEmployeeDocument(existing.id);
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentType", categoryType);
      // Some backends also expect a documentName — uncomment if yours does:
      // formData.append("documentName", file.name);

      await uploadEmployeeDocument(formData);
      await fetchAll();
    } catch (err) {
      console.error("Upload failed", err);
      alert("Could not upload document. Please try again.");
    } finally {
      setUploadingType(null);
      event.target.value = "";
    }
  };

  if (loading) {
    return (
      <div className="employee-documents-layout">
        <EmployeeSidebar />
        <EmployeeTopbar />
        <main className="employee-documents-main">
          <p>Loading documents...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="employee-documents-layout">

      <EmployeeSidebar />

      <EmployeeTopbar />

      <main className="employee-documents-main">

        {/* =========================
            PAGE HEADER
        ========================= */}
        <div className="employee-documents-header">

          <div>
            <span className="employee-page-label">
              EMPLOYEE WORKSPACE
            </span>

            <h1>Documents</h1>

            <p>
              Upload and manage your employee documents.
            </p>
          </div>

          <div className="employee-documents-header-icon">
            <FileText size={25} />
          </div>

        </div>


        {/* =========================
            SUMMARY (DocumentSummaryDto — confirmed shape)
        ========================= */}
        <section className="employee-documents-summary">

          <div className="document-summary-card">
            <div className="document-summary-icon purple">
              <FileText size={21} />
            </div>
            <div>
              <span>Total Documents</span>
              <strong>{summary?.totalDocuments ?? DOCUMENT_CATEGORIES.length}</strong>
              <small>Required documents</small>
            </div>
          </div>

          <div className="document-summary-card">
            <div className="document-summary-icon green">
              <CheckCircle2 size={21} />
            </div>
            <div>
              <span>Verified</span>
              <strong>{summary?.verifiedDocuments ?? 0}</strong>
              <small>Documents verified</small>
            </div>
          </div>

          <div className="document-summary-card">
            <div className="document-summary-icon orange">
              <Clock3 size={21} />
            </div>
            <div>
              <span>Pending</span>
              <strong>{summary?.pendingDocuments ?? 0}</strong>
              <small>Awaiting verification</small>
            </div>
          </div>

          <div className="document-summary-card">
            <div className="document-summary-icon red">
              <Upload size={21} />
            </div>
            <div>
              <span>Not Uploaded</span>
              <strong>{summary?.notUploadedDocuments ?? 0}</strong>
              <small>Documents required</small>
            </div>
          </div>

        </section>


        {/* =========================
            DOCUMENT CARD
        ========================= */}
        <section className="employee-documents-card">

          <div className="documents-card-header">
            <div>
              <h2>My Documents</h2>
              <p>Upload the required documents for your employee record.</p>
            </div>
            <FileText size={22} />
          </div>

          <div className="employee-document-list">

            {DOCUMENT_CATEGORIES.map((category) => {
              const doc = documentsByType[category.type];
              const status = doc?.status || "Not Uploaded";

              return (
                <div className="employee-document-row" key={category.type}>

                  <div className="employee-document-icon">
                    <File size={21} />
                  </div>

                  <div className="employee-document-info">
                    <h3>{category.name}</h3>
                    <p>{category.description}</p>

                    {doc?.fileName && (
                      <span className="employee-document-file">
                        <File size={13} />
                        {doc.fileName}
                      </span>
                    )}
                  </div>

                  <div className="employee-document-status">
                    <span className={`document-status-badge ${statusToBadgeClass(status)}`}>
                      {statusToBadgeClass(status) === "verified" && <CheckCircle2 size={13} />}
                      {statusToBadgeClass(status) === "pending" && <Clock3 size={13} />}
                      {statusToBadgeClass(status) === "not-uploaded" && <XCircle size={13} />}
                      {status}
                    </span>
                  </div>

                  <div className="employee-document-actions">
                    {doc?.fileName && (
                      <>
                        <button
                          type="button"
                          title="View"
                          onClick={() => setSelectedDocument({ ...doc, categoryName: category.name })}
                        >
                          <Eye size={17} />
                        </button>
                        <button type="button" title="Download">
                          <Download size={17} />
                        </button>
                      </>
                    )}

                    <label className="document-upload-button" title="Upload">
                      <Upload size={16} />
                      <span>
                        {uploadingType === category.type
                          ? "Uploading..."
                          : doc?.fileName
                          ? "Replace"
                          : "Upload"}
                      </span>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        disabled={uploadingType === category.type}
                        onChange={(event) => handleFileUpload(event, category.type)}
                      />
                    </label>
                  </div>

                </div>
              );
            })}

          </div>

        </section>


        {/* =========================
            DOCUMENT INFORMATION
        ========================= */}
        <section className="employee-document-info-card">
          <div className="document-info-icon">
            <FileText size={20} />
          </div>
          <div>
            <h3>Document Guidelines</h3>
            <p>
              Make sure uploaded documents are clear and readable.
              Supported formats include PDF, DOC, DOCX, JPG and PNG.
            </p>
          </div>
        </section>

      </main>


      {/* =========================
          VIEW DOCUMENT MODAL
      ========================= */}
      {selectedDocument && (
        <div className="document-modal-overlay">
          <div className="document-modal">

            <div className="document-modal-header">
              <div>
                <h2>{selectedDocument.categoryName}</h2>
                <p>{selectedDocument.fileName}</p>
              </div>
              <button type="button" onClick={() => setSelectedDocument(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="document-preview">
              <FileText size={55} />
              <h3>Document Preview</h3>
              <p>{selectedDocument.fileName}</p>
              {/* No preview/download URL field is in EmployeeDocumentResponseDto.
                  If your backend serves the file via a separate endpoint
                  (e.g. GET /employee-documents/{id}/download), wire an
                  <iframe>/<img> or the Download button below to that instead. */}
              <span>Preview not available — file storage URL not confirmed yet</span>
            </div>

            <div className="document-modal-footer">
              <button type="button" onClick={() => setSelectedDocument(null)}>
                Close
              </button>
              <button type="button">
                <Download size={16} />
                Download
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default EmployeeDocuments;
