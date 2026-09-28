import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageSquare,
} from "lucide-react";

import apiClient from "../../services/apiClient";

function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ==========================================
  // HANDLE INPUT CHANGE
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Remove old success/error message when user starts typing again
    setSubmitted(false);
    setError("");
  };

  // ==========================================
  // SUBMIT CONTACT MESSAGE
  // POST /api/contact/messages
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitted(false);
    setError("");
    setLoading(true);

    try {
      // Backend expects:
      // fullName, email, subject, message
      const requestBody = {
        fullName: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      };

      const response = await apiClient.post(
        "/contact/messages",
        requestBody
      );

      const result = response.data;

      if (!result?.success) {
        throw new Error(
          result?.message || "Unable to send message."
        );
      }

      // Backend successfully saved the message
      setSubmitted(true);

      // Clear form only after successful submission
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (err) {
      console.error("Contact message error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to send your message. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">

      <section className="contact-hero">
        <div className="container contact-hero-content">

          <span className="section-label">
            CONTACT US
          </span>

          <h1>
            We'd Love to Hear From You
          </h1>

          <p>
            Have a question about jobs, applications or our
            recruitment platform? Send us a message and our team
            will get back to you.
          </p>

        </div>
      </section>


      <section className="contact-content-section">
        <div className="container contact-layout">

          <div className="contact-info">

            <span className="section-label">
              GET IN TOUCH
            </span>

            <h2>
              Let's Start a Conversation
            </h2>

            <p className="contact-description">
              Whether you're a candidate looking for an
              opportunity or an organization using our recruitment
              platform, we're here to help.
            </p>


            <div className="contact-info-list">

              <div className="contact-info-item">

                <div className="contact-info-icon">
                  <Mail size={22} />
                </div>

                <div>
                  <span>Email</span>

                  <strong>
                    support@talentai.com
                  </strong>
                </div>

              </div>


              <div className="contact-info-item">

                <div className="contact-info-icon">
                  <Phone size={22} />
                </div>

                <div>
                  <span>Phone</span>

                  <strong>
                    +91 98765 43210
                  </strong>
                </div>

              </div>


              <div className="contact-info-item">

                <div className="contact-info-icon">
                  <MapPin size={22} />
                </div>

                <div>
                  <span>Office</span>

                  <strong>
                    Hyderabad, Telangana
                  </strong>
                </div>

              </div>

            </div>


            <div className="contact-help-card">

              <MessageSquare size={25} />

              <div>
                <h3>
                  Need Recruitment Support?
                </h3>

                <p>
                  Our team can assist with applications,
                  recruitment workflows and platform-related
                  questions.
                </p>
              </div>

            </div>

          </div>


          <div className="contact-form-card">

            <h2>
              Send Us a Message
            </h2>

            <p>
              Fill in the form below and we'll contact you.
            </p>


            {submitted && (
              <div className="contact-success-message">
                Your message has been submitted successfully.
              </div>
            )}


            {error && (
              <div
                style={{
                  marginBottom: "16px",
                  padding: "12px 14px",
                  borderRadius: "8px",
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  color: "#dc2626",
                  fontSize: "14px",
                }}
              >
                {error}
              </div>
            )}


            <form onSubmit={handleSubmit}>

              <div className="contact-form-group">

                <label htmlFor="name">
                  Full Name *
                </label>

                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />

              </div>


              <div className="contact-form-group">

                <label htmlFor="email">
                  Email Address *
                </label>

                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="example@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />

              </div>


              <div className="contact-form-group">

                <label htmlFor="subject">
                  Subject *
                </label>

                <input
                  id="subject"
                  type="text"
                  name="subject"
                  placeholder="How can we help you?"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />

              </div>


              <div className="contact-form-group">

                <label htmlFor="message">
                  Message *
                </label>

                <textarea
                  id="message"
                  name="message"
                  rows="6"
                  placeholder="Write your message..."
                  value={formData.message}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />

              </div>


              <button
                type="submit"
                className="contact-submit-button"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Message"}

                <Send size={18} />
              </button>

            </form>

          </div>

        </div>
      </section>

    </div>
  );
}

export default ContactPage;