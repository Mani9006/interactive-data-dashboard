/**
 * @fileoverview Theme toggle component for switching between light and dark modes.
 * Persists preference to localStorage.
 */

const { useState, useEffect, useCallback } = React;

/**
 * ThemeToggle component renders a button to toggle between light and dark themes.
 * @param {Object} props - Component props
 * @param {string} props.theme - Current theme ('light' or 'dark')
 * @param {Function} props.onToggle - Callback when theme changes
 * @returns {React.ReactElement}
 */
function ThemeToggle({ theme, onToggle }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggle = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    if (onToggle) {
      onToggle(newTheme);
    }
  }, [theme, onToggle]);

  if (!mounted) {
    return React.createElement('button', {
      className: 'theme-toggle',
      'aria-label': 'Toggle theme',
    }, '\u{2600}');
  }

  const isDark = theme === 'dark';

  return React.createElement('button', {
    className: 'theme-toggle',
    onClick: handleToggle,
    'aria-label': isDark ? 'Switch to light theme' : 'Switch to dark theme',
    title: isDark ? 'Switch to light theme' : 'Switch to dark theme',
  },
    React.createElement('span', { className: 'theme-toggle-icon' }, isDark ? '\u{1F319}' : '\u{2600}'),
    React.createElement('span', { className: 'theme-toggle-text' }, isDark ? 'Dark' : 'Light')
  );
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ThemeToggle };
}
