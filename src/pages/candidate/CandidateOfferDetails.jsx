import { useEffect, useState } from "react";
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

import {
  acceptOffer,
  getMyOffers,
  rejectOffer,
} from "../../services/candidateService";
import {
  getErrorMessage,
  getOfferStatus,
} from "../../services/candidateHelpers";

import "./CandidateDashboard.css";

function CandidateOfferDetails() {
  const navigate = useNavigate();
  const { offerId } = useParams();

  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [responding, setResponding] = useState(false);
  const [actionError, setActionError] = useState("");

  const [showDeclineModal, setShowDeclineModal] =
    useState(false);

  const [declineReason, setDeclineReason] =
    useState("");

  // There is no "get one offer" call that is safe for candidates, so
  // the offer is found in the candidate's own offer list.
  useEffect(() => {
    let cancelled = false;

    const loadOffer = async () => {
      setLoading(true);
      setError("");

      try {
        const list = await getMyOffers();

        if (!cancelled) {
          setOffer(
            list.find(
              (item) => String(item.id) === String(offerId)
            ) || null
          );
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            getErrorMessage(err, "Unable to load this offer.")
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadOffer();

    return () => {
      cancelled = true;
    };
  }, [offerId]);

  // Calls the backend first; the page only changes if it worked.
  const respond = async (apiCall, fallbackStatus, onSuccess) => {
    setResponding(true);
    setActionError("");

    try {
      const updated = await apiCall(offer.id);

      setOffer((current) => ({
        ...current,
        status: updated?.status
          ? getOfferStatus(updated.status)
          : fallbackStatus,
      }));

      onSuccess?.();
    } catch (err) {
      setActionError(
        getErrorMessage(
          err,
          "Unable to send your response. Please try again."
        )
      );
    } finally {
      setResponding(false);
    }
  };

  const handleAcceptOffer = () =>
    respond(acceptOffer, "Accepted");

  // The backend does not store a decline reason, so it is optional.
  const handleDeclineOffer = () =>
    respond(rejectOffer, "Declined", () =>
      setShowDeclineModal(false)
    );

  if (loading || !offer) {
    return (
      <div className="candidate-layout">
        <CandidateSidebar />

        <div className="candidate-main">
          <CandidateNavbar />

          <main className="candidate-dashboard-content">
            <div className="candidate-job-not-found">
              <Gift size={34} />

              <h2>
                {loading
                  ? "Loading offer..."
                  : error
                  ? "Unable to load offer"
                  : "Offer not found"}
              </h2>

              <p>
                {loading
                  ? "Please wait while we fetch your offer."
                  : error ||
                    "The offer you are trying to view does not exist."}
              </p>

              {!loading && (
                <button
                  type="button"
                  onClick={() => navigate("/candidate/offers")}
                >
                  Back to My Offers
                </button>
              )}
            </div>
          </main>
        </div>
      </div>
    );
  }

  const selectedOffer = offer;
  const offerStatus = offer.status;

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

                  {selectedOffer.probationPeriod && (
                    <div>
                      <span>Probation Period</span>

                      <strong>
                        {selectedOffer.probationPeriod}
                      </strong>
                    </div>
                  )}

                  {selectedOffer.reportingManager && (
                    <div>
                      <span>Reporting Manager</span>

                      <strong>
                        {selectedOffer.reportingManager}
                      </strong>
                    </div>
                  )}
                </div>
              </section>

              {/* BENEFITS */}

              {selectedOffer.benefits.length > 0 && (
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
              )}

              {actionError && !showDeclineModal && (
                <span className="candidate-form-error">
                  {actionError}
                </span>
              )}

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
                      disabled={responding}
                    >
                      <Check size={16} />
                      {responding ? "Sending..." : "Accept Offer"}
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
                  {selectedOffer.offerCode && (
                    <div>
                      <BadgeCheck size={16} />

                      <div>
                        <span>Offer Code</span>

                        <strong>
                          {selectedOffer.offerCode}
                        </strong>
                      </div>
                    </div>
                  )}

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

              {selectedOffer.reportingManager && (
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
              )}

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
                  Are you sure you want to decline this
                  offer? This cannot be undone.
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
                Reason for declining (optional)
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

              <small>
                Your reason is not shared with the recruiter
                yet.
              </small>

              {actionError && (
                <span className="candidate-form-error">
                  {actionError}
                </span>
              )}
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
                disabled={responding}
                onClick={handleDeclineOffer}
              >
                {responding ? "Sending..." : "Decline Offer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CandidateOfferDetails;