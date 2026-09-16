import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Filter,
  Eye,
  Send,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  X,
  Download,
} from "lucide-react";

import {
  fetchOffers,
  fetchOfferStats,
  searchOffers,
  fetchOffersByStatus,
  sendOffer,
} from "./hrApi";

import "./HROffers.css";


function HROffers() {
  const [offers, setOffers] = useState([]);
  const [stats, setStats] = useState({
    totalOffers: 0,
    pendingOffers: 0,
    sentOffers: 0,
    acceptedOffers: 0,
    rejectedOffers: 0,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedOffer, setSelectedOffer] = useState(null);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");


  // --------------------------------------------------
  // Convert backend offer to frontend format
  // --------------------------------------------------
  const formatOffer = (offer) => {
    const statusMap = {
      PENDING: "Pending",
      SENT: "Sent",
      ACCEPTED: "Accepted",
      REJECTED: "Rejected",
      YET_TO_RELEASED: "Yet To Released",
    };

    let joiningDate = "-";

    if (offer.joiningDate) {
      const date = new Date(offer.joiningDate);

      if (!Number.isNaN(date.getTime())) {
        joiningDate = date.toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });
      }
    }

    return {
      id: offer.offerCode || `OFF-${offer.offerId}`,
      offerId: offer.offerId,
      candidateId: offer.candidateId,
      candidate: offer.candidateName || "Unknown Candidate",
      position: offer.position || "-",
      department: offer.department || "Engineering",
      salary:
        offer.salary !== null && offer.salary !== undefined
          ? `₹${Number(offer.salary).toLocaleString("en-IN")}`
          : "-",
      salaryValue: offer.salary,
      joiningDate,
      joiningDateValue: offer.joiningDate,
      location: offer.location || "-",
      employmentType: offer.employmentType || "-",
      status: statusMap[offer.status] || offer.status || "Pending",
      backendStatus: offer.status,
      offerLetterUrl: offer.offerLetterUrl || null,
    };
  };


  // --------------------------------------------------
  // Load all offers
  // --------------------------------------------------
  const loadOffers = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await fetchOffers();

      const formattedOffers = Array.isArray(data)
        ? data.map(formatOffer)
        : [];

      setOffers(formattedOffers);
    } catch (err) {
      console.error("Failed to load offers:", err);
      setError(
        err?.message || "Failed to load offers from the server."
      );
    } finally {
      setLoading(false);
    }
  };


  // --------------------------------------------------
  // Load statistics
  // --------------------------------------------------
  const loadStats = async () => {
    try {
      const data = await fetchOfferStats();

      if (data) {
        setStats({
          totalOffers: data.totalOffers ?? 0,
          pendingOffers: data.pendingOffers ?? 0,
          sentOffers: data.sentOffers ?? 0,
          acceptedOffers: data.acceptedOffers ?? 0,
          rejectedOffers: data.rejectedOffers ?? 0,
        });
      }
    } catch (err) {
      console.error("Failed to load offer statistics:", err);
    }
  };


  // --------------------------------------------------
  // Initial load
  // --------------------------------------------------
  useEffect(() => {
    loadOffers();
    loadStats();
  }, []);


  // --------------------------------------------------
  // Search
  // --------------------------------------------------
  useEffect(() => {
    const searchValue = searchTerm.trim();

    if (!searchValue) {
      loadOffers();
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setError("");

        const data = await searchOffers(searchValue);

        const formattedOffers = Array.isArray(data)
          ? data.map(formatOffer)
          : [];

        setOffers(formattedOffers);
      } catch (err) {
        console.error("Offer search failed:", err);
        setError(
          err?.message || "Failed to search offers."
        );
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);


  // --------------------------------------------------
  // Status filter
  // --------------------------------------------------
  const handleStatusFilter = async (status) => {
    setStatusFilter(status);

    if (status === "All") {
      await loadOffers();
      return;
    }

    const backendStatus = {
      Pending: "PENDING",
      Sent: "SENT",
      Accepted: "ACCEPTED",
      Rejected: "REJECTED",
    }[status];

    if (!backendStatus) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await fetchOffersByStatus(backendStatus);

      const formattedOffers = Array.isArray(data)
        ? data.map(formatOffer)
        : [];

      setOffers(formattedOffers);
    } catch (err) {
      console.error("Failed to filter offers:", err);
      setError(
        err?.message || "Failed to filter offers."
      );
    } finally {
      setLoading(false);
    }
  };


  // --------------------------------------------------
  // Send offer
  // --------------------------------------------------
  const handleSendOffer = async (offer) => {
    if (!offer.offerId) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");

      await sendOffer(offer.offerId);

      await loadOffers();
      await loadStats();

      setSelectedOffer(null);
    } catch (err) {
      console.error("Failed to send offer:", err);

      setError(
        err?.message || "Failed to send offer."
      );
    } finally {
      setActionLoading(false);
    }
  };


  // --------------------------------------------------
  // Download / open offer letter
  // --------------------------------------------------
  const handleDownloadLetter = (offer) => {
    if (offer.offerLetterUrl) {
      window.open(
        offer.offerLetterUrl,
        "_blank",
        "noopener,noreferrer"
      );
      return;
    }

    alert(
      "Offer letter is not available from the backend for this offer."
    );
  };


  // --------------------------------------------------
  // Local filtering for search display
  // --------------------------------------------------
  const filteredOffers = useMemo(() => {
    if (!searchTerm.trim()) {
      return offers;
    }

    const value = searchTerm.toLowerCase();

    return offers.filter((offer) => {
      return (
        offer.candidate.toLowerCase().includes(value) ||
        offer.position.toLowerCase().includes(value) ||
        offer.id.toLowerCase().includes(value)
      );
    });
  }, [offers, searchTerm]);


  return (
    <div className="hr-page">

      {/* HEADER */}
      <div className="offers-header">
        <div>
          <h1>Offers</h1>
          <p>Manage candidate offers and offer status</p>
        </div>

        <button className="create-offer-btn">
          <FileText size={18} />
          Create Offer
        </button>
      </div>


      {/* ERROR */}
      {error && (
        <div
          style={{
            padding: "12px 16px",
            marginBottom: "16px",
            borderRadius: "8px",
            background: "#fff1f2",
            color: "#be123c",
            border: "1px solid #fecdd3",
          }}
        >
          {error}
        </div>
      )}


      {/* STATS */}
      <div className="offer-stats">

        <div className="offer-stat-card">
          <div className="offer-stat-icon purple">
            <FileText size={21} />
          </div>

          <div>
            <span>Total Offers</span>
            <strong>{stats.totalOffers}</strong>
            <small>All generated offers</small>
          </div>
        </div>


        <div className="offer-stat-card">
          <div className="offer-stat-icon orange">
            <Clock size={21} />
          </div>

          <div>
            <span>Pending</span>
            <strong>{stats.pendingOffers}</strong>
            <small>Awaiting response</small>
          </div>
        </div>


        <div className="offer-stat-card">
          <div className="offer-stat-icon blue">
            <Send size={21} />
          </div>

          <div>
            <span>Sent</span>
            <strong>{stats.sentOffers}</strong>
            <small>Offers sent</small>
          </div>
        </div>


        <div className="offer-stat-card">
          <div className="offer-stat-icon green">
            <CheckCircle size={21} />
          </div>

          <div>
            <span>Accepted</span>
            <strong>{stats.acceptedOffers}</strong>
            <small>Offers accepted</small>
          </div>
        </div>

      </div>


      {/* OFFERS CARD */}
      <div className="offers-card">

        {/* TOOLBAR */}
        <div className="offers-toolbar">

          <div className="search-box">
            <Search size={19} />

            <input
              type="text"
              placeholder="Search candidate, position or offer ID..."
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
            />
          </div>


          <div className="filter-box">
            <Filter size={18} />

            <select
              value={statusFilter}
              onChange={(event) =>
                handleStatusFilter(event.target.value)
              }
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Sent">Sent</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

        </div>


        {/* TABLE */}
        <div className="table-wrapper">

          <table className="offers-table">

            <thead>
              <tr>
                <th>Offer ID</th>
                <th>Candidate</th>
                <th>Position</th>
                <th>Salary</th>
                <th>Joining Date</th>
                <th>Location</th>
                <th>Employment</th>
                <th>Status</th>
                <th>Offer Letter</th>
                <th>Actions</th>
              </tr>
            </thead>


            <tbody>

              {loading ? (

                <tr>
                  <td
                    colSpan="10"
                    className="empty-state"
                  >
                    Loading offers...
                  </td>
                </tr>

              ) : filteredOffers.length > 0 ? (

                filteredOffers.map((offer) => (

                  <tr key={offer.offerId || offer.id}>

                    <td className="offer-id">
                      {offer.id}
                    </td>


                    <td>
                      <div className="candidate-cell">

                        <div className="candidate-avatar">
                          {offer.candidate.charAt(0)}
                        </div>

                        <div>
                          <strong>
                            {offer.candidate}
                          </strong>

                          <span>
                            {offer.department}
                          </span>
                        </div>

                      </div>
                    </td>


                    <td>
                      {offer.position}
                    </td>


                    <td className="salary">
                      {offer.salary}
                    </td>


                    <td>
                      {offer.joiningDate}
                    </td>


                    <td>
                      {offer.location}
                    </td>


                    <td>
                      {offer.employmentType}
                    </td>


                    <td>
                      <span
                        className={`status-badge ${offer.status
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                      >

                        {offer.status === "Accepted" && (
                          <CheckCircle size={14} />
                        )}

                        {offer.status === "Pending" && (
                          <Clock size={14} />
                        )}

                        {offer.status === "Sent" && (
                          <Send size={14} />
                        )}

                        {offer.status === "Rejected" && (
                          <XCircle size={14} />
                        )}

                        {offer.status}

                      </span>
                    </td>


                    {/* OFFER LETTER */}
                    <td>

                      {offer.status === "Accepted" && (
                        <button
                          className="letter-btn accepted-letter"
                          onClick={() =>
                            setSelectedOffer(offer)
                          }
                        >
                          <FileText size={15} />
                          Accepted Letter
                        </button>
                      )}


                      {offer.status === "Sent" && (
                        <button
                          className="letter-btn sent-letter"
                          onClick={() =>
                            setSelectedOffer(offer)
                          }
                        >
                          <FileText size={15} />
                          Offer Letter
                        </button>
                      )}


                      {offer.status === "Pending" && (
                        <button
                          className="letter-btn pending-letter"
                          onClick={() =>
                            setSelectedOffer(offer)
                          }
                        >
                          <FileText size={15} />
                          Generate
                        </button>
                      )}


                      {offer.status === "Rejected" && (
                        <button
                          className="letter-btn rejected-letter"
                          onClick={() =>
                            setSelectedOffer(offer)
                          }
                        >
                          <FileText size={15} />
                          Rejection
                        </button>
                      )}

                    </td>


                    {/* ACTIONS */}
                    <td>

                      <div className="action-buttons">

                        <button
                          className="icon-action"
                          title="View Offer"
                          onClick={() =>
                            setSelectedOffer(offer)
                          }
                        >
                          <Eye size={17} />
                        </button>


                        {offer.status === "Pending" && (
                          <button
                            className="icon-action send-action"
                            title="Send Offer"
                            disabled={actionLoading}
                            onClick={() =>
                              handleSendOffer(offer)
                            }
                          >
                            <Send size={17} />
                          </button>
                        )}

                      </div>

                    </td>

                  </tr>

                ))

              ) : (

                <tr>
                  <td
                    colSpan="10"
                    className="empty-state"
                  >
                    No offers found.
                  </td>
                </tr>

              )}

            </tbody>

          </table>

        </div>


        {/* FOOTER */}
        <div className="offers-footer">
          Showing <strong>{filteredOffers.length}</strong>{" "}
          of{" "}
          <strong>{stats.totalOffers}</strong> offers
        </div>

      </div>


      {/* LETTER MODAL */}
      {selectedOffer && (

        <div
          className="letter-modal-overlay"
          onClick={() => setSelectedOffer(null)}
        >

          <div
            className="letter-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* MODAL HEADER */}
            <div className="letter-modal-header">

              <div>

                <h2>
                  {selectedOffer.status === "Rejected"
                    ? "Rejection Letter"
                    : selectedOffer.status === "Accepted"
                    ? "Accepted Offer Letter"
                    : "Offer Letter"}
                </h2>

                <p>
                  {selectedOffer.id}
                </p>

              </div>


              <button
                className="close-modal-btn"
                onClick={() =>
                  setSelectedOffer(null)
                }
              >
                <X size={20} />
              </button>

            </div>


            {/* LETTER PREVIEW */}
            <div className="letter-preview">

              <div className="letter-company">

                <h1>
                  Talent<span>AI</span>
                </h1>

                <p>
                  AI Recruitment & Employee Management Platform
                </p>

              </div>


              <div className="letter-title">

                <h2>
                  {selectedOffer.status === "Rejected"
                    ? "CANDIDATE DECISION LETTER"
                    : selectedOffer.status === "Accepted"
                    ? "OFFER ACCEPTANCE LETTER"
                    : "EMPLOYMENT OFFER LETTER"}
                </h2>

              </div>


              <div className="letter-content">

                <p>
                  Dear{" "}
                  <strong>
                    {selectedOffer.candidate}
                  </strong>,
                </p>


                {selectedOffer.status === "Rejected" ? (

                  <p>
                    Thank you for your interest in the{" "}
                    <strong>
                      {selectedOffer.position}
                    </strong>{" "}
                    position at TalentAI. After careful
                    consideration, we regret to inform
                    you that your application has not been
                    selected at this time.
                  </p>

                ) : (

                  <>

                    <p>
                      We are pleased to offer you the
                      position of{" "}
                      <strong>
                        {selectedOffer.position}
                      </strong>{" "}
                      at TalentAI.
                    </p>


                    <div className="letter-details">

                      <div>
                        <span>Designation</span>
                        <strong>
                          {selectedOffer.position}
                        </strong>
                      </div>


                      <div>
                        <span>Annual Salary</span>
                        <strong>
                          {selectedOffer.salary}
                        </strong>
                      </div>


                      <div>
                        <span>Joining Date</span>
                        <strong>
                          {selectedOffer.joiningDate}
                        </strong>
                      </div>


                      <div>
                        <span>Location</span>
                        <strong>
                          {selectedOffer.location}
                        </strong>
                      </div>


                      <div>
                        <span>Employment Type</span>
                        <strong>
                          {selectedOffer.employmentType}
                        </strong>
                      </div>


                      <div>
                        <span>Reporting Manager</span>
                        <strong>
                          HR Manager
                        </strong>
                      </div>

                    </div>


                    {selectedOffer.status === "Accepted" && (

                      <div className="accepted-message">

                        <CheckCircle size={20} />

                        <div>

                          <strong>
                            Offer Accepted
                          </strong>

                          <p>
                            The candidate has accepted
                            this employment offer.
                          </p>

                        </div>

                      </div>

                    )}


                    {selectedOffer.status !== "Accepted" && (

                      <p>
                        We look forward to welcoming you
                        to our team. Please review the
                        terms of this offer and confirm
                        your acceptance.
                      </p>

                    )}

                  </>

                )}


                <p className="letter-closing">

                  Sincerely,
                  <br />

                  <strong>
                    HR Manager
                  </strong>

                  <br />

                  TalentAI

                </p>

              </div>

            </div>


            {/* MODAL FOOTER */}
            {selectedOffer.status !== "Rejected" && (

              <div className="letter-modal-footer">

                <button
                  className="download-letter-btn"
                  onClick={() =>
                    handleDownloadLetter(
                      selectedOffer
                    )
                  }
                >
                  <Download size={17} />
                  Download Letter
                </button>


                {selectedOffer.status === "Pending" && (

                  <button
                    className="send-letter-btn"
                    disabled={actionLoading}
                    onClick={() =>
                      handleSendOffer(
                        selectedOffer
                      )
                    }
                  >

                    <Send size={17} />

                    {actionLoading
                      ? "Sending..."
                      : "Send Offer"}

                  </button>

                )}

              </div>

            )}

          </div>

        </div>

      )}

    </div>
  );
}


export default HROffers;