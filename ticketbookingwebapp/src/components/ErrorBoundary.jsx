/**
 * Global Error Boundary Component
 * Catches JavaScript errors anywhere in the component tree
 */

import React from 'react';
import { Button, Result } from 'antd';
import { ReloadOutlined, HomeOutlined } from '@ant-design/icons';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('❌ Error Boundary caught an error:', error, errorInfo);
    }
    
    // Log error to external service (e.g., Sentry)
    // logErrorToService(error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}>
          <Result
            status="error"
            title="Oops! Something went wrong"
            subTitle="We're sorry for the inconvenience. Please try reloading the page."
            extra={[
              <Button
                key="reload"
                type="primary"
                icon={<ReloadOutlined />}
                onClick={this.handleReload}
              >
                Reload Page
              </Button>,
              <Button
                key="home"
                icon={<HomeOutlined />}
                onClick={this.handleGoHome}
              >
                Go Home
              </Button>,
            ]}
          >
            {import.meta.env.DEV && this.state.error && (
              <div style={{
                marginTop: '20px',
                padding: '16px',
                background: '#f5f5f5',
                borderRadius: '4px',
                textAlign: 'left',
                maxWidth: '600px',
                margin: '20px auto',
              }}>
                <details style={{ whiteSpace: 'pre-wrap' }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '8px' }}>
                    Error Details (Development Only)
                  </summary>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    <strong>Error:</strong>
                    <pre style={{ marginTop: '8px', padding: '8px', background: 'white', borderRadius: '4px' }}>
                      {this.state.error && this.state.error.toString()}
                    </pre>
                    
                    <strong style={{ marginTop: '12px', display: 'block' }}>Stack Trace:</strong>
                    <pre style={{ marginTop: '8px', padding: '8px', background: 'white', borderRadius: '4px', overflow: 'auto', maxHeight: '200px' }}>
                      {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                </details>
              </div>
            )}
          </Result>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
