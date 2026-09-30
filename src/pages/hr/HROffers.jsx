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

import HRSidebar from "./HRSidebar";

import "./HROffers.css";

function HROffers() {
  // ============================================================
  // OFFERS
  // ============================================================

  const [offers, setOffers] = useState([]);

  const [stats, setStats] = useState({
    totalOffers: 0,
    pendingOffers: 0,
    sentOffers: 0,
    acceptedOffers: 0,
    rejectedOffers: 0,
  });

  // ============================================================
  // SEARCH / FILTER
  // ============================================================

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // ============================================================
  // VIEW LETTER MODAL
  // ============================================================

  const [selectedOffer, setSelectedOffer] = useState(null);

  // ============================================================
  // CREATE OFFER MODAL
  // ============================================================

  const [createOfferOpen, setCreateOfferOpen] = useState(false);

  const [createLoading, setCreateLoading] = useState(false);

  const [createOfferForm, setCreateOfferForm] = useState({
    candidateId: "",
    candidateName: "",
    position: "",
    salary: "",
    joiningDate: "",
    location: "",
    employmentType: "",
  });

  // ============================================================
  // GENERAL LOADING
  // ============================================================

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");

  // ============================================================
  // FORMAT BACKEND OFFER
  // ============================================================

  const formatOffer = (offer) => {
    const statusMap = {
      PENDING: "Pending",
      SENT: "Sent",
      ACCEPTED: "Accepted",
      REJECTED: "Rejected",
      YET_TO_RELEASED: "Yet To Released",
    };

    let joiningDate = "-";

    if (offer?.joiningDate) {
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
      id:
        offer?.offerCode ||
        `OFF-${offer?.offerId ?? ""}`,

      offerId: offer?.offerId,

      candidateId: offer?.candidateId,

      candidate:
        offer?.candidateName ||
        offer?.candidate?.name ||
        "Unknown Candidate",

      position:
        offer?.position ||
        offer?.jobTitle ||
        "-",

      department:
        offer?.department ||
        "Engineering",

      salary:
        offer?.salary !== null &&
        offer?.salary !== undefined
          ? `₹${Number(
              offer.salary
            ).toLocaleString("en-IN")}`
          : "-",

      salaryValue: offer?.salary,

      joiningDate,

      joiningDateValue:
        offer?.joiningDate,

      location:
        offer?.location ||
        "-",

      employmentType:
        offer?.employmentType ||
        "-",

      status:
        statusMap[offer?.status] ||
        offer?.status ||
        "Pending",

      backendStatus:
        offer?.status,

      offerLetterUrl:
        offer?.offerLetterUrl ||
        offer?.offerLetter ||
        null,
    };
  };

  // ============================================================
  // LOAD ALL OFFERS
  // ============================================================

  const loadOffers = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await fetchOffers();

      console.log(
        "Offers from backend:",
        data
      );

      const formattedOffers =
        Array.isArray(data)
          ? data.map(formatOffer)
          : [];

      setOffers(formattedOffers);

    } catch (err) {
      console.error(
        "Failed to load offers:",
        err
      );

      setError(
        err?.message ||
          "Failed to load offers from the server."
      );

      setOffers([]);

    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // LOAD OFFER STATISTICS
  // ============================================================

  const loadStats = async () => {
    try {
      const data =
        await fetchOfferStats();

      console.log(
        "Offer statistics:",
        data
      );

      if (data) {
        setStats({
          totalOffers:
            data.totalOffers ??
            data.total ??
            0,

          pendingOffers:
            data.pendingOffers ??
            data.pending ??
            0,

          sentOffers:
            data.sentOffers ??
            data.sent ??
            0,

          acceptedOffers:
            data.acceptedOffers ??
            data.accepted ??
            0,

          rejectedOffers:
            data.rejectedOffers ??
            data.rejected ??
            0,
        });
      }

    } catch (err) {
      console.error(
        "Failed to load offer statistics:",
        err
      );
    }
  };

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    loadOffers();
    loadStats();
  }, []);

  // ============================================================
  // SEARCH OFFERS
  // ============================================================

  useEffect(() => {
    const searchValue =
      searchTerm.trim();

    if (!searchValue) {
      loadOffers();
      return;
    }

    const timer =
      setTimeout(async () => {
        try {
          setLoading(true);
          setError("");

          const data =
            await searchOffers(
              searchValue
            );

          console.log(
            "Offer search result:",
            data
          );

          const formattedOffers =
            Array.isArray(data)
              ? data.map(formatOffer)
              : [];

          setOffers(
            formattedOffers
          );

        } catch (err) {
          console.error(
            "Offer search failed:",
            err
          );

          setError(
            err?.message ||
              "Failed to search offers."
          );

          setOffers([]);

        } finally {
          setLoading(false);
        }
      }, 400);

    return () =>
      clearTimeout(timer);

  }, [searchTerm]);

  // ============================================================
  // STATUS FILTER
  // ============================================================

  const handleStatusFilter =
    async (status) => {
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

        const data =
          await fetchOffersByStatus(
            backendStatus
          );

        console.log(
          `Offers with status ${backendStatus}:`,
          data
        );

        const formattedOffers =
          Array.isArray(data)
            ? data.map(formatOffer)
            : [];

        setOffers(
          formattedOffers
        );

      } catch (err) {
        console.error(
          "Failed to filter offers:",
          err
        );

        setError(
          err?.message ||
            "Failed to filter offers."
        );

        setOffers([]);

      } finally {
        setLoading(false);
      }
    };

  // ============================================================
  // CREATE OFFER - FORM CHANGE
  // ============================================================

  const handleCreateOfferChange =
    (event) => {
      const {
        name,
        value,
      } = event.target;

      setCreateOfferForm(
        (previous) => ({
          ...previous,
          [name]: value,
        })
      );
    };

  // ============================================================
  // OPEN CREATE OFFER
  // ============================================================

  const openCreateOffer =
    () => {
      setError("");

      setCreateOfferForm({
        candidateId: "",
        candidateName: "",
        position: "",
        salary: "",
        joiningDate: "",
        location: "",
        employmentType: "",
      });

      setCreateOfferOpen(true);
    };

  // ============================================================
  // CLOSE CREATE OFFER
  // ============================================================

  const closeCreateOffer =
    () => {
      if (createLoading) {
        return;
      }

      setCreateOfferOpen(false);
    };

  // ============================================================
  // CREATE OFFER API
  // ============================================================

  const handleCreateOffer =
    async (event) => {
      event.preventDefault();

      setError("");

      // --------------------------------------------------------
      // BASIC VALIDATION
      // --------------------------------------------------------

      if (
        !createOfferForm.candidateId ||
        !createOfferForm.candidateName ||
        !createOfferForm.position ||
        !createOfferForm.salary ||
        !createOfferForm.joiningDate ||
        !createOfferForm.location ||
        !createOfferForm.employmentType
      ) {
        setError(
          "Please fill all required offer fields."
        );

        return;
      }

      try {
        setCreateLoading(true);

        // ------------------------------------------------------
        // REQUEST BODY MATCHES SWAGGER
        // ------------------------------------------------------

        const requestBody = {
          offerId: 0,

          offerCode: "",

          candidateId:
            Number(
              createOfferForm.candidateId
            ),

          candidateName:
            createOfferForm.candidateName,

          position:
            createOfferForm.position,

          salary:
            Number(
              createOfferForm.salary
            ),

          joiningDate:
            createOfferForm.joiningDate,

          location:
            createOfferForm.location,

          employmentType:
            createOfferForm.employmentType,

          status:
            "PENDING",

          offerLetterUrl:
            "",
        };

        console.log(
          "Creating offer:",
          requestBody
        );

        // ------------------------------------------------------
        // JWT TOKEN
        // ------------------------------------------------------

        const token =
          localStorage.getItem(
            "token"
          );

        // ------------------------------------------------------
        // CALL BACKEND
        // ------------------------------------------------------

        const response =
          await fetch(
            "http://localhost:8080/api/offers",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Accept:
                  "*/*",

                ...(token
                  ? {
                      Authorization:
                        `Bearer ${token}`,
                    }
                  : {}),
              },

              body:
                JSON.stringify(
                  requestBody
                ),
            }
          );

        const result =
          await response.json();

        console.log(
          "Create offer response:",
          result
        );

        // ------------------------------------------------------
        // ERROR RESPONSE
        // ------------------------------------------------------

        if (!response.ok) {
          throw new Error(
            result?.message ||
              `Failed to create offer. HTTP ${response.status}`
          );
        }

        // ------------------------------------------------------
        // SUCCESS
        // ------------------------------------------------------

        alert(
          result?.message ||
            "Offer created successfully."
        );

        setCreateOfferOpen(false);

        setCreateOfferForm({
          candidateId: "",
          candidateName: "",
          position: "",
          salary: "",
          joiningDate: "",
          location: "",
          employmentType: "",
        });

        // Refresh table
        await loadOffers();

        // Refresh statistics
        await loadStats();

      } catch (err) {
        console.error(
          "Create offer failed:",
          err
        );

        setError(
          err?.message ||
            "Failed to create offer."
        );

      } finally {
        setCreateLoading(false);
      }
    };

  // ============================================================
  // SEND OFFER
  // ============================================================

  const handleSendOffer =
    async (offer) => {
      if (!offer?.offerId) {
        setError(
          "Offer ID is not available."
        );

        return;
      }

      try {
        setActionLoading(true);
        setError("");

        await sendOffer(
          offer.offerId
        );

        await loadOffers();
        await loadStats();

        setSelectedOffer(null);

      } catch (err) {
        console.error(
          "Failed to send offer:",
          err
        );

        setError(
          err?.message ||
            "Failed to send offer."
        );

      } finally {
        setActionLoading(false);
      }
    };

  // ============================================================
  // DOWNLOAD / OPEN OFFER LETTER
  // ============================================================

  const handleDownloadLetter =
    (offer) => {
      if (offer?.offerLetterUrl) {
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

  // ============================================================
  // LOCAL SEARCH FILTER
  // ============================================================

  const filteredOffers =
    useMemo(() => {
      if (!searchTerm.trim()) {
        return offers;
      }

      const value =
        searchTerm
          .toLowerCase()
          .trim();

      return offers.filter(
        (offer) => {
          return (
            String(
              offer?.candidate || ""
            )
              .toLowerCase()
              .includes(value) ||

            String(
              offer?.position || ""
            )
              .toLowerCase()
              .includes(value) ||

            String(
              offer?.id || ""
            )
              .toLowerCase()
              .includes(value)
          );
        }
      );
    }, [
      offers,
      searchTerm,
    ]);

  // ============================================================
  // STATUS ICON
  // ============================================================

  const getStatusIcon =
    (status) => {
      if (status === "Accepted") {
        return (
          <CheckCircle
            size={14}
          />
        );
      }

      if (status === "Pending") {
        return (
          <Clock
            size={14}
          />
        );
      }

      if (status === "Sent") {
        return (
          <Send
            size={14}
          />
        );
      }

      if (status === "Rejected") {
        return (
          <XCircle
            size={14}
          />
        );
      }

      return null;
    };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="hr-page-layout">

      {/* SIDEBAR */}

      <HRSidebar />

      {/* MAIN CONTENT */}

      <main className="hr-page-content">

        <div className="hr-page">

          {/* HEADER */}

          <div className="offers-header">

            <div>
              <h1>
                Offers
              </h1>

              <p>
                Manage candidate offers
                and offer status
              </p>
            </div>

            {/* CREATE OFFER BUTTON */}

            <button
              type="button"
              className="create-offer-btn"
              onClick={
                openCreateOffer
              }
            >
              <FileText
                size={18}
              />

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
                background:
                  "#fff1f2",
                color:
                  "#be123c",
                border:
                  "1px solid #fecdd3",
              }}
            >
              {error}
            </div>
          )}

          {/* STATISTICS */}

          <div className="offer-stats">

            {/* TOTAL */}

            <div className="offer-stat-card">

              <div className="offer-stat-icon purple">
                <FileText
                  size={21}
                />
              </div>

              <div>
                <span>
                  Total Offers
                </span>

                <strong>
                  {stats.totalOffers}
                </strong>

                <small>
                  All generated offers
                </small>
              </div>

            </div>

            {/* PENDING */}

            <div className="offer-stat-card">

              <div className="offer-stat-icon orange">
                <Clock
                  size={21}
                />
              </div>

              <div>
                <span>
                  Pending
                </span>

                <strong>
                  {stats.pendingOffers}
                </strong>

                <small>
                  Awaiting response
                </small>
              </div>

            </div>

            {/* SENT */}

            <div className="offer-stat-card">

              <div className="offer-stat-icon blue">
                <Send
                  size={21}
                />
              </div>

              <div>
                <span>
                  Sent
                </span>

                <strong>
                  {stats.sentOffers}
                </strong>

                <small>
                  Offers sent
                </small>
              </div>

            </div>

            {/* ACCEPTED */}

            <div className="offer-stat-card">

              <div className="offer-stat-icon green">
                <CheckCircle
                  size={21}
                />
              </div>

              <div>
                <span>
                  Accepted
                </span>

                <strong>
                  {stats.acceptedOffers}
                </strong>

                <small>
                  Offers accepted
                </small>
              </div>

            </div>

          </div>

          {/* OFFERS CARD */}

          <div className="offers-card">

            {/* TOOLBAR */}

            <div className="offers-toolbar">

              <div className="search-box">

                <Search
                  size={19}
                />

                <input
                  type="text"
                  placeholder="Search candidate, position or offer ID..."
                  value={searchTerm}
                  onChange={(
                    event
                  ) =>
                    setSearchTerm(
                      event.target
                        .value
                    )
                  }
                />

              </div>

              <div className="filter-box">

                <Filter
                  size={18}
                />

                <select
                  value={
                    statusFilter
                  }
                  onChange={(
                    event
                  ) =>
                    handleStatusFilter(
                      event.target
                        .value
                    )
                  }
                >

                  <option value="All">
                    All Status
                  </option>

                  <option value="Pending">
                    Pending
                  </option>

                  <option value="Sent">
                    Sent
                  </option>

                  <option value="Accepted">
                    Accepted
                  </option>

                  <option value="Rejected">
                    Rejected
                  </option>

                </select>

              </div>

            </div>

            {/* TABLE */}

            <div className="table-wrapper">

              <table className="offers-table">

                <thead>

                  <tr>

                    <th>
                      Offer ID
                    </th>

                    <th>
                      Candidate
                    </th>

                    <th>
                      Position
                    </th>

                    <th>
                      Salary
                    </th>

                    <th>
                      Joining Date
                    </th>

                    <th>
                      Location
                    </th>

                    <th>
                      Employment
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Offer Letter
                    </th>

                    <th>
                      Actions
                    </th>

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

                    filteredOffers.map(
                      (offer) => (

                        <tr
                          key={
                            offer.offerId ||
                            offer.id
                          }
                        >

                          {/* OFFER ID */}

                          <td className="offer-id">
                            {offer.id}
                          </td>

                          {/* CANDIDATE */}

                          <td>

                            <div className="candidate-cell">

                              <div className="candidate-avatar">

                                {offer.candidate
                                  ?.charAt(0)
                                  ?.toUpperCase() ||
                                  "?"}

                              </div>

                              <div>

                                <strong>
                                  {
                                    offer.candidate
                                  }
                                </strong>

                                <span>
                                  {
                                    offer.department
                                  }
                                </span>

                              </div>

                            </div>

                          </td>

                          {/* POSITION */}

                          <td>
                            {offer.position}
                          </td>

                          {/* SALARY */}

                          <td className="salary">
                            {offer.salary}
                          </td>

                          {/* JOINING DATE */}

                          <td>
                            {offer.joiningDate}
                          </td>

                          {/* LOCATION */}

                          <td>
                            {offer.location}
                          </td>

                          {/* EMPLOYMENT */}

                          <td>
                            {offer.employmentType}
                          </td>

                          {/* STATUS */}

                          <td>

                            <span
                              className={`status-badge ${
                                String(
                                  offer.status
                                )
                                  .toLowerCase()
                                  .replace(
                                    /\s+/g,
                                    "-"
                                  )
                              }`}
                            >

                              {getStatusIcon(
                                offer.status
                              )}

                              {offer.status}

                            </span>

                          </td>

                          {/* OFFER LETTER */}

                          <td>

                            {offer.status ===
                              "Accepted" && (

                              <button
                                type="button"
                                className="letter-btn accepted-letter"
                                onClick={() =>
                                  setSelectedOffer(
                                    offer
                                  )
                                }
                              >

                                <FileText
                                  size={15}
                                />

                                Accepted Letter

                              </button>

                            )}

                            {offer.status ===
                              "Sent" && (

                              <button
                                type="button"
                                className="letter-btn sent-letter"
                                onClick={() =>
                                  setSelectedOffer(
                                    offer
                                  )
                                }
                              >

                                <FileText
                                  size={15}
                                />

                                Offer Letter

                              </button>

                            )}

                            {offer.status ===
                              "Pending" && (

                              <button
                                type="button"
                                className="letter-btn pending-letter"
                                onClick={() =>
                                  setSelectedOffer(
                                    offer
                                  )
                                }
                              >

                                <FileText
                                  size={15}
                                />

                                Generate

                              </button>

                            )}

                            {offer.status ===
                              "Rejected" && (

                              <button
                                type="button"
                                className="letter-btn rejected-letter"
                                onClick={() =>
                                  setSelectedOffer(
                                    offer
                                  )
                                }
                              >

                                <FileText
                                  size={15}
                                />

                                Rejection

                              </button>

                            )}

                          </td>

                          {/* ACTIONS */}

                          <td>

                            <div className="action-buttons">

                              <button
                                type="button"
                                className="icon-action"
                                title="View Offer"
                                onClick={() =>
                                  setSelectedOffer(
                                    offer
                                  )
                                }
                              >

                                <Eye
                                  size={17}
                                />

                              </button>

                              {offer.status ===
                                "Pending" && (

                                <button
                                  type="button"
                                  className="icon-action send-action"
                                  title="Send Offer"
                                  disabled={
                                    actionLoading
                                  }
                                  onClick={() =>
                                    handleSendOffer(
                                      offer
                                    )
                                  }
                                >

                                  <Send
                                    size={17}
                                  />

                                </button>

                              )}

                            </div>

                          </td>

                        </tr>

                      )
                    )

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

              Showing{" "}

              <strong>
                {
                  filteredOffers.length
                }
              </strong>

              {" "}of{" "}

              <strong>
                {stats.totalOffers}
              </strong>

              {" "}offers

            </div>

          </div>

          {/* ======================================================
              CREATE OFFER MODAL
          ====================================================== */}

          {createOfferOpen && (

            <div
              className="letter-modal-overlay"
              onClick={
                closeCreateOffer
              }
            >

              <div
                className="letter-modal"
                style={{
                  maxWidth:
                    "650px",
                }}
                onClick={(
                  event
                ) =>
                  event.stopPropagation()
                }
              >

                {/* MODAL HEADER */}

                <div className="letter-modal-header">

                  <div>

                    <h2>
                      Create Offer
                    </h2>

                    <p>
                      Create a new candidate offer
                    </p>

                  </div>

                  <button
                    type="button"
                    className="close-modal-btn"
                    onClick={
                      closeCreateOffer
                    }
                  >
                    <X
                      size={20}
                    />
                  </button>

                </div>

                {/* FORM */}

                <form
                  onSubmit={
                    handleCreateOffer
                  }
                  style={{
                    padding:
                      "24px",
                  }}
                >

                  <div
                    style={{
                      display:
                        "grid",
                      gridTemplateColumns:
                        "1fr 1fr",
                      gap:
                        "16px",
                    }}
                  >

                    {/* CANDIDATE ID */}

                    <div>

                      <label>
                        Candidate ID *
                      </label>

                      <input
                        type="number"
                        name="candidateId"
                        value={
                          createOfferForm.candidateId
                        }
                        onChange={
                          handleCreateOfferChange
                        }
                        placeholder="Example: 8"
                        required
                        style={{
                          width:
                            "100%",
                          padding:
                            "10px",
                          marginTop:
                            "6px",
                        }}
                      />

                    </div>

                    {/* CANDIDATE NAME */}

                    <div>

                      <label>
                        Candidate Name *
                      </label>

                      <input
                        type="text"
                        name="candidateName"
                        value={
                          createOfferForm.candidateName
                        }
                        onChange={
                          handleCreateOfferChange
                        }
                        placeholder="Candidate name"
                        required
                        style={{
                          width:
                            "100%",
                          padding:
                            "10px",
                          marginTop:
                            "6px",
                        }}
                      />

                    </div>

                    {/* POSITION */}

                    <div>

                      <label>
                        Position *
                      </label>

                      <input
                        type="text"
                        name="position"
                        value={
                          createOfferForm.position
                        }
                        onChange={
                          handleCreateOfferChange
                        }
                        placeholder="Example: Java Developer"
                        required
                        style={{
                          width:
                            "100%",
                          padding:
                            "10px",
                          marginTop:
                            "6px",
                        }}
                      />

                    </div>

                    {/* SALARY */}

                    <div>

                      <label>
                        Salary *
                      </label>

                      <input
                        type="number"
                        name="salary"
                        value={
                          createOfferForm.salary
                        }
                        onChange={
                          handleCreateOfferChange
                        }
                        placeholder="Example: 600000"
                        min="0"
                        required
                        style={{
                          width:
                            "100%",
                          padding:
                            "10px",
                          marginTop:
                            "6px",
                        }}
                      />

                    </div>

                    {/* JOINING DATE */}

                    <div>

                      <label>
                        Joining Date *
                      </label>

                      <input
                        type="date"
                        name="joiningDate"
                        value={
                          createOfferForm.joiningDate
                        }
                        onChange={
                          handleCreateOfferChange
                        }
                        required
                        style={{
                          width:
                            "100%",
                          padding:
                            "10px",
                          marginTop:
                            "6px",
                        }}
                      />

                    </div>

                    {/* LOCATION */}

                    <div>

                      <label>
                        Location *
                      </label>

                      <input
                        type="text"
                        name="location"
                        value={
                          createOfferForm.location
                        }
                        onChange={
                          handleCreateOfferChange
                        }
                        placeholder="Example: Hyderabad"
                        required
                        style={{
                          width:
                            "100%",
                          padding:
                            "10px",
                          marginTop:
                            "6px",
                        }}
                      />

                    </div>

                  </div>

                  {/* EMPLOYMENT TYPE */}

                  <div
                    style={{
                      marginTop:
                        "16px",
                    }}
                  >

                    <label>
                      Employment Type *
                    </label>

                    <select
                      name="employmentType"
                      value={
                        createOfferForm.employmentType
                      }
                      onChange={
                        handleCreateOfferChange
                      }
                      required
                      style={{
                        width:
                          "100%",
                        padding:
                          "10px",
                        marginTop:
                          "6px",
                      }}
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

                      <option value="CONTRACT">
                        Contract
                      </option>

                    </select>

                  </div>

                  {/* STATUS */}

                  <div
                    style={{
                      marginTop:
                        "16px",
                      padding:
                        "12px",
                      background:
                        "#f8fafc",
                      borderRadius:
                        "8px",
                    }}
                  >

                    <strong>
                      Status:
                    </strong>

                    {" "}Pending

                  </div>

                  {/* BUTTONS */}

                  <div
                    style={{
                      display:
                        "flex",
                      justifyContent:
                        "flex-end",
                      gap:
                        "12px",
                      marginTop:
                        "24px",
                    }}
                  >

                    <button
                      type="button"
                      onClick={
                        closeCreateOffer
                      }
                      disabled={
                        createLoading
                      }
                      style={{
                        padding:
                          "10px 18px",
                        borderRadius:
                          "6px",
                        border:
                          "1px solid #d1d5db",
                        background:
                          "white",
                        cursor:
                          "pointer",
                      }}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={
                        createLoading
                      }
                      style={{
                        padding:
                          "10px 20px",
                        borderRadius:
                          "6px",
                        border:
                          "none",
                        background:
                          "#4f46e5",
                        color:
                          "white",
                        cursor:
                          "pointer",
                      }}
                    >

                      {createLoading
                        ? "Creating..."
                        : "Create Offer"}

                    </button>

                  </div>

                </form>

              </div>

            </div>

          )}

          {/* ======================================================
              LETTER MODAL
          ====================================================== */}

          {selectedOffer && (

            <div
              className="letter-modal-overlay"
              onClick={() =>
                setSelectedOffer(null)
              }
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

                      {selectedOffer.status ===
                      "Rejected"
                        ? "Rejection Letter"
                        : selectedOffer.status ===
                          "Accepted"
                        ? "Accepted Offer Letter"
                        : "Offer Letter"}

                    </h2>

                    <p>
                      {selectedOffer.id}
                    </p>

                  </div>

                  <button
                    type="button"
                    className="close-modal-btn"
                    onClick={() =>
                      setSelectedOffer(
                        null
                      )
                    }
                  >

                    <X
                      size={20}
                    />

                  </button>

                </div>

                {/* LETTER PREVIEW */}

                <div className="letter-preview">

                  <div className="letter-company">

                    <h1>
                      Talent
                      <span>
                        AI
                      </span>
                    </h1>

                    <p>
                      AI Recruitment &
                      Employee
                      Management Platform
                    </p>

                  </div>

                  <div className="letter-title">

                    <h2>

                      {selectedOffer.status ===
                      "Rejected"
                        ? "CANDIDATE DECISION LETTER"
                        : selectedOffer.status ===
                          "Accepted"
                        ? "OFFER ACCEPTANCE LETTER"
                        : "EMPLOYMENT OFFER LETTER"}

                    </h2>

                  </div>

                  <div className="letter-content">

                    <p>

                      Dear{" "}

                      <strong>
                        {
                          selectedOffer.candidate
                        }
                      </strong>,

                    </p>

                    {selectedOffer.status ===
                    "Rejected" ? (

                      <p>

                        Thank you for your
                        interest in the{" "}

                        <strong>
                          {
                            selectedOffer.position
                          }
                        </strong>{" "}

                        position at TalentAI.
                        After careful
                        consideration, we
                        regret to inform you
                        that your application
                        has not been selected
                        at this time.

                      </p>

                    ) : (

                      <>

                        <p>

                          We are pleased to
                          offer you the position
                          of{" "}

                          <strong>
                            {
                              selectedOffer.position
                            }
                          </strong>{" "}

                          at TalentAI.

                        </p>

                        <div className="letter-details">

                          <div>

                            <span>
                              Designation
                            </span>

                            <strong>
                              {
                                selectedOffer.position
                              }
                            </strong>

                          </div>

                          <div>

                            <span>
                              Annual Salary
                            </span>

                            <strong>
                              {
                                selectedOffer.salary
                              }
                            </strong>

                          </div>

                          <div>

                            <span>
                              Joining Date
                            </span>

                            <strong>
                              {
                                selectedOffer.joiningDate
                              }
                            </strong>

                          </div>

                          <div>

                            <span>
                              Location
                            </span>

                            <strong>
                              {
                                selectedOffer.location
                              }
                            </strong>

                          </div>

                          <div>

                            <span>
                              Employment Type
                            </span>

                            <strong>
                              {
                                selectedOffer.employmentType
                              }
                            </strong>

                          </div>

                          <div>

                            <span>
                              Reporting Manager
                            </span>

                            <strong>
                              HR Manager
                            </strong>

                          </div>

                        </div>

                        {selectedOffer.status ===
                          "Accepted" && (

                          <div className="accepted-message">

                            <CheckCircle
                              size={20}
                            />

                            <div>

                              <strong>
                                Offer Accepted
                              </strong>

                              <p>
                                The candidate has
                                accepted this
                                employment offer.
                              </p>

                            </div>

                          </div>

                        )}

                        {selectedOffer.status !==
                          "Accepted" && (

                          <p>

                            We look forward to
                            welcoming you to our
                            team. Please review
                            the terms of this
                            offer and confirm
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

                {selectedOffer.status !==
                  "Rejected" && (

                  <div className="letter-modal-footer">

                    <button
                      type="button"
                      className="download-letter-btn"
                      onClick={() =>
                        handleDownloadLetter(
                          selectedOffer
                        )
                      }
                    >

                      <Download
                        size={17}
                      />

                      Download Letter

                    </button>

                    {selectedOffer.status ===
                      "Pending" && (

                      <button
                        type="button"
                        className="send-letter-btn"
                        disabled={
                          actionLoading
                        }
                        onClick={() =>
                          handleSendOffer(
                            selectedOffer
                          )
                        }
                      >

                        <Send
                          size={17}
                        />

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

      </main>

    </div>
  );
}

export default HROffers;