import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User, Loader2, Mic, MicOff, Volume2, VolumeX, ClipboardCheck, AlertCircle } from "lucide-react";
import api from "../../api/api";
import { t } from "../../data/translations";
import "./Chatbot.css";

function Chatbot({ currentDisease }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hello! I am your AI Plant Doctor. Ask me anything about plant care, leaf diseases, pesticides, or organic treatments."
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const chatEndRef = useRef(null);

  // Auto-scroll to the bottom of the chat list
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recog = new SpeechRecognition();
        recog.continuous = false;
        recog.interimResults = false;
        recog.lang = "ta-IN"; // Default to Tamil for voice input
        
        recog.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          setIsListening(false);
        };
        
        recog.onerror = (event) => {
          console.warn("Speech recognition error:", event.error);
          setIsListening(false);
        };
        
        recog.onend = () => {
          setIsListening(false);
        };
        
        setRecognition(recog);
      }
    }
  }, []);

  const startListening = () => {
    if (recognition && !isListening) {
      setIsListening(true);
      recognition.start();
    }
  };

  // Build conversation history for AI context
  const buildConversationHistory = () => {
    return messages.slice(-10).map(m => ({
      role: m.sender === "user" ? "user" : "assistant",
      content: m.text
    }));
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { sender: "user", text: userMessage }]);
    setLoading(true);

    try {
      const conversationHistory = buildConversationHistory();
      const diseaseInfo = currentDisease ? `Detected disease: ${currentDisease.replace(/___/g, " → ").replace(/_/g, " ")}` : "No disease detected yet";

      const response = await api.post("/api/chat", {
        message: userMessage,
        context: currentDisease || "",
        history: conversationHistory,
        diseaseInfo: diseaseInfo
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

  // Copy message to clipboard
  const copyMessage = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="chatbot-wrapper">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button className="chat-toggle-btn" onClick={() => setIsOpen(true)} aria-label="Open AI Assistant">
          <MessageSquare size={26} />
          <span className="badge-pulse"></span>
        </button>
      )}

      {/* Floating Chat Window */}
      {isOpen && (
        <div className="chat-window-glass" role="dialog" aria-modal="true" aria-label="AI Plant Doctor">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-title">
              <Bot size={22} className="bot-header-icon" />
              <div>
                <h4>NVIDIA AI Doctor</h4>
                <p>Powered by NVIDIA AI Engine</p>
              </div>
            </div>
            <button className="chat-close-btn" onClick={() => setIsOpen(false)} aria-label="Close chat">
              <X size={20} />
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
                  {msg.sender === "bot" ? <Bot size={16} /> : <User size={16} />}
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
                {msg.sender === "bot" && (
                  <button 
                    className="copy-btn" 
                    onClick={() => copyMessage(msg.text)}
                    aria-label="Copy message"
                    title="Copy"
                  >
                    <ClipboardCheck size={14} />
                  </button>
                )}
              </div>
            ))}

            {loading && (
              <div className="chat-bubble-row bot">
                <div className="chat-avatar">
                  <Bot size={16} />
                </div>
                <div className="chat-bubble loading">
                  <Loader2 size={18} className="spin-icon" />
                  Thinking...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="chat-input-bar">
            <button
              type="button"
              className={`voice-btn ${isListening ? "listening" : ""}`}
              onClick={startListening}
              disabled={loading || !recognition}
              aria-label={isListening ? "Stop listening" : "Voice input"}
            >
              {isListening ? <MicOff size={20} color="#ef4444" /> : <Mic size={20} />}
            </button>
            <input
              type="text"
              placeholder="Ask about treatment, soil, crop care..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              aria-label="Your question"
            />
            <button type="submit" disabled={loading || !input.trim()}>
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Chatbot;