import { useState } from "react";
import "./Chatbot.css";

function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi! 👋 I'm TalentAI. How can I help you today?",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || loading) {
      return;
    }

    // Add user message
    setMessages((previousMessages) => [
      ...previousMessages,
      {
        sender: "user",
        text: trimmedMessage,
      },
    ]);

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8080/api/chatbot/chat",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: trimmedMessage,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();

      setMessages((previousMessages) => [
        ...previousMessages,
        {
          sender: "bot",
          text:
            data.reply ||
            "Sorry, I could not generate a response.",
        },
      ]);
    } catch (error) {
      console.error("Chatbot error:", error);

      setMessages((previousMessages) => [
        ...previousMessages,
        {
          sender: "bot",
          text:
            "Sorry, I'm having trouble connecting to the server right now.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* ================= CHAT WINDOW ================= */}
      {isOpen && (
        <div className="chatbot-window">

          {/* ================= HEADER ================= */}
          <div className="chatbot-header">

            <div className="chatbot-header-info">
              <div className="chatbot-avatar">
                🤖
              </div>

              <div>
                <h3>TalentAI</h3>
                <span>AI Recruitment Assistant</span>
              </div>
            </div>

            {/* CLOSE BUTTON */}
            <button
              type="button"
              className="chatbot-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close chatbot"
              title="Close"
            >
              ×
            </button>

          </div>

          {/* ================= MESSAGES ================= */}
          <div className="chatbot-messages">

            {messages.map((chatMessage, index) => (
              <div
                key={index}
                className={`chat-message ${
                  chatMessage.sender === "user"
                    ? "user-message"
                    : "bot-message"
                }`}
              >
                {chatMessage.text}
              </div>
            ))}

            {/* LOADING / TYPING */}
            {loading && (
              <div className="chat-message bot-message typing">
                <span></span>
                <span></span>
                <span></span>
              </div>
            )}

          </div>

          {/* ================= INPUT ================= */}
          <div className="chatbot-input-area">

            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask TalentAI something..."
              rows="1"
              disabled={loading}
            />

            <button
              type="button"
              className="chatbot-send"
              onClick={sendMessage}
              disabled={loading || !message.trim()}
              aria-label="Send message"
            >
              ➤
            </button>

          </div>

        </div>
      )}

      {/* ================= FLOATING BUTTON ================= */}
      {!isOpen && (
        <button
          type="button"
          className="chatbot-floating-button"
          onClick={() => setIsOpen(true)}
          aria-label="Open TalentAI"
          title="Open TalentAI"
        >
          <span className="chatbot-icon">🤖</span>
          <span className="chatbot-pulse"></span>
        </button>
      )}
    </>
  );
}

export default FloatingChatbot;