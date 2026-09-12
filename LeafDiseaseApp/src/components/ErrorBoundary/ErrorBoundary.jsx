import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { t } from "../../data/translations";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', textAlign: 'center', padding: '20px', backgroundColor: 'var(--bg-color)' }}>
          <AlertTriangle size={64} color="#fca5a5" style={{ marginBottom: '20px' }} />
          <h2 style={{ color: 'var(--text-color)', marginBottom: '10px' }}>
            {this.props.lang === "ta" ? "பயன்பாட்டில் எதிர்பாராத பிழை ஏற்பட்டுள்ளது" : "An unexpected error occurred."}
          </h2>
          <p style={{ color: 'var(--text-color-secondary)', maxWidth: '400px', marginBottom: '20px' }}>
            {this.props.lang === "ta" ? "தயவுசெய்து பக்கத்தை மீண்டும் ஏற்றவும் அல்லது முகப்புக்கு திரும்பவும்." : "Please reload the page or return home."}
          </p>
          <button 
            className="btn btn-primary" 
            onClick={() => window.location.reload()}
          >
            <RefreshCw size={16} />
            <span>{this.props.lang === "ta" ? "மீண்டும் ஏற்றவும்" : "Reload Application"}</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
