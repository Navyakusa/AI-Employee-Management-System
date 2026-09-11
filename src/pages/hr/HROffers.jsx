import { useMemo, useState } from "react";
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

import "./HROffers.css";

const offersData = [
  {
    id: "OFF-001",
    candidate: "Rahul Sharma",
    position: "Java Developer",
    department: "Engineering",
    salary: "₹9 LPA",
    joiningDate: "20 Sep 2026",
    location: "Hyderabad",
    employmentType: "Full Time",
    status: "Sent",
  },
  {
    id: "OFF-002",
    candidate: "Priya Reddy",
    position: "Frontend Developer",
    department: "Engineering",
    salary: "₹8 LPA",
    joiningDate: "25 Sep 2026",
    location: "Hyderabad",
    employmentType: "Full Time",
    status: "Accepted",
  },
  {
    id: "OFF-003",
    candidate: "Arjun Kumar",
    position: "UI/UX Designer",
    department: "Design",
    salary: "₹7 LPA",
    joiningDate: "01 Oct 2026",
    location: "Bangalore",
    employmentType: "Full Time",
    status: "Pending",
  },
  {
    id: "OFF-004",
    candidate: "Sneha Patel",
    position: "HR Executive",
    department: "Human Resources",
    salary: "₹6 LPA",
    joiningDate: "05 Oct 2026",
    location: "Hyderabad",
    employmentType: "Full Time",
    status: "Accepted",
  },
  {
    id: "OFF-005",
    candidate: "Vikram Singh",
    position: "Backend Developer",
    department: "Engineering",
    salary: "₹10 LPA",
    joiningDate: "10 Oct 2026",
    location: "Pune",
    employmentType: "Full Time",
    status: "Rejected",
  },
];

