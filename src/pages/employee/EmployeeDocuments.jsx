import React, { useState } from "react";
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
import "./EmployeeDocuments.css";

function EmployeeDocuments() {
  const [documents, setDocuments] = useState([
    {
      id: 1,
      name: "Identity Document",
      description: "Government issued identity proof",
      fileName: "Aadhar_Card.pdf",
      uploadedOn: "10 Sep 2026",
      status: "Verified",
    },
    {
      id: 2,
      name: "Address Proof",
      description: "Valid address proof document",
      fileName: "Address_Proof.pdf",
      uploadedOn: "10 Sep 2026",
      status: "Verified",
    },
    {
      id: 3,
      name: "Education Certificate",
      description: "Highest qualification certificate",
      fileName: "Education_Certificate.pdf",
      uploadedOn: "11 Sep 2026",
      status: "Pending",
    },
    {
      id: 4,
      name: "Previous Employment Documents",
      description: "Previous employment related documents",
      fileName: "Experience_Letter.pdf",
      uploadedOn: "12 Sep 2026",
      status: "Verified",
    },
    {
      id: 5,
      name: "Bank Details",
      description: "Bank account information document",
      fileName: "",
      uploadedOn: "",
      status: "Not Uploaded",
    },
  ]);

  const [selectedDocument, setSelectedDocument] = useState(null);

  const handleFileUpload = (event, documentId) => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    setDocuments((previousDocuments) =>
      previousDocuments.map((document) =>
        document.id === documentId
          ? {
              ...document,
              fileName: file.name,
              uploadedOn: "16 Sep 2026",
              status: "Pending",
            }
          : document
      )
    );

    event.target.value = "";
  };

  const verifiedCount = documents.filter(
    (document) => document.status === "Verified"
  ).length;

  const pendingCount = documents.filter(
    (document) => document.status === "Pending"
  ).length;

  const notUploadedCount = documents.filter(
    (document) => document.status === "Not Uploaded"
  ).length;

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
            SUMMARY
        ========================= */}
        <section className="employee-documents-summary">

          <div className="document-summary-card">

            <div className="document-summary-icon purple">
              <FileText size={21} />
            </div>

            <div>
              <span>Total Documents</span>
              <strong>{documents.length}</strong>
              <small>Required documents</small>
            </div>

          </div>


          <div className="document-summary-card">

            <div className="document-summary-icon green">
              <CheckCircle2 size={21} />
            </div>

            <div>
              <span>Verified</span>
              <strong>{verifiedCount}</strong>
              <small>Documents verified</small>
            </div>

          </div>


          <div className="document-summary-card">

            <div className="document-summary-icon orange">
              <Clock3 size={21} />
            </div>

            <div>
              <span>Pending</span>
              <strong>{pendingCount}</strong>
              <small>Awaiting verification</small>
            </div>

          </div>


          <div className="document-summary-card">

            <div className="document-summary-icon red">
              <Upload size={21} />
            </div>

            <div>
              <span>Not Uploaded</span>
              <strong>{notUploadedCount}</strong>
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

              <p>
                Upload the required documents for your employee record.
              </p>
            </div>

            <FileText size={22} />

          </div>


          {/* Document List */}

          <div className="employee-document-list">

            {documents.map((document) => (

              <div
                className="employee-document-row"
                key={document.id}
              >

                {/* Icon */}
                <div className="employee-document-icon">
                  <File size={21} />
                </div>


                {/* Information */}
                <div className="employee-document-info">

                  <h3>
                    {document.name}
                  </h3>

                  <p>
                    {document.description}
                  </p>

                  {document.fileName && (
                    <span className="employee-document-file">
                      <File size={13} />
                      {document.fileName}
                    </span>
                  )}

                </div>


                {/* Status */}
                <div className="employee-document-status">

                  <span
                    className={`document-status-badge ${document.status
                      .toLowerCase()
                      .replace(" ", "-")}`}
                  >

                    {document.status === "Verified" && (
                      <CheckCircle2 size={13} />
                    )}

                    {document.status === "Pending" && (
                      <Clock3 size={13} />
                    )}

                    {document.status === "Not Uploaded" && (
                      <XCircle size={13} />
                    )}

                    {document.status}

                  </span>

                </div>


                {/* Actions */}
                <div className="employee-document-actions">

                  {document.fileName && (
                    <>
                      <button
                        type="button"
                        title="View"
                        onClick={() =>
                          setSelectedDocument(document)
                        }
                      >
                        <Eye size={17} />
                      </button>

                      <button
                        type="button"
                        title="Download"
                      >
                        <Download size={17} />
                      </button>
                    </>
                  )}


                  <label
                    className="document-upload-button"
                    title="Upload"
                  >
                    <Upload size={16} />

                    <span>
                      {document.fileName
                        ? "Replace"
                        : "Upload"}
                    </span>

                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={(event) =>
                        handleFileUpload(
                          event,
                          document.id
                        )
                      }
                    />
                  </label>

                </div>

              </div>

            ))}

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
                <h2>
                  {selectedDocument.name}
                </h2>

                <p>
                  {selectedDocument.fileName}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedDocument(null)}
              >
                <X size={20} />
              </button>

            </div>


            <div className="document-preview">

              <FileText size={55} />

              <h3>
                Document Preview
              </h3>

              <p>
                {selectedDocument.fileName}
              </p>

              <span>
                Preview area
              </span>

            </div>


            <div className="document-modal-footer">

              <button
                type="button"
                onClick={() => setSelectedDocument(null)}
              >
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