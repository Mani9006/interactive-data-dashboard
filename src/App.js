/**
 * @fileoverview Root App component for the Interactive Data Dashboard.
 * Manages global state including theme and renders the main layout.
 */

const { useState, useEffect, useCallback } = React;

/**
 * App - Root application component.
 * Handles theme management and renders the dashboard layout.
 * @returns {React.ReactElement}
 */
function App() {
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem('dashboard-theme');
      if (stored === 'light' || stored === 'dark') {
        setTheme(stored);
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark');
      }
    } catch (e) {
      console.warn('Could not read theme preference:', e);
    }
    setMounted(true);
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute('data-theme', theme);
      try {
        window.localStorage.setItem('dashboard-theme', theme);
      } catch (e) {
        console.warn('Could not save theme preference:', e);
      }
    }
  }, [theme, mounted]);

  /**
   * Handle theme toggle.
   * @param {string} newTheme - New theme value
   */
  const handleThemeChange = useCallback((newTheme) => {
    setTheme(newTheme);
  }, []);

  if (!mounted) {
    return React.createElement('div', { className: 'app' },
      React.createElement('div', {
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          color: '#94a3b8',
        },
      }, 'Loading...')
    );
  }

  return React.createElement('div', { className: 'app' },
    // Header
    React.createElement('header', { className: 'app-header' },
      React.createElement('div', { className: 'app-header-left' },
        React.createElement('div', { className: 'app-logo' }, 'D'),
        React.createElement('h1', { className: 'app-title' }, 'Data Dashboard')
      ),
      React.createElement('div', { className: 'app-header-right' },
        React.createElement(ThemeToggle, { theme, onToggle: handleThemeChange })
      )
    ),

    // Main content
    React.createElement('main', { className: 'app-main' },
      React.createElement(ErrorBoundary, null,
        React.createElement(Dashboard, { theme })
      )
    ),

    // Footer
    React.createElement('footer', { className: 'app-footer' },
      React.createElement('p', null,
        'Data Dashboard \u00B9 2024 \u2022 Built with React & Chart.js',
        React.createElement('br', null),
        'Data is simulated for demonstration purposes.'
      )
    )
  );
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { App };
}