function HROffers() {
  const [searchTerm, setSearchTerm] = useState("");
const [statusFilter, setStatusFilter] = useState("All");
const [selectedOffer, setSelectedOffer] = useState(null);

  const filteredOffers = useMemo(() => {
    return offersData.filter((offer) => {
      const matchesSearch =
        offer.candidate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || offer.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  const totalOffers = offersData.length;
  const pendingOffers = offersData.filter(
    (offer) => offer.status === "Pending"
  ).length;
  const sentOffers = offersData.filter(
    (offer) => offer.status === "Sent"
  ).length;
  const acceptedOffers = offersData.filter(
    (offer) => offer.status === "Accepted"
  ).length;

  return (
    <div className="hr-page">
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

      <div className="offer-stats">
        <div className="offer-stat-card">
          <div className="offer-stat-icon purple">
            <FileText size={21} />
          </div>

          <div>
            <span>Total Offers</span>
            <strong>{totalOffers}</strong>
            <small>All generated offers</small>
          </div>
        </div>

        <div className="offer-stat-card">
          <div className="offer-stat-icon orange">
            <Clock size={21} />
          </div>

          <div>
            <span>Pending</span>
            <strong>{pendingOffers}</strong>
            <small>Awaiting response</small>
          </div>
        </div>

        <div className="offer-stat-card">
          <div className="offer-stat-icon blue">
            <Send size={21} />
          </div>

          <div>
            <span>Sent</span>
            <strong>{sentOffers}</strong>
            <small>Offers sent</small>
          </div>
        </div>

        <div className="offer-stat-card">
          <div className="offer-stat-icon green">
            <CheckCircle size={21} />
          </div>

          <div>
            <span>Accepted</span>
            <strong>{acceptedOffers}</strong>
            <small>Offers accepted</small>
          </div>
        </div>
      </div>

      <div className="offers-card">
        <div className="offers-toolbar">
          <div className="search-box">
            <Search size={19} />
            <input
              type="text"
              placeholder="Search candidate, position or offer ID..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <div className="filter-box">
            <Filter size={18} />

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Sent">Sent</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

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
              {filteredOffers.length > 0 ? (
                filteredOffers.map((offer) => (
                  <tr key={offer.id}>
                    <td className="offer-id">{offer.id}</td>

                    <td>
                      <div className="candidate-cell">
                        <div className="candidate-avatar">
                          {offer.candidate.charAt(0)}
                        </div>

                        <div>
                          <strong>{offer.candidate}</strong>
                          <span>{offer.department}</span>
                        </div>
                      </div>
                    </td>

                    <td>{offer.position}</td>

                    <td className="salary">{offer.salary}</td>

                    <td>{offer.joiningDate}</td>

                    <td>{offer.location}</td>

                    <td>{offer.employmentType}</td>

                    <td>
                      <span
                        className={`status-badge ${offer.status.toLowerCase()}`}
                      >
                        {offer.status === "Accepted" && (
                          <CheckCircle size={14} />
                        )}

                        {offer.status === "Pending" && <Clock size={14} />}

                        {offer.status === "Sent" && <Send size={14} />}

                        {offer.status === "Rejected" && <XCircle size={14} />}

                        {offer.status}
                      </span>
                    </td>

                   <td>
  {offer.status === "Accepted" && (
    <button
      className="letter-btn accepted-letter"
      onClick={() => setSelectedOffer(offer)}
    >
      <FileText size={15} />
      Accepted Letter
    </button>
  )}

  {offer.status === "Sent" && (
    <button
      className="letter-btn sent-letter"
      onClick={() => setSelectedOffer(offer)}
    >
      <FileText size={15} />
      Offer Letter
    </button>
  )}

  {offer.status === "Pending" && (
    <button
      className="letter-btn pending-letter"
      onClick={() => setSelectedOffer(offer)}
    >
      <FileText size={15} />
      Generate
    </button>
  )}

  {offer.status === "Rejected" && (
    <button
      className="letter-btn rejected-letter"
      onClick={() => setSelectedOffer(offer)}
    >
      <FileText size={15} />
      Rejection
    </button>
  )}
</td>

<td>
  <div className="action-buttons">
    <button
      className="icon-action"
      title="View Offer"
      onClick={() => setSelectedOffer(offer)}
    >
      <Eye size={17} />
    </button>

    {offer.status === "Pending" && (
      <button
        className="icon-action send-action"
        title="Send Offer"
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
                  <td colSpan="10" className="empty-state">
                    No offers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

                <div className="offers-footer">
          Showing <strong>{filteredOffers.length}</strong> of{" "}
          <strong>{offersData.length}</strong> offers
        </div>
      </div>

      {selectedOffer && (
        <div
          className="letter-modal-overlay"
          onClick={() => setSelectedOffer(null)}
        >
          <div
            className="letter-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="letter-modal-header">
              <div>
                <h2>
                  {selectedOffer.status === "Rejected"
                    ? "Rejection Letter"
                    : selectedOffer.status === "Accepted"
                    ? "Accepted Offer Letter"
                    : "Offer Letter"}
                </h2>

                <p>{selectedOffer.id}</p>
              </div>

              <button
                className="close-modal-btn"
                onClick={() => setSelectedOffer(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="letter-preview">
              <div className="letter-company">
                <h1>
                  Talent<span>AI</span>
                </h1>
                <p>AI Recruitment & Employee Management Platform</p>
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
                  Dear <strong>{selectedOffer.candidate}</strong>,
                </p>

                {selectedOffer.status === "Rejected" ? (
                  <p>
                    Thank you for your interest in the{" "}
                    <strong>{selectedOffer.position}</strong> position at
                    TalentAI. After careful consideration, we regret to inform
                    you that your application has not been selected at this
                    time.
                  </p>
                ) : (
                  <>
                    <p>
                      We are pleased to offer you the position of{" "}
                      <strong>{selectedOffer.position}</strong> at TalentAI.
                    </p>

                    <div className="letter-details">
                      <div>
                        <span>Designation</span>
                        <strong>{selectedOffer.position}</strong>
                      </div>

                      <div>
                        <span>Annual Salary</span>
                        <strong>{selectedOffer.salary}</strong>
                      </div>

                      <div>
                        <span>Joining Date</span>
                        <strong>{selectedOffer.joiningDate}</strong>
                      </div>

                      <div>
                        <span>Location</span>
                        <strong>{selectedOffer.location}</strong>
                      </div>

                      <div>
                        <span>Employment Type</span>
                        <strong>{selectedOffer.employmentType}</strong>
                      </div>

                      <div>
                        <span>Reporting Manager</span>
                        <strong>HR Manager</strong>
                      </div>
                    </div>

                    {selectedOffer.status === "Accepted" && (
                      <div className="accepted-message">
                        <CheckCircle size={20} />

                        <div>
                          <strong>Offer Accepted</strong>
                          <p>
                            The candidate has accepted this employment offer.
                          </p>
                        </div>
                      </div>
                    )}

                    {selectedOffer.status !== "Accepted" && (
                      <p>
                        We look forward to welcoming you to our team. Please
                        review the terms of this offer and confirm your
                        acceptance.
                      </p>
                    )}
                  </>
                )}

                <p className="letter-closing">
                  Sincerely,
                  <br />
                  <strong>HR Manager</strong>
                  <br />
                  TalentAI
                </p>
              </div>
            </div>

            {selectedOffer.status !== "Rejected" && (
              <div className="letter-modal-footer">
                <button className="download-letter-btn">
                  <Download size={17} />
                  Download Letter
                </button>

                {selectedOffer.status === "Pending" && (
                  <button className="send-letter-btn">
                    <Send size={17} />
                    Send Offer
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