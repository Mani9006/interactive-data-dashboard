/**
 * @fileoverview Application entry point.
 * Renders the App component into the DOM root element.
 */

// Wait for all scripts to load before mounting
window.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById('root');

  if (!rootElement) {
    console.error('Root element not found. Cannot mount application.');
    return;
  }

  // Check if React 18 createRoot is available
  if (React && ReactDOM && ReactDOM.createRoot) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(React.createElement(App));
  } else if (React && ReactDOM && ReactDOM.render) {
    // Fallback for React 17
    ReactDOM.render(React.createElement(App), rootElement);
  } else {
    console.error('React or ReactDOM not loaded. Cannot mount application.');
    rootElement.innerHTML = '<div style="padding:2rem;text-align:center;color:#94a3b8;">' +
      '<h2>Failed to load required libraries</h2>' +
      '<p>Please check your internet connection and reload the page.</p>' +
      '</div>';
  }
});
