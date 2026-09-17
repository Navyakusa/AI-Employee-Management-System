import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Gift,
  IndianRupee,
  MapPin,
  UserRound,
  X,
  XCircle,
} from "lucide-react";

import CandidateSidebar from "./CandidateSidebar";
import CandidateNavbar from "./CandidateNavbar";

import "./CandidateDashboard.css";

function CandidateOfferDetails() {
  const navigate = useNavigate();
  const { offerId } = useParams();

  // Temporary frontend data.
  // Backend API will replace this later.
  const offers = [
    {
      id: 1,
      jobTitle: "Java Backend Developer",
      company: "Anasol Technologies",
      designation: "Java Backend Developer",
      location: "Hyderabad",
      employmentType: "Full Time",
      salary: "₹6,50,000 per annum",
      offeredDate: "17 Sep 2026",
      joiningDate: "01 Oct 2026",
      probationPeriod: "6 Months",
      reportingManager: "Engineering Manager",
      status: "Pending",
      benefits: [
        "Health insurance coverage",
        "Paid annual leave",
        "Learning and development support",
        "Performance-based incentives",
        "Flexible hybrid work policy",
      ],
    },
    {
      id: 2,
      jobTitle: "Software Engineer",
      company: "CloudMatrix",
      designation: "Software Engineer",
      location: "Hyderabad",
      employmentType: "Full Time",
      salary: "₹6,00,000 per annum",
      offeredDate: "10 Sep 2026",
      joiningDate: "25 Sep 2026",
      probationPeriod: "6 Months",
      reportingManager: "Software Engineering Manager",
      status: "Accepted",
      benefits: [
        "Health insurance coverage",
        "Paid annual leave",
        "Performance incentives",
        "Professional development support",
      ],
    },
  ];

  const selectedOffer =
    offers.find(
      (offer) => String(offer.id) === String(offerId)
    ) || offers[0];

  const [offerStatus, setOfferStatus] = useState(
    selectedOffer.status
  );

  const [showDeclineModal, setShowDeclineModal] =
    useState(false);

  const [declineReason, setDeclineReason] =
    useState("");

  const handleAcceptOffer = () => {
    // Backend integration later:
    // PUT/PATCH /api/offers/{offerId}/accept

    setOfferStatus("Accepted");
  };

  const handleDeclineOffer = () => {
    if (!declineReason.trim()) {
      return;
    }

    // Backend integration later:
    // PUT/PATCH /api/offers/{offerId}/decline

    console.log("Decline reason:", declineReason);

    setOfferStatus("Declined");
    setShowDeclineModal(false);
  };

  return (
    <div className="candidate-layout">
      <CandidateSidebar />

      <div className="candidate-main">
        <CandidateNavbar />

        <main className="candidate-dashboard-content">
          {/* BACK */}

          <button
            type="button"
            className="candidate-application-back"
            onClick={() =>
              navigate("/candidate/offers")
            }
          >
            <ArrowLeft size={17} />
            Back to My Offers
          </button>

          {/* HEADER */}

          <div className="candidate-offer-detail-header">
            <div>
              <p className="candidate-label">
                OFFER DETAILS
              </p>

              <h1>{selectedOffer.jobTitle}</h1>

              <div className="candidate-offer-detail-company">
                <Building2 size={15} />

                <span>
                  {selectedOffer.company}
                </span>
              </div>
            </div>

            <span
              className={`candidate-offer-detail-status ${offerStatus.toLowerCase()}`}
            >
              {offerStatus}
            </span>
          </div>

          {/* SUCCESS MESSAGE */}

          {offerStatus === "Accepted" && (
            <div className="candidate-offer-response-message accepted">
              <div>
                <CheckCircle2 size={22} />
              </div>

              <div>
                <strong>
                  Offer Accepted Successfully
                </strong>

                <p>
                  You have accepted this job offer.
                  The recruitment team will contact you
                  regarding the next onboarding steps.
                </p>
              </div>
            </div>
          )}

          {offerStatus === "Declined" && (
            <div className="candidate-offer-response-message declined">
              <div>
                <XCircle size={22} />
              </div>

              <div>
                <strong>Offer Declined</strong>

                <p>
                  You have declined this offer. Your
                  response has been recorded.
                </p>
              </div>
            </div>
          )}

          {/* SUMMARY */}

          <section className="candidate-offer-detail-summary">
            <div className="candidate-offer-detail-summary-item">
              <div>
                <BriefcaseBusiness size={19} />
              </div>

              <span>Designation</span>

              <strong>
                {selectedOffer.designation}
              </strong>
            </div>

            <div className="candidate-offer-detail-summary-item">
              <div>
                <IndianRupee size={19} />
              </div>

              <span>Annual Salary</span>

              <strong>
                {selectedOffer.salary}
              </strong>
            </div>

            <div className="candidate-offer-detail-summary-item">
              <div>
                <CalendarDays size={19} />
              </div>

              <span>Joining Date</span>

              <strong>
                {selectedOffer.joiningDate}
              </strong>
            </div>

            <div className="candidate-offer-detail-summary-item">
              <div>
                <MapPin size={19} />
              </div>

              <span>Job Location</span>

              <strong>
                {selectedOffer.location}
              </strong>
            </div>
          </section>

          {/* MAIN LAYOUT */}

          <div className="candidate-offer-detail-layout">
            <div className="candidate-offer-detail-main">
              {/* EMPLOYMENT DETAILS */}

              <section className="candidate-offer-detail-card">
                <div className="candidate-offer-detail-card-header">
                  <div>
                    <BriefcaseBusiness size={19} />
                  </div>

                  <div>
                    <h2>Employment Details</h2>

                    <p>
                      Review the employment terms
                      included in your offer.
                    </p>
                  </div>
                </div>

                <div className="candidate-offer-information-grid">
                  <div>
                    <span>Company</span>

                    <strong>
                      {selectedOffer.company}
                    </strong>
                  </div>

                  <div>
                    <span>Designation</span>

                    <strong>
                      {selectedOffer.designation}
                    </strong>
                  </div>

                  <div>
                    <span>Employment Type</span>

                    <strong>
                      {selectedOffer.employmentType}
                    </strong>
                  </div>

                  <div>
                    <span>Location</span>

                    <strong>
                      {selectedOffer.location}
                    </strong>
                  </div>

                  <div>
                    <span>Annual Compensation</span>

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
                    <span>Probation Period</span>

                    <strong>
                      {selectedOffer.probationPeriod}
                    </strong>
                  </div>

                  <div>
                    <span>Reporting Manager</span>

                    <strong>
                      {selectedOffer.reportingManager}
                    </strong>
                  </div>
                </div>
              </section>

              {/* BENEFITS */}

              <section className="candidate-offer-detail-card">
                <div className="candidate-offer-detail-card-header">
                  <div>
                    <Gift size={19} />
                  </div>

                  <div>
                    <h2>Benefits & Perks</h2>

                    <p>
                      Benefits included as part of your
                      employment offer.
                    </p>
                  </div>
                </div>

                <div className="candidate-offer-benefits">
                  {selectedOffer.benefits.map(
                    (benefit, index) => (
                      <div
                        key={index}
                        className="candidate-offer-benefit-item"
                      >
                        <div>
                          <Check size={14} />
                        </div>

                        <span>{benefit}</span>
                      </div>
                    )
                  )}
                </div>
              </section>

              {/* OFFER RESPONSE */}

              {offerStatus === "Pending" && (
                <section className="candidate-offer-action-card">
                  <div className="candidate-offer-action-content">
                    <div>
                      <BadgeCheck size={22} />
                    </div>

                    <div>
                      <h2>
                        Ready to respond?
                      </h2>

                      <p>
                        Please review all offer details
                        carefully before accepting or
                        declining this offer.
                      </p>
                    </div>
                  </div>

                  <div className="candidate-offer-action-buttons">
                    <button
                      type="button"
                      className="candidate-decline-offer-btn"
                      onClick={() =>
                        setShowDeclineModal(true)
                      }
                    >
                      <X size={16} />
                      Decline Offer
                    </button>

                    <button
                      type="button"
                      className="candidate-accept-offer-btn"
                      onClick={handleAcceptOffer}
                    >
                      <Check size={16} />
                      Accept Offer
                    </button>
                  </div>
                </section>
              )}
            </div>

            {/* RIGHT SIDE */}

            <aside className="candidate-offer-detail-side">
              <section className="candidate-offer-side-card">
                <h2>Offer Summary</h2>

                <div className="candidate-offer-side-list">
                  <div>
                    <CalendarDays size={16} />

                    <div>
                      <span>Offer Date</span>

                      <strong>
                        {selectedOffer.offeredDate}
                      </strong>
                    </div>
                  </div>

                  <div>
                    <CalendarDays size={16} />

                    <div>
                      <span>Joining Date</span>

                      <strong>
                        {selectedOffer.joiningDate}
                      </strong>
                    </div>
                  </div>

                  <div>
                    <BriefcaseBusiness size={16} />

                    <div>
                      <span>Employment</span>

                      <strong>
                        {selectedOffer.employmentType}
                      </strong>
                    </div>
                  </div>

                  <div>
                    <MapPin size={16} />

                    <div>
                      <span>Location</span>

                      <strong>
                        {selectedOffer.location}
                      </strong>
                    </div>
                  </div>
                </div>
              </section>

              <section className="candidate-offer-side-card">
                <h2>Reporting To</h2>

                <div className="candidate-offer-manager">
                  <div>
                    <UserRound size={20} />
                  </div>

                  <div>
                    <span>Reporting Manager</span>

                    <strong>
                      {selectedOffer.reportingManager}
                    </strong>
                  </div>
                </div>
              </section>

              <section className="candidate-offer-note-card">
                <Clock3 size={18} />

                <div>
                  <strong>
                    Review your offer
                  </strong>

                  <p>
                    Verify the salary, joining date,
                    designation and employment terms
                    before submitting your response.
                  </p>
                </div>
              </section>
            </aside>
          </div>
        </main>
      </div>

      {/* DECLINE MODAL */}

      {showDeclineModal && (
        <div className="candidate-offer-modal-overlay">
          <div className="candidate-offer-modal">
            <div className="candidate-offer-modal-header">
              <div>
                <h2>Decline Offer</h2>

                <p>
                  Please tell us why you are declining
                  this offer.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowDeclineModal(false)
                }
              >
                <X size={19} />
              </button>
            </div>

            <div className="candidate-offer-modal-body">
              <label htmlFor="declineReason">
                Reason for declining
              </label>

              <textarea
                id="declineReason"
                rows="5"
                placeholder="Enter your reason..."
                value={declineReason}
                onChange={(event) =>
                  setDeclineReason(
                    event.target.value
                  )
                }
              />
            </div>

            <div className="candidate-offer-modal-actions">
              <button
                type="button"
                className="candidate-offer-modal-cancel"
                onClick={() =>
                  setShowDeclineModal(false)
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="candidate-offer-modal-decline"
                disabled={!declineReason.trim()}
                onClick={handleDeclineOffer}
              >
                Decline Offer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CandidateOfferDetails;