import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./Chatbot.css";
import apiClient from "../services/apiClient";

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi! 👋 I'm TalentAI. How can I help you today?",
    },
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const resetChat = () => {
      setMessages([
        {
          sender: "bot",
          text: "Hi! 👋 I'm TalentAI. How can I help you today?",
        },
      ]);
      setMessage("");
      setLoading(false);
    };

    const checkUser = () => {
      const currentUser = localStorage.getItem("loggedInUser");
      const currentToken = localStorage.getItem("token");

      const currentSession = `${currentToken || ""}_${currentUser || ""}`;
      const previousSession = sessionStorage.getItem("chatbotSession");

      if (previousSession && previousSession !== currentSession) {
        resetChat();
      }

      sessionStorage.setItem("chatbotSession", currentSession);
    };

    checkUser();

    const interval = setInterval(checkUser, 500);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const sendMessage = async () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || loading) {
      return;
    }

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
      const response = await apiClient.post("/chatbot/chat", {
        message: trimmedMessage,
        conversation_history: [],
        job_context: "",
      });

      const botResponse = response.data?.response;

      if (!botResponse) {
        throw new Error("Chatbot response is missing");
      }

      setMessages((previousMessages) => [
        ...previousMessages,
        {
          sender: "bot",
          text: botResponse,
        },
      ]);
    } catch (error) {
      console.error("Chatbot error:", error);

      setMessages((previousMessages) => [
        ...previousMessages,
        {
          sender: "bot",
          text: "Sorry, I'm having trouble connecting to the server right now.",
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
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar">🤖</div>

              <div>
                <h3>TalentAI</h3>
                <span>AI Recruitment Assistant</span>
              </div>
            </div>

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
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
  {chatMessage.text}
</ReactMarkdown>
              </div>
            ))}

            {loading && (
              <div className="chat-message bot-message typing">
                <span></span>
                <span></span>
                <span></span>
              </div>
            )}
          </div>

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

export default Chatbot;