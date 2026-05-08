/**
 * @fileoverview Error Boundary component for graceful error handling.
 * Catches JavaScript errors in child component tree and displays fallback UI.
 */

const { Component } = React;

/**
 * Error Boundary that catches rendering errors in child components.
 * @extends React.Component
 */
class ErrorBoundary extends Component {
  /**
   * @param {Object} props - Component props
   * @param {React.ReactNode} props.children - Child components
   * @param {React.ReactNode} [props.fallback] - Custom fallback UI
   */
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  /**
   * Update state when error is caught.
   * @param {Error} error - The caught error
   * @returns {Object} Updated state
   */
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  /**
   * Log error details when caught.
   * @param {Error} error - The caught error
   * @param {Object} errorInfo - React error info
   */
  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // In production, send to error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  /**
   * Reset error state to retry rendering.
   */
  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return React.createElement('div', { className: 'error-boundary' },
        React.createElement('div', { className: 'error-boundary-icon' }, '\uD83D\uDEA8'),
        React.createElement('h2', null, 'Something went wrong'),
        React.createElement('p', null,
          'An error occurred while rendering this component. ' +
          'You can try refreshing the page or go back to the dashboard.'
        ),
        this.state.error && React.createElement('pre', null, this.state.error.toString()),
        React.createElement('button', {
          onClick: this.handleRetry,
          style: { marginTop: '1rem' }
        }, 'Try Again')
      );
    }

    return this.props.children;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ErrorBoundary };
}
