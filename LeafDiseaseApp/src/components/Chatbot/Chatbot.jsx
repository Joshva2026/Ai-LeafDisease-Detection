import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User, Loader2 } from "lucide-react";
import api from "../../api/api";
import "./Chatbot.css";

function Chatbot({ currentDisease }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! I am LeafGuard AI Assistant. Ask me anything about plant care, leaf diseases, pesticides, or organic treatments."
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-scroll to the bottom of the chat list
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { sender: "user", text: userMessage }]);
    setLoading(true);

    try {
      const response = await api.post("/api/chat", {
        message: userMessage,
        context: currentDisease || ""
      });

      if (response.data.success) {
        setMessages(prev => [...prev, { sender: "bot", text: response.data.reply }]);
      } else {
        setMessages(prev => [
          ...prev,
          { sender: "bot", text: "Sorry, I couldn't reach the AI engine right now. Please try again." }
        ]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        { sender: "bot", text: "Connection error. Make sure your backend API is online!" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot-wrapper">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button className="chat-toggle-btn" onClick={() => setIsOpen(true)}>
          <MessageSquare size={24} />
          <span className="badge-pulse"></span>
        </button>
      )}

      {/* Floating Chat Window */}
      {isOpen && (
        <div className="chat-window-glass">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-title">
              <Bot size={20} className="bot-header-icon" />
              <div>
                <h4>Agri-bot Assistant</h4>
                <p>Powered by Gemini AI</p>
              </div>
            </div>
            <button className="chat-close-btn" onClick={() => setIsOpen(false)}>
              <X size={18} />
            </button>
          </div>

          {/* Context Advisory Tag */}
          {currentDisease && (
            <div className="chat-context-banner">
              🌾 Focus: <strong>{currentDisease.replace(/___/g, " → ").replace(/_/g, " ")}</strong>
            </div>
          )}

          {/* Messages Log */}
          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-bubble-row ${msg.sender}`}>
                <div className="chat-avatar">
                  {msg.sender === "bot" ? <Bot size={14} /> : <User size={14} />}
                </div>
                <div className="chat-bubble">
                  {/* Basic parsing for markdown bold text */}
                  {msg.text.split("\n").map((line, idx) => (
                    <p key={idx} style={{ margin: "4px 0" }}>
                      {line.startsWith("-") || line.startsWith("*") || /^\d+\./.test(line) ? (
                        <span>{line}</span>
                      ) : (
                        // parse simple **bold** tags
                        line.split("**").map((part, pIdx) =>
                          pIdx % 2 === 1 ? <strong key={pIdx}>{part}</strong> : part
                        )
                      )}
                    </p>
                  ))}
                </div>
              </div>
            ))}

            {loading && (
              <div className="chat-bubble-row bot">
                <div className="chat-avatar">
                  <Bot size={14} />
                </div>
                <div className="chat-bubble loading">
                  <Loader2 size={16} className="spin-icon" />
                  Thinking...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="chat-input-bar">
            <input
              type="text"
              placeholder="Ask about treatment, soil, crop care..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()}>
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Chatbot;
