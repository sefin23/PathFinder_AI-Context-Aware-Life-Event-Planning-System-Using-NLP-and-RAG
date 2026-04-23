import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', background: 'rgba(255,0,0,0.05)', border: '1px solid var(--coral)', borderRadius: '12px', color: 'white' }}>
          <h2 style={{ color: 'var(--coral)' }}>Component Failure</h2>
          <p style={{ fontSize: '14px', color: 'var(--fog)', marginTop: '8px' }}>
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          <button 
            onClick={() => window.location.reload()}
            style={{ marginTop: '16px', padding: '8px 16px', background: 'var(--coral)', border: 'none', borderRadius: '4px', cursor: 'pointer', color: 'white', fontWeight: 700 }}
          >
            Reload Navigator
          </button>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
