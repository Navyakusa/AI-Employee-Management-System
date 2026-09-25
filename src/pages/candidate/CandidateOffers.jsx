
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  MapPin,
  Search,
} from "lucide-react";

import CandidateSidebar from "./CandidateSidebar";
import CandidateNavbar from "./CandidateNavbar";

import { getMyOffers } from "../../services/candidateService";
import { getErrorMessage } from "../../services/candidateHelpers";

import "./CandidateDashboard.css";

function CandidateOffers() {
  const navigate = useNavigate();

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOffers = async () => {
    setLoading(true);
    setError("");

    try {
      setOffers(await getMyOffers());
    } catch (err) {
      setError(
        getErrorMessage(err, "Unable to load your offers.")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOffers();
  }, []);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  const filteredOffers = useMemo(() => {
    const value = search.trim().toLowerCase();

    return offers.filter((offer) => {
      const matchesSearch =
        !value ||
        offer.jobTitle.toLowerCase().includes(value) ||
        offer.company.toLowerCase().includes(value);

      const matchesStatus =
        status === "All" || offer.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [offers, search, status]);

  const pendingCount = offers.filter(
    (offer) => offer.status === "Pending"
  ).length;

  const acceptedCount = offers.filter(
    (offer) => offer.status === "Accepted"
  ).length;

  return (
    <div className="candidate-layout">
      <CandidateSidebar />

      <div className="candidate-main">
        <CandidateNavbar />

        <main className="candidate-dashboard-content">
          {/* HEADER */}

          <div className="candidate-offers-header">
            <div>
              <p className="candidate-label">
                JOB OFFERS
              </p>

              <h1>My Offers</h1>

              <p>
                Review your employment offers and respond
                to pending offers.
              </p>
            </div>
          </div>

          {/* SUMMARY */}

          <section className="candidate-offers-summary">
            <div className="candidate-offer-summary-card">
              <div className="candidate-offer-summary-icon total">
                <FileText size={20} />
              </div>

              <div>
                <span>Total Offers</span>
                <strong>{offers.length}</strong>
              </div>
            </div>

            <div className="candidate-offer-summary-card">
              <div className="candidate-offer-summary-icon pending">
                <Clock3 size={20} />
              </div>

              <div>
                <span>Pending Response</span>
                <strong>{pendingCount}</strong>
              </div>
            </div>

            <div className="candidate-offer-summary-card">
              <div className="candidate-offer-summary-icon accepted">
                <CheckCircle2 size={20} />
              </div>

              <div>
                <span>Accepted</span>
                <strong>{acceptedCount}</strong>
              </div>
            </div>
          </section>

          {/* FILTERS */}

          <section className="candidate-offers-filter">
            <div className="candidate-offers-search">
              <Search size={18} />

              <input
                type="text"
                placeholder="Search job or company..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />
            </div>

            <div className="candidate-offers-status-filter">
              <FileText size={17} />

              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value)
                }
              >
                <option value="All">
                  All Offers
                </option>

                <option value="Pending">
                  Pending
                </option>

                <option value="Accepted">
                  Accepted
                </option>

                <option value="Declined">
                  Declined
                </option>
              </select>
            </div>
          </section>

          {/* LIST HEADER */}

          <div className="candidate-offers-list-heading">
            <div>
              <h2>Offers</h2>

              <p>
                {filteredOffers.length} offer
                {filteredOffers.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* OFFER LIST */}

          {loading ? (
            <div className="candidate-offers-empty">
              <FileText size={30} />

              <h3>Loading your offers...</h3>

              <p>Please wait a moment.</p>
            </div>
          ) : error ? (
            <div className="candidate-offers-empty">
              <FileText size={30} />

              <h3>Unable to load offers</h3>

              <p>{error}</p>

              <button type="button" onClick={loadOffers}>
                Try Again
              </button>
            </div>
          ) : filteredOffers.length > 0 ? (
            <div className="candidate-offers-list">
              {filteredOffers.map((offer) => (
                <article
                  key={offer.id}
                  className="candidate-offer-card"
                >
                  <div className="candidate-offer-company-icon">
                    <BriefcaseBusiness size={22} />
                  </div>

                  <div className="candidate-offer-card-content">
                    <div className="candidate-offer-card-top">
                      <div>
                        <h3>{offer.jobTitle}</h3>

                        <p>
                          <Building2 size={13} />
                          {offer.company}
                        </p>
                      </div>

                      <span
                        className={`candidate-offer-status ${offer.status.toLowerCase()}`}
                      >
                        {offer.status}
                      </span>
                    </div>

                    <div className="candidate-offer-card-meta">
                      <span>
                        <MapPin size={14} />
                        {offer.location}
                      </span>

                      <span>
                        <BriefcaseBusiness size={14} />
                        {offer.employmentType}
                      </span>

                      {offer.offeredDate && (
                        <span>
                          <CalendarDays size={14} />
                          Offered {offer.offeredDate}
                        </span>
                      )}

                      <span>
                        <CalendarDays size={14} />
                        Joining {offer.joiningDate}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="candidate-offer-details-button"
                    onClick={() =>
                      navigate(
                        `/candidate/offers/${offer.id}`
                      )
                    }
                  >
                    View Offer
                    <ArrowRight size={15} />
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <div className="candidate-offers-empty">
              <FileText size={30} />

              <h3>No offers found</h3>

              <p>
                {offers.length === 0
                  ? "You don't have any offers yet."
                  : "No offers match your current filters."}
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatus("All");
                }}
              >
                Clear Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default CandidateOffers;