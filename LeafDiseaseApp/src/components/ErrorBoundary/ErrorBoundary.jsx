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
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, () => this.setState({ hasError: false, error: null }));
      }
      
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: this.props.inline ? '100%' : '100vh', textAlign: 'center', padding: '20px', backgroundColor: 'var(--bg-color)', minHeight: this.props.inline ? '300px' : '100vh', borderRadius: this.props.inline ? '16px' : '0' }}>
          <AlertTriangle size={this.props.inline ? 48 : 64} color="#fca5a5" style={{ marginBottom: '20px' }} />
          <h2 style={{ color: 'var(--text-color)', marginBottom: '10px', fontSize: this.props.inline ? '1.2rem' : '1.5rem' }}>
            {this.props.customMessage || (this.props.lang === "ta" ? "பயன்பாட்டில் எதிர்பாராத பிழை ஏற்பட்டுள்ளது" : "An unexpected error occurred.")}
          </h2>
          <p style={{ color: 'var(--text-color-secondary)', maxWidth: '400px', marginBottom: '20px', fontSize: '0.9rem' }}>
            {this.props.lang === "ta" ? "தயவுசெய்து மீண்டும் முயற்சிக்கவும்." : "Please try again."}
          </p>
          <button 
            className="btn btn-secondary" 
            onClick={() => {
              if (this.props.onRetry) {
                this.setState({ hasError: false, error: null });
                this.props.onRetry();
              } else {
                window.location.reload();
              }
            }}
          >
            <RefreshCw size={16} />
            <span>{this.props.lang === "ta" ? "மீண்டும் ஏற்றவும்" : "Retry"}</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
