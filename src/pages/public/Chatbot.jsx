import { useState } from "react";
import {
  Bot,
  Send,
  User,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import apiClient from "@/api/apiClient";

function Chatbot() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text:
        "Hi! I'm TalentAI Assistant. I can help you with job openings, applications, recruitment process and general platform questions.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const quickQuestions = [
    "Show me available jobs",
    "How do I apply for a job?",
    "What happens after I apply?",
    "How does AI screening work?",
  ];

  const sendMessage = async (messageText = input) => {
  const trimmedMessage = messageText.trim();

  if (!trimmedMessage || loading) {
    return;
  }

  const userMessage = {
    id: Date.now(),
    sender: "user",
    text: trimmedMessage,
  };

  const conversationHistory = messages.map(
    (message) => message.text
  );

  setMessages((prev) => [
    ...prev,
    userMessage,
  ]);

  setInput("");
  setLoading(true);

  try {
    const response = await apiClient.post(
      "/chatbot/chat",
      {
        message: trimmedMessage,
        conversation_history: conversationHistory,
        job_context: "",
      }
    );

    console.log("Chatbot API response:", response);
    console.log("Chatbot response data:", response.data);

    const botResponse = response.data?.response;

    if (!botResponse) {
      throw new Error("Chatbot response field is missing");
    }

    const botMessage = {
      id: Date.now() + 1,
      sender: "bot",
      text: botResponse,
    };

    setMessages((prev) => [
      ...prev,
      botMessage,
    ]);
  } catch (error) {
    console.error("Chatbot error:", error);

    const botMessage = {
      id: Date.now() + 1,
      sender: "bot",
      text:
        "Sorry, I couldn't generate a response. Please try again.",
    };

    setMessages((prev) => [
      ...prev,
      botMessage,
    ]);
  } finally {
    setLoading(false);
  }
};

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  return (
    <div className="chatbot-page">

      <section className="chatbot-hero">
        <div className="container chatbot-hero-content">

          <div className="chatbot-hero-icon">
            <Bot size={30} />
          </div>

          <span className="section-label">
            AI ASSISTANT
          </span>

          <h1>
            How Can We Help You?
          </h1>

          <p>
            Ask questions about jobs, applications,
            recruitment stages and the TalentAI platform.
          </p>

        </div>
      </section>

      <section className="chatbot-section">
        <div className="container">

          <div className="chatbot-layout">

            <aside className="chatbot-sidebar">

              <div className="chatbot-info-card">

                <Sparkles size={24} />

                <h3>
                  TalentAI Assistant
                </h3>

                <p>
                  Get quick answers about recruitment
                  and job applications.
                </p>

              </div>

              <div className="quick-questions">

                <h4>
                  Suggested Questions
                </h4>

                {quickQuestions.map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() =>
                      sendMessage(question)
                    }
                    disabled={loading}
                  >
                    <MessageCircle size={16} />

                    {question}
                  </button>
                ))}

              </div>

            </aside>

            <div className="chatbot-window">

              <div className="chatbot-header">

                <div className="chatbot-avatar">
                  <Bot size={22} />
                </div>

                <div>
                  <h3>
                    TalentAI Assistant
                  </h3>

                  <span>
                    {loading ? "Thinking..." : "Online"}
                  </span>
                </div>

              </div>

              <div className="chatbot-messages">

                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={
                      message.sender === "user"
                        ? "chat-message user-message"
                        : "chat-message bot-message"
                    }
                  >

                    <div className="chat-message-avatar">

                      {message.sender === "user" ? (
                        <User size={18} />
                      ) : (
                        <Bot size={18} />
                      )}

                    </div>

                    <div className="chat-message-content">

                      <span>
                        {message.sender === "user"
                          ? "You"
                          : "TalentAI"}
                      </span>

                      <p>
                        {message.text}
                      </p>

                    </div>

                  </div>
                ))}

                {loading && (
                  <div className="chat-message bot-message">

                    <div className="chat-message-avatar">
                      <Bot size={18} />
                    </div>

                    <div className="chat-message-content">
                      <span>TalentAI</span>
                      <p>Thinking...</p>
                    </div>

                  </div>
                )}

              </div>

              <form
                className="chatbot-input-area"
                onSubmit={handleSubmit}
              >

                <input
                  type="text"
                  placeholder="Ask TalentAI a question..."
                  value={input}
                  onChange={(e) =>
                    setInput(e.target.value)
                  }
                  disabled={loading}
                />

                <button
                  type="submit"
                  aria-label="Send message"
                  disabled={loading}
                >
                  <Send size={19} />
                </button>

              </form>

            </div>

          </div>

        </div>
      </section>

    </div>
  );
}

export default Chatbot;