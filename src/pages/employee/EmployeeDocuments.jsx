import React, { useEffect, useRef, useState } from "react";
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
  uploadEmployeeDocument,
  deleteEmployeeDocument,
  fetchEmployeeDocumentFile,
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

const MIME_BY_EXTENSION = {
  pdf: "application/pdf",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

function getExtension(fileName) {
  const match = /\.([a-z0-9]+)$/i.exec(fileName || "");
  return match ? match[1].toLowerCase() : "";
}

// Servers often send files as "application/octet-stream". Re-type the blob
// from the file extension so the browser can show PDFs and images inline.
function toTypedBlob(blob, contentType, fileName) {
  const fromExtension = MIME_BY_EXTENSION[getExtension(fileName)];
  const type =
    contentType && !contentType.includes("octet-stream")
      ? contentType.split(";")[0]
      : fromExtension || blob.type || "application/octet-stream";
  return blob.type === type ? blob : new Blob([blob], { type });
}

function previewKind(type) {
  if (type === "application/pdf") return "pdf";
  if (type.startsWith("image/")) return "image";
  return "other";
}

function fileErrorMessage(err) {
  const status = err?.response?.status;
  if (status === 404) return "The file was not found on the server.";
  if (status === 401) return "Your session has expired. Please log in again.";
  if (status === 403) return "You are not allowed to access this file.";
  return "Could not load the file. Please try again.";
}

function EmployeeDocuments() {
  const [documentsByType, setDocumentsByType] = useState({});
  // All records per category, newest first (the backend can hold more than
  // one record for the same category, e.g. after a failed replace).
  const [allDocumentsByType, setAllDocumentsByType] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [uploadingType, setUploadingType] = useState(null);

  // Preview state for the View modal
  const [preview, setPreview] = useState({ url: null, kind: null, loading: false, error: "" });
  const [downloadingId, setDownloadingId] = useState(null);
  // Keeps the fetched file of the open document so Download in the modal
  // does not fetch it a second time.
  const previewFileRef = useRef(null);

  const fetchAll = async () => {
    try {
      const docsRes = await getMyDocuments();
      const list = docsRes.data?.data || [];

      // Group by category, newest upload first
      const allByType = {};
      list.forEach((doc) => {
        (allByType[doc.documentType] ||= []).push(doc);
      });
      Object.values(allByType).forEach((docs) =>
        docs.sort((a, b) => String(b.uploadedAt || "").localeCompare(String(a.uploadedAt || "")))
      );

      // The page shows the newest document of each category
      const byType = {};
      Object.entries(allByType).forEach(([type, docs]) => {
        byType[type] = docs[0];
      });

      setAllDocumentsByType(allByType);
      setDocumentsByType(byType);
    } catch (err) {
      console.error("Failed to load documents", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Free the object URL when the preview changes or the page unmounts
  useEffect(() => {
    return () => {
      if (preview.url) window.URL.revokeObjectURL(preview.url);
    };
  }, [preview.url]);

  const loadFile = async (doc, mode) => {
    // Reuse the file already loaded in the View modal instead of fetching again
    if (previewFileRef.current?.docId === doc.id) return previewFileRef.current.blob;
    const { blob, contentType } = await fetchEmployeeDocumentFile(doc, mode);
    return toTypedBlob(blob, contentType, doc.fileName);
  };

  const handleView = async (doc, categoryName) => {
    setSelectedDocument({ ...doc, categoryName });
    previewFileRef.current = null;
    setPreview({ url: null, kind: null, loading: true, error: "" });

    try {
      const blob = await loadFile(doc, "view");
      previewFileRef.current = { docId: doc.id, blob };
      setPreview({
        url: window.URL.createObjectURL(blob),
        kind: previewKind(blob.type),
        loading: false,
        error: "",
      });
    } catch (err) {
      console.error("Document view failed", err);
      setPreview({ url: null, kind: null, loading: false, error: fileErrorMessage(err) });
    }
  };

  const closePreview = () => {
    setSelectedDocument(null);
    previewFileRef.current = null;
    setPreview({ url: null, kind: null, loading: false, error: "" });
  };

  const handleDownload = async (doc) => {
    setDownloadingId(doc.id);
    try {
      const blob = await loadFile(doc, "download");
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = doc.fileName || "document";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (err) {
      console.error("Document download failed", err);
      alert(fileErrorMessage(err));
    } finally {
      setDownloadingId(null);
    }
  };

  const handleFileUpload = async (event, categoryType) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadingType(categoryType);

    try {
      // No "replace" endpoint exists. Upload the new file FIRST, and only
      // after it succeeds delete the old record(s) of this category, so a
      // failed upload never loses the existing document.
      const oldDocuments = allDocumentsByType[categoryType] || [];

      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentType", categoryType);
      // Some backends also expect a documentName — uncomment if yours does:
      // formData.append("documentName", file.name);

      await uploadEmployeeDocument(formData);

      for (const old of oldDocuments) {
        try {
          await deleteEmployeeDocument(old.id);
        } catch (deleteErr) {
          console.error("Could not delete old document", old.id, deleteErr);
        }
      }
      await fetchAll();
    } catch (err) {
      console.error("Upload failed", err);
      alert("Could not upload document. Please try again.");
    } finally {
      setUploadingType(null);
      event.target.value = "";
    }
  };

  // Summary cards are counted from the documents shown on this page, so they
  // always match the list (the backend summary counts every stored record,
  // including old duplicates, and always returns notUploadedDocuments = 0).
  const shownDocuments = DOCUMENT_CATEGORIES.map((c) => documentsByType[c.type]).filter(Boolean);
  const counts = {
    uploaded: shownDocuments.length,
    verified: shownDocuments.filter((d) => statusToBadgeClass(d.status) === "verified").length,
    pending: shownDocuments.filter((d) => statusToBadgeClass(d.status) === "pending").length,
    notUploaded: DOCUMENT_CATEGORIES.length - shownDocuments.length,
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
              <strong>{counts.uploaded}</strong>
              <small>Uploaded documents</small>
            </div>
          </div>

          <div className="document-summary-card">
            <div className="document-summary-icon green">
              <CheckCircle2 size={21} />
            </div>
            <div>
              <span>Verified</span>
              <strong>{counts.verified}</strong>
              <small>Documents verified</small>
            </div>
          </div>

          <div className="document-summary-card">
            <div className="document-summary-icon orange">
              <Clock3 size={21} />
            </div>
            <div>
              <span>Pending</span>
              <strong>{counts.pending}</strong>
              <small>Awaiting verification</small>
            </div>
          </div>

          <div className="document-summary-card">
            <div className="document-summary-icon red">
              <Upload size={21} />
            </div>
            <div>
              <span>Not Uploaded</span>
              <strong>{counts.notUploaded}</strong>
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
                          onClick={() => handleView(doc, category.name)}
                        >
                          <Eye size={17} />
                        </button>
                        <button
                          type="button"
                          title={downloadingId === doc.id ? "Downloading..." : "Download"}
                          disabled={downloadingId === doc.id}
                          onClick={() => handleDownload(doc)}
                        >
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
        <div className="document-modal-overlay" onClick={closePreview}>
          <div
            className={`document-modal ${preview.url && preview.kind !== "other" ? "has-preview" : ""}`}
            onClick={(event) => event.stopPropagation()}
          >

            <div className="document-modal-header">
              <div>
                <h2>{selectedDocument.categoryName}</h2>
                <p>{selectedDocument.fileName}</p>
              </div>
              <button type="button" onClick={closePreview}>
                <X size={20} />
              </button>
            </div>

            {preview.url && preview.kind === "pdf" && (
              <iframe
                className="document-preview-frame"
                src={preview.url}
                title={selectedDocument.fileName}
              />
            )}

            {preview.url && preview.kind === "image" && (
              <div className="document-preview-image">
                <img src={preview.url} alt={selectedDocument.fileName} />
              </div>
            )}

            {!(preview.url && preview.kind !== "other") && (
              <div className="document-preview">
                <FileText size={55} />
                <h3>Document Preview</h3>
                <p>{selectedDocument.fileName}</p>
                {preview.loading && <span>Loading document...</span>}
                {preview.error && <span className="document-preview-error">{preview.error}</span>}
                {preview.url && preview.kind === "other" && (
                  <span>This file type cannot be previewed in the browser. Use Download to open it.</span>
                )}
              </div>
            )}

            <div className="document-modal-footer">
              <button type="button" onClick={closePreview}>
                Close
              </button>
              <button
                type="button"
                disabled={downloadingId === selectedDocument.id}
                onClick={() => handleDownload(selectedDocument)}
              >
                <Download size={16} />
                {downloadingId === selectedDocument.id ? "Downloading..." : "Download"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default EmployeeDocuments;
